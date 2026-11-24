// Проверка словарей i18n/<язык>.tsv: ключи существуют, HTML-теги и {подстановки} совпадают, нет прямых кавычек в тексте.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const dir = fileURLToPath(new URL('../i18n/', import.meta.url));
const keys = new Map();
for (const l of readFileSync(dir + 'keys.tsv', 'utf8').split('\n')) { const p = l.split('\t'); if (/^\d+$/.test(p[0])) keys.set(p[0], { cat: p[1], s: p.slice(2).join('\t') }); }
const tags = s => (s.match(/<[^>]+>/g) || []).join('');
const ph = s => (s.match(/\{\w+\}/g) || []).sort().join('');
let bad = 0, orphan = 0;
for (const f of readdirSync(dir).filter(f => /^[a-z]{2}\.tsv$/.test(f))) {
  const seen = new Set(); let n = 0;
  readFileSync(dir + f, 'utf8').split('\n').forEach((l, i) => {
    if (!l.trim()) return;
    const t = l.indexOf('\t'), id = l.slice(0, t), v = l.slice(t + 1), k = keys.get(id);
    const err = m => { bad++; console.log(`${f}:${i + 1} [${id}] ${m}`); };
    if (t < 0) return err('нет табуляции');
    if (!k) { orphan++; return; }
    if (seen.has(id)) err('повтор'); seen.add(id); n++;
    if (tags(k.s) !== tags(v)) err('HTML-теги не совпадают');
    if (ph(k.s) !== ph(v)) err('подстановки не совпадают');
    if (/"/.test(v.replace(/<[^>]+>/g, ''))) err('прямая кавычка в тексте');
    if (!v.trim()) err('пусто');
    if (/^[\s]/.test(v) || /\s$/.test(v)) err('пробел по краям');
  });
  const need = [...keys].filter(([, k]) => !['story', 'long', 'name'].includes(k.cat)).length;
  console.log(f, 'строк:', n, '/', keys.size, '(интерфейс и данные:', [...keys].filter(([id, k]) => seen.has(id) && !['story', 'long', 'name'].includes(k.cat)).length, '/', need + ')');
}
if (orphan) console.log(`строк для удалённых ключей (не используются): ${orphan}`);
process.exit(bad ? 1 : 0);
