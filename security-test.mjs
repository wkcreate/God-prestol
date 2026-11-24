// Проверка защиты: подпись сохранений, откат кодом, перевод часов назад и вперёд, старые сохранения,
// недоступность переменных игры в выпускной сборке. Падает при любой неудаче.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const dir = p => fileURLToPath(new URL(p, import.meta.url));
const browser = await chromium.launch();
let fails = 0;
const ok = (c, name) => { console.log((c ? '✓ ' : '✗ ') + name); if (!c) fails++; };
const clock = () => {
  let T = Date.UTC(2026, 5, 1, 9, 0, 0); const RD = Date;
  class VD extends RD { constructor(...a) { if (a.length === 0) super(T); else super(...a); } static now() { return T; } }
  window.Date = VD; window.__adv = ms => { T += ms; };
};

// ---------- разработческая сборка: логика защиты ----------
{
  const srv = await serve(8151, dir('../build/dev/'));
  const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(clock);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('st')) return; sessionStorage.setItem('st', 1); localStorage.clear();
    localStorage.setItem('np_save_v1', JSON.stringify({ v: 3, name: 'Old', stage: 40, gold: 1e12, scroll: 1e9, m: { lv: 30, cls: 'war' }, h: {}, team: ['@main'] }));
  });
  await page.goto('http://127.0.0.1:8151/index.html'); await page.waitForTimeout(1200);
  const legacy = await page.evaluate(() => { const c = chars()[0]; if (!c || !loadChar(c.id)) return null; return { gold: S.gold, scroll: S.scroll, stage: S.stage }; });
  ok(legacy && legacy.stage === 40 && legacy.gold <= 2e4 + 40 * 400 && legacy.scroll <= 400, 'старое незашифрованное сохранение перенесено с ограничением ресурсов ' + JSON.stringify(legacy));
  ok(await page.evaluate(() => !localStorage.getItem('np_save_v1')), 'старое сохранение удалено после переноса');
  await page.evaluate(() => { newChar('Guard', 'mag'); daily(); });
  // перевод часов вперёд без игры: новый день не наступает
  const d0 = await page.evaluate(() => { S.d.fs = 0; S.pt = 0; daily(); S.ptD = 0; return S.d.day; });
  const d1 = await page.evaluate(() => { __adv(864e5); daily(); return S.d.day; });
  ok(d1 === d0, 'перевод часов на сутки вперёд без минуты игры не даёт новый день');
  const d2 = await page.evaluate(() => { S.pt += 61e3; daily(); return S.d.day; });
  ok(d2 === d0 + 1, 'после минуты игры новый день наступает');
  // перевод часов назад
  const back = await page.evaluate(() => { const day = S.d.day; S.d.fs = 0; save(); __adv(-3 * 864e5); S.pt += 6e5; daily(); const a = afk(); __adv(3 * 864e5); return { same: S.d.day === day && S.d.fs === 0, h: a.h }; });
  ok(back.same && back.h === 0, 'перевод часов назад не сбрасывает день и не даёт добычу');
  // откат кодом сохранения
  const roll = await page.evaluate(() => {
    const code = exportCode(); __adv(5 * 60e3); S.gold += 999; save();
    let r1 = ''; try { importCode(code); r1 = 'загружен'; } catch (e) { r1 = e.message; }
    const uid = S.uid; deleteChar(CID); newChar('Other', 'war');
    let r2 = ''; try { importCode(code); r2 = 'загружен'; } catch (e) { r2 = e.message; }
    const fresh = exportCode(); let r3 = ''; try { importCode(fresh); r3 = 'загружен'; } catch (e) { r3 = e.message; }
    return { r1, r2, r3, uid };
  });
  ok(roll.r1 === 'old', 'старый код не загружается поверх нового прогресса');
  ok(roll.r2 === 'old', 'старый код не загружается и после удаления персонажа');
  ok(roll.r3 === 'загружен', 'свежий код загружается (перенос на другое устройство работает)');
  // подделка сохранения
  const tamper = await page.evaluate(() => { save(); const k = 'np_c_' + CID, s = localStorage.getItem(k); const bad = s.slice(0, 40) + (s[40] === 'A' ? 'B' : 'A') + s.slice(41);
    let e1 = ''; try { dec(bad); } catch (e) { e1 = e.message; } localStorage.setItem(k, bad); localStorage.removeItem(k + '_b'); const loaded = loadChar(CID); return { e1, loaded, TAMPER }; });
  ok(tamper.e1 === 'tamper' && !tamper.loaded && tamper.TAMPER === 1, 'изменённое сохранение отклоняется');
  ok(await page.evaluate(() => localStorage.getItem('np_led').startsWith('NP2.')), 'журнал прогресса тоже подписан');
  ok(!errs.length, 'нет ошибок JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await page.close(); srv.close && srv.close();
}

// ---------- выпускная сборка: код закрыт ----------
{
  const srv = await serve(8152, dir('../www/'));
  const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { if (!sessionStorage.getItem('st')) { sessionStorage.setItem('st', 1); localStorage.clear(); } });
  await page.goto('http://127.0.0.1:8152/index.html'); await page.waitForTimeout(1500);
  await page.click('[data-act="chNew"]'); await page.fill('#newNm', 'Prod'); await page.click('[data-act="pickCls"][data-c="arc"]'); await page.click('[data-act="startGame"]');
  const g = await page.evaluate(() => ['S', 'ACT', 'give', 'save', 'enc', 'dec', 'SEC', 'BT', 'ledger', 'importCode'].filter(n => { try { return typeof eval(n) !== 'undefined'; } catch (e) { return false; } }));
  ok(g.length === 0, 'переменные и функции игры недоступны из консоли' + (g.length ? ': ' + g.join(',') : ''));
  const st = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('np_c_') || k === 'np_led').map(k => localStorage.getItem(k).slice(0, 4)));
  ok(st.length >= 2 && st.every(x => x === 'NP2.'), 'сохранения и журнал зашифрованы');
  const csp = await page.evaluate(() => (document.querySelector('meta[http-equiv="Content-Security-Policy"]') || {}).content || '');
  ok(/script-src 'self'/.test(csp) && !/unsafe-eval/.test(csp), 'CSP запрещает чужие и встроенные скрипты');
  const inj = await page.evaluate(() => new Promise(r => { const s = document.createElement('script'); s.textContent = 'window.__inj=1'; document.head.appendChild(s); setTimeout(() => r(!!window.__inj), 100); }));
  ok(!inj, 'внедрённый скрипт не выполняется');
  ok(!errs.length, 'нет ошибок JavaScript' + (errs.length ? ': ' + errs[0] : ''));
  await page.close(); srv.close && srv.close();
}
await browser.close();
console.log(fails ? `Провалено проверок: ${fails}` : 'Проверка защиты пройдена');
process.exit(fails ? 1 : 0);
