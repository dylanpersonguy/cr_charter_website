import { site } from '../data/site.mjs';
import { destinations, destBySlug, regions, marinas } from '../data/destinations.mjs';
import { species, speciesBySlug, monthsLong } from '../data/species.mjs';
import { trips, tripByTag } from '../data/trips.mjs';
import { fleet, captainBySlug, priceLabels, fromPrice } from '../data/fleet.mjs';
import { faqs, posts, monthNotes } from '../data/content.mjs';
import { esc, img, icon, money, pick, pickMany, imgUrl, strip, json } from './helpers.mjs';
import { page, abs, speciesPath, boatPath, waLink, faqSchema, orgSchema } from './layout.mjs';
import {
  sectionHead, pageHero, boatCard, destCard, speciesCard, tripCard, tripFrom, postCard, captainCard, seasonBar, seasonTable,
  crMap, bookingForm, faqList, ctaBand, testimonialsBlock, priceTable, tagChips, statBlock, crumbsNav,
} from './components.mjs';

const preloadFor = cands => { const im = pick(cands); return im ? { src: `/assets/img/${im.file}`, srcset: `/assets/img/${im.file_sm} 800w, /assets/img/${im.file} ${im.width}w` } : null; };
const offer = (low, high, url) => ({ '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: low, highPrice: high, offerCount: 1, availability: 'https://schema.org/InStock', url: abs(url) });
const bySpecies = s => destinations.filter(d => s.where.includes(d.slug));

// ════════════════════════════════════════════════════════════════════════════
// HOME
// ════════════════════════════════════════════════════════════════════════════
export function home() {
  const featuredDest = destinations.filter(d => d.featured);
  const featuredBoats = fleet.filter(b => b.featured).slice(0, 6);
  const keySpecies = ['sailfish', 'marlin', 'tuna', 'mahi-mahi', 'roosterfish', 'wahoo', 'cubera-snapper', 'tarpon'].map(s => speciesBySlug[s]);
  const destOpts = Object.entries(regions).map(([k, r]) => `<optgroup label="${esc(r.short)}">${destinations.filter(d => d.region === k).map(d => `<option value="${d.slug}">${esc(d.name)}</option>`).join('')}</optgroup>`).join('');
  const hotByMonth = monthNotes.map((m, i) => ({ m: monthsLong[i], s: m.hot.map(h => speciesBySlug[h].name.replace(/ \(.*\)/, '')).slice(0, 3).join(' · ') }));
  const nowM = new Date().getMonth();
  const gallery = pickMany(['sailfish-2', 'roosterfish', 'yellowfin-tuna', 'dorado', 'blue-marlin', 'tarpon', 'catch-release', 'los-suenos'], 6);

  const body = `
<section class="hero" data-hero>
  <div class="hero__media">${img(['hero-coast', 'pacific-sunset', 'sportfisher-running'], { eager: true, sizes: '100vw', alt: 'Aerial view of Costa Rica’s Pacific coastline and turquoise ocean' })}</div>
  <div class="hero__shade"></div>
  <div class="wrap hero__inner">
    <div class="hero__copy">
      <p class="hero__now" data-now='${esc(json(hotByMonth))}'><span class="hero__pulse"></span><span data-now-text>Biting in ${hotByMonth[nowM].m}: ${esc(hotByMonth[nowM].s)}</span></p>
      <h1 class="hero__title"><span class="hero__kw">Costa Rica Fishing Charters</span><span class="hero__big">Bluewater. Billfish.<br><em>Pura vida.</em></span></h1>
      <p class="hero__lead">Hand-picked boats and captains in ${destinations.length} destinations — from the tournament docks of Los Sueños to the wild Osa Peninsula. Sailfish, marlin, tuna and roosterfish, all year round.</p>
    </div>
    <form class="finder" action="/fishing-charters/" method="get" role="search" aria-label="Find a fishing charter">
      <div class="finder__field"><label for="f-dest">${icon('pin')} Where</label><select id="f-dest" name="dest"><option value="">All of Costa Rica</option>${destOpts}</select></div>
      <div class="finder__field"><label for="f-type">${icon('fish')} Trip</label><select id="f-type" name="type"><option value="">Any trip</option>${trips.filter(t => fleet.some(b => b.tags.includes(t.tag))).map(t => `<option value="${t.tag}">${esc(t.name)}</option>`).join('')}</select></div>
      <div class="finder__field"><label for="f-date">${icon('calendar')} When</label><input id="f-date" name="date" type="date"></div>
      <div class="finder__field"><label for="f-ang">${icon('users')} Anglers</label><select id="f-ang" name="anglers"><option value="">Any</option><option value="2">2+</option><option value="4">4+</option><option value="6">6+</option></select></div>
      <button class="btn btn--sun finder__go" type="submit">Find charters ${icon('arrow')}</button>
    </form>
    ${statBlock([{ n: destinations.length, label: 'Fishing destinations' }, { n: fleet.length, label: 'Vetted boats & crews' }, { n: species.length, suffix: '+', label: 'Game fish species' }, { n: 365, label: 'Days a year of fishing' }])}
  </div>
  <div class="ticker" aria-hidden="true"><div class="ticker__track">${[0, 1].map(() => species.map(s => `<span>${esc(s.name)}</span>${icon('wave')}`).join('')).join('')}</div></div>
</section>

<section class="section intro">
  <div class="wrap intro__grid">
    <div data-reveal>
      <p class="eyebrow">Why fish Costa Rica</p>
      <h2 class="display">The most consistent billfishing on the planet — <em>and so much more.</em></h2>
      <p class="intro__lead">Upwelling currents, a narrow continental shelf and warm tropical water put world-class fishing minutes from shore. Raise a dozen sailfish in a day, battle a 400-lb blue marlin, sight-cast to roosterfish on the reef — then celebrate with fresh tuna sashimi as the sun sets over the Pacific.</p>
      <a class="link-arrow" href="/best-time-to-fish-costa-rica/">When to go ${icon('arrow')}</a>
    </div>
    <ul class="features">
      <li data-reveal>${icon('marlin')}<h3>Billfish capital</h3><p>Sailfish and marlin every month of the year, with peak days that rank among the best on Earth.</p></li>
      <li data-reveal>${icon('compass')}<h3>Short runs, more fishing</h3><p>Deep water is often 30–60 minutes from the dock, so you spend your day fishing — not traveling.</p></li>
      <li data-reveal>${icon('shield')}<h3>Vetted local crews</h3><p>Licensed captains, maintained boats and quality tackle. We only work with crews we’d fish with ourselves.</p></li>
      <li data-reveal>${icon('leaf')}<h3>Conservation first</h3><p>Every billfish is released with circle hooks and care — keeping Costa Rica’s waters thriving.</p></li>
    </ul>
  </div>
</section>

<section class="section section--deep" id="destinations">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Destinations & marinas', title: `${destinations.length} destinations. Two oceans.<br>One tiny country.`, lead: 'Pick your coast by season and species. Tap a pin to explore charters, marinas and what’s biting.', light: true, link: { href: '/costa-rica-fishing-destinations/', text: 'All destinations' } })}
    <div class="mapgrid">
      ${crMap({ id: 'home-map' })}
      <div class="regions">
        ${Object.entries(regions).map(([k, r]) => `<div class="region" data-reveal><h3>${esc(r.label)}</h3><p>${esc(r.blurb)}</p><ul>${destinations.filter(d => d.region === k).map(d => `<li><a href="${d.path}" data-pin-link="${d.slug}">${esc(d.name)}</a></li>`).join('')}</ul></div>`).join('')}
      </div>
    </div>
    <div class="grid grid--dest">${featuredDest.map((d, i) => destCard(d, { big: i === 0 })).join('')}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Fishing experiences', title: 'Every way to fish Costa Rica', lead: 'From half-day roosterfish trips to five-day seamount expeditions — choose your adventure.', link: { href: '/fishing-trips/', text: 'All fishing trips' } })}
    <div class="bento">${trips.slice(0, 9).map((t, i) => tripCard(t, { big: i === 0 })).join('')}</div>
  </div>
</section>

<section class="section section--sand">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Most wanted', title: 'Meet the locals', lead: `${species.length} species of world-class game fish — here’s who you’ll be fighting.`, link: { href: '/costa-rica-fish-species/', text: 'All species' } })}
  </div>
  <div class="rail" data-rail>
    <div class="rail__track">${species.map(speciesCard).join('')}</div>
    <div class="wrap rail__ctrl"><button type="button" class="rail__btn" data-rail-prev aria-label="Previous species">${icon('arrow')}</button><button type="button" class="rail__btn" data-rail-next aria-label="Next species">${icon('arrow')}</button></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Featured fleet', title: 'Boats our anglers love', lead: 'Transparent per-boat pricing. Every boat includes captain, mate, tackle, bait and drinks.', link: { href: '/fishing-charters/', text: `See all ${fleet.length} boats & prices` } })}
    <div class="grid grid--boats">${featuredBoats.map(b => boatCard(b)).join('')}</div>
  </div>
</section>

<section class="section section--foam">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Fishing calendar', title: 'When to go for what', lead: 'Typical bite by month across Costa Rica. The highlighted column is this month.', link: { href: '/best-time-to-fish-costa-rica/', text: 'Full month-by-month guide' } })}
    ${seasonTable(keySpecies)}
  </div>
</section>

<section class="section how">
  <div class="wrap how__grid">
    <div class="how__media" data-reveal>
      ${img(['angler-fighting-fish', 'angler-fighting-fish', 'catch-release'], { sizes: '(max-width: 900px) 100vw, 45vw', alt: 'Angler fighting a fish on a Costa Rica sportfishing boat' })}
      <div class="how__badge">${icon('shield')}<span><strong>Book with confidence</strong>Local team · no payment to inquire</span></div>
    </div>
    <div>
      ${sectionHead({ eyebrow: 'How it works', title: 'From inbox to hook-up in three steps' })}
      <ol class="steps">
        <li data-reveal><span class="steps__n">01</span><div><h3>Tell us your plan</h3><p>Dates, destination, group size and dream species. Not sure? We’ll recommend the best coast for your dates.</p></div></li>
        <li data-reveal><span class="steps__n">02</span><div><h3>Get your perfect match</h3><p>A local expert confirms availability and pricing with the right captain — usually within a few hours, by WhatsApp or email.</p></div></li>
        <li data-reveal><span class="steps__n">03</span><div><h3>Fish like a local</h3><p>Meet your crew at the dock or beach. Rods, bait, drinks and know-how are on board — you just bring the sunscreen.</p></div></li>
      </ol>
      <a class="btn btn--ink btn--lg" href="/book/">Start planning ${icon('arrow')}</a>
    </div>
  </div>
</section>

<section class="section section--deep">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Anglers’ stories', title: 'Days they’ll talk about forever', light: true })}
    ${testimonialsBlock()}
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'From the cockpit', title: 'Catches & moments', link: { href: '/photo-gallery/', text: 'Open the gallery' } })}
    <div class="mosaic" data-lightbox-group>${gallery.map((g, i) => `<a class="mosaic__item m${i}" href="/assets/img/${g.file}" data-lightbox data-caption="${esc(g.alt)}">${img(g, { sizes: '(max-width: 700px) 50vw, 33vw', small: true })}</a>`).join('')}</div>
  </div>
</section>

<section class="section section--sand">
  <div class="wrap faqgrid">
    <div>
      ${sectionHead({ eyebrow: 'Questions', title: 'Costa Rica fishing, answered', lead: 'Licenses, prices, seasons, tipping — everything first-timers ask.', link: { href: '/faq/', text: 'All FAQs' } })}
      <div class="faqgrid__contact" data-reveal><p>Still have a question?</p><a class="btn btn--wa" href="${waLink('Hi! I have a question about fishing in Costa Rica.')}" target="_blank" rel="noopener">${icon('chat')} Ask on WhatsApp</a></div>
    </div>
    ${faqList(faqs.slice(0, 7), { openFirst: true })}
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Guides', title: 'Plan like a pro', link: { href: '/blog/', text: 'All guides' } })}
    <div class="grid grid--posts">${posts.slice(0, 3).map(postCard).join('')}</div>
  </div>
</section>

${ctaBand()}`;

  return page({
    path: '/', title: 'Costa Rica Fishing Charters | Sailfish, Marlin & Roosterfish',
    desc: `Book Costa Rica fishing charters with vetted local captains in ${destinations.length} destinations. Sailfish, marlin, tuna & roosterfish in Los Sueños, Quepos, Tamarindo & more.`,
    body, bodyClass: 'is-home', preload: preloadFor(['hero-coast', 'pacific-sunset', 'sportfisher-running']),
    schema: [faqSchema(faqs.slice(0, 7)), { '@type': 'ItemList', name: 'Costa Rica fishing destinations', itemListElement: destinations.map((d, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(d.path), name: `${d.name} fishing charters` })) }],
  });
}

// ════════════════════════════════════════════════════════════════════════════
// FLEET & PRICING
// ════════════════════════════════════════════════════════════════════════════
export function fleetIndex() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Fishing Charters', href: '/fishing-charters/' }];
  const destOpts = Object.entries(regions).map(([k, r]) => `<optgroup label="${esc(r.short)}">${destinations.filter(d => d.region === k && fleet.some(b => b.dest === d.slug)).map(d => `<option value="${d.slug}">${esc(d.name)}</option>`).join('')}</optgroup>`).join('');
  const prices = fleet.map(fromPrice);
  const body = `
${pageHero({ image: ['marina-docks', 'sportfisher-docked', 'los-suenos'], eyebrow: 'Fleet & pricing', title: 'Costa Rica Fishing Charters: Boats & Prices', lead: `Compare ${fleet.length} hand-picked boats across ${new Set(fleet.map(b => b.dest)).size} destinations — from ${money(Math.min(...prices))} per boat. Transparent prices, vetted crews, no booking fees.`, crumbs, size: 'sm', alt: 'Sportfishing boats docked at a Costa Rica marina' })}
<section class="section section--tight">
  <div class="wrap">
    <form class="filters" data-filters aria-label="Filter boats">
      <div class="filters__row">
        <div class="field"><label for="flt-dest">Destination</label><select id="flt-dest" name="dest"><option value="">All destinations</option>${destOpts}</select></div>
        <div class="field"><label for="flt-type">Trip type</label><select id="flt-type" name="type"><option value="">All trips</option>${trips.filter(t => fleet.some(b => b.tags.includes(t.tag))).map(t => `<option value="${t.tag}">${esc(t.name)}</option>`).join('')}</select></div>
        <div class="field"><label for="flt-ang">Group size</label><select id="flt-ang" name="anglers"><option value="">Any size</option><option value="2">2+ anglers</option><option value="4">4+ anglers</option><option value="6">6+ anglers</option></select></div>
        <div class="field"><label for="flt-size">Boat length</label><select id="flt-size" name="size"><option value="">Any length</option><option value="0-29">Under 30 ft</option><option value="30-39">30–39 ft</option><option value="40-999">40 ft +</option></select></div>
        <div class="field"><label for="flt-sort">Sort by</label><select id="flt-sort" name="sort"><option value="">Recommended</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="len-desc">Boat size: largest</option></select></div>
      </div>
      <div class="filters__bar"><p class="filters__count" aria-live="polite"><strong data-count>${fleet.length}</strong> boats match</p><button class="link-btn" type="reset">Clear filters</button></div>
    </form>
    <div class="grid grid--boats" data-boat-grid>${fleet.map(b => boatCard(b)).join('')}</div>
    <div class="empty" data-empty hidden>${icon('fish')}<h3>No boats match those filters</h3><p>Tell us what you’re after and we’ll find the right boat — our partner network goes beyond what’s listed here.</p><a class="btn btn--sun" href="/book/">Ask a local expert</a></div>
    <aside class="note">${icon('info')}<p>Prices are in USD <strong>per boat</strong>, not per person. They include captain, mate, fuel, tackle, bait and soft drinks. Fishing licenses (about $17 per angler) and crew gratuity (10–20%) are not included. Final pricing is confirmed with your quote.</p></aside>
  </div>
</section>
<section class="section section--sand">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Not sure which boat?', title: 'Choose by experience' })}
    <div class="bento bento--even">${trips.slice(0, 6).map(t => tripCard(t)).join('')}</div>
  </div>
</section>
${ctaBand({ title: 'Can’t decide? We’ll match you.', lead: 'Share your dates, group and target species — we’ll recommend the perfect boat and captain.' })}`;
  return page({
    path: '/fishing-charters/', title: 'Fishing Charters Costa Rica | Fleet & Prices from $350',
    desc: `Compare ${fleet.length} Costa Rica fishing charter boats with transparent prices. Inshore, offshore, luxury and multi-day trips in Quepos, Los Sueños, Tamarindo & more.`,
    body, crumbs, preload: preloadFor(['marina-docks', 'sportfisher-docked', 'los-suenos']),
    schema: [{ '@type': 'ItemList', name: 'Costa Rica fishing charter boats', itemListElement: fleet.map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(boatPath(b)), name: b.name })) }],
  });
}

export function boatPage(b) {
  const d = destBySlug[b.dest], cap = captainBySlug[b.captain];
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Fishing Charters', href: '/fishing-charters/' }, { name: d.name, href: d.path }, { name: b.name, href: boatPath(b) }];
  const gal = pickMany([...b.img, ...d.img], 3);
  const offshore = b.tags.some(t => ['offshore', 'multiday', 'kite'].includes(t));
  const targets = species.filter(s => s.where.includes(b.dest) && (offshore || s.group !== 'offshore')).slice(0, 6);
  const similar = fleet.filter(x => x.slug !== b.slug && (x.dest === b.dest || destBySlug[x.dest].region === d.region)).slice(0, 3);
  const pvals = Object.values(b.prices);
  const included = ['Captain & English-speaking mate', 'Rods, reels & tackle', 'Bait & lures', 'Fuel', 'Water, soft drinks & snacks', ...(b.prices.full ? ['Lunch on full-day trips'] : []), 'Safety equipment & life jackets', 'Fish cleaning & bagging'];
  const body = `
<section class="boathero">
  <div class="wrap">
    ${crumbsNav(crumbs)}
    <div class="gallery" data-lightbox-group>
      ${gal.map((g, i) => `<a class="gallery__item g${i}" href="/assets/img/${g.file}" data-lightbox data-caption="${esc(g.alt)}">${img(g, { eager: i === 0, sizes: i === 0 ? '(max-width: 900px) 100vw, 66vw' : '(max-width: 900px) 50vw, 33vw', small: i > 0 })}</a>`).join('')}
      <span class="gallery__note">${icon('camera')} Representative photos</span>
    </div>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap boat">
    <div class="boat__main">
      <p class="eyebrow">${icon('pin')} ${esc(d.full)} · ${esc(regions[d.region].short)}</p>
      <h1 class="boat__title">${esc(b.name)} <span>${b.length} ft ${esc(b.builder)} ${esc(b.type)} · ${esc(d.name)} Fishing Charter</span></h1>
      <ul class="kfacts">
        <li>${icon('ruler')}<span><small>Length</small>${b.length} ft</span></li>
        <li>${icon('users')}<span><small>Anglers</small>Up to ${b.anglers} (${b.guests} guests)</span></li>
        <li>${icon('anchor')}<span><small>Captain</small><a href="/captains/#${cap.slug}">${esc(cap.name)}</a></span></li>
        <li>${icon('pin')}<span><small>Departs</small>${esc(d.marina)}</span></li>
      </ul>
      ${tagChips(b.tags)}
      <div class="prose">
        <h2>About this charter</h2>
        <p><strong>${esc(b.pitch)}</strong> ${esc(b.name)} is a ${b.length}-foot ${esc(b.builder)} ${esc(b.type.toLowerCase())} based in ${esc(d.name)}, run by ${esc(cap.name)} — ${cap.years} years on the water and a specialist in ${esc(cap.specialties.slice(0, 2).join(' and ').split(' ').map(w => w === w.toUpperCase() ? w : w.toLowerCase()).join(' '))}.</p>
        <p>${esc(strip(d.intro))} From here, ${esc(b.name)} typically fishes for ${targets.slice(0, 4).map(s => `<a href="${speciesPath(s)}">${esc(s.name.toLowerCase())}</a>`).join(', ')}${targets.length > 4 ? ' and more' : ''}. Peak season: ${esc(d.peak)}.</p>
      </div>
      <h2 class="h2">Prices</h2>
      ${priceTable(b)}
      <p class="small muted">USD per boat, up to ${b.anglers} anglers. Fishing licenses and crew gratuity not included.</p>
      <h2 class="h2">On board</h2>
      <ul class="amen">${b.amenities.map(a => `<li>${icon('check')} ${esc(a)}</li>`).join('')}</ul>
      <h2 class="h2">What’s included</h2>
      <ul class="amen amen--alt">${included.map(a => `<li>${icon('check')} ${esc(a)}</li>`).join('')}</ul>
      <h2 class="h2">Meet your captain</h2>
      ${captainCard(cap, { noBoats: true })}
      <h2 class="h2">What you can catch from ${esc(d.name)}</h2>
      <ul class="catchlist">${targets.map(s => `<li><a href="${speciesPath(s)}">${img(s.img, { sizes: '96px', small: true, alt: s.name })}<span><strong>${esc(s.name)}</strong><small>${esc(s.size)}</small>${seasonBar(s.months, { mini: true })}</span></a></li>`).join('')}</ul>
      <h2 class="h2">Departure point</h2>
      <div class="depart">
        ${crMap({ active: d.slug, compact: true, id: 'boat-map' })}
        <dl class="depart__facts">
          <div><dt>${icon('anchor')} Marina / launch</dt><dd>${esc(d.marina)} — ${esc(d.launch)}</dd></div>
          <div><dt>${icon('globe')} Nearest airport</dt><dd>${esc(d.airport)}</dd></div>
          <div><dt>${icon('compass')} Run to the fish</dt><dd>${esc(d.run)}</dd></div>
          <div><dt>${icon('calendar')} Peak season</dt><dd>${esc(d.peak)}</dd></div>
        </dl>
      </div>
      <h2 class="h2">Good to know</h2>
      <ul class="ticks">
        <li>${icon('check')}<span>Every angler needs an <a href="/costa-rica-fishing-license/">INCOPESCA fishing license</a> — buy it online before your trip.</span></li>
        <li>${icon('check')}<span>Billfish are always released; tuna, dorado and snapper can be kept within legal limits.</span></li>
        <li>${icon('check')}<span>Gratuity of 10–20% is customary. <a href="/blog/how-much-to-tip-fishing-charter-costa-rica/">Tipping guide</a>.</span></li>
        <li>${icon('check')}<span>Trips cancelled by the captain for weather are rescheduled or refunded per your booking terms.</span></li>
        <li>${icon('check')}<span>Not sure what to pack? Read our <a href="/blog/what-to-bring-on-a-costa-rica-fishing-charter/">charter checklist</a>.</span></li>
      </ul>
    </div>
    <aside class="boat__side">
      <div class="bookcard" id="book">
        <p class="bookcard__from"><small>From</small> <strong>${money(Math.min(...pvals))}</strong> <small>/ boat</small></p>
        <p class="bookcard__sub">${icon('users')} Up to ${b.anglers} anglers · ${icon('clock')} ${Object.keys(b.prices).map(k => priceLabels[k].split(' (')[0]).join(', ')}</p>
        ${bookingForm({ boat: b, compact: true, id: 'boat-book' })}
      </div>
    </aside>
  </div>
</section>
${similar.length ? `<section class="section section--sand"><div class="wrap">${sectionHead({ eyebrow: 'Similar boats', title: `More charters near ${esc(d.name)}`, link: { href: '/fishing-charters/', text: 'Compare all boats' } })}<div class="grid grid--boats">${similar.map(x => boatCard(x)).join('')}</div></div></section>` : ''}
<div class="mbar"><p><small>From</small> <strong>${money(Math.min(...pvals))}</strong></p><a class="btn btn--sun" href="#book">Check availability</a></div>`;
  return page({
    path: boatPath(b), title: [`${b.name} | ${b.length} ft ${d.titleName || d.name} Fishing Charter`, `${b.name} | ${d.titleName || d.name} Fishing Charter`, `${b.name} | Costa Rica Fishing Charter`].find(t => t.length <= 60),
    desc: `${b.name}: ${b.length} ft ${b.builder} ${b.type.toLowerCase()} fishing charter in ${d.name}, Costa Rica. Up to ${b.anglers} anglers, from ${money(Math.min(...pvals))}. ${b.pitch}`.slice(0, 158),
    body, crumbs, bodyClass: 'has-mbar', solidHeader: true,
    schema: [{ '@type': 'Product', name: `${b.name} — ${d.name} fishing charter`, description: `${b.pitch} ${b.length} ft ${b.builder} ${b.type} departing ${d.marina}.`, image: gal.map(g => abs('/assets/img/' + g.file)), brand: { '@type': 'Brand', name: site.name }, category: 'Fishing charter', offers: offer(Math.min(...pvals), Math.max(...pvals), boatPath(b)) }],
    ogImage: gal[0] ? '/assets/img/' + gal[0].file : undefined,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// DESTINATIONS
// ════════════════════════════════════════════════════════════════════════════
export function destinationsIndex() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Destinations', href: '/costa-rica-fishing-destinations/' }];
  const body = `
${pageHero({ image: ['hero-coast', 'papagayo', 'pacific-sunset'], eyebrow: 'Destinations & marinas', title: 'Costa Rica Fishing Destinations', lead: `From Guanacaste’s marlin grounds to the Caribbean’s tarpon rivers — ${destinations.length} places to fish, and how to choose the right one for your dates.`, crumbs, size: 'sm' })}
<section class="section section--deep section--tight">
  <div class="wrap mapgrid">
    ${crMap({ id: 'dest-map' })}
    <div class="regions">${Object.entries(regions).map(([k, r]) => `<div class="region"><h2 class="region__h">${esc(r.label)}</h2><p>${esc(r.blurb)}</p><ul>${destinations.filter(d => d.region === k).map(d => `<li><a href="${d.path}" data-pin-link="${d.slug}">${esc(d.name)}</a></li>`).join('')}</ul></div>`).join('')}</div>
  </div>
</section>
${Object.entries(regions).map(([k, r], i) => `
<section class="section${i % 2 ? ' section--sand' : ''}">
  <div class="wrap">
    ${sectionHead({ eyebrow: esc(r.short), title: esc(r.label), lead: esc(r.blurb) })}
    <div class="grid grid--dest4">${destinations.filter(d => d.region === k).map(d => destCard(d)).join('')}</div>
  </div>
</section>`).join('')}
<section class="section section--foam">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Marinas & launch points', title: 'Where Costa Rica’s boats depart', lead: 'Full-service marinas offer dock boarding; in many beach towns you’ll take a short tender ride from the sand.' })}
    <div class="table-wrap" data-reveal><table class="dtable"><thead><tr><th scope="col">Marina / launch</th><th scope="col">Location</th><th scope="col">Type</th><th scope="col">Good to know</th></tr></thead><tbody>${marinas.map(m => `<tr><th scope="row">${m.dest ? `<a href="${destBySlug[m.dest].path}">${esc(m.name)}</a>` : esc(m.name)}</th><td>${esc(m.where)}</td><td><span class="chip chip--soft">${esc(m.type)}</span></td><td>${esc(m.note)}</td></tr>`).join('')}</tbody></table></div>
  </div>
</section>
${ctaBand({ title: 'Which coast fits your dates?', lead: 'Tell us when you’re traveling — we’ll recommend the destination with the hottest bite.' })}`;
  return page({
    path: '/costa-rica-fishing-destinations/', title: 'Costa Rica Fishing Destinations & Marinas | Map & Guide',
    desc: `Interactive map of ${destinations.length} Costa Rica fishing destinations and marinas: Los Sueños, Quepos, Flamingo, Tamarindo, Papagayo, Golfito, Osa and the Caribbean.`,
    body, crumbs, preload: preloadFor(['hero-coast', 'papagayo', 'pacific-sunset']),
  });
}

export function destinationPage(d) {
  const r = regions[d.region];
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Destinations', href: '/costa-rica-fishing-destinations/' }, { name: d.name, href: d.path }];
  const boats = fleet.filter(b => b.dest === d.slug);
  const here = species.filter(s => s.where.includes(d.slug));
  const nearby = d.nearby.map(s => destBySlug[s]).filter(Boolean);
  const h1 = d.slug === 'arenal' ? 'Lake Arenal Fishing' : d.slug === 'caribbean' ? 'Barra del Colorado & Tortuguero Fishing' : `${d.name} Fishing Charters`;
  const lows = boats.map(fromPrice);
  const body = `
${pageHero({ image: d.img, eyebrow: `${esc(r.label)} · ${esc(d.province)}`, title: esc(h1), lead: esc(d.intro), crumbs, size: 'lg', alt: `${d.full}, Costa Rica`,
    actions: `<a class="btn btn--sun btn--lg" href="#boats">${boats.length ? `View ${boats.length} boat${boats.length > 1 ? 's' : ''} & prices` : 'Check availability'} ${icon('arrow')}</a><a class="btn btn--glass btn--lg" href="${waLink(`Hi! I’m interested in fishing in ${d.name}.`)}" target="_blank" rel="noopener">${icon('chat')} Ask a local</a>`,
    facts: [{ icon: 'anchor', label: 'Departs from', value: esc(d.marina) }, { icon: 'globe', label: 'Nearest airport', value: esc(d.airport) }, { icon: 'compass', label: 'Run to fish', value: esc(d.run) }, { icon: 'calendar', label: 'Peak season', value: esc(d.peak) }] })}
<section class="section">
  <div class="wrap split">
    <div class="prose prose--lg" data-reveal>
      <h2>Fishing in ${esc(d.name)}</h2>
      ${d.body.map(p => `<p>${p}</p>`).join('')}
    </div>
    <aside class="split__side" data-reveal>
      <div class="sidecard">
        <h3>Why ${esc(d.name)}</h3>
        <ul class="ticks">${d.highlights.map(h => `<li>${icon('check')}<span>${esc(h)}</span></li>`).join('')}</ul>
        ${lows.length ? `<p class="sidecard__price"><small>Charters from</small> <strong>${money(Math.min(...lows))}</strong> <small>/ boat</small></p>` : ''}
        <a class="btn btn--sun btn--block" href="/book/?dest=${d.slug}">Check availability</a>
      </div>
      ${crMap({ active: d.slug, compact: true, id: 'd-map' })}
    </aside>
  </div>
</section>
<section class="section section--sand" id="boats">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Fleet & pricing', title: `${esc(d.name)} fishing boats`, lead: boats.length ? 'Per-boat prices including captain, mate, tackle, bait and drinks.' : `We work with trusted local captains in ${esc(d.name)} — send us your dates and we’ll match you with the right boat.` })}
    ${boats.length ? `<div class="grid grid--boats">${boats.map(b => boatCard(b)).join('')}</div>` : ''}
    <div class="inline-cta" data-reveal><p>${boats.length ? 'Need a different size or date?' : 'Ready to fish ' + esc(d.name) + '?'} Our network covers more boats than we list online.</p><a class="btn btn--ink" href="/book/?dest=${d.slug}">Request a quote ${icon('arrow')}</a></div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Target species', title: `What you can catch in ${esc(d.name)}`, lead: 'Typical seasonality — your captain will share what’s biting right now.' })}
    ${seasonTable(here, { caption: `${d.name} fishing seasons by species and month` })}
    <div class="grid grid--species">${here.slice(0, 8).map(speciesCard).join('')}</div>
  </div>
</section>
${d.faqs.length ? `<section class="section section--foam"><div class="wrap faqgrid"><div>${sectionHead({ eyebrow: 'FAQ', title: `${esc(d.name)} fishing questions` })}</div>${faqList(d.faqs, { openFirst: true })}</div></section>` : ''}
${nearby.length ? `<section class="section"><div class="wrap">${sectionHead({ eyebrow: 'Nearby', title: 'Explore nearby destinations', link: { href: '/costa-rica-fishing-destinations/', text: 'All destinations' } })}<div class="grid grid--dest4">${nearby.map(n => destCard(n)).join('')}</div></div></section>` : ''}
${ctaBand({ title: `Fish ${esc(d.name)} with a local.`, lead: `Tell us your dates and we’ll line up the best available boat in ${esc(d.name)}.` })}`;
  return page({
    path: d.path, title: d.seoTitle, desc: d.metaDesc, body, crumbs, preload: preloadFor(d.img),
    ogImage: pick(d.img) ? '/assets/img/' + pick(d.img).file : undefined,
    schema: [
      { '@type': 'TouristDestination', name: `${d.full}, Costa Rica`, description: strip(d.intro), url: abs(d.path), geo: { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lon }, containedInPlace: { '@type': 'Country', name: 'Costa Rica' }, touristType: ['Anglers', 'Sportfishing'], image: pick(d.img) ? abs('/assets/img/' + pick(d.img).file) : undefined },
      boats.length ? { '@type': 'ItemList', name: `${d.name} fishing charters`, itemListElement: boats.map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(boatPath(b)), name: b.name })) } : null,
      faqSchema(d.faqs),
    ],
  });
}

// ════════════════════════════════════════════════════════════════════════════
// TRIPS
// ════════════════════════════════════════════════════════════════════════════
export function tripsIndex() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Fishing Trips', href: '/fishing-trips/' }];
  const body = `
${pageHero({ image: ['sportfisher-running-2', 'sportfisher-running', 'outriggers'], eyebrow: 'Fishing experiences', title: 'Costa Rica Fishing Trips', lead: 'Deep sea, inshore, fly, kite, multi-day expeditions and private yachts — find the experience that fits your crew.', crumbs, size: 'sm' })}
<section class="section">
  <div class="wrap">
    <div class="bento">${trips.map((t, i) => tripCard(t, { big: [0, 1, 6].includes(i) })).join('')}</div>
  </div>
</section>
<section class="section section--sand">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Compare', title: 'Which trip is right for you?' })}
    <div class="table-wrap" data-reveal><table class="dtable"><thead><tr><th scope="col">Trip</th><th scope="col">Duration</th><th scope="col">Best for</th><th scope="col">Typical targets</th><th scope="col">From</th></tr></thead><tbody>${trips.map(t => `<tr><th scope="row"><a href="${t.path}">${esc(t.name)}</a></th><td>${esc(t.duration)}</td><td>${esc(t.ideal)}</td><td>${t.species.slice(0, 3).map(s => esc(speciesBySlug[s].name)).join(', ')}</td><td>${tripFrom(t) ? money(tripFrom(t)) + (t.fromNote ? ' ' + esc(t.fromNote) : '') : '—'}</td></tr>`).join('')}</tbody></table></div>
  </div>
</section>
${ctaBand()}`;
  return page({ path: '/fishing-trips/', title: 'Costa Rica Fishing Trips | Deep Sea, Inshore, Fly & More', desc: 'Compare Costa Rica fishing trips: deep sea, inshore, fly & kite fishing, FAD and seamount expeditions, family trips, yachts and all-inclusive packages.', body, crumbs, preload: preloadFor(['sportfisher-running-2', 'sportfisher-running', 'outriggers']) });
}

export function tripPage(t) {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Fishing Trips', href: '/fishing-trips/' }, { name: t.name, href: t.path }];
  const boats = fleet.filter(b => b.tags.includes(t.tag));
  const sp = t.species.map(s => speciesBySlug[s]);
  const from = tripFrom(t);
  const others = trips.filter(x => x.tag !== t.tag).slice(0, 3);
  const body = `
${pageHero({ image: t.img, eyebrow: esc(t.kicker), title: esc(t.seoTitle.split(' | ')[0]), lead: esc(t.summary), crumbs, size: 'md', alt: `${t.name} in Costa Rica`,
    actions: `<a class="btn btn--sun btn--lg" href="${boats.length ? '#boats' : '/book/?trip=' + t.tag}">${boats.length ? 'See boats & prices' : 'Request a quote'} ${icon('arrow')}</a>`,
    facts: [{ icon: 'clock', label: 'Duration', value: esc(t.duration) }, { icon: 'users', label: 'Ideal for', value: esc(t.ideal) }, { icon: 'fish', label: 'Targets', value: sp.slice(0, 3).map(s => esc(s.name)).join(', ') }, { icon: 'star', label: 'From', value: from ? `${money(from)} ${esc(t.fromNote || 'per boat')}` : 'On request' }] })}
<section class="section">
  <div class="wrap split">
    <div class="prose prose--lg" data-reveal>
      <h2>About ${esc(t.name.toLowerCase())} in Costa Rica</h2>
      ${t.body.map(p => `<p>${p}</p>`).join('')}
    </div>
    <aside class="split__side" data-reveal>
      <div class="sidecard">
        <h3>What’s included</h3>
        <ul class="ticks">${t.includes.map(i => `<li>${icon('check')}<span>${esc(i)}</span></li>`).join('')}</ul>
        <a class="btn btn--sun btn--block" href="/book/?trip=${t.tag}">Check availability</a>
      </div>
    </aside>
  </div>
</section>
<section class="section section--foam">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Target species', title: 'What you’ll be fishing for' })}
    <div class="grid grid--species">${sp.map(speciesCard).join('')}</div>
  </div>
</section>
${boats.length ? `<section class="section" id="boats"><div class="wrap">${sectionHead({ eyebrow: 'Fleet & pricing', title: `Boats for ${esc(t.name.toLowerCase())}`, lead: `${boats.length} boat${boats.length > 1 ? 's' : ''} across Costa Rica offer this experience.` })}<div class="grid grid--boats">${boats.map(b => boatCard(b)).join('')}</div></div></section>` : ''}
${t.faqs.length ? `<section class="section section--sand"><div class="wrap faqgrid"><div>${sectionHead({ eyebrow: 'FAQ', title: `${esc(t.name)} questions` })}</div>${faqList(t.faqs, { openFirst: true })}</div></section>` : ''}
<section class="section"><div class="wrap">${sectionHead({ eyebrow: 'More experiences', title: 'You might also like', link: { href: '/fishing-trips/', text: 'All trips' } })}<div class="bento bento--even">${others.map(o => tripCard(o)).join('')}</div></div></section>
${ctaBand()}`;
  return page({
    path: t.path, title: t.seoTitle, desc: t.metaDesc, body, crumbs, preload: preloadFor(t.img),
    ogImage: pick(t.img) ? '/assets/img/' + pick(t.img).file : undefined,
    schema: [{ '@type': 'Service', name: `${t.name} in Costa Rica`, serviceType: t.name, description: t.summary, provider: { '@id': site.url + '/#org' }, areaServed: { '@type': 'Country', name: 'Costa Rica' }, ...(from ? { offers: offer(from, Math.max(from, ...boats.map(b => Math.max(...Object.values(b.prices)))), t.path) } : {}) }, faqSchema(t.faqs)],
  });
}
