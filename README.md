# Edge Smart Space — Website v2 (HTML / CSS / JS)

Static site: no server code, no frameworks, no animation libraries. Open `index.html` or upload the folder to any static host
(Netlify, Vercel, GitHub Pages, Cloudflare Pages, Hostinger…).

## What's inside
```
index.html                 Whole page: SEO meta, Open Graph, JSON-LD (LocalBusiness + Products), inline logo
assets/css/style.css       All styles. Light theme tokens in :root, dark theme in [data-theme="dark"]
assets/js/main.js          Theme switch, touch-panel moods, curtain scroll sequence, gate demo, form (~12 KB)
assets/img/render/         Photoreal interior renders (WebP, 2 sizes each)
  hero_day / hero_dusk           Hero background (light mode / dark mode)
  mood_day|warm|cool|movie|off   Touch-panel lighting moods (same room, same camera)
  curtain-1280-00..15            Curtain opening sequence, desktop
  curtain-720-00..15             Curtain opening sequence, phones
assets/img/logo/           Logo files (SVG + PNG); the header/footer logo is inlined as a theme-aware symbol
```

## Section order
Hero → 01 Touch Panels → 02 Automatic Curtains → 03 Locks & CCTV → 04 Sensors & Gates → Solutions → Pricing → Contact → Footer

## Light / dark mode
- Loads in **light mode** by default. The sun/moon switch in the header changes theme; the choice is remembered per browser.
- The hero photo also changes: daylight in light mode, dusk in dark mode.

## Touch-panel moods
Each scene key shows a separate render of the *same* room under different lighting (Daylight, Warm Evening, Cool Night,
Movie, All Off). The other scenes download just before the section scrolls into view, so taps switch instantly.
The dimmer slider adjusts brightness on top.

## Automatic curtains
A 16-frame render sequence is drawn on a canvas and blended frame-to-frame as you scroll, so the motion is continuous.
Phones get lighter 720px frames. With reduced-motion or no JavaScript, a still of the open curtains is shown with the text.

## Contact form
Connected to Web3Forms: submissions are emailed to edgesmartspace@gmail.com (access key is in the hidden
`access_key` field in `index.html`; Web3Forms keys are designed to be public).

## Things to edit before launch
- Phones: +91 93158 24206 and +91 96256 93696. WhatsApp chat opens +91 93158 24206 (`WHATSAPP` in `assets/js/main.js`)
- Domain: `https://edgesmartspace.com` (no www) in canonical, Open Graph, JSON-LD, sitemap.xml, robots.txt and `CNAME`
- Street address: removed for now. When you have one, add it to the footer and a `streetAddress`/`postalCode` to the JSON-LD
  (it must match your Google Business Profile exactly)
- Prices: the three packages (₹24,999 / ₹44,999 / ₹74,999 + GST) appear on the home page, every city page and the JSON-LD

## SEO files
- `home-automation-delhi/`, `-noida/`, `-gurgaon/`, `-ghaziabad/`, `-faridabad/` — city landing pages (each `index.html`)
- `privacy/` — privacy policy, `404.html` — not-found page (GitHub Pages uses it automatically)
- `robots.txt`, `sitemap.xml` — when you add a page, add its URL to the sitemap and update `<lastmod>`
- `CNAME` — tells GitHub Pages the custom domain; `.nojekyll` — serve files as-is
- Every page has its own `<title>`, meta description, canonical URL and JSON-LD; keep them unique if you copy a page

## Replacing the renders with your own photos
Keep the same file names and sizes (1600 / 960 px wide, 16:9). For the mood switch to look right, all five mood
images must be the same room from the same camera position.

## Updating the live site (cache busting)
Browsers keep old copies of `style.css` and `main.js`. Whenever you change either file, bump the version number in
every `.html` page (e.g. `style.css?v=20261020` -> `style.css?v=20261105`) so every visitor gets the new file immediately.
