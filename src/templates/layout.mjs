import { site, nav } from '../data/site.mjs';
import { destinations, regions } from '../data/destinations.mjs';
import { trips } from '../data/trips.mjs';
import { species, speciesGroups } from '../data/species.mjs';
import { esc, icon, iconSprite, json, imgUrl } from './helpers.mjs';

export const abs = p => site.url + p;
let assetVersion = '1';
export const setAssetVersion = v => { assetVersion = v; };
export const speciesPath = s => `/costa-rica-${s.slug}-fishing/`;
export const boatPath = b => `/fishing-charters/${b.slug}/`;
export const postPath = p => `/blog/${p.slug}/`;
export const waLink = (text = '') => `https://wa.me/${site.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;

export const orgSchema = () => ({
  '@type': ['TravelAgency', 'LocalBusiness'], '@id': site.url + '/#org', name: site.legalName, alternateName: site.name,
  url: site.url + '/', logo: site.url + '/assets/img/brand/logo-512.png', image: site.url + site.ogImage,
  telephone: site.phone, email: site.email, priceRange: '$$–$$$$',
  address: { '@type': 'PostalAddress', streetAddress: site.address.street, addressLocality: site.address.locality, addressRegion: site.address.region, postalCode: site.address.postalCode, addressCountry: site.address.country },
  geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lon },
  openingHours: site.hours,
  areaServed: { '@type': 'Country', name: 'Costa Rica' },
  knowsAbout: ['Sportfishing', 'Deep sea fishing', 'Sailfish', 'Marlin', 'Roosterfish', 'Yellowfin tuna', 'Fishing charters in Costa Rica'],
  sameAs: Object.values(site.social),
});

export const crumbsSchema = crumbs => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.href) })),
});
export const faqSchema = list => list?.length ? ({ '@type': 'FAQPage', mainEntity: list.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } })) }) : null;

const logo = `<span class="logo__mark" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M9.5 23C10.4 17.2 11.6 12.6 13.6 9.4c6.1 1.6 12.3 5.4 17.4 10.9V23z" fill="currentColor"/><path d="M7.5 26.2c2.1 0 2.1-1.6 4.2-1.6s2.1 1.6 4.2 1.6 2.1-1.6 4.2-1.6 2.1 1.6 4.2 1.6 2.1-1.6 4.2-1.6 2.1 1.6 4.2 1.6" fill="none" stroke="var(--sun)" stroke-width="1.6" stroke-linecap="round"/></svg></span><span class="logo__text"><small>Costa Rica</small>${esc(site.name.replace(/^Costa Rica\s*/, ''))}</span>`;

function megaDestinations() {
  const cols = Object.entries(regions).map(([key, r]) => {
    const list = destinations.filter(d => d.region === key);
    if (!list.length) return '';
    return `<div class="mega__col"><p class="mega__head">${esc(r.short)}</p><ul>${list.map(d => `<li><a href="${d.path}">${esc(d.name)}</a></li>`).join('')}</ul></div>`;
  }).join('');
  return `<div class="mega__grid mega__grid--dest">${cols}<a class="mega__feature" href="/costa-rica-fishing-destinations/" style="--bg:url('${imgUrl(['hero-coast', 'pacific-sunset'], true)}')"><span class="eyebrow">Interactive map</span><strong>Explore all ${destinations.length} destinations</strong><span class="mega__go">View map ${icon('arrow')}</span></a></div>`;
}
function megaTrips() {
  return `<div class="mega__grid mega__grid--trips">${trips.map(t => `<a class="mega__trip" href="${t.path}">${icon(t.icon)}<span><strong>${esc(t.name)}</strong><small>${esc(t.kicker)}</small></span></a>`).join('')}</div>`;
}
function megaSpecies() {
  const cols = Object.entries(speciesGroups).map(([key, g]) => `<div class="mega__col"><p class="mega__head">${esc(g.label)}</p><ul>${species.filter(s => s.group === key).map(s => `<li><a href="/costa-rica-${s.slug}-fishing/">${esc(s.name)}</a></li>`).join('')}</ul></div>`).join('');
  return `<div class="mega__grid mega__grid--species">${cols}<a class="mega__feature" href="/best-time-to-fish-costa-rica/" style="--bg:url('${imgUrl(['sailfish-2', 'sailfish'], true)}')"><span class="eyebrow">Fishing calendar</span><strong>What’s biting, month by month</strong><span class="mega__go">See seasons ${icon('arrow')}</span></a></div>`;
}
const megas = { destinations: megaDestinations, trips: megaTrips, species: megaSpecies };

function header(path, solid) {
  const items = nav.map(n => {
    const active = path.startsWith(n.href) ? ' aria-current="page"' : '';
    if (!n.mega) return `<li><a class="nav__link" href="${n.href}"${active}>${esc(n.label)}</a></li>`;
    return `<li class="has-mega"><a class="nav__link" href="${n.href}"${active} aria-haspopup="true" aria-expanded="false">${esc(n.label)}${icon('chevron', 'nav__chev')}</a><div class="mega" role="region" aria-label="${esc(n.label)}"><div class="mega__inner">${megas[n.mega]()}</div></div></li>`;
  }).join('');
  const drawer = nav.map(n => {
    if (!n.mega) return `<li><a href="${n.href}">${esc(n.label)}</a></li>`;
    let sub = '';
    if (n.mega === 'destinations') sub = destinations.map(d => `<a href="${d.path}">${esc(d.name)}</a>`).join('');
    if (n.mega === 'trips') sub = trips.map(t => `<a href="${t.path}">${esc(t.name)}</a>`).join('');
    if (n.mega === 'species') sub = species.map(s => `<a href="/costa-rica-${s.slug}-fishing/">${esc(s.name)}</a>`).join('');
    return `<li><details><summary>${esc(n.label)}${icon('chevron')}</summary><div class="drawer__sub"><a href="${n.href}" class="drawer__all">All ${esc(n.label.toLowerCase())} ${icon('arrow')}</a>${sub}</div></details></li>`;
  }).join('');
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="hdr${solid ? ' hdr--solid' : ''}" data-hdr>
  <div class="hdr__bar wrap">
    <a class="logo" href="/" aria-label="${esc(site.name)} — home">${logo}</a>
    <nav class="nav" aria-label="Main"><ul class="nav__list">${items}</ul></nav>
    <div class="hdr__actions">
      <a class="hdr__phone" href="tel:${site.phoneHref}">${icon('phone')}<span>${esc(site.phone)}</span></a>
      <a class="btn btn--sun btn--sm" href="/book/">Book a charter</a>
      <button class="hdr__burger" type="button" aria-label="Open menu" aria-controls="drawer" aria-expanded="false" data-drawer-open>${icon('menu')}</button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" hidden>
  <div class="drawer__backdrop" data-drawer-close></div>
  <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="drawer__top"><a class="logo" href="/">${logo}</a><button type="button" class="drawer__x" aria-label="Close menu" data-drawer-close>${icon('close')}</button></div>
    <ul class="drawer__nav">${drawer}<li><a href="/captains/">Captains</a></li><li><a href="/about/">About</a></li><li><a href="/contact/">Contact</a></li></ul>
    <div class="drawer__cta"><a class="btn btn--sun btn--block" href="/book/">Book a charter</a><a class="btn btn--ghost btn--block" href="${waLink('Hi! I’d like info about a fishing charter in Costa Rica.')}" target="_blank" rel="noopener">${icon('chat')} WhatsApp us</a></div>
  </div>
</div>`;
}

function footer() {
  const col = (title, links) => `<div class="ftr__col"><p class="ftr__head">${title}</p><ul>${links.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ul></div>`;
  return `
<footer class="ftr">
  <div class="ftr__wave" aria-hidden="true"><svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0 40c120 26 240 39 360 26S600 14 720 14s240 39 360 39 240-26 360-26v53H0z"/></svg></div>
  <div class="wrap">
    <div class="ftr__top">
      <div class="ftr__brand">
        <a class="logo logo--lg" href="/">${logo}</a>
        <p>Hand-picked fishing charters, captains and boats across Costa Rica — from the tournament docks of Los Sueños to the jungle rivers of the Caribbean.</p>
        <ul class="ftr__contact">
          <li><a href="tel:${site.phoneHref}">${icon('phone')} ${esc(site.phone)}</a></li>
          <li><a href="${waLink()}" target="_blank" rel="noopener">${icon('chat')} WhatsApp ${esc(site.phoneCR)}</a></li>
          <li><a href="mailto:${site.email}">${icon('mail')} ${esc(site.email)}</a></li>
          <li>${icon('pin')} ${esc(site.address.locality)}, ${esc(site.address.region)}, Costa Rica</li>
        </ul>
        <div class="ftr__social">
          <a href="${site.social.instagram}" aria-label="Instagram" rel="noopener" target="_blank">${icon('instagram')}</a>
          <a href="${site.social.facebook}" aria-label="Facebook" rel="noopener" target="_blank">${icon('facebook')}</a>
          <a href="${site.social.youtube}" aria-label="YouTube" rel="noopener" target="_blank">${icon('youtube')}</a>
          <a href="${site.social.tripadvisor}" aria-label="Tripadvisor" rel="noopener" target="_blank">${icon('tripadvisor')}</a>
        </div>
      </div>
      <form class="ftr__news" data-newsletter>
        <p class="ftr__head">The Costa Rica fishing report</p>
        <p>What’s biting, where and when — one short email a month.</p>
        <div class="ftr__newsrow"><label class="sr-only" for="news-email">Email address</label><input id="news-email" type="email" name="email" required placeholder="you@email.com" autocomplete="email"><button class="btn btn--sun" type="submit">Subscribe</button></div>
        <p class="ftr__newsmsg" role="status" aria-live="polite"></p>
      </form>
    </div>
    <div class="ftr__cols">
      ${col('Destinations', destinations.map(d => [d.path, d.name + (d.slug === 'arenal' ? '' : ' Fishing')]))}
      ${col('Fishing Trips', trips.map(t => [t.path, t.name]))}
      ${col('Species', species.slice(0, 12).map(s => [`/costa-rica-${s.slug}-fishing/`, s.name]))}
      ${col('Plan Your Trip', [['/fishing-charters/', 'Fleet & Pricing'], ['/best-time-to-fish-costa-rica/', 'Best Time to Fish'], ['/costa-rica-fishing-license/', 'Fishing License'], ['/costa-rica-fishing-regulations/', 'Regulations'], ['/costa-rica-fishing-tournaments/', 'Tournaments'], ['/captains/', 'Our Captains'], ['/faq/', 'FAQ'], ['/blog/', 'Guides & Blog'], ['/photo-gallery/', 'Photo Gallery']])}
      ${col('Company', [['/about/', 'About Us'], ['/contact/', 'Contact'], ['/book/', 'Book a Charter'], ['/privacy-policy/', 'Privacy Policy'], ['/terms/', 'Terms & Conditions'], ['/photo-credits/', 'Photo Credits']])}
    </div>
    <div class="ftr__legal">
      <p>© ${new Date().getFullYear()} ${esc(site.legalName)}. All prices in USD.</p>
      <p>Billfish are always released · Licensed captains · Fishing all 365 days</p>
    </div>
  </div>
</footer>
<a class="wa-float" href="${waLink('Hi! I’d like info about a fishing charter in Costa Rica.')}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">${icon('chat')}<span>Chat with a local expert</span></a>`;
}

/**
 * Render a full HTML page.
 * opts: { path, title, desc, body, schema: [], crumbs, solidHeader, ogImage, preload, noindex, ogType }
 */
export function page(o) {
  const branded = `${o.title} | ${site.name}`;
  const title = o.title.includes(site.name) || branded.length > 60 ? o.title : branded;
  const canonical = abs(o.path);
  const og = o.ogImage ? (o.ogImage.startsWith('http') ? o.ogImage : abs(o.ogImage)) : abs(site.ogImage);
  const graph = [orgSchema(), { '@type': 'WebSite', '@id': site.url + '/#website', url: site.url + '/', name: site.legalName, publisher: { '@id': site.url + '/#org' }, inLanguage: 'en' },
    { '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: title, description: o.desc, isPartOf: { '@id': site.url + '/#website' }, inLanguage: 'en', primaryImageOfPage: og },
    ...(o.crumbs ? [crumbsSchema(o.crumbs)] : []), ...(o.schema || []).filter(Boolean)];
  return `<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${o.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">
<meta name="theme-color" content="#04121c">
<meta property="og:type" content="${o.ogType || 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(o.desc)}">
<meta name="twitter:image" content="${og}">
<meta name="geo.region" content="CR">
<meta name="geo.placename" content="Costa Rica">
${site.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(site.googleSiteVerification)}">` : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/fraunces-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
${o.preload ? `<link rel="preload" as="image" href="${o.preload.src}" imagesrcset="${o.preload.srcset}" imagesizes="100vw" fetchpriority="high">` : ''}
<link rel="stylesheet" href="/assets/css/styles.css?v=${assetVersion}">
<script type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': graph })}</script>
${site.gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.gaId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.gaId}');</script>` : ''}
</head>
<body class="${o.bodyClass || ''}">
${iconSprite}
${header(o.path, o.solidHeader)}
<main id="main">
${o.body}
</main>
${footer()}
<script>window.SITE=${json({ whatsapp: site.whatsapp, email: site.email, formEndpoint: site.formEndpoint, name: site.name })};</script>
<script src="/assets/js/main.js?v=${assetVersion}" defer></script>
</body>
</html>`;
}
