// Симуляция прохождения без доната (F2P) в настоящем браузере на разработческой сборке build/dev.
// Виртуальные часы и детерминированный Math.random; игрок заходит 3 раза в день и делает всё бесплатное:
// вход, почта, задания, добыча, быстрая добыча, колесо, арена, союз (титан, война кланов, лавка), событие Бездны,
// призывы на заработанные свитки/купоны/золото, прокачка (уровни, снаряжение, звёзды, таланты, возвышение,
// божественное/древнее, питомцы, крылья, артефакты), чтение сюжета и продвижение по кампании до первого поражения.
// Запуск: node scripts/f2p-sim.mjs [дней=900] [сиды=1,2,3]
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import { serve } from './serve.mjs';

const DAYS = +(process.argv[2] || 900);
const SEEDS = (process.argv[3] || '1,2,3').split(',').map(Number);
const dir = p => fileURLToPath(new URL(p, import.meta.url));
const srv = await serve(8131, dir('../build/dev/'));
const browser = await chromium.launch();
const results = [];

for (const seed of SEEDS) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.addInitScript(seed => {
    let T = Date.UTC(2026, 0, 5, 8, 0, 0);              // понедельник, 08:00
    const RD = Date;
    class VD extends RD { constructor(...a) { if (a.length === 0) super(T); else super(...a); } static now() { return T; } }
    window.Date = VD; window.__adv = ms => { T += ms; }; window.__T = () => T;
    let s = seed * 2654435761 >>> 0;
    Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    try { localStorage.clear(); localStorage.setItem('np_lang', 'en'); } catch (e) {}
  }, seed);
  await page.goto('http://127.0.0.1:8131/index.html');
  await page.waitForTimeout(1500);
  await page.click('[data-act="chNew"]');
  await page.fill('#newNm', 'Sim' + seed);
  await page.click(`[data-act="pickCls"][data-c="${['war', 'mag', 'arc', 'asn'][seed % 4]}"]`);
  await page.click('[data-act="startGame"]');
  await page.evaluate(() => {
    window.render = () => {}; window.toast = () => {}; window.sfx = () => {}; window.haptic = () => {}; window.music = () => {};
    window.modal = () => {}; window.closeModal = () => {}; window.ask = () => {}; window.save = () => {};
    window.storyShow = (c, kind, then) => { if (kind == 'l') { if (!S.story.seen.includes(c)) S.story.seen.push(c); storyFinish(c); } else if (!S.story.bs.includes(c)) S.story.bs.push(c); then && then(); };
    S.set.anx = 0;
    const battle = () => { if (!BT.active) return false; BT.skip(); BT.close(); return true; };
    const loop = (f, max = 999) => { let n = 0; while (n < max && f()) n++; return n; };
    window.SIM = {
      log: [], stuck: 0, fights: 0, losses: 0,
      session(dayIdx) {
        S.pt = (S.pt || 0) + 6e5; daily(); mailSync(); passSync();
        if (S.login.last !== today()) ACT.login();
        S.mail.forEach(m => { if (!m.got) mailClaim(m.id); });
        if (!S.d.gift) ACT.gift();
        claimAfk(); while (S.d.qa > 0) quickAfk();
        loop(() => (S.d.fw > 0 || S.token > 0) && spinWheel(1));
        if (S.d.fs > 0) summon('std', 1);
        // союз
        if (!S.g) joinGuild(guildOffers()[0].n, guildOffers()[0].lv);
        if (!S.d.ci) ACT.gCheck();
        if (S.gw) ACT.gwClaim();
        while (S.d.gb > 0) { ACT.gBoss(); battle(); }
        while (S.d.war > 0) { const w = S.g.war.riv.map((r, i) => ({ r, i })).sort((a, b) => (a.r.beat - b.r.beat) || (a.r.f - b.r.f))[0]; ACT.gWar({ i: w.i }); battle(); }
        loop(() => buyItem(GSHOP, 'g5'), 1); loop(() => S.gcoin >= 1200 && buyItem(GSHOP, 'g2'));
        // арена
        if (!S.d.arr) ACT.arDaily();
        while (S.d.ar > 0) { const o = arenaOpps(); const i = o.reduce((b, x, j) => (x.pw < o[b].pw ? j : b), 0); ACT.arFight({ i }); battle(); }
        loop(() => S.acoin >= 600 && buyItem(ASHOP, 'a2'));
        // событие Бездны
        while (S.d.ev > 0 && S.ev.t < 30) { const t0 = S.ev.t; ACT.evFight(); battle(); if (S.ev.t === t0) break; }
        this.upgrade();
        // призывы
        loop(() => S.scroll >= 10 && summon('std', 10));
        loop(() => S.coupon >= 10 && summon('cpn', 10));
        loop(() => S.gold >= 2600 + 300 && summon('prem', 10));
        this.upgrade();
        // сюжет
        let c; while ((c = storyNext())) { if (!S.story.seen.includes(c)) S.story.seen.push(c); if (!storyFinish(c)) break; }
        // кампания
        const s0 = S.stage; let lost = 0;
        while (S.stage <= MAX_STAGE && lost < 2) { const st = S.stage; ACT.fight(); if (!battle()) break; this.fights++; if (S.stage === st) { lost++; this.losses++; this.upgrade(); } }
        // задания, достижения, обучение, путь
        QCHEST.forEach((q, i) => ACT.qchest({ i }));
        ACH.forEach(a => achClaim(a.id)); loop(() => tutClaim(), 20);
        PASS_TIERS.forEach((t, i) => passClaim(i, 'f'));
        this.upgrade();
        return S.stage - s0;
      },
      upgrade() {
        autoTeam();
        loop(() => levelTeam() > 0, 50);
        const team = S.team.filter(Boolean);
        for (const k of Object.keys(S.h)) loop(() => starUp(k, false), 30);
        for (const k of team) if (k !== '@main') loop(() => starUp(k, true), 30);
        for (const k of team) { gearAll(k); while (ascend(k)) {} for (const kind of ['dv', 'an']) for (let sl = 0; sl < 2; sl++) loop(() => extraUp(k, kind, sl), 400); }
        for (const t of ['atk', 'hp', 'crit']) talUpN(t, 100);
        while (S.egg > 0) hatch();
        const pets = Object.keys(S.pets); if (pets.length) { if (!S.pet || !S.pets[S.pet]) S.pet = pets[0]; loop(() => petUp(S.pet), 400); pets.forEach(p => loop(() => petUp(p), 400)); }
        WINGS.forEach(W => wingCraft(W.id)); const ws = Object.keys(S.wings); if (ws.length) { if (!S.wing) S.wing = ws[0]; ws.forEach(w => loop(() => wingUp(w), 400)); }
        RELICS.forEach(R => relicCraft(R.id)); Object.keys(S.relics).forEach(id => { if (!S.relEq.includes(id)) relicEquip(id); loop(() => relicUp(id), 400); });
        autoTeam(); loop(() => levelTeam() > 0, 50);
      },
      day(d) {
        const before = S.stage;
        for (const h of [0, 6, 13]) { this.session(d); __adv(h === 13 ? 11 * 3600e3 : (h === 0 ? 6 : 7) * 3600e3); }
        const m = po('@main');
        const row = { d, stage: S.stage, ch: chapOf(Math.min(S.stage, MAX_STAGE)), lv: m.lv, tr: m.tr || 0, rl: m.rl || 0, zl: m.zl || 0, pw: teamPower(), heroes: Object.keys(S.h).length, usr: Object.keys(S.h).filter(k => HERO[k].rar == 4).length, lr: Object.keys(S.h).filter(k => HERO[k].rar >= 5).length, maxSt: Math.max(...Object.values(S.h).map(h => h.st)), story: S.story.done.length, gold: S.gold, asc: S.asc };
        this.log.push(row); this.stuck = S.stage === before ? this.stuck + 1 : 0;
        return row;
      }
    };
  });
  const t0 = Date.now(); let last;
  for (let d = 1; d <= DAYS; d++) {
    last = await page.evaluate(d => SIM.day(d), d);
    if (d % 50 === 0 || last.stage > 600) console.log(`seed ${seed} · day ${d}: stage ${last.stage} ch ${last.ch} lv ${last.lv} tr ${last.tr}/${last.rl}/${last.zl} power ${last.pw} heroes ${last.heroes} usr ${last.usr} maxStar ${last.maxSt} story ${last.story} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    if (last.stage > 600 && last.tr >= 2 && last.zl >= 100) break;
  }
  const log = await page.evaluate(() => SIM.log);
  const fights = await page.evaluate(() => ({ f: SIM.fights, l: SIM.losses }));
  results.push({ seed, log, fights, errors: [...new Set(errors)].slice(0, 10) });
  await page.close();
}
writeFileSync(dir('../build/f2p-sim.json'), JSON.stringify(results));
const firstDay = (log, f) => (log.find(f) || {}).d || null;
for (const r of results) {
  const L = r.log;
  console.log(`\nseed ${r.seed}: battles ${r.fights.f}, lost ${r.fights.l}, JS errors: ${r.errors.length ? r.errors.join(' | ') : 'none'}`);
  for (const ch of [1, 5, 10, 15, 20, 25, 30]) console.log(`  chapter ${ch} cleared: day ${firstDay(L, x => x.stage > ch * 20)}`);
  console.log(`  main lv 100: day ${firstDay(L, x => x.lv >= 100 || x.tr)}, lv 300: ${firstDay(L, x => x.lv >= 300 || x.tr)}, lv 500: ${firstDay(L, x => x.lv >= 500 || x.tr)}, R1: ${firstDay(L, x => x.tr >= 1)}, Zenith: ${firstDay(L, x => x.tr >= 2)}, Zenith 100: ${firstDay(L, x => x.tr >= 2 && x.zl >= 100)}`);
  console.log(`  story 30/30: day ${firstDay(L, x => x.story >= 30)}; first USR: day ${firstDay(L, x => x.usr > 0)}; first 21★: day ${firstDay(L, x => x.maxSt >= 21)}`);
}
await browser.close(); srv.close && srv.close(); process.exit(0);
