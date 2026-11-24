// Локальный сервер для www/: npm start → http://localhost:8080
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const defRoot = fileURLToPath(new URL('../www/', import.meta.url));
const port = Number(process.env.PORT || 8080);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml' };

export function serve(p = port, root = defRoot) {
  const srv = http.createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (path.endsWith('/')) path += 'index.html';
      const file = normalize(join(root, path));
      if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(body);
    } catch {
      res.writeHead(404); res.end('Not found');
    }
  });
  return new Promise(r => srv.listen(p, '127.0.0.1', () => r(srv)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await serve(port, process.argv.includes('--dev') ? fileURLToPath(new URL('../build/dev/', import.meta.url)) : defRoot);
  console.log(`Небесный Престол: http://localhost:${port}`);
}
