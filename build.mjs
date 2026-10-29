// Static site generator: node build.mjs  →  ./dist
import fs from 'node:fs';
import path from 'node:path';
import { site } from './src/data/site.mjs';
import { destinations } from './src/data/destinations.mjs';
import { species } from './src/data/species.mjs';
import { trips } from './src/data/trips.mjs';
import { fleet } from './src/data/fleet.mjs';
import { guides, posts } from './src/data/content.mjs';
import { missingImages, images } from './src/templates/helpers.mjs';
import { createHash } from 'node:crypto';
import { setAssetVersion } from './src/templates/layout.mjs';
import * as M from './src/templates/pages-main.mjs';
import * as C from './src/templates/pages-content.mjs';

const OUT = path.resolve('dist');
const t0 = Date.now();
// Overwrite in place (no wipe) so a running dev server never serves a half-built site; stale files are pruned at the end.
fs.mkdirSync(OUT, { recursive: true });
const written = new Set();
const write = (f, data) => { written.add(path.resolve(f)); fs.writeFileSync(f, data); };
const copy = (from, to) => { written.add(path.resolve(to)); fs.copyFileSync(from, to); };

setAssetVersion(createHash('md5').update(fs.readFileSync('src/assets/css/fonts.css')).update(fs.readFileSync('src/assets/css/styles.css')).update(fs.readFileSync('src/assets/js/main.js')).digest('hex').slice(0, 8));

// ── Pages ─────────────────────────────────────────────────────────────────────
const pages = [];
const add = (p, html, meta = {}) => pages.push({ path: p, html, ...meta });
add('/', M.home(), { pri: '1.0', freq: 'weekly' });
add('/fishing-charters/', M.fleetIndex(), { pri: '0.9', freq: 'weekly' });
fleet.forEach(b => add(`/fishing-charters/${b.slug}/`, M.boatPage(b), { pri: '0.7' }));
add('/costa-rica-fishing-destinations/', M.destinationsIndex(), { pri: '0.9' });
destinations.forEach(d => add(d.path, M.destinationPage(d), { pri: '0.9', freq: 'weekly' }));
add('/fishing-trips/', M.tripsIndex(), { pri: '0.8' });
trips.forEach(t => add(t.path, M.tripPage(t), { pri: '0.8' }));
add('/costa-rica-fish-species/', C.speciesIndex(), { pri: '0.8' });
species.forEach(s => add(`/costa-rica-${s.slug}-fishing/`, C.speciesPage(s), { pri: '0.8' }));
add('/best-time-to-fish-costa-rica/', C.seasons(), { pri: '0.9', freq: 'monthly' });
add('/captains/', C.captainsPage(), { pri: '0.6' });
Object.values(guides).forEach(g => add(g.path, C.guidePage(g), { pri: '0.7' }));
add('/costa-rica-fishing-tournaments/', C.tournamentsPage(), { pri: '0.6' });
add('/blog/', C.blogIndex(), { pri: '0.6', freq: 'weekly' });
posts.forEach(p => add(`/blog/${p.slug}/`, C.postPage(p), { pri: '0.6', lastmod: p.date }));
add('/faq/', C.faqPage(), { pri: '0.7' });
add('/about/', C.aboutPage(), { pri: '0.5' });
add('/contact/', C.contactPage(), { pri: '0.6' });
add('/book/', C.bookPage(), { pri: '0.8' });
add('/photo-gallery/', C.galleryPage(), { pri: '0.5' });
add('/photo-credits/', C.creditsPage(), { pri: '0.2' });
add('/privacy-policy/', C.privacyPage(), { pri: '0.2' });
add('/terms/', C.termsPage(), { pri: '0.2' });

for (const p of pages) {
  const file = path.join(OUT, p.path, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  write(file, p.html);
}
write(path.join(OUT, '404.html'), C.notFound());

// ── Assets ────────────────────────────────────────────────────────────────────
const copyDir = (from, to, filter = () => true) => {
  if (!fs.existsSync(from)) return;
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, e.name), d = path.join(to, e.name);
    if (e.isDirectory()) copyDir(s, d, filter);
    else if (filter(s)) { fs.mkdirSync(to, { recursive: true }); copy(s, d); }
  }
};
copyDir('src/assets', path.join(OUT, 'assets'), f => !f.endsWith('manifest.json') && !f.endsWith('fonts.css'));
// Single stylesheet: self-hosted @font-face rules + design system
write(path.join(OUT, 'assets/css/styles.css'), fs.readFileSync('src/assets/css/fonts.css', 'utf8') + '\n' + fs.readFileSync('src/assets/css/styles.css', 'utf8'));
for (const f of ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
  const s = path.join('src/assets/img/brand', f);
  if (fs.existsSync(s)) copy(s, path.join(OUT, f));
}

// ── SEO files ─────────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const imgsIn = html => [...new Set([...html.matchAll(/<img src="(\/assets\/img\/[^"]+)"/g)].map(m => m[1].replace(/-800\.webp$/, '.webp')))].slice(0, 6);
write(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map(p => `  <url><loc>${site.url}${p.path}</loc><lastmod>${p.lastmod || today}</lastmod>${p.freq ? `<changefreq>${p.freq}</changefreq>` : ''}<priority>${p.pri || '0.5'}</priority>${imgsIn(p.html).map(i => `<image:image><image:loc>${site.url}${i}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>
`);
write(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /404.html\n\nSitemap: ${site.url}/sitemap.xml\n`);
write(path.join(OUT, 'site.webmanifest'), JSON.stringify({
  name: site.legalName, short_name: site.name, start_url: '/', display: 'standalone', background_color: '#04121c', theme_color: '#04121c',
  icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
}, null, 2));
write(path.join(OUT, 'llms.txt'), `# ${site.legalName}

> Costa Rica fishing charters: vetted local captains and boats in ${destinations.length} destinations, with per-boat pricing, seasons and species guides.

## Destinations
${destinations.map(d => `- [${d.name} fishing charters](${site.url}${d.path}): ${d.peak}`).join('\n')}

## Fishing trips
${trips.map(t => `- [${t.name}](${site.url}${t.path}): ${t.summary}`).join('\n')}

## Species
${species.map(s => `- [${s.name} fishing in Costa Rica](${site.url}/costa-rica-${s.slug}-fishing/)`).join('\n')}

## Planning
- [Fleet & pricing](${site.url}/fishing-charters/)
- [Best time to fish in Costa Rica](${site.url}/best-time-to-fish-costa-rica/)
- [Costa Rica fishing license](${site.url}/costa-rica-fishing-license/)
- [FAQ](${site.url}/faq/)
- [Book a charter](${site.url}/book/)
`);

// ── Prune files from previous builds ─────────────────────────────────────────
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { prune(p); if (!fs.readdirSync(p).length) fs.rmdirSync(p); } else if (!written.has(path.resolve(p))) fs.unlinkSync(p); } };
prune(OUT);

// ── Quality gates: internal links, anchors, images, meta lengths ──────────────
const exists = new Set(pages.map(p => p.path));
const problems = [];
const warn = [];
for (const p of [...pages, { path: '/404.html', html: fs.readFileSync(path.join(OUT, '404.html'), 'utf8') }]) {
  for (const [, href] of p.html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
    if (href.startsWith('/assets/')) { if (!fs.existsSync(path.join(OUT, href))) problems.push(`${p.path}: missing asset ${href}`); continue; }
    if (/\.(svg|png|webmanifest|xml|txt|jpg)$/.test(href)) { if (!fs.existsSync(path.join(OUT, href))) warn.push(`${p.path}: missing file ${href}`); continue; }
    if (!exists.has(href)) problems.push(`${p.path}: broken link ${href}`);
  }
  for (const [, src] of p.html.matchAll(/<img src="([^"]+)"/g)) if (!fs.existsSync(path.join(OUT, src))) problems.push(`${p.path}: missing image ${src}`);
  for (const [, id] of p.html.matchAll(/href="#([^"]+)"/g)) if (id && !p.html.includes(`id="${id}"`)) problems.push(`${p.path}: broken anchor #${id}`);
  const title = (p.html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (p.html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const h1s = (p.html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`${p.path}: ${h1s} <h1> tags`);
  if (title.replace(/&amp;/g, '&').length > 65) warn.push(`${p.path}: title ${title.length} chars`);
  if (desc.replace(/&amp;/g, '&').length > 160 || desc.length < 70) warn.push(`${p.path}: description ${desc.length} chars`);
}
const titles = pages.map(p => (p.html.match(/<title>([^<]*)<\/title>/) || [])[1]);
titles.forEach((t, i) => { if (titles.indexOf(t) !== i) problems.push(`duplicate <title>: ${t}`); });

console.log(`✔ Built ${pages.length + 1} pages in ${Date.now() - t0} ms → dist/`);
console.log(`  ${Object.keys(images).length} images available`);
if (missingImages.size) console.log(`  ⚠ image ids not found (fallbacks used): ${[...missingImages].sort().join(', ')}`);
if (warn.length) console.log('  ⚠ ' + warn.join('\n  ⚠ '));
if (problems.length) { console.error('✖ ' + problems.join('\n✖ ')); process.exitCode = 1; }
