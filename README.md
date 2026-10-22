# IsaPlus E-Commerce — Website

Static, multi-page website. No build step — upload the whole folder to any host
(GitHub Pages, Netlify, Hostinger, cPanel, GHL custom code, etc.).

## Structure

```
index.html        Home
services.html     Services
packages.html     Packages & pricing (+ live estimator)
results.html      Results / case studies (gold "vault" page)
about.html        About
faq.html          FAQ (search + categories)
audit.html        CTA page — "Get your first free audit" (3-step form)

css/global.css    Shared design system: loader, cursor, nav, footer, buttons, cards
css/<page>.css    One stylesheet per page

js/global.js      Shared: 3D loader, page transitions, luxury cursor, nav,
                  scroll reveals, 3D tilt, magnetic buttons, mini 3D scenes
js/<page>.js      One script per page (home = Three.js globe hero)

images/           Logo emblem (transparent), favicon, full logo
images/results/   ← put your result screenshots here
```

## Adding your results (results.html)

1. Save images into `images/results/` with these names:
   - `featured-before.jpg`, `featured-after.jpg` (before/after slider)
   - `result-1.jpg` … `result-9.jpg` (gallery)
2. Open `js/results.js` and edit the titles, categories, numbers and text at the top.
   Add or remove gallery items by adding/removing lines in the `RESULTS` list.
3. Any missing image shows an elegant placeholder automatically.

Tip: open `results.html?admin` to see the expected file name on every frame and
drag-and-drop images onto frames for a quick preview (preview only, not saved).
Admin hints also show automatically when you open the file locally.

## Free audit form (audit.html)

Open `js/audit.js` and paste a webhook URL into `FORM_ENDPOINT`
(GoHighLevel inbound webhook, Make.com, Zapier, Formspree…). The form POSTs JSON:
`name, email, phone, brand, store, revenue, services, message, package, source, submitted_at`.

If `FORM_ENDPOINT` is left empty, the form opens the visitor's email app with the
request pre-filled to matthew@isaplus.shop and jonathan@isaplus.shop.

Links like `audit.html?package=growth` pre-select services on the form
(the Packages page buttons already use these).

## Notes

- The intro 3D loader plays once per browser session; after that, pages switch
  with a quick branded curtain transition.
- The custom cursor only appears on mouse/trackpad devices; touch devices use
  normal behaviour. All motion respects "reduce motion" accessibility settings.
- Three.js (r128) loads from cdnjs; fonts (Manrope + Instrument Serif) from Google Fonts.
