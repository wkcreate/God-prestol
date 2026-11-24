// Сборка игры из src/ в www/ (выпуск) и build/dev/ (для тестов).
//  1. Все русские строки в коде оборачиваются в T("…") — так работает перевод на 20 языков.
//  2. Список строк сохраняется в i18n/keys.tsv, словари i18n/<язык>.tsv превращаются в www/lang/<язык>.js.
//  3. Выпускная версия собирается в один файл app.js внутри замыкания и минифицируется esbuild:
//     переменные игры недоступны из консоли браузера, код трудно читать и менять.
// Запуск: node scripts/build.mjs   (флаги: --dev-only, --no-min)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const req = createRequire(import.meta.url);
const tryReq = (name, alt) => { try { return req(name); } catch { return req(alt); } };
const acorn = tryReq('acorn', '/opt/node-tools/node_modules/acorn');
const walk = tryReq('acorn-walk', '/opt/npm-tools/node_modules/acorn-walk');
const esbuild = tryReq('esbuild', '/opt/npm-tools/node_modules/esbuild');

const root = fileURLToPath(new URL('..', import.meta.url));
const SRC = root + 'src/', WWW = root + 'www/', DEV = root + 'build/dev/', I18N = root + 'i18n/';
const JS = ['data.js', 'art.js', 'game.js', 'battle.js', 'ui.js', 'ui2.js', 'ext.js', 'meta.js'];
const args = process.argv.slice(2);
const pkg = JSON.parse(readFileSync(root + 'package.json', 'utf8'));
const CYR = /[А-Яа-яЁёЇїІіЄєҐґ]/;

/* ---------- 1. оборачивание строк в T() ---------- */
const keys = new Map();               // ключ → категория
const addKey = (k, cat) => { k = k.trim(); if (!k || !CYR.test(k)) return; const c = keys.get(k); if (!c || rank(cat) > rank(c)) keys.set(k, cat); };
const rank = c => ({ ui: 3, data: 2, name: 1, long: 0, story: 0 }[c] ?? 3);   // если строка встречается и в интерфейсе — она «ui»

function categorize(file, ancestors) {
  const decl = ancestors.find(n => n.type === 'VariableDeclarator');
  const name = decl && decl.id && decl.id.name;
  if (file === 'data.js') {
    if (name === 'STORY') return 'story';
    if (['NPC_NAMES', 'GUILD_NAMES', 'CLAN_NAMES'].includes(name)) return 'name';
    if (name === 'HERO_RAW') { const arr = [...ancestors].reverse().find(n => n.type === 'ArrayExpression' && n !== ancestors[1]); return 'data'; }
    if (name === 'MAIL') { const prop = [...ancestors].reverse().find(n => n.type === 'Property'); return prop && prop.key && prop.key.name === 'b' ? 'long' : 'data'; }
    return 'data';
  }
  if (file === 'meta.js') {
    const asg = ancestors.find(n => n.type === 'AssignmentExpression' && n.left && n.left.property);
    if (asg && ['privacy', 'terms'].includes(asg.left.property.name)) return 'long';
  }
  return 'ui';
}

function transform(file, code) {
  const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
  const edits = [];
  walk.ancestor(ast, {
    Literal(node, _st, anc) {
      if (typeof node.value !== 'string' || !CYR.test(node.value)) return;
      const parent = anc[anc.length - 2];
      if (parent && parent.type === 'Property' && parent.key === node && !parent.computed) return;   // ключи объектов не трогаем
      let cat = categorize(file, anc);
      if (file === 'data.js' && cat === 'data') {                                                 // имя героя в HERO_RAW — второй элемент строки
        const row = anc[anc.length - 2];
        if (row && row.type === 'ArrayExpression' && row.elements[1] === node && anc.some(a => a.type === 'VariableDeclarator' && a.id.name === 'HERO_RAW')) cat = 'name';
      }
      addKey(node.value, cat);
      if (anc.some(a => a.type === 'CallExpression' && a.callee.type === 'Identifier' && a.callee.name === 'K')) return;   // K("…") — хранится как ключ
      const pre = /[\w$]/.test(code[node.start - 1] || '') ? ' ' : '';            // return'…' → return T("…")
      edits.push([node.start, node.end, `${pre}T(${JSON.stringify(node.value)})`]);
    },
    TemplateElement(node, _st, anc) {
      const raw = node.value.raw;
      if (!CYR.test(raw)) return;
      if (raw.includes('\\')) { console.warn('пропущено (экранирование):', file, raw.slice(0, 60)); return; }
      const cat = categorize(file, anc);
      const re = /[^<>"]+/g; let m;
      while ((m = re.exec(raw))) {
        const run = m[0]; if (!CYR.test(run)) continue;
        const lead = run.length - run.trimStart().length, text = run.trim();
        addKey(text, cat);
        const s = node.start + m.index + lead;
        edits.push([s, s + text.length, '${T(' + JSON.stringify(text) + ')}']);
      }
    }
  });
  edits.sort((a, b) => b[0] - a[0]);
  let out = code;
  for (const [s, e, t] of edits) out = out.slice(0, s) + t + out.slice(e);
  return out;
}

const transformed = {};
for (const f of JS) transformed[f] = transform(f, readFileSync(SRC + f, 'utf8'));
// строки из index.html (data-t, data-ta) и подписи, которые код передаёт в T() сам
for (const m of readFileSync(SRC + 'index.html', 'utf8').matchAll(/data-ta?="([^"]+)"/g)) addKey(m[1], 'ui');
for (const f of JS) for (const m of readFileSync(SRC + f, 'utf8').matchAll(/T\('([^']+)'\)/g)) addKey(m[1], 'ui');

/* ---------- 2. ключи и словари ---------- */
mkdirSync(I18N, { recursive: true });
const old = existsSync(I18N + 'keys.tsv') ? readFileSync(I18N + 'keys.tsv', 'utf8').trim().split('\n').filter(Boolean).map(l => l.split('\t')) : [];
const idOf = new Map(old.map(([id, , k]) => [k, +id]));               // номера ключей стабильны между сборками
let next = Math.max(0, ...old.map(r => +r[0])) + 1;
const rows = [...keys].map(([k, c]) => { if (!idOf.has(k)) idOf.set(k, next++); return [idOf.get(k), c, k]; }).sort((a, b) => a[0] - b[0]);
const esc = s => s.replace(/\t/g, ' ').replace(/\n/g, '\\n');
writeFileSync(I18N + 'keys.tsv', rows.map(r => `${r[0]}\t${r[1]}\t${esc(r[2])}`).join('\n') + '\n');
const byId = new Map(rows.map(r => [r[0], r[2]]));
const langs = existsSync(I18N) ? readdirSync(I18N).filter(f => /^[a-z]{2}\.tsv$/.test(f)).map(f => f.slice(0, 2)) : [];
const dict = {}, stats = {};
for (const l of langs) {
  const d = {}; let n = 0;
  for (const line of readFileSync(I18N + l + '.tsv', 'utf8').split('\n')) {
    const i = line.indexOf('\t'); if (i < 0) continue;
    const id = +line.slice(0, i), v = line.slice(i + 1).replace(/\\n/g, '\n').trim();
    const k = byId.get(id); if (k && v) { d[k] = v; n++; }
  }
  dict[l] = d; stats[l] = n;
}

/* ---------- 3. сборка ---------- */
const head = readFileSync(SRC + 'index.html', 'utf8');
const scriptTags = /<script src="i18n\.js"><\/script>[\s\S]*?<script src="meta\.js"><\/script>/;
function writeCommon(dir) {
  mkdirSync(dir + 'lang', { recursive: true });
  for (const d of ['fonts', 'icons']) cpSync(SRC + d, dir + d, { recursive: true });
  cpSync(SRC + 'privacy.html', dir + 'privacy.html');
  for (const l of langs) writeFileSync(dir + `lang/${l}.js`, `NP_L.${l}=${JSON.stringify(dict[l])};\n`);
}
// разработка: отдельные файлы, без минификации (тесты обращаются к переменным игры)
rmSync(DEV, { recursive: true, force: true }); mkdirSync(DEV, { recursive: true }); writeCommon(DEV);
cpSync(SRC + 'i18n.js', DEV + 'i18n.js');
for (const f of JS) writeFileSync(DEV + f, transformed[f]);
writeFileSync(DEV + 'index.html', head);
let bundleSize = 0;
if (!args.includes('--dev-only')) {
  rmSync(WWW, { recursive: true, force: true }); mkdirSync(WWW, { recursive: true }); writeCommon(WWW);
  const body = JS.map(f => `/* ${f} */\n` + transformed[f].replace(/^'use strict';/, '')).join('\n;\n');
  const minify = !args.includes('--no-min');
  const app = esbuild.transformSync(`(()=>{'use strict';\n${body}\n})();`, { minify, target: 'es2020', legalComments: 'none', charset: 'utf8' }).code;
  const i18n = esbuild.transformSync(readFileSync(SRC + 'i18n.js', 'utf8'), { minify, target: 'es2020', charset: 'utf8' }).code;
  writeFileSync(WWW + 'app.js', app); writeFileSync(WWW + 'i18n.js', i18n); bundleSize = app.length;
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'">`;
  writeFileSync(WWW + 'index.html', head.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + csp).replace(scriptTags, '<script src="i18n.js"></script>\n<script src="app.js"></script>'));
  // манифест и офлайн-кэш
  writeFileSync(WWW + 'manifest.webmanifest', JSON.stringify({ name: 'Celestial Throne', short_name: 'Throne', description: 'Fantasy idle RPG: heroes of six factions, 600 stages, arena and guilds.', lang: 'en', start_url: './', scope: './', display: 'standalone', orientation: 'portrait', background_color: '#05081a', theme_color: '#07080b', categories: ['games'],
    icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] }, null, 1));
  const files = ['./', 'index.html', 'manifest.webmanifest', 'privacy.html', 'i18n.js', 'app.js', 'lang/en.js', ...readdirSync(WWW + 'fonts').filter(f => f.endsWith('.woff')).map(f => 'fonts/' + f), 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
  writeFileSync(WWW + 'sw.js', `/* офлайн-кэш веб-версии; версия кэша меняется с версией игры */
const CACHE='np-${pkg.version}-${Date.now().toString(36)}';const FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&new URL(e.request.url).origin===location.origin){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return res}).catch(()=>caches.match('index.html'))))});
`);
}
const total = rows.length, cats = rows.reduce((a, r) => (a[r[1]] = (a[r[1]] || 0) + 1, a), {});
console.log(`строк для перевода: ${total}`, cats);
console.log('переведено:', Object.entries(stats).map(([l, n]) => `${l} ${n}`).join(', ') || 'нет словарей');
if (bundleSize) console.log(`app.js: ${(bundleSize / 1024).toFixed(0)} КБ`);
