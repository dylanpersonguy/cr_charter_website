import { site } from '../data/site.mjs';
import { destinations, destBySlug, regions } from '../data/destinations.mjs';
import { species, speciesBySlug, speciesGroups, months, monthsLong } from '../data/species.mjs';
import { trips } from '../data/trips.mjs';
import { fleet, captains } from '../data/fleet.mjs';
import { faqs, monthNotes, tournaments, guides, posts } from '../data/content.mjs';
import { esc, img, icon, money, pick, pickMany, images, strip, fmtDate, readingTime } from './helpers.mjs';
import { page, abs, speciesPath, boatPath, postPath, waLink, faqSchema } from './layout.mjs';
import { sectionHead, pageHero, boatCard, destCard, speciesCard, tripCard, postCard, captainCard, seasonBar, seasonTable, bookingForm, faqList, ctaBand, rich, crumbsNav, slugify } from './components.mjs';

const BUILD_DATE = new Date().toISOString().slice(0, 10);
const preloadFor = cands => { const im = pick(cands); return im ? { src: `/assets/img/${im.file}`, srcset: `/assets/img/${im.file_sm} 800w, /assets/img/${im.file} ${im.width}w` } : null; };
const article = (o) => ({ '@type': o.type || 'Article', headline: o.headline, description: o.desc, image: pick(o.img) ? abs('/assets/img/' + pick(o.img).file) : undefined, datePublished: o.date || '2026-10-01', dateModified: BUILD_DATE, author: { '@type': 'Organization', name: site.legalName, url: site.url + '/' }, publisher: { '@id': site.url + '/#org' }, mainEntityOfPage: abs(o.path), inLanguage: 'en' });

// ════════════════════════════════════════════════════════════════════════════
// SPECIES
// ════════════════════════════════════════════════════════════════════════════
export function speciesIndex() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Fish Species', href: '/costa-rica-fish-species/' }];
  const body = `
${pageHero({ image: ['sailfish-2', 'blue-marlin', 'dorado'], eyebrow: 'Species guide', title: 'Costa Rica Fish Species Guide', lead: 'Everything you need to know about the game fish of Costa Rica — when they bite, where to find them and how crews target them.', crumbs, size: 'sm' })}
${Object.entries(speciesGroups).map(([k, g], i) => `
<section class="section${i % 2 ? ' section--sand' : ''}">
  <div class="wrap">
    ${sectionHead({ eyebrow: esc(g.label), title: esc(g.label) + ' species', lead: esc(g.blurb) })}
    <div class="grid grid--species">${species.filter(s => s.group === k).map(speciesCard).join('')}</div>
  </div>
</section>`).join('')}
<section class="section section--foam"><div class="wrap">${sectionHead({ eyebrow: 'At a glance', title: 'Seasons for every species', link: { href: '/best-time-to-fish-costa-rica/', text: 'Month-by-month guide' } })}${seasonTable(species)}</div></section>
${ctaBand()}`;
  return page({ path: '/costa-rica-fish-species/', title: 'Costa Rica Fish Species Guide | Sailfish, Marlin, Tuna & More', desc: 'Guide to Costa Rica game fish: sailfish, marlin, yellowfin tuna, mahi-mahi, roosterfish, wahoo, snapper, tarpon & more — seasons, sizes and hotspots.', body, crumbs, preload: preloadFor(['sailfish', 'blue-marlin', 'dorado']) });
}

export function speciesPage(s) {
  const p = speciesPath(s);
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Fish Species', href: '/costa-rica-fish-species/' }, { name: s.name, href: p }];
  const dests = s.where.map(w => destBySlug[w]).filter(Boolean); // ordered by priority
  const offshore = s.group === 'offshore';
  const boats = fleet.filter(b => s.where.includes(b.dest) && (!offshore || b.tags.some(t => ['offshore', 'multiday', 'kite'].includes(t)))).slice(0, 6);
  const peak = s.months.map((r, i) => r === 3 ? months[i] : null).filter(Boolean);
  const title = `${s.name.replace(/ \(.*\)/, '')} Fishing in Costa Rica`;
  const others = species.filter(x => x.slug !== s.slug && x.group === s.group).concat(species.filter(x => x.group !== s.group)).slice(0, 4);
  const body = `
${pageHero({ image: s.img, eyebrow: `${esc(speciesGroups[s.group].label)} · <i>${esc(s.sci)}</i>`, title: esc(title), lead: esc(s.summary), crumbs, size: 'md', alt: `${s.name} — Costa Rica sportfishing`,
    facts: [{ icon: 'ruler', label: 'Typical size', value: esc(s.size) }, { icon: 'calendar', label: 'Peak months', value: peak.length ? esc(peak.join(', ')) : 'Year-round' }, { icon: 'pin', label: 'Top spots', value: dests.slice(0, 3).map(d => esc(d.name)).join(', ') }, { icon: s.release ? 'leaf' : 'fish', label: s.release ? 'Regulation' : 'Table fare', value: s.release ? 'Catch & release' : 'Excellent — legal to keep' }] })}
<section class="section">
  <div class="wrap split">
    <article class="prose prose--lg" data-reveal>
      <p class="aka">Also known as: ${esc(s.aka)}</p>
      ${s.body.map(x => `<p>${x}</p>`).join('')}
      <h2>Season</h2>
      ${seasonBar(s.months)}
      <p class="small muted">Typical bite by month in Costa Rica. Patterns vary by coast and year.</p>
      <h2>How crews target ${esc(s.name.replace(/ \(.*\)/, '').toLowerCase())}</h2>
      <ul class="ticks">${s.tactics.map(t => `<li>${icon('check')}<span>${esc(t)}</span></li>`).join('')}</ul>
      ${s.tips.length ? `<h2>Pro tips</h2><ul class="ticks">${s.tips.map(t => `<li>${icon('star')}<span>${esc(t)}</span></li>`).join('')}</ul>` : ''}
    </article>
    <aside class="split__side" data-reveal>
      <div class="sidecard">
        <h3>Fish for ${esc(s.name.replace(/ \(.*\)/, '').toLowerCase())}</h3>
        <p>Tell us your dates — we’ll pick the destination and boat with the best odds.</p>
        <a class="btn btn--sun btn--block" href="/book/">Check availability</a>
        <a class="btn btn--ghost-ink btn--block" href="${waLink(`Hi! I want to catch ${s.name.toLowerCase()} in Costa Rica.`)}" target="_blank" rel="noopener">${icon('chat')} WhatsApp us</a>
      </div>
    </aside>
  </div>
</section>
<section class="section section--sand">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Where to catch them', title: `Best destinations for ${esc(s.name.replace(/ \(.*\)/, '').toLowerCase())}` })}
    <div class="grid grid--dest4">${dests.slice(0, 8).map(d => destCard(d)).join('')}</div>
  </div>
</section>
${boats.length ? `<section class="section"><div class="wrap">${sectionHead({ eyebrow: 'Fleet', title: 'Boats that target this species', link: { href: '/fishing-charters/', text: 'All boats' } })}<div class="grid grid--boats">${boats.map(b => boatCard(b)).join('')}</div></div></section>` : ''}
${s.faqs.length ? `<section class="section section--foam"><div class="wrap faqgrid"><div>${sectionHead({ eyebrow: 'FAQ', title: `${esc(s.name.replace(/ \(.*\)/, ''))} questions` })}</div>${faqList(s.faqs, { openFirst: true })}</div></section>` : ''}
<section class="section"><div class="wrap">${sectionHead({ eyebrow: 'Keep exploring', title: 'More Costa Rica game fish', link: { href: '/costa-rica-fish-species/', text: 'All species' } })}<div class="grid grid--species">${others.map(speciesCard).join('')}</div></div></section>
${ctaBand()}`;
  const desc = `${s.name.replace(/ \(.*\)/, '')} fishing in Costa Rica: best season${peak.length ? ` (${peak[0]}–${peak[peak.length - 1]} peak)` : ''}, top destinations, typical sizes (${s.size}) and charters. ${s.release ? 'Catch & release.' : ''}`.slice(0, 158);
  return page({ path: p, title: `${title} | Season & Charters`.length <= 60 ? `${title} | Season & Charters` : title, desc, body, crumbs, preload: preloadFor(s.img), ogImage: pick(s.img) ? '/assets/img/' + pick(s.img).file : undefined,
    schema: [article({ headline: title, desc: s.summary, img: s.img, path: p }), faqSchema(s.faqs)] });
}

// ════════════════════════════════════════════════════════════════════════════
// SEASONS
// ════════════════════════════════════════════════════════════════════════════
export function seasons() {
  const path = '/best-time-to-fish-costa-rica/';
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Best Time to Fish', href: path }];
  const qa = [
    { q: 'What is the best month to fish in Costa Rica?', a: 'For sailfish, January to April in the Central and South Pacific is hard to beat. For marlin, tuna and roosterfish in Guanacaste, May to August is excellent. There is good fishing somewhere in Costa Rica every month.' },
    { q: 'Is the rainy season good for fishing in Costa Rica?', a: 'Yes. The green season (May–November) brings excellent dorado, yellowfin tuna and Guanacaste marlin, fewer crowds and lower prices. Rain usually falls in the afternoon, after morning fishing trips.' },
    { q: 'When is sailfish season in Costa Rica?', a: 'Sailfish are caught year-round. The Central and South Pacific peak from December to April; Guanacaste is strongest from about April to August.' },
  ];
  const body = `
${pageHero({ image: ['sailfish-2', 'sailfish', 'pacific-sunset'], eyebrow: 'Fishing calendar', title: 'Best Time to Fish in Costa Rica', lead: 'Month-by-month guide to Costa Rica’s fishing seasons — which species peak when, and which coast to choose for your travel dates.', crumbs, size: 'md' })}
<section class="section">
  <div class="wrap">
    <div class="prose prose--lg prose--center" data-reveal>
      <p><strong>The short answer: there’s no bad month — only the wrong coast.</strong> Costa Rica’s Pacific coast fishes all year, but its regions peak at different times. The Central Pacific (<a href="/los-suenos-fishing-charters/">Los Sueños</a>, <a href="/quepos-fishing-charters/">Quepos</a>) and South Pacific (<a href="/golfito-fishing-charters/">Golfito</a>, <a href="/drake-bay-sierpe-fishing-charters/">Osa</a>) are famous for December–April sailfish, while Guanacaste (<a href="/flamingo-fishing-charters/">Flamingo</a>, <a href="/tamarindo-fishing-charters/">Tamarindo</a>, <a href="/papagayo-fishing-charters/">Papagayo</a>) shines for marlin and sailfish from roughly April through September. The green season brings bumper dorado and tuna across the country.</p>
    </div>
    ${seasonTable(species)}
  </div>
</section>
<section class="section section--sand">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Month by month', title: 'What’s biting each month', center: true })}
    <div class="months">${monthNotes.map((m, i) => `<article class="month" data-month-card="${i}" data-reveal id="${monthsLong[i].toLowerCase()}"><h3>${monthsLong[i]}</h3><ul class="chips chips--soft">${m.hot.map(h => `<li><a class="chip" href="${speciesPath(speciesBySlug[h])}">${esc(speciesBySlug[h].name.replace(/ \(.*\)/, ''))}</a></li>`).join('')}</ul><p>${esc(m.note)}</p></article>`).join('')}</div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'By region', title: 'Choose your coast' })}
    <div class="regioncards">${Object.entries(regions).map(([k, r]) => `<article class="rcard" data-reveal><h3>${esc(r.label)}</h3><p>${esc(r.blurb)}</p><ul>${destinations.filter(d => d.region === k).map(d => `<li><a href="${d.path}">${esc(d.name)}</a> <small>${esc(d.peak)}</small></li>`).join('')}</ul></article>`).join('')}</div>
  </div>
</section>
<section class="section section--foam"><div class="wrap faqgrid"><div>${sectionHead({ eyebrow: 'FAQ', title: 'Season questions' })}</div>${faqList(qa, { openFirst: true })}</div></section>
${ctaBand({ title: 'Tell us your dates.', lead: 'We’ll tell you exactly where the bite is hottest — and line up the perfect boat.' })}`;
  return page({ path, title: 'Best Time to Fish in Costa Rica | Month-by-Month Calendar', desc: 'When is the best time to fish in Costa Rica? Month-by-month fishing calendar for sailfish, marlin, tuna, mahi-mahi & roosterfish, plus which coast to choose.', body, crumbs, preload: preloadFor(['sailfish-2', 'sailfish', 'pacific-sunset']),
    schema: [article({ headline: 'Best Time to Fish in Costa Rica', desc: 'Month-by-month Costa Rica fishing calendar.', img: ['sailfish-2', 'sailfish'], path }), faqSchema(qa)] });
}

// ════════════════════════════════════════════════════════════════════════════
// CAPTAINS
// ════════════════════════════════════════════════════════════════════════════
export function captainsPage() {
  const path = '/captains/';
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Captains', href: path }];
  const body = `
${pageHero({ image: ['captain-helm', 'sportfisher-running', 'marina-docks'], eyebrow: 'Our crews', title: 'Meet Our Costa Rica Fishing Captains', lead: 'Local legends who grew up on these waters. Every captain is licensed, experienced and personally vetted by our team.', crumbs, size: 'sm' })}
<section class="section">
  <div class="wrap">
    <div class="grid grid--captains">${captains.map(c => captainCard(c)).join('')}</div>
  </div>
</section>
<section class="section section--sand">
  <div class="wrap split">
    <div class="prose prose--lg" data-reveal>
      <h2>How we choose our captains</h2>
      <p>A fishing trip is only as good as the crew. Before any boat joins our fleet, our team meets the captain, inspects the vessel and fishes with them. We look for:</p>
      <ul class="ticks">
        ${['Valid captain’s license and legally registered vessel', 'Well-maintained engines, electronics and safety gear', 'Quality, well-serviced rods, reels and tackle', 'Mates who speak English and love teaching', 'Proven catch-and-release practices with circle hooks', 'Consistently excellent feedback from anglers'].map(x => `<li>${icon('check')}<span>${x}</span></li>`).join('')}
      </ul>
    </div>
    <div class="split__side" data-reveal>${img(['catch-release', 'sailfish-2'], { sizes: '(max-width: 900px) 100vw, 40vw', cls: 'rounded', alt: 'Crew releasing a billfish beside the boat' })}</div>
  </div>
</section>
${ctaBand()}`;
  return page({ path, title: 'Costa Rica Fishing Captains | Meet Our Local Crews', desc: 'Meet the licensed Costa Rica fishing captains behind our charters: billfish specialists, roosterfish experts, fly-fishing pros and family favorites.', body, crumbs });
}

// ════════════════════════════════════════════════════════════════════════════
// GUIDES (license, regulations) & TOURNAMENTS
// ════════════════════════════════════════════════════════════════════════════
export function guidePage(g) {
  const crumbs = [{ name: 'Home', href: '/' }, { name: g.name, href: g.path }];
  const toc = g.blocks.filter(b => b[0] === 'h2');
  const body = `
${pageHero({ image: g.img, eyebrow: 'Angler’s guide', title: esc(g.seoTitle.split(' | ')[0]), lead: esc(g.lead), crumbs, size: 'sm' })}
<section class="section">
  <div class="wrap article">
    <aside class="article__toc" aria-label="On this page"><p class="eyebrow">On this page</p><ol>${toc.map(h => `<li><a href="#${slugify(h[1])}">${esc(strip(h[1]))}</a></li>`).join('')}</ol><p class="small muted">Updated ${fmtDate(BUILD_DATE)}</p></aside>
    <article class="prose prose--lg">${rich(g.blocks)}</article>
  </div>
</section>
${g.faqs?.length ? `<section class="section section--foam"><div class="wrap faqgrid"><div>${sectionHead({ eyebrow: 'FAQ', title: 'Quick answers' })}</div>${faqList(g.faqs, { openFirst: true })}</div></section>` : ''}
${ctaBand()}`;
  return page({ path: g.path, title: g.seoTitle, desc: g.metaDesc, body, crumbs, schema: [article({ headline: g.seoTitle.split(' | ')[0], desc: g.lead, img: g.img, path: g.path }), faqSchema(g.faqs)] });
}

export function tournamentsPage() {
  const path = '/costa-rica-fishing-tournaments/';
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Tournaments', href: path }];
  const byMonth = monthsLong.map(m => [m, tournaments.filter(t => t.month === m)]).filter(([, l]) => l.length);
  const body = `
${pageHero({ image: ['blue-marlin', 'sportfisher-running-2', 'marina-pez-vela'], eyebrow: 'Tournament calendar', title: 'Costa Rica Fishing Tournaments', lead: 'Costa Rica hosts some of the most prestigious billfish tournaments in the world. Here’s the annual calendar — and how to fish one.', crumbs, size: 'sm' })}
<section class="section">
  <div class="wrap split">
    <div>
      <ol class="timeline">${byMonth.map(([m, list]) => `<li data-reveal><p class="timeline__m">${m}</p>${list.map(t => `<div class="timeline__item"><h3>${esc(t.name)}</h3><p>${icon('pin')} ${t.dest ? `<a href="${destBySlug[t.dest].path}">${esc(t.where)}</a>` : esc(t.where)} · <span class="chip chip--soft">${esc(t.type)}</span></p></div>`).join('')}</li>`).join('')}</ol>
      <aside class="note">${icon('info')}<p>Tournament dates and formats change every year. Always confirm the current schedule with the official organizer before booking travel.</p></aside>
    </div>
    <aside class="split__side" data-reveal>
      <div class="sidecard">
        <h3>Fish a tournament</h3>
        <p>Tournament-ready boats book up months ahead. Tell us the event and your team size and we’ll find a competitive boat and crew.</p>
        <a class="btn btn--sun btn--block" href="/book/?trip=offshore">Request a tournament boat</a>
      </div>
    </aside>
  </div>
</section>
${ctaBand()}`;
  return page({ path, title: 'Costa Rica Fishing Tournaments Calendar | Billfish Events', desc: 'Annual Costa Rica fishing tournament calendar: Los Sueños Triple Crown, Offshore World Championship, Dorado Derby and more billfish events.', body, crumbs });
}

// ════════════════════════════════════════════════════════════════════════════
// BLOG
// ════════════════════════════════════════════════════════════════════════════
export function blogIndex() {
  const path = '/blog/';
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Guides & Blog', href: path }];
  const [first, ...rest] = posts;
  const body = `
${pageHero({ image: ['reel-closeup', 'lures', 'sportfisher-docked'], eyebrow: 'Guides & blog', title: 'Costa Rica Fishing Guides', lead: 'Practical, honest advice for planning the perfect fishing trip to Costa Rica — prices, seasons, packing lists and more.', crumbs, size: 'sm' })}
<section class="section">
  <div class="wrap">
    <a class="feature-post" href="${postPath(first)}" data-reveal>${img(first.img, { sizes: '(max-width: 900px) 100vw, 60vw', alt: first.title })}<span class="feature-post__body"><span class="eyebrow">${esc(first.cat)} · ${readingTime(first.blocks)} min read</span><span class="feature-post__title">${esc(first.title)}</span><span>${esc(first.excerpt)}</span><span class="link-arrow">Read guide ${icon('arrow')}</span></span></a>
    <div class="grid grid--posts">${rest.map(postCard).join('')}</div>
  </div>
</section>
<section class="section section--sand"><div class="wrap">${sectionHead({ eyebrow: 'Essential reading', title: 'Angler resources' })}<div class="grid grid--posts">
  ${[['/costa-rica-fishing-license/', 'Costa Rica Fishing License', 'How to buy your INCOPESCA license online in minutes.', 'calendar'], ['/costa-rica-fishing-regulations/', 'Regulations & Conservation', 'Billfish rules, protected areas and best practices.', 'leaf'], ['/costa-rica-fishing-tournaments/', 'Tournament Calendar', 'The big billfish events at Los Sueños and Quepos.', 'trophy']].map(([h, t, d, ic]) => `<a class="rescard" href="${h}" data-reveal>${icon(ic)}<strong>${t}</strong><span>${d}</span></a>`).join('')}
</div></div></section>
${ctaBand()}`;
  return page({ path, title: 'Costa Rica Fishing Blog & Trip Planning Guides', desc: 'Costa Rica fishing guides: charter prices, what to bring, tipping, half vs full day, where to fish by region and catch-and-release tips from local experts.', body, crumbs });
}

export function postPage(p) {
  const path = postPath(p);
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog/' }, { name: p.title, href: path }];
  const related = posts.filter(x => x.slug !== p.slug).slice(0, 3);
  const body = `
<section class="post-hero">
  <div class="wrap post-hero__inner">
    ${crumbsNav(crumbs)}
    <p class="eyebrow">${esc(p.cat)} · ${readingTime(p.blocks)} min read</p>
    <h1 class="post-hero__title">${esc(p.title)}</h1>
    <p class="post-hero__meta">By the ${esc(site.name)} team · <time datetime="${p.date}">${fmtDate(p.date)}</time></p>
  </div>
  <div class="wrap"><div class="post-hero__media">${img(p.img, { eager: true, sizes: '(max-width: 1200px) 100vw, 1200px', alt: p.title })}</div></div>
</section>
<section class="section section--tight">
  <div class="wrap article article--post">
    <aside class="article__toc"><p class="eyebrow">Plan your trip</p><a class="btn btn--sun btn--block" href="/book/">Check availability</a><a class="btn btn--ghost-ink btn--block" href="/fishing-charters/">Fleet & prices</a></aside>
    <article class="prose prose--lg"><p class="lead">${esc(p.excerpt)}</p>${rich(p.blocks)}</article>
  </div>
</section>
<section class="section section--sand"><div class="wrap">${sectionHead({ eyebrow: 'Keep reading', title: 'More guides' })}<div class="grid grid--posts">${related.map(postCard).join('')}</div></div></section>
${ctaBand()}`;
  return page({ path, title: p.seoTitle, desc: p.metaDesc, body, crumbs, solidHeader: true, ogType: 'article', ogImage: pick(p.img) ? '/assets/img/' + pick(p.img).file : undefined,
    schema: [article({ type: 'BlogPosting', headline: p.title, desc: p.metaDesc, img: p.img, path, date: p.date })] });
}

// ════════════════════════════════════════════════════════════════════════════
// FAQ · ABOUT · CONTACT · BOOK
// ════════════════════════════════════════════════════════════════════════════
export function faqPage() {
  const path = '/faq/';
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'FAQ', href: path }];
  const all = [...faqs, ...guides.license.faqs.slice(0, 2), ...species.flatMap(s => s.faqs).slice(0, 6)];
  const seen = new Set(); const uniq = all.filter(f => !seen.has(f.q) && seen.add(f.q));
  const body = `
${pageHero({ image: ['catch-release', 'family-fishing', 'sportfisher-docked'], eyebrow: 'Help center', title: 'Costa Rica Fishing FAQ', lead: 'Answers to the questions anglers ask us most — licenses, prices, seasons, tipping, kids, weather and more.', crumbs, size: 'sm' })}
<section class="section"><div class="wrap faq-page">${faqList(uniq, { openFirst: true })}<aside class="sidecard" data-reveal><h3>Didn’t find your answer?</h3><p>Our local team replies fast — usually within a few hours.</p><a class="btn btn--wa btn--block" href="${waLink('Hi! I have a question about fishing in Costa Rica.')}" target="_blank" rel="noopener">${icon('chat')} WhatsApp</a><a class="btn btn--ghost-ink btn--block" href="mailto:${site.email}">${icon('mail')} Email us</a></aside></div></section>
${ctaBand()}`;
  return page({ path, title: 'Costa Rica Fishing FAQ | Licenses, Prices, Seasons & Tips', desc: 'Frequently asked questions about fishing in Costa Rica: licenses, charter prices, best season, tipping, keeping fish, kids, seasickness and what to bring.', body, crumbs, schema: [faqSchema(uniq)] });
}

export function aboutPage() {
  const path = '/about/';
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'About', href: path }];
  const body = `
${pageHero({ image: ['pacific-sunset-2', 'pacific-sunset', 'hero-coast'], eyebrow: 'About us', title: `About ${esc(site.name)}`, lead: 'We’re a Costa Rica–based team of anglers who believe a great fishing trip starts long before you reach the dock.', crumbs, size: 'sm' })}
<section class="section">
  <div class="wrap split">
    <div class="prose prose--lg" data-reveal>
      <h2>Local knowledge, honest advice</h2>
      <p>Costa Rica has hundreds of charter boats, and they are not all equal. Our job is to know which captains are on fire this week, which coast fits your dates, which boat suits your group — and to tell you honestly when a half day will do or when you really need a full day.</p>
      <p>We work directly with local captains in ${destinations.length} destinations, from the tournament fleets of Los Sueños and Quepos to family-run pangas on the beaches of Guanacaste and the Nicoya Peninsula, the lodges of the Osa and the tarpon rivers of the Caribbean.</p>
      <h2>What we stand for</h2>
      <ul class="ticks">
        <li>${icon('check')}<span><strong>Transparent pricing.</strong> Per-boat prices up front, with no hidden booking fees.</span></li>
        <li>${icon('check')}<span><strong>Vetted crews.</strong> Licensed captains, maintained boats and quality tackle — always.</span></li>
        <li>${icon('check')}<span><strong>Real humans, fast.</strong> A local expert answers on WhatsApp or email, usually within hours.</span></li>
        <li>${icon('check')}<span><strong>Conservation first.</strong> We support catch-and-release and responsible fishing practices.</span></li>
      </ul>
    </div>
    <div class="split__side" data-reveal>${img(['captain-helm', 'sportfisher-running'], { sizes: '(max-width: 900px) 100vw, 40vw', cls: 'rounded', alt: 'Captain at the helm of a sportfishing boat in Costa Rica' })}</div>
  </div>
</section>
${ctaBand()}`;
  return page({ path, title: `About Us | ${site.name} Costa Rica Fishing Charters`.slice(0, 60), desc: `A Costa Rica–based team connecting anglers with vetted local captains in ${destinations.length} destinations. Transparent prices, fast answers, conservation first.`, body, crumbs });
}

export function contactPage() {
  const path = '/contact/';
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Contact', href: path }];
  const body = `
${pageHero({ image: ['tamarindo', 'tamarindo-2', 'pacific-sunset'], eyebrow: 'Contact', title: 'Contact Our Costa Rica Fishing Experts', lead: 'Questions, quotes or custom trips — we usually reply within a few hours.', crumbs, size: 'sm' })}
<section class="section">
  <div class="wrap contact">
    <div class="contact__ways">
      <a class="way" href="${waLink('Hi! I’d like info about a fishing charter in Costa Rica.')}" target="_blank" rel="noopener" data-reveal>${icon('chat')}<strong>WhatsApp</strong><span>${esc(site.phoneCR)}</span><em>Fastest response</em></a>
      <a class="way" href="tel:${site.phoneHref}" data-reveal>${icon('phone')}<strong>Call</strong><span>${esc(site.phone)}</span><em>Daily 6 am – 8 pm (CR time)</em></a>
      <a class="way" href="mailto:${site.email}" data-reveal>${icon('mail')}<strong>Email</strong><span>${esc(site.email)}</span><em>Detailed quotes & packages</em></a>
      <div class="way" data-reveal>${icon('pin')}<strong>Office</strong><span>${esc(site.address.locality)}, ${esc(site.address.region)}</span><em>Costa Rica</em></div>
    </div>
    <div class="contact__form"><h2 class="h2">Send us your trip details</h2>${bookingForm({ id: 'contact-form' })}</div>
  </div>
</section>`;
  return page({ path, title: 'Contact Us | Costa Rica Fishing Charters', desc: 'Contact our Costa Rica fishing charter experts by WhatsApp, phone or email for quotes, availability and custom fishing packages. Fast replies from a local team.', body, crumbs,
    schema: [{ '@type': 'ContactPage', name: 'Contact', url: abs(path) }] });
}

export function bookPage() {
  const path = '/book/';
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Book a Charter', href: path }];
  const body = `
<section class="bookpage">
  <div class="bookpage__media">${img(['sportfisher-running', 'pacific-sunset'], { eager: true, sizes: '(max-width: 900px) 100vw, 45vw', alt: 'Sportfishing boat running offshore in Costa Rica' })}<div class="bookpage__over"><p class="eyebrow eyebrow--light">Why book with us</p><ul class="ticks ticks--light">${['No payment to check availability', 'Hand-picked, licensed captains', 'Transparent per-boat pricing', 'Local experts on WhatsApp', 'Help with licenses, transfers & lodging'].map(x => `<li>${icon('check')}<span>${x}</span></li>`).join('')}</ul></div></div>
  <div class="bookpage__form">
    ${crumbsNav(crumbs)}
    <h1 class="bookpage__title">Book a Fishing Charter in Costa Rica</h1>
    <p class="bookpage__lead">Tell us about your trip. We’ll confirm availability and the best price with the right captain — usually within a few hours.</p>
    ${bookingForm({ id: 'main-book' })}
  </div>
</section>`;
  return page({ path, title: 'Book a Fishing Charter in Costa Rica | Check Availability', desc: 'Check availability and book your Costa Rica fishing charter. Choose your destination, boat and date — a local expert confirms your trip within hours.', body, crumbs, solidHeader: true });
}

// ════════════════════════════════════════════════════════════════════════════
// GALLERY & CREDITS
// ════════════════════════════════════════════════════════════════════════════
export function galleryPage() {
  const path = '/photo-gallery/';
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Photo Gallery', href: path }];
  const groups = [['fish', 'Fish & catches'], ['boats', 'Boats & action'], ['places', 'Destinations']];
  const body = `
${pageHero({ image: ['blue-marlin-2', 'sailfish', 'dorado'], eyebrow: 'Gallery', title: 'Costa Rica Sportfishing Photo Gallery', lead: 'Billfish, bluewater, jungle rivers and Pacific sunsets — a glimpse of what’s waiting for you.', crumbs, size: 'sm' })}
<section class="section">
  <div class="wrap">
    <div class="tabs" role="tablist" data-tabs>${[['all', 'All'], ...groups].map(([k, l], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${k}">${l}</button>`).join('')}</div>
    <div class="masonry" data-lightbox-group data-masonry>${Object.values(images).filter(im => !/-2$/.test(im.id) || true).map(im => `<a class="masonry__item" href="/assets/img/${im.file}" data-lightbox data-group="${im.group}" data-caption="${esc(im.alt)}">${img(im, { sizes: '(max-width: 700px) 50vw, 25vw', small: true })}</a>`).join('')}</div>
  </div>
</section>
${ctaBand()}`;
  return page({ path, title: 'Costa Rica Sportfishing Photo Gallery', desc: 'Photo gallery of Costa Rica sportfishing: sailfish, marlin, tuna, roosterfish, tarpon, boats, marinas and the beautiful coastlines where we fish.', body, crumbs, schema: [{ '@type': 'ImageGallery', name: 'Costa Rica sportfishing photo gallery', url: abs(path) }] });
}

export function creditsPage() {
  const path = '/photo-credits/';
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Photo Credits', href: path }];
  const rows = Object.values(images).sort((a, b) => a.group.localeCompare(b.group) || a.id.localeCompare(b.id));
  const body = `
<section class="section section--top"><div class="wrap">
  ${crumbsNav(crumbs)}
  <h1 class="h1">Photo Credits</h1>
  <p class="lead">Photographs on this site are used under the licenses listed below. We’re grateful to the photographers who share their work.</p>
  <div class="table-wrap"><table class="dtable dtable--credits"><thead><tr><th scope="col">Photo</th><th scope="col">Subject</th><th scope="col">Author</th><th scope="col">License</th><th scope="col">Source</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td>${img(r, { sizes: '96px', small: true })}</td><td>${esc(r.subject)}</td><td>${esc(r.author)}</td><td>${r.license_url ? `<a href="${esc(r.license_url)}" rel="noopener nofollow" target="_blank">${esc(r.license)}</a>` : esc(r.license)}</td><td>${r.source_url ? `<a href="${esc(r.source_url)}" rel="noopener nofollow" target="_blank">Source</a>` : '—'}</td></tr>`).join('')}
  </tbody></table></div>
</div></section>`;
  return page({ path, title: 'Photo Credits', desc: 'Photo credits and licenses for the sportfishing, species and destination photographs used on this Costa Rica fishing charters website.', body, crumbs, solidHeader: true });
}

// ════════════════════════════════════════════════════════════════════════════
// LEGAL & 404
// ════════════════════════════════════════════════════════════════════════════
const legal = (path, name, blocks, desc) => {
  const crumbs = [{ name: 'Home', href: '/' }, { name, href: path }];
  return page({ path, title: name, desc, crumbs, solidHeader: true, body: `<section class="section section--top"><div class="wrap narrow">${crumbsNav(crumbs)}<h1 class="h1">${esc(name)}</h1><aside class="note">${icon('info')}<p>Template text — have this page reviewed by a qualified professional and adapted to your business before launch.</p></aside><div class="prose">${rich(blocks)}</div></div></section>` });
};
export const privacyPage = () => legal('/privacy-policy/', 'Privacy Policy', [
  ['p', `This policy explains how ${esc(site.legalName)} collects and uses personal information when you visit this website or request a booking.`],
  ['h2', 'Information we collect'], ['p', 'When you submit a booking request or subscribe to our newsletter we collect the details you provide, such as your name, email address, phone number, travel dates and trip preferences. We also collect anonymous usage data through analytics cookies if enabled.'],
  ['h2', 'How we use it'], ['p', 'We use your information to answer inquiries, arrange your charter with the selected captain, send booking confirmations and, if you opt in, our fishing report. We share booking details only with the service providers needed to deliver your trip.'],
  ['h2', 'Your rights'], ['p', `You may request access to, correction of or deletion of your personal data at any time by emailing <a href="mailto:${site.email}">${site.email}</a>.`],
], 'How we collect, use and protect the personal information you share when you request a Costa Rica fishing charter through our website.');
export const termsPage = () => legal('/terms/', 'Terms & Conditions', [
  ['p', 'These terms apply to bookings made through this website. Your specific booking confirmation will state the final price, payment schedule and cancellation policy for your trip.'],
  ['h2', 'Bookings & payment'], ['p', 'A booking is confirmed only when you receive written confirmation from us. Deposit and balance requirements are stated in your quote.'],
  ['h2', 'Weather & safety'], ['p', 'The captain has final authority on all safety decisions. Trips cancelled by the captain due to weather or sea conditions will be rescheduled or refunded according to your booking confirmation.'],
  ['h2', 'Fishing licenses & regulations'], ['p', 'Anglers are responsible for holding a valid INCOPESCA fishing license and for following Costa Rican fishing regulations, including catch-and-release rules for billfish.'],
  ['h2', 'Liability'], ['p', 'Charters are operated by independent licensed captains. Participants must follow crew instructions at all times.'],
], 'Terms and conditions for Costa Rica fishing charter bookings: confirmations, payments, weather cancellations, licenses and safety.');

export function notFound() {
  return page({ path: '/404.html', title: 'Page Not Found', desc: 'This page could not be found. Explore Costa Rica fishing charters, destinations, species guides and fleet prices instead.', noindex: true, solidHeader: true, body: `
<section class="section section--top nf"><div class="wrap narrow center">
  <p class="nf__code">404</p>
  <h1 class="h1">This one got away.</h1>
  <p class="lead">The page you’re looking for doesn’t exist or has moved. Try one of these instead:</p>
  <div class="nf__links"><a class="btn btn--sun" href="/">Home</a><a class="btn btn--ink" href="/fishing-charters/">Fleet & prices</a><a class="btn btn--ghost-ink" href="/costa-rica-fishing-destinations/">Destinations</a></div>
</div></section>` });
}
