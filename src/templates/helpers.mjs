import fs from 'node:fs';
import path from 'node:path';

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const strip = (s = '') => String(s).replace(/<[^>]+>/g, '');
export const money = n => '$' + Number(n).toLocaleString('en-US');
export const json = o => JSON.stringify(o).replace(/</g, '\\u003c');
export const jsonLd = o => `<script type="application/ld+json">${json(o)}</script>`;

// ── Images ────────────────────────────────────────────────────────────────────
// Image manifests are written by the photo-sourcing step into src/assets/img/<group>/manifest.json
const IMG_ROOT = path.resolve('src/assets/img');
export const images = {};
export const missingImages = new Set();
for (const group of ['places', 'fish', 'boats']) {
  const f = path.join(IMG_ROOT, group, 'manifest.json');
  if (!fs.existsSync(f)) continue;
  for (const e of JSON.parse(fs.readFileSync(f, 'utf8'))) {
    if (fs.existsSync(path.join(IMG_ROOT, e.file))) images[e.id] = { ...e, group };
  }
}
const FALLBACK_ORDER = ['hero-coast', 'pacific-sunset', 'sportfisher-running', 'deep-sea-ocean', 'sailfish'];

/** Resolve the first available image id from a candidate list (string or array). */
export function pick(cands) {
  const list = Array.isArray(cands) ? cands : [cands];
  for (const id of list) { if (images[id]) return images[id]; missingImages.add(id); }
  for (const id of FALLBACK_ORDER) if (images[id]) return images[id];
  return Object.values(images)[0] || null;
}

/** Resolve several distinct images from a candidate list. */
export function pickMany(cands, n) {
  const out = [], seen = new Set();
  for (const id of cands) { const im = images[id]; if (im && !seen.has(im.id)) { out.push(im); seen.add(im.id); } else if (!im) missingImages.add(id); if (out.length >= n) break; }
  return out;
}

/**
 * Responsive <img>. opts: { sizes, cls, eager, alt, ratio }
 * Uses the 800w variant + full-size variant as srcset candidates.
 */
export function img(cands, opts = {}) {
  const im = typeof cands === 'object' && cands && cands.file ? cands : pick(cands);
  if (!im) return `<div class="img-missing ${opts.cls || ''}" role="img" aria-label="${esc(opts.alt || '')}"></div>`;
  const sizes = opts.sizes || '100vw';
  // The manifest's alt text describes what is actually in the photo, so it wins over generic template text.
  const alt = esc(im.alt || opts.alt || im.subject || '');
  const load = opts.eager ? 'loading="eager" fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
  const smW = 800, smH = Math.round(im.height * (800 / im.width));
  const srcset = im.width > 800 ? `/assets/img/${im.file_sm} ${smW}w, /assets/img/${im.file} ${im.width}w` : `/assets/img/${im.file} ${im.width}w`;
  return `<img src="/assets/img/${opts.small ? im.file_sm : im.file}" srcset="${srcset}" sizes="${sizes}" width="${opts.small ? smW : im.width}" height="${opts.small ? smH : im.height}" alt="${alt}" ${load}${opts.cls ? ` class="${opts.cls}"` : ''}>`;
}
export const imgUrl = (cands, small = false) => { const im = pick(cands); return im ? `/assets/img/${small ? im.file_sm : im.file}` : ''; };

// ── Icons (inline SVG sprite) ─────────────────────────────────────────────────
const I = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2c2.1.7 3.5 2.8 3.5 5.8"/>',
  boat: '<path d="M2.5 15.5h19l-2.6 4.5H5.1z"/><path d="M12 3v12.5M12 3l6.5 9.5H12"/>',
  ruler: '<path d="M3 16.5 16.5 3 21 7.5 7.5 21z"/><path d="M7 12.5l1.8 1.8M10 9.5l1.8 1.8M13 6.5l1.8 1.8"/>',
  anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M5 13H3a9 9 0 0 0 18 0h-2M8.5 10.5h7"/>',
  fish: '<path d="M2.5 12c3.2-4.2 7-6.3 11-6.3 3.3 0 6 2.1 8 6.3-2 4.2-4.7 6.3-8 6.3-4 0-7.8-2.1-11-6.3z"/><path d="M2.5 12 1 8.5M2.5 12 1 15.5"/><circle cx="16.5" cy="11" r=".9" fill="currentColor"/>',
  marlin: '<path d="M1.5 12.5 9 11c2-3.5 5-5.5 8-5.5l-1.5 3c2.6.7 4.6 1.9 6 3.5-2.6 2.4-6 3.6-10 3.4L9 13.5z"/><path d="M14 9 12 4.5M19.5 12.5 22.5 9M19.5 12.5l3 3.5"/>',
  rooster: '<path d="M3 13c3-3 6.5-4.5 10.5-4.5 3.4 0 6 1.4 7.5 4.5-1.5 3-4.1 4.5-7.5 4.5C9.5 17.5 6 16 3 13z"/><path d="M8 10 7 4M10 9.3 10 3.5M12.5 8.6 13.5 3.5M15 8.8 17 5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
  phone: '<path d="M21 16.5v3a2 2 0 0 1-2.2 2A19.5 19.5 0 0 1 2.5 5.2 2 2 0 0 1 4.5 3h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.4 10.9a16 16 0 0 0 4.7 4.7l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  chat: '<path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3 20.5l1.4-4.8A8.5 8.5 0 1 1 20.5 11.5z"/><path d="M9 9.2c0 3 2.4 5.6 5.6 5.6l1-1.6-1.8-.9-.8.8a4 4 0 0 1-2.3-2.3l.8-.8-.9-1.8z" fill="currentColor" stroke="none"/>',
  menu: '<path d="M3 6.5h18M3 12h18M3 17.5h18"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  wave: '<path d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',
  leaf: '<path d="M5 19c0-8 5-13.5 15-14-.4 9.5-6 15-14 15"/><path d="M5 19c3-4 6-6.5 9.5-8.5"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8 21h8M9.5 17h5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  camera: '<path d="M4 7.5h3l1.5-2.5h7L17 7.5h3a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.8"/>',
  fly: '<path d="M20 4 9 15M20 4c-1 5-4.5 8-9 9.5M20 4c-5 1-8 4.5-9.5 9M9 15l-5 5M6.5 13.5l4 4"/>',
  kite: '<path d="M12 2 19 9l-7 9-7-9z"/><path d="M12 2v16M5 9h14M12 18c0 2-2 2-2 4"/>',
  family: '<circle cx="7.5" cy="6" r="2.5"/><circle cx="16.5" cy="6" r="2.5"/><circle cx="12" cy="12" r="1.8"/><path d="M3.5 20v-5a4 4 0 0 1 8 0M12.5 15a4 4 0 0 1 8 0v5M9.5 20v-2.5a2.5 2.5 0 0 1 5 0V20"/>',
  yacht: '<path d="M2 16.5h20l-3 4H5z"/><path d="M5 16.5 7 12h9.5l2.5 4.5M8.5 12l1.5-3.5h5L16.5 12"/>',
  package: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
  filter: '<path d="M3 5h18l-7 8.5V20l-4-2v-4.5z"/>',
  quote: '<path d="M10 7H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2M20 7h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',
  facebook: '<path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.6 1.6-1.6h1.6V4.3A21 21 0 0 0 15.4 4C13 4 11.5 5.4 11.5 8v2.5H9v3h2.5V21"/>',
  youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>',
  tripadvisor: '<circle cx="7" cy="13" r="3.5"/><circle cx="17" cy="13" r="3.5"/><circle cx="7" cy="13" r="1" fill="currentColor"/><circle cx="17" cy="13" r="1" fill="currentColor"/><path d="M3.5 13c0-3.6 3.8-6.5 8.5-6.5s8.5 2.9 8.5 6.5M10.5 13 12 16l1.5-3"/>',
};
export const iconSprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${Object.entries(I).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join('')}</svg>`;
export const icon = (name, cls = '') => `<svg class="ico${cls ? ' ' + cls : ''}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;

// ── Misc ──────────────────────────────────────────────────────────────────────
export const readingTime = blocks => Math.max(2, Math.round(JSON.stringify(blocks).replace(/<[^>]+>/g, '').split(/\s+/).length / 220));
export const fmtDate = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
export const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
