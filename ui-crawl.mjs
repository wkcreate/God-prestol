// Обход интерфейса: на каждом экране и вкладке нажимается каждая безопасная кнопка (data-act), открытые окна
// и бои закрываются, все ошибки JavaScript собираются. Прогоняется на нескольких языках и на двух состояниях:
// новый персонаж и «всё открыто» (поздняя игра с ресурсами).
// Запуск: node scripts/ui-crawl.mjs [языки=en,ru,uk,pl,ar,ja]
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const LANGS = (process.argv[2] || 'en,ru,uk,pl,ar,ja').split(',');
const dir = p => fileURLToPath(new URL(p, import.meta.url));
const srv = await serve(8141, dir('../build/' + (process.env.CRAWL_DIR || 'dev') + '/'));
const browser = await chromium.launch();
const SKIP = new Set(['reset', 'chDel', 'switchChar', 'toLogin', 'langSet', 'langPick', 'quality', 'imp', 'gLeave', 'askYes', 'enter', 'chNew', 'startGame', 'pickCls', 'srvPick', 'srvSet', 'chPick', 'noop', 'bExit', 'nextStage', 'evNext', 'anxToggle', 'setName', 'cls']);
const VIEWS = [['home'], ['heroes'], ['heroes', 'team'], ['main'], ['battle'], ['story'], ['arena'], ['events'], ['events', 'ev'], ['events', 'quests'], ['events', 'login'], ['events', 'ach'], ['guild'], ['summon', 'std'], ['summon', 'prem'], ['summon', 'cpn'], ['summon', 'wheel'], ['paid', 'altar'], ['shop', 'gold'], ['shop', 'items'], ['shop', 'skins'], ['shop', 'guild'], ['shop', 'arena'], ['paid', 'roul'], ['paid', 'pz'], ['paid', 'pass'], ['paid', 'packs'], ['main', { t: 'info' }], ['main', { t: 'gear' }], ['main', { t: 'wings' }], ['main', { t: 'pets' }], ['main', { t: 'arts' }], ['hero', { t: 'info', k: 0 }], ['hero', { t: 'gear', k: 0 }], ['hero', { t: 'star', k: 0 }], ['hero', { t: 'star', k: 1 }]];
let total = 0, clicks = 0;
const hang = [];
const tm = (pr, what) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('зависание: ' + what)), 6000))]);

for (const lang of LANGS) for (const late of [false, true]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 300)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });
  await page.addInitScript(l => { if (!sessionStorage.getItem('np_t')) { localStorage.clear(); localStorage.setItem('np_lang', l); sessionStorage.setItem('np_t', 1); } }, lang);
  await page.goto('http://127.0.0.1:8141/index.html'); await page.waitForTimeout(1300);
  await page.click('[data-act="chNew"]'); await page.fill('#newNm', 'Crawl'); await page.click('[data-act="pickCls"][data-c="mag"]'); await page.click('[data-act="startGame"]');
  await page.evaluate(() => { window.ask = (t, f) => {}; });                    // подтверждения не нажимаем
  if (late) await page.evaluate(() => {
    Object.assign(S, { gold: 5e6, silver: 5e9, exp: 5e9, scroll: 500, coupon: 300, token: 100, gcoin: 5e4, acoin: 5e4, tp: 500, ore: 1e6, divine: 1e4, ancient: 1e4, lrs: 2000, ess: 5000, egg: 10, food: 1e5, feather: 1e5, dust: 1e5, asc: 300, usrShard: 100 });
    S.stage = 401; S.chr = 20; for (let c = 1; c <= 20; c++) { if (!S.story.seen.includes(c)) S.story.seen.push(c); storyFinish(c); }
    summon('prem', 10); summon('prem', 10); summon('cpn', 10); summon('std', 10);
    joinGuild(guildOffers()[0].n, 3); levelTeam(); S.team.filter(Boolean).forEach(k => gearAll(k));
    save(); render();
  });
  await page.evaluate(() => { closeModal(); window.SIMP = p => !p ? null : typeof p === 'string' ? { p } : Object.assign({}, p, p.k != null ? { k: Object.keys(S.h).filter(k => !k.startsWith('@'))[p.k] } : {}); });
  page.setDefaultTimeout(6000);
  for (const [v, p] of VIEWS) {
    process.stderr.write(`${lang}${late ? '+' : ''} ${v}/${typeof p === 'object' ? JSON.stringify(p) : p || ''}  `);
    await page.evaluate(([v, p]) => { try { closeModal(); if (BT.active) BT.close(); go(v, SIMP(p)); } catch (e) { console.error('go ' + v + ': ' + e); } }, [v, p]);
    await page.waitForTimeout(120);
    const acts = await page.evaluate(skip => [...document.querySelectorAll('#screen [data-act], #top [data-act], #nav [data-act]')].map((e, i) => ({ i, a: e.dataset.act, d: !!e.disabled })).filter(x => !skip.includes(x.a) && !x.d), [...SKIP]);
    const seen = new Set();
    for (const x of acts.slice(0, 40)) {
      const key = x.a + (x.a === 'tab' || x.a === 'go' ? x.i : '');
      if (seen.has(key) && !['hero', 'tab', 'go', 'subT', 'hf', 'sortT', 'hr', 'teamT'].includes(x.a)) continue; seen.add(key);
      try { await tm(page.evaluate(([v, p, i]) => { const els = [...document.querySelectorAll('#screen [data-act], #top [data-act], #nav [data-act]')]; const e = els[i]; if (e) e.click(); }, [v, p, x.i]), v + '/' + x.a); } catch (e) { errors.push(String(e)); hang.push(v + '/' + x.a); break; }
      clicks++;
      await page.waitForTimeout(40);
      // всё открытое закрываем: модальные окна, сюжет, бой (с пропуском боя, чтобы сработал итог)
      await tm(page.evaluate(([v, p]) => {
        try { if (BT.active && !BT.over) BT.skip(); } catch (e) { console.error('skip: ' + e); }
        const m = document.querySelector('#modal:not([hidden]) [data-act]:not([data-act="close"])');
        if (document.querySelector('#story:not([hidden])')) ACT.storySkip();
        closeModal(); if (BT.active) BT.close(); go(v, SIMP(p));
      }, [v, p]), 'закрытие после ' + x.a).catch(e => { errors.push(String(e)); });
    }
  }
  // настройки, почта, достижения, что нового — открываются окнами
  for (const a of ['settings', 'mail', 'whatsNew', 'privacy', 'terms', 'errLog']) { await page.evaluate(a => { ACT[a] && ACT[a]({}); }, a); await page.waitForTimeout(60); await page.evaluate(() => closeModal()); clicks++; }
  // сохранение и повторный вход
  await page.evaluate(() => save());
  await page.reload(); await page.waitForTimeout(1300);
  const pick = await page.$('[data-act="enter"]'); if (pick) await pick.click(); else errors.push('после перезапуска нет кнопки входа');
  await page.waitForTimeout(300);
  const cyr = lang === 'ru' || lang === 'uk' ? [] : await page.evaluate(() => (document.body.innerText.match(/[А-Яа-яЁё][^\n]{0,30}/g) || []).slice(0, 5));
  const u = [...new Set(errors)];
  total += u.length;
  console.log(`${lang}${late ? ' (поздняя игра)' : ''}: ошибок ${u.length}${u.length ? '\n  ' + u.slice(0, 8).join('\n  ') : ''}${cyr.length ? '\n  непереведено: ' + cyr.join(' | ') : ''}`);
  await page.close();
}
console.log(`нажатий: ${clicks}, ошибок всего: ${total}`);
await browser.close(); srv.close && srv.close(); process.exit(total ? 1 : 0);
