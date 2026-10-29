import { site } from '../data/site.mjs';
import { destinations, destBySlug, regions } from '../data/destinations.mjs';
import { species, speciesBySlug, months, monthsLong } from '../data/species.mjs';
import { trips, tripByTag } from '../data/trips.mjs';
import { fleet, captainBySlug, priceLabels, fromPrice } from '../data/fleet.mjs';
import { testimonials } from '../data/content.mjs';
import { mapGeo, project } from '../data/map-geo.mjs';
import { esc, img, icon, money, imgUrl, pick, fmtDate, readingTime } from './helpers.mjs';
import { speciesPath, boatPath, postPath, waLink } from './layout.mjs';

// ── Basics ────────────────────────────────────────────────────────────────────
export const crumbsNav = list => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${list.map((c, i) => i === list.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${c.href}">${esc(c.name)}</a></li>`).join('')}</ol></nav>`;

export const sectionHead = ({ eyebrow, title, lead, link, center, light }) => `
<div class="shead${center ? ' shead--center' : ''}${light ? ' shead--light' : ''}" data-reveal>
  <div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h2 class="shead__title">${title}</h2>${lead ? `<p class="shead__lead">${lead}</p>` : ''}</div>
  ${link ? `<a class="link-arrow" href="${link.href}">${esc(link.text)} ${icon('arrow')}</a>` : ''}
</div>`;

/** Inner-page hero with background image. */
export function pageHero({ image, eyebrow, title, lead, crumbs, facts, actions, size = 'md', alt }) {
  return `
<section class="phero phero--${size}">
  <div class="phero__media">${img(image, { eager: true, sizes: '100vw', alt })}</div>
  <div class="phero__shade"></div>
  <div class="wrap phero__inner">
    ${crumbs ? crumbsNav(crumbs) : ''}
    ${eyebrow ? `<p class="eyebrow eyebrow--light">${eyebrow}</p>` : ''}
    <h1 class="phero__title">${title}</h1>
    ${lead ? `<p class="phero__lead">${lead}</p>` : ''}
    ${actions ? `<div class="phero__actions">${actions}</div>` : ''}
  </div>
  ${facts ? `<div class="wrap"><dl class="facts">${facts.map(f => `<div class="facts__item">${icon(f.icon)}<dt>${esc(f.label)}</dt><dd>${f.value}</dd></div>`).join('')}</dl></div>` : ''}
</section>`;
}

export const tagChips = (tags = []) => `<ul class="chips">${tags.map(t => tripByTag[t] ? `<li><a class="chip" href="${tripByTag[t].path}">${esc(tripByTag[t].name)}</a></li>` : '').join('')}</ul>`;

// ── Cards ─────────────────────────────────────────────────────────────────────
export function boatCard(b, opts = {}) {
  const d = destBySlug[b.dest];
  const cap = captainBySlug[b.captain];
  return `
<article class="bcard" data-reveal data-boat data-dest="${b.dest}" data-region="${d.region}" data-tags="${b.tags.join(' ')}" data-len="${b.length}" data-anglers="${b.anglers}" data-price="${fromPrice(b)}" data-name="${esc(b.name)}">
  <a class="bcard__media" href="${boatPath(b)}" tabindex="-1" aria-hidden="true">
    ${img(b.img, { sizes: '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw', small: true, alt: `${b.name} — ${b.length} ft ${b.type.toLowerCase()} in ${d.name}` })}
    <span class="bcard__badge">${icon('pin')} ${esc(d.name)}</span>
  </a>
  <div class="bcard__body">
    <p class="bcard__type">${b.length} ft ${esc(b.builder)} · ${esc(b.type)}</p>
    <h3 class="bcard__title"><a href="${boatPath(b)}">${esc(b.name)}</a></h3>
    <p class="bcard__pitch">${esc(b.pitch)}</p>
    <ul class="bcard__meta">
      <li>${icon('users')} Up to ${b.anglers} anglers</li>
      <li>${icon('anchor')} ${esc(cap.name.replace('Capt. ', 'Capt. '))}</li>
    </ul>
    <div class="bcard__foot">
      <p class="price"><small>From</small> <strong>${money(fromPrice(b))}</strong> <small>/ boat</small></p>
      <a class="btn btn--ink btn--sm" href="${boatPath(b)}">View boat ${icon('arrow')}</a>
    </div>
  </div>
</article>`;
}

export function destCard(d, opts = {}) {
  const r = regions[d.region];
  const boats = fleet.filter(b => b.dest === d.slug).length;
  return `
<a class="dcard${opts.big ? ' dcard--big' : ''}" href="${d.path}" data-reveal>
  ${img(d.img, { sizes: opts.big ? '(max-width: 900px) 100vw, 50vw' : '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw', small: !opts.big, alt: `${d.full}, Costa Rica` })}
  <span class="dcard__shade"></span>
  <span class="dcard__body">
    <span class="dcard__region">${esc(r.short)}</span>
    <span class="dcard__name">${esc(d.name)}</span>
    <span class="dcard__meta">${esc(d.peak)}</span>
    <span class="dcard__go">${boats ? `${boats} boat${boats > 1 ? 's' : ''} · ` : ''}Explore ${icon('arrow')}</span>
  </span>
</a>`;
}

export function speciesCard(s) {
  return `
<a class="scard" href="${speciesPath(s)}" data-reveal>
  <span class="scard__media">${img(s.img, { sizes: '(max-width: 700px) 80vw, 320px', small: true, alt: `${s.name} caught in Costa Rica` })}</span>
  <span class="scard__body">
    <span class="scard__top">${esc(s.top)}</span>
    <span class="scard__name">${esc(s.name)}</span>
    <span class="scard__sci">${esc(s.sci)}</span>
    ${seasonBar(s.months, { mini: true })}
    <span class="scard__size">${icon('ruler')} ${esc(s.size)}</span>
  </span>
</a>`;
}

// Price basis per trip type: offshore trips quote ¾/full days, expeditions quote per day.
const PRICE_KEYS = { offshore: ['threeQuarter', 'full'], kite: ['threeQuarter', 'full'], multiday: ['multiday'] };
export const boatPriceFor = (b, tag) => { const ks = PRICE_KEYS[tag]; if (!ks) return fromPrice(b); const v = ks.map(k => b.prices[k]).filter(Boolean); return v.length ? Math.min(...v) : null; };
export const tripFrom = t => { const prices = fleet.filter(b => b.tags.includes(t.tag)).map(b => boatPriceFor(b, t.tag)).filter(Boolean); return prices.length ? Math.min(...prices) : t.from; };
export function tripCard(t, opts = {}) {
  const from = tripFrom(t);
  return `
<a class="tcard${opts.big ? ' tcard--big' : ''}" href="${t.path}" data-reveal>
  ${img(t.img, { sizes: opts.big ? '(max-width: 900px) 100vw, 50vw' : '(max-width: 700px) 100vw, 33vw', small: !opts.big, alt: `${t.name} in Costa Rica` })}
  <span class="tcard__shade"></span>
  <span class="tcard__body">
    <span class="tcard__icon">${icon(t.icon)}</span>
    <span class="tcard__kicker">${esc(t.kicker)}</span>
    <span class="tcard__name">${esc(t.name)}</span>
    ${opts.big ? `<span class="tcard__sum">${esc(t.summary)}</span>` : ''}
    <span class="tcard__foot"><span>${icon('clock')} ${esc(t.duration)}</span>${from ? `<span>From <strong>${money(from)}</strong>${t.fromNote ? ' ' + esc(t.fromNote) : ''}</span>` : ''}</span>
  </span>
</a>`;
}

export function postCard(p) {
  return `
<article class="pcard" data-reveal>
  <a class="pcard__media" href="${postPath(p)}" tabindex="-1" aria-hidden="true">${img(p.img, { sizes: '(max-width: 700px) 100vw, 33vw', small: true, alt: p.title })}</a>
  <div class="pcard__body">
    <p class="pcard__meta"><span>${esc(p.cat)}</span> · ${readingTime(p.blocks)} min read</p>
    <h3 class="pcard__title"><a href="${postPath(p)}">${esc(p.title)}</a></h3>
    <p class="pcard__ex">${esc(p.excerpt)}</p>
  </div>
</article>`;
}

export function captainCard(c, opts = {}) {
  const boats = fleet.filter(b => b.captain === c.slug);
  const initials = c.name.replace('Capt. ', '').split(' ').map(w => w[0]).join('').slice(0, 2);
  return `
<article class="ccard" id="${c.slug}" data-reveal>
  <div class="ccard__avatar" aria-hidden="true"><span>${esc(initials)}</span></div>
  <div class="ccard__body">
    <h3 class="ccard__name">${esc(c.name)}</h3>
    <p class="ccard__meta">${icon('pin')} ${esc(c.home)} · ${c.years} years on the water · ${esc(c.langs.join(' & '))}</p>
    <p class="ccard__bio">${esc(c.bio)}</p>
    <ul class="chips chips--soft">${c.specialties.map(s => `<li><span class="chip">${esc(s)}</span></li>`).join('')}</ul>
    ${boats.length && !opts.noBoats ? `<p class="ccard__boats">Runs: ${boats.map(b => `<a href="${boatPath(b)}">${esc(b.name)}</a>`).join(', ')}</p>` : ''}
  </div>
</article>`;
}

// ── Seasons ───────────────────────────────────────────────────────────────────
const rateLabel = ['Off season', 'Fair', 'Good', 'Peak'];
export function seasonBar(m, opts = {}) {
  return `<span class="sbar${opts.mini ? ' sbar--mini' : ''}" role="img" aria-label="Season: ${m.map((r, i) => `${months[i]} ${rateLabel[r].toLowerCase()}`).join(', ')}">${m.map((r, i) => `<span class="sbar__c r${r}" title="${monthsLong[i]}: ${rateLabel[r]}">${opts.mini ? '' : `<em>${months[i][0]}</em>`}</span>`).join('')}</span>`;
}
export function seasonTable(list, opts = {}) {
  return `
<div class="stable-wrap" data-reveal>
<table class="stable" data-season-table>
  <caption class="sr-only">${esc(opts.caption || 'Costa Rica fishing seasons by species and month')}</caption>
  <thead><tr><th scope="col">Species</th>${months.map((m, i) => `<th scope="col" data-month="${i}"><abbr title="${monthsLong[i]}">${m}</abbr></th>`).join('')}</tr></thead>
  <tbody>${list.map(s => `<tr><th scope="row"><a href="${speciesPath(s)}">${esc(s.name)}</a></th>${s.months.map((r, i) => `<td class="r${r}" data-month="${i}" title="${esc(s.name)} · ${monthsLong[i]}: ${rateLabel[r]}"><span class="sr-only">${rateLabel[r]}</span></td>`).join('')}</tr>`).join('')}</tbody>
</table>
</div>
<ul class="slegend" aria-hidden="true"><li><i class="r3"></i>Peak</li><li><i class="r2"></i>Good</li><li><i class="r1"></i>Fair</li><li><i class="r0"></i>Rare</li><li class="slegend__note">Typical patterns — conditions vary year to year.</li></ul>`;
}

// ── Map ───────────────────────────────────────────────────────────────────────
const LABEL = { // [dx, dy, anchor]
  'bahia-salinas': [13, 6, 'start'], papagayo: [13, -2, 'start'], 'playas-del-coco': [13, 12, 'start'], flamingo: [13, 6, 'start'], tamarindo: [13, 8, 'start'],
  nosara: [-13, 4, 'end'], samara: [13, 10, 'start'], 'santa-teresa': [-13, 8, 'end'], 'los-suenos': [6, -16, 'middle'], jaco: [13, 12, 'start'],
  quepos: [-13, 8, 'end'], 'drake-bay': [-13, 4, 'end'], 'puerto-jimenez': [-12, 22, 'end'], golfito: [13, 4, 'start'], caribbean: [13, 6, 'start'], arenal: [13, 6, 'start'],
};
const SHORT = { caribbean: 'Barra del Colorado', 'santa-teresa': 'Santa Teresa', 'drake-bay': 'Drake Bay', samara: 'Sámara', arenal: 'Lake Arenal' };
export function crMap({ active, compact, id = 'crmap' } = {}) {
  const pins = destinations.map(d => {
    const [x, y] = project(d.lat, d.lon);
    const [dx, dy, an] = LABEL[d.slug] || [12, 5, 'start'];
    const on = active === d.slug ? ' is-active' : '';
    return `<a class="pin${on}" href="${d.path}" data-pin="${d.slug}" data-name="${esc(d.name)}" data-region="${esc(regions[d.region].short)}" data-peak="${esc(d.peak)}" data-img="${imgUrl(d.img, true)}" aria-label="${esc(d.name)} fishing charters">
      <circle class="pin__pulse" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10"/><circle class="pin__dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7"/>
      <text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${an}">${esc(SHORT[d.slug] || d.name)}</text></a>`;
  }).join('');
  return `
<figure class="crmap${compact ? ' crmap--compact' : ''}" data-map id="${id}">
  <svg viewBox="0 0 ${mapGeo.width} ${mapGeo.height}" role="group" aria-label="Map of fishing destinations in Costa Rica">
    <defs>
      <linearGradient id="${id}-land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f6f6b"/><stop offset=".55" stop-color="#17594f"/><stop offset="1" stop-color="#0f4740"/></linearGradient>
      <pattern id="${id}-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="1"/></pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#${id}-grid)"/>
    <path d="${mapGeo.nic}" class="crmap__nb"/><path d="${mapGeo.pan}" class="crmap__nb"/>
    <path d="${mapGeo.cr}" fill="url(#${id}-land)" class="crmap__land"/>
    <text class="crmap__sea" x="170" y="640">Pacific Ocean</text>
    <text class="crmap__sea" x="760" y="300">Caribbean Sea</text>
    <text class="crmap__nbl" x="330" y="40">NICARAGUA</text>
    <text class="crmap__nbl" x="840" y="610">PANAMÁ</text>
    ${pins}
  </svg>
  <div class="crmap__tip" hidden><img alt="" width="160" height="100"><div><strong></strong><span></span><em></em></div></div>
  <figcaption class="sr-only">Pins mark fishing destinations. Select a destination to view charters.</figcaption>
</figure>`;
}

// ── Booking form ──────────────────────────────────────────────────────────────
export function bookingForm({ boat, dest, compact, id = 'book' } = {}) {
  const destOpts = Object.entries(regions).map(([k, r]) => `<optgroup label="${esc(r.short)}">${destinations.filter(d => d.region === k).map(d => `<option value="${d.slug}"${(dest === d.slug || boat?.dest === d.slug) ? ' selected' : ''}>${esc(d.name)}</option>`).join('')}</optgroup>`).join('');
  const boatOpts = destinations.map(d => { const bs = fleet.filter(b => b.dest === d.slug); return bs.length ? `<optgroup label="${esc(d.name)}">${bs.map(b => `<option value="${b.slug}" data-dest="${b.dest}"${boat?.slug === b.slug ? ' selected' : ''}>${esc(b.name)} — ${b.length} ft</option>`).join('')}</optgroup>` : ''; }).join('');
  const tripOpts = trips.map(t => `<option value="${t.tag}">${esc(t.name)}</option>`).join('');
  const durOpts = Object.entries(priceLabels).filter(([k]) => !boat || boat.prices[k]).map(([k, l]) => `<option value="${k}">${esc(l)}${boat ? ' — ' + money(boat.prices[k]) : ''}</option>`).join('');
  return `
<form class="bform${compact ? ' bform--compact' : ''}" id="${id}" data-booking novalidate>
  <div class="bform__grid">
    <div class="field field--full"><label for="${id}-dest">Destination</label><select id="${id}-dest" name="destination" required><option value="">Choose a destination…</option>${destOpts}</select></div>
    <div class="field field--full"><label for="${id}-boat">Boat <span class="opt">(optional)</span></label><select id="${id}-boat" name="boat"><option value="">Recommend the best boat for me</option>${boatOpts}</select></div>
    ${compact ? '' : `<div class="field"><label for="${id}-trip">Trip type</label><select id="${id}-trip" name="trip"><option value="">Any / not sure</option>${tripOpts}</select></div>`}
    <div class="field${compact ? ' field--full' : ''}"><label for="${id}-dur">Duration</label><select id="${id}-dur" name="duration">${durOpts}</select></div>
    <div class="field"><label for="${id}-date">Date</label><input id="${id}-date" name="date" type="date" required></div>
    <div class="field"><label for="${id}-anglers">Anglers</label><select id="${id}-anglers" name="anglers">${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option${n === 2 ? ' selected' : ''}>${n}</option>`).join('')}<option value="9+">9+</option></select></div>
    <div class="field field--full"><label for="${id}-name">Full name</label><input id="${id}-name" name="name" autocomplete="name" required></div>
    <div class="field"><label for="${id}-email">Email</label><input id="${id}-email" name="email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="${id}-phone">WhatsApp / phone <span class="opt">(optional)</span></label><input id="${id}-phone" name="phone" type="tel" autocomplete="tel"></div>
    <div class="field field--full"><label for="${id}-msg">Anything else? <span class="opt">(optional)</span></label><textarea id="${id}-msg" name="message" rows="${compact ? 2 : 4}" placeholder="Target species, hotel, kids on board, flexible dates…"></textarea></div>
    <label class="check field--full"><input type="checkbox" name="flexible" value="yes"> My dates are flexible</label>
  </div>
  <button class="btn btn--sun btn--block btn--lg" type="submit">Check availability ${icon('arrow')}</button>
  <p class="bform__note">${icon('shield')} No payment now. A local expert replies within a few hours.</p>
  <div class="bform__done" hidden role="status" aria-live="polite">
    <div class="bform__doneicon">${icon('check')}</div>
    <h3>Almost there!</h3>
    <p data-done-text>Send us your request in one tap and we’ll confirm availability and price.</p>
    <div class="bform__doneactions"><a class="btn btn--wa btn--block" data-done-wa href="#" target="_blank" rel="noopener">${icon('chat')} Send via WhatsApp</a><a class="btn btn--ghost-ink btn--block" data-done-mail href="#">${icon('mail')} Send via email</a></div>
  </div>
</form>`;
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
export const faqList = (list, opts = {}) => `<div class="faq${opts.light ? ' faq--light' : ''}">${list.map((f, i) => `<details class="faq__item" data-reveal${i === 0 && opts.openFirst ? ' open' : ''}><summary><h3>${esc(f.q)}</h3><span class="faq__plus" aria-hidden="true">${icon('plus')}</span></summary><div class="faq__a"><p>${f.a}</p></div></details>`).join('')}</div>`;

// ── Rich text ─────────────────────────────────────────────────────────────────
export const slugify = s => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function rich(blocks) {
  return blocks.map(([t, v]) => {
    if (t === 'h2') return `<h2 id="${slugify(v)}">${v}</h2>`;
    if (t === 'h3') return `<h3>${v}</h3>`;
    if (t === 'p') return `<p>${v}</p>`;
    if (t === 'ul') return `<ul class="ticks">${v.map(li => `<li>${icon('check')}<span>${li}</span></li>`).join('')}</ul>`;
    if (t === 'tip') return `<aside class="tip">${icon('info')}<p>${v}</p></aside>`;
    return '';
  }).join('\n');
}

// ── Sections ──────────────────────────────────────────────────────────────────
export function ctaBand({ title = 'Your boat is waiting.', lead = 'Tell us your dates and dream fish. A local expert will match you with the perfect captain — usually within a few hours.', image = ['pacific-sunset', 'pacific-sunset-2', 'hero-coast'] } = {}) {
  return `
<section class="cta">
  <div class="cta__media">${img(image, { sizes: '100vw', alt: 'Sunset over the Pacific coast of Costa Rica' })}</div>
  <div class="cta__shade"></div>
  <div class="wrap cta__inner" data-reveal>
    <p class="eyebrow eyebrow--light">Pura vida starts here</p>
    <h2 class="cta__title">${title}</h2>
    <p class="cta__lead">${lead}</p>
    <div class="cta__actions">
      <a class="btn btn--sun btn--lg" href="/book/">Check availability ${icon('arrow')}</a>
      <a class="btn btn--glass btn--lg" href="${waLink('Hi! I’d like help planning a fishing trip in Costa Rica.')}" target="_blank" rel="noopener">${icon('chat')} WhatsApp a local</a>
    </div>
  </div>
</section>`;
}

export function testimonialsBlock(list = testimonials) {
  return `
<div class="quotes" data-reveal>
  ${list.map(t => `<figure class="quote">
    ${icon('quote', 'quote__mark')}
    <div class="quote__stars" aria-hidden="true">${icon('star')}${icon('star')}${icon('star')}${icon('star')}${icon('star')}</div>
    <blockquote><p>${esc(t.text)}</p></blockquote>
    <figcaption><strong>${esc(t.name)}</strong><span>${esc(t.from)} · ${esc(destBySlug[t.dest]?.name || '')}</span>${t.sample ? '<em class="quote__sample">Sample — replace with a real review</em>' : ''}</figcaption>
  </figure>`).join('')}
</div>`;
}

export function priceTable(b) {
  return `<table class="ptable"><tbody>${Object.entries(priceLabels).filter(([k]) => b.prices[k]).map(([k, l]) => `<tr><th scope="row">${esc(l)}</th><td>${money(b.prices[k])}</td></tr>`).join('')}</tbody></table>`;
}

export const statBlock = items => `<ul class="stats">${items.map(s => `<li data-reveal><strong data-count="${s.n}">${s.n}</strong>${s.suffix ? `<span class="stats__suf">${s.suffix}</span>` : ''}<span>${esc(s.label)}</span></li>`).join('')}</ul>`;
