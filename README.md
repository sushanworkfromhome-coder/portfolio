# Edge Smart Space — Static Website (HTML / CSS / JS)

No server code. Open `index.html` directly, or host the folder anywhere static:
Netlify, Vercel, GitHub Pages, Cloudflare Pages, Hostinger/GoDaddy file manager, etc.

## Files
```
index.html             The whole page (SEO meta, Open Graph, JSON-LD schema inline)
assets/css/style.css   Styles — colour tokens at the top
assets/js/hero3d.js    Three.js 3D hero (mouse + scroll reactive)
assets/js/main.js      Scroll scenes (GSAP), lighting demo, ₹/$ toggle, WhatsApp, contact form
assets/img/og-cover.jpg Social share image (1200×630)
sitemap.xml, robots.txt
```

## Make the contact form deliver emails (2 minutes, free)
1. Go to https://web3forms.com, enter **edgesmartspace@gmail.com**, and copy the access key they email you.
2. In `index.html`, search for `YOUR_WEB3FORMS_ACCESS_KEY` and paste the key there.

Until a key is set, submitting the form opens the visitor's email app with the enquiry pre-filled
to the address in `CONTACT_EMAIL` at the top of `assets/js/main.js`, so no lead is lost.

## Things to edit in index.html (search for them)
- `+91 98765 43210` and `919876543210` (WhatsApp link) → your numbers
- `https://www.edgesmartspace.com` → your domain (canonical, OG tags, schema, sitemap, robots)
- Prices: each price has `data-inr` / `data-usd` attributes plus the visible text — update all three.
  The JSON-LD `<script type="application/ld+json">` in the `<head>` also lists INR prices and the address.

## Logo files (assets/img/logo/)
| File | Used for |
|---|---|
| `logo-horizontal.svg` | Header (icon + wordmark side by side) |
| `logo-stacked.svg` | Footer (original stacked layout) |
| `logo-icon.svg` | Browser tab icon |
| `logo-horizontal-light-bg.svg`, `logo-stacked-light-bg.svg` | Letterheads, invoices, light backgrounds |
| `logo-stacked@2x.png`, `logo-icon@2x.png` | Social media, WhatsApp profile, Google Business |

App/tab icons live in `assets/img/` (`favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`), and the share image is `assets/img/og-cover.jpg`.
To swap the logo later, replace these files keeping the same names — no code changes needed.
Colours: icon gradient #00F2FE → #4FACFE, wordmark #F5F7FA (dark-bg versions); #0096C7 → #2563EB and #0A0A0A (light-bg versions).
