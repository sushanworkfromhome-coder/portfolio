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
Uses Web3Forms (free). Get a key at https://web3forms.com with edgesmartspace@gmail.com, then replace
`YOUR_WEB3FORMS_ACCESS_KEY` in `index.html`. Until then the form opens the visitor's email app pre-filled.

## Things to edit before launch
- Phone `+91 98765 43210` and WhatsApp number (`WHATSAPP` at the top of `assets/js/main.js`)
- Domain `https://www.edgesmartspace.com` (canonical, Open Graph, JSON-LD, sitemap.xml, robots.txt)
- Street address in the JSON-LD block
- Prices: visible text plus `data-inr` / `data-usd` on each price

## Replacing the renders with your own photos
Keep the same file names and sizes (1600 / 960 px wide, 16:9). For the mood switch to look right, all five mood
images must be the same room from the same camera position.
