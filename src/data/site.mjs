// ─────────────────────────────────────────────────────────────────────────────
// SITE CONFIG — the one file to edit for brand, domain and contact details.
// Everything marked PLACEHOLDER must be replaced before launch.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: 'Costa Rica Bluewater',                  // PLACEHOLDER brand name
  legalName: 'Costa Rica Bluewater Fishing Charters', // PLACEHOLDER
  tagline: 'Costa Rica Fishing Charters',
  url: 'https://www.costaricabluewater.com',     // PLACEHOLDER production domain (no trailing slash)
  locale: 'en_US',
  lang: 'en',

  phone: '+1 (888) 555-0142',                    // PLACEHOLDER (555-01xx is a reserved fictional range)
  phoneHref: '+18885550142',
  phoneCR: '+506 0000-0000',                     // PLACEHOLDER Costa Rica line
  whatsapp: '50600000000',                       // PLACEHOLDER digits only, used for wa.me links
  email: 'reservations@costaricabluewater.com',  // PLACEHOLDER

  // Office / NAP used in schema.org and the footer. PLACEHOLDER address.
  address: {
    street: 'Calle Central',
    locality: 'Tamarindo',
    region: 'Guanacaste',
    postalCode: '50309',
    country: 'CR',
  },
  geo: { lat: 10.2993, lon: -85.8371 },
  hours: 'Mo-Su 06:00-20:00',

  social: {
    instagram: 'https://www.instagram.com/',     // PLACEHOLDER
    facebook: 'https://www.facebook.com/',       // PLACEHOLDER
    youtube: 'https://www.youtube.com/',         // PLACEHOLDER
    tripadvisor: 'https://www.tripadvisor.com/', // PLACEHOLDER
  },

  // Optional: set to a form backend (Formspree, Basin, your API…) to POST booking
  // requests as JSON. When empty, the form hands off to WhatsApp or email instead.
  formEndpoint: '',

  // Set to your GA4 measurement ID (e.g. 'G-XXXXXXX') to enable analytics.
  gaId: '',
  // Paste your Google Search Console verification token here.
  googleSiteVerification: '',

  ogImage: '/assets/img/brand/og-default.jpg',
};

// Primary navigation — `mega` items get a dropdown panel.
export const nav = [
  { label: 'Destinations', href: '/costa-rica-fishing-destinations/', mega: 'destinations' },
  { label: 'Fishing Trips', href: '/fishing-trips/', mega: 'trips' },
  { label: 'Fleet & Pricing', href: '/fishing-charters/' },
  { label: 'Species', href: '/costa-rica-fish-species/', mega: 'species' },
  { label: 'Seasons', href: '/best-time-to-fish-costa-rica/' },
  { label: 'Guides', href: '/blog/' },
];
