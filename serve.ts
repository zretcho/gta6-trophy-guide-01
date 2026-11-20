// Leonida Trophy Guide — tiny static file server for local testing.
// Serves app/ at its root on http://localhost:8080 by default.
// Run: node serve.ts [port]
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(join(fileURLToPath(import.meta.url), '..', 'app'));
const port = Number(process.argv[2] || process.env.PORT || 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const server = createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'content-type': 'text/plain' });
    res.end('Method not allowed\n');
    return;
  }
  const urlPath = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
  let rel = normalize(urlPath).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]/, '');
  if (rel === '') rel = 'index.html';
  const file = join(appDir, rel);
  if (!file.startsWith(appDir + sep) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found\n');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`Leonida Trophy Guide at http://localhost:${port}/ (serving ${appDir})`);
});
