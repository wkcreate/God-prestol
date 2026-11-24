// Смоук-тест в настоящем браузере.
// Часть 1 (разработческая сборка build/dev): вход → новый персонаж → призыв → бой → прокачка → все экраны → сохранение → смена персонажа.
// Часть 2 (выпускная сборка www): игра запускается, переменные игры недоступны из консоли, сохранение зашифровано.
// Падает, если на странице случилась хоть одна ошибка JavaScript.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const dir = p => fileURLToPath(new URL(p, import.meta.url));
const browser = await chromium.launch();
const errors = [];
const step = async (name, fn) => { await fn(); console.log('✓', name); };
async function newCharacter(page, name) {
  await page.click('[data-act="chNew"]');
  await page.fill('#newNm', name);
  await page.click('[data-act="pickCls"][data-c="arc"]');
  await page.click('[data-act="startGame"]');
  await page.click('#modal [data-act="close"]');
}
async function skipStory(page) {
  for (let i = 0; i < 12 && await page.isVisible('#story'); i++) { await page.click('#story .stbox'); await page.waitForTimeout(60); }
  if (await page.isVisible('#modal [data-act="storyClose"]')) await page.click('#modal [data-act="storyClose"]');
}
async function part1() {
  const srv = await serve(8099, dir('../build/dev/'));
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push('dev: ' + e));
  try {
    await page.goto('http://127.0.0.1:8099/index.html'); await page.waitForTimeout(2200);
    await step('новый персонаж', () => newCharacter(page, 'Test'));
    await step('почта', async () => { await page.click('[data-act="mail"]'); await page.click('[data-act="mailAll"]'); await page.evaluate('closeModal()'); });
    await step('призыв ×10', async () => {
      await page.evaluate("go('summon',{p:'std'})");
      await page.click('[data-act="sum"][data-n="10"]'); await page.click('[data-act="sumAll"]'); await page.click('#modal [data-act="close"]');
    });
    await step('сюжет и бой', async () => {
      await page.evaluate("go('battle')"); await page.click('[data-act="fight"]'); await page.waitForTimeout(300);
      await skipStory(page); await page.waitForTimeout(1500);
      await page.click('#bpause'); await page.click('#bpause'); await page.click('[data-act="bSkip"]');
      await page.waitForSelector('#bres .ribbon'); await page.click('#bres [data-act="bExit"]');
    });
    await step('прокачка и снаряжение', async () => {
      await page.evaluate("S.exp=1e7;S.silver=1e8;S.ore=1e5;go('heroes',{p:'team'})"); await page.click('[data-act="lvTeam"]');
      await page.evaluate("go('main',{t:'gear'})"); await page.click('[data-act="gearAll"]');
    });
    await step('все экраны', async () => {
      for (const [s, p] of [['main'], ['arena'], ['guild'], ['events', 'ach'], ['events', 'quests'], ['events', 'login'], ['summon', 'wheel'], ['shop', 'items'], ['shop', 'skins'], ['paid'], ['paid', 'pz'], ['paid', 'pass'], ['paid', 'packs'], ['paid', 'altar'], ['story'], ['home']])
        await page.evaluate(`go('${s}'${p ? `,{p:'${p}'}` : ''})`);
    });
    await step('сохранение и вход', async () => {
      const before = await page.evaluate('[S.stage,Object.keys(S.h).length,S.name]');
      await page.reload(); await page.waitForTimeout(2200);
      await page.click('[data-act="enter"]'); await page.waitForTimeout(300);
      const after = await page.evaluate('[S.stage,Object.keys(S.h).length,S.name]');
      if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error(`прогресс не сохранился: ${before} → ${after}`);
    });
    await step('второй персонаж и переключение', async () => {
      await page.evaluate('ACT.switchChar()'); await page.waitForTimeout(200);
      await newCharacter(page, 'Second');
      await page.evaluate('ACT.switchChar()'); await page.waitForTimeout(200);
      const n = await page.locator('.ch[data-act="chPick"]').count();
      if (n !== 2) throw new Error('ожидалось 2 персонажа, найдено ' + n);
    });
    await step('подделка сохранения отклоняется', async () => {
      const bad = await page.evaluate(() => { const id = JSON.parse(localStorage.getItem('np_chars'))[0].id; const k = 'np_c_' + id; const s = localStorage.getItem(k); const p = s.split('.'); p[1] = p[1].slice(0, 20) + (p[1][20] === 'A' ? 'B' : 'A') + p[1].slice(21); try { dec(p.join('.')); return false; } catch (e) { return true; } });
      if (!bad) throw new Error('изменённое сохранение прошло проверку');
    });
  } catch (e) { errors.push('ТЕСТ dev: ' + e.message); }
  finally { await page.close(); srv.close(); }
}
async function part2() {
  const srv = await serve(8098, dir('../www/'));
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push('www: ' + e));
  try {
    await page.goto('http://127.0.0.1:8098/index.html'); await page.waitForTimeout(2200);
    await step('выпускная сборка: новый персонаж', () => newCharacter(page, 'Prod'));
    await step('выпускная сборка: бой', async () => {
      await page.click('.fightb'); await page.waitForTimeout(300); await skipStory(page);
      await page.waitForTimeout(800); await page.click('[data-act="bSkip"]'); await page.waitForSelector('#bres .ribbon'); await page.click('#bres [data-act="bExit"]');
    });
    await step('выпускная сборка: защита', async () => {
      const r = await page.evaluate(() => [typeof S, typeof give, typeof ACT, (Object.keys(localStorage).find(k => k.startsWith('np_c_')) && localStorage.getItem(Object.keys(localStorage).find(k => k.startsWith('np_c_'))).slice(0, 4))]);
      if (r[0] !== 'undefined' || r[1] !== 'undefined' || r[2] !== 'undefined') throw new Error('переменные игры видны из консоли: ' + r);
      if (r[3] !== 'NP2.') throw new Error('сохранение не зашифровано');
    });
  } catch (e) { errors.push('ТЕСТ www: ' + e.message); }
  finally { await page.close(); srv.close(); }
}
await part1();
await part2();
await browser.close();
if (errors.length) { console.error('Ошибки:\n' + errors.join('\n')); process.exit(1); }
console.log('Смоук-тест пройден');
