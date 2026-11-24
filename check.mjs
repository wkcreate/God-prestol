// Быстрая проверка без браузера: синтаксис исходников и собранных файлов, совпадение версий,
// наличие файлов из index.html. Запускать после `npm run build`.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
let bad = 0;
const check = dir => {
  const d = new URL(dir, root);
  if (!existsSync(d)) { bad++; console.error('Нет папки', dir, '— сначала выполните npm run build'); return; }
  for (const f of readdirSync(d).filter(f => f.endsWith('.js'))) {
    try { execFileSync(process.execPath, ['--check', new URL(f, d).pathname], { stdio: 'pipe' }); console.log('ok   ', dir + f); }
    catch (e) { bad++; console.error('FAIL ', dir + f, '\n', String(e.stderr || e)); }
  }
};
['src/', 'www/', 'www/lang/'].forEach(check);
const pkg = JSON.parse(readFileSync(new URL('package.json', root))).version;
const game = /const VERSION='([^']+)'/.exec(readFileSync(new URL('src/data.js', root), 'utf8'))?.[1];
if (pkg !== game) { bad++; console.error(`Версии не совпадают: package.json ${pkg}, src/data.js ${game}`); }
else console.log('version', pkg);
if (existsSync(new URL('www/index.html', root))) {
  const html = readFileSync(new URL('www/index.html', root), 'utf8');
  for (const s of [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]))
    if (!existsSync(new URL('www/' + s, root))) { bad++; console.error('Нет файла из index.html:', s); }
  if (!html.includes('Content-Security-Policy')) { bad++; console.error('В www/index.html нет CSP'); }
}
process.exit(bad ? 1 : 0);
