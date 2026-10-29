# Costa Rica Fishing Charters — website

A fast, static, SEO-first website for a Costa Rica sportfishing charter business:
95 pages generated from plain data files, zero runtime dependencies.

## Run it

```bash
npm run dev      # build + local server with auto-rebuild → http://localhost:8080
npm run build    # production build → ./dist
npm run brand    # regenerate favicons, app icons and the social share image
```

Requires Node 20+ (and Python 3 + Pillow only for the image tools).

## What’s inside

| Section | URL pattern | Count |
|---|---|---|
| Home (hero search, interactive map, species rail, season heatmap) | `/` | 1 |
| Fleet & pricing with live filters | `/fishing-charters/` | 1 |
| Boat detail pages (gallery, prices, captain, booking form) | `/fishing-charters/<boat>/` | 24 |
| Destination / marina pages | `/<place>-fishing-charters/` | 16 |
| Fishing trip types | `/costa-rica-<trip>/` | 11 |
| Species guides | `/costa-rica-<species>-fishing/` | 17 |
| Seasons calendar, license, regulations, tournaments, FAQ | various | 5 |
| Blog guides | `/blog/<slug>/` | 7 |
| About, contact, booking, captains, gallery, credits, legal, 404 | various | 9 |

Every page ships with a unique title and meta description, canonical URL, Open Graph and Twitter tags, and
JSON-LD structured data (TravelAgency, BreadcrumbList, FAQPage, Product/Offer, Service, TouristDestination,
Article/BlogPosting). The build also writes `sitemap.xml` (with image entries), `robots.txt`,
`site.webmanifest` and `llms.txt`, and **fails if any internal link, anchor or image is broken**
or a page doesn’t have exactly one `<h1>`.

## Edit content

Everything lives in `src/data/`:

- `site.mjs` — **brand name, domain, phone, WhatsApp, email, address, socials, form endpoint, GA4 ID**
- `destinations.mjs` — 16 destinations & the marinas table
- `fleet.mjs` — boats, captains and prices
- `trips.mjs` — fishing experiences
- `species.mjs` — species guides and month-by-month seasonality
- `content.mjs` — FAQs, monthly notes, tournaments, testimonials, license/regulation guides, blog posts

Styles: `src/assets/css/styles.css` · Behaviour: `src/assets/js/main.js` · Templates: `src/templates/`.

### Add your own photos

```bash
python -P tools/add-image.py ~/photos/my-boat.jpg boats pura-vida-hunter "Pura Vida Hunter running offshore from Los Sueños"
```

Then put the id first in that boat’s `img: [...]` list in `fleet.mjs`. Real photos of your boats, captains
and clients’ catches will beat stock photography for both conversions and Google Images.

### Booking requests

With `formEndpoint` empty, the booking form validates and then hands the request off to WhatsApp or email
with every detail pre-filled. To receive submissions directly, set `formEndpoint` in `site.mjs` to any
service that accepts a JSON POST (Formspree, Basin, Getform, your own API…).

## Deploy

Any static host works. Build command `node build.mjs`, publish directory `dist`
(Netlify, Cloudflare Pages, Vercel, GitHub Pages, S3 + CloudFront).

## ⚠ Before launch — replace the placeholders

1. **`site.mjs`**: brand name, real domain (used for canonicals/sitemap), phone, WhatsApp, email, address, social links.
2. **`fleet.mjs`**: the 24 boats and 12 captains are **realistic samples**. Replace them with your real partner boats,
   captains, confirmed prices and photos.
3. **`content.mjs` testimonials**: they are labelled “Sample” on the site. Replace them with real reviews (or
   remove the section) — invented reviews are illegal in the US (FTC rule, 2024) and many other markets.
4. Confirm the policies stated on the site match how you operate: per-boat pricing, what’s included, weather
   cancellations, hotel pickup, English-speaking crews, “no payment to inquire”.
5. Have the privacy policy and terms reviewed; verify tournament dates and INCOPESCA license prices each season.
6. Run `npm run brand` again if you change the brand name (it renders the share image).

## SEO launch checklist (the off-page half)

The on-page work is done — fast static HTML, keyword-mapped URLs/titles/H1s for every destination, species
and trip type, internal linking, structured data and sitemaps. Ranking on page one for competitive terms like
“Costa Rica fishing charters” also depends on things only the business can do:

- Verify the domain in **Google Search Console** and **Bing Webmaster Tools**, then submit `/sitemap.xml`.
- Create and verify a **Google Business Profile** (same name, phone and address as `site.mjs`); collect real reviews.
- Get listed and reviewed on **TripAdvisor**, FishingBooker-style marketplaces, and local tourism directories.
- Earn links from hotels, surf schools, tour operators and travel bloggers in each destination.
- Publish fresh content monthly (real fishing reports with your own photos are ideal).
- Consider a Spanish version (`/es/`) for local and Latin American searchers.
- Add GA4 (`gaId` in `site.mjs`) and track booking-form and WhatsApp clicks as conversions.

## Photo credits

Photos come from Wikimedia Commons, Unsplash and Openverse under free licenses (CC0, Public Domain,
CC BY, CC BY-SA, Unsplash License). Attribution is generated automatically at `/photo-credits/`
from `src/assets/img/*/manifest.json` — keep that page published when using CC BY / BY-SA images.
