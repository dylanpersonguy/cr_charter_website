// Zero-dependency static server for ./dist with clean URLs.
// node serve.mjs [--watch] [--port 8080]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = path.resolve('dist');
const args = process.argv.slice(2);
let port = Number(args[args.indexOf('--port') + 1]) || Number(process.env.PORT) || 8080;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

const server = http.createServer((req, res) => {
  let url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (url.includes('..')) { res.writeHead(400).end(); return; }
  let file = path.join(ROOT, url);
  if (url.endsWith('/')) file = path.join(file, 'index.html');
  else if (!path.extname(url) && fs.existsSync(path.join(file, 'index.html'))) { res.writeHead(301, { Location: url + '/' }).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      res.end(fs.existsSync(path.join(ROOT, '404.html')) ? fs.readFileSync(path.join(ROOT, '404.html')) : 'Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});
server.on('error', e => { if (e.code === 'EADDRINUSE') { port++; server.listen(port); } else throw e; });
server.on('listening', () => console.log(`\n  ➜  Local:  http://localhost:${port}/\n`));
server.listen(port);

if (args.includes('--watch')) {
  let timer, running = false;
  const rebuild = () => {
    if (running) return; running = true;
    const p = spawn(process.execPath, ['build.mjs'], { stdio: 'inherit' });
    p.on('exit', () => { running = false; });
  };
  fs.watch('src', { recursive: true }, (_, f) => { if (f && !f.includes('manifest.json')) { clearTimeout(timer); timer = setTimeout(rebuild, 700); } });
  fs.watch('build.mjs', () => { clearTimeout(timer); timer = setTimeout(rebuild, 150); });
  console.log('  Watching src/ for changes…');
}
