# Spotlight website

Static, animated site. No build step and no server needed. Upload every file in this folder to one host folder.

## Files
| File | Purpose |
|---|---|
| index.html | Home page: markup, SEO tags, social preview tags, structured data |
| style.css | All styling and animation |
| main.js | Animations, approval demo, chat assistant, enquiry form |
| robots.txt, sitemap.xml, llms.txt | Search engine and AI crawler files |
| logo-full.png | Full logo |
| lamp.webp / lamp.png | The real logo lamp as a transparent cutout (gold beam), used in the hero and scroll reel |
| logo-mark.png / .webp | Spotlight lamp on transparent background, for dark placements (the hero and reel now use lamp.webp, listed below) |
| logo-wordmark.png / .webp | Silver SPOTLIGHT wordmark, transparent background, for dark backgrounds only (the light site uses text in the footer) |
| favicon-32.png, favicon-180.png, favicon-512.png | Browser, Apple and app icons |
| privacy.html, terms.html | Legal pages (templates, see below) |
| 404.html | Custom "page not found" page |
| consent.js | Cookie banner and Google Analytics loader |
| og-image.jpg | 1200x630 social preview image (WhatsApp, LinkedIn, X) |
| site.webmanifest | Home-screen icon and colours |
| _headers | Security headers for Netlify and Cloudflare Pages |
| .htaccess | HTTPS redirect, headers, caching and 404 for Apache hosts |

## Before going live (required)
1. **Domain.** Replace `yourdomain.com` in index.html, privacy.html, terms.html, 404.html, robots.txt, sitemap.xml and llms.txt.
2. **Email.** Replace `hello@yourdomain.com` in index.html (contact section) and in the legal pages.
3. **Legal pages.** privacy.html and terms.html are templates. Fill every yellow `[placeholder]` (company name, address, jurisdiction) and have a lawyer review them. They are not legal advice.
4. **Contact form.** Without a form service the form opens the visitor's email app with the message prefilled. To receive messages directly, create a free form endpoint (Formspree, Web3Forms or similar) and paste its URL into `ENDPOINT` at the bottom of main.js. If you use a host other than formspree.io, add it to `connect-src` and `form-action` in `_headers` / `.htaccess`.
5. **Analytics.** Create a Google Analytics 4 property and paste its Measurement ID (G-XXXXXXXXXX) into `GA_ID` at the top of consent.js. Analytics only loads after a visitor accepts the cookie banner.
6. **HTTPS.** Netlify, Vercel, Cloudflare Pages and GitHub Pages force HTTPS automatically; enable it in their settings. On Apache hosts, `.htaccess` does it.

## Launch checklist status
- Privacy policy, terms: done (templates, fill in).
- Cookie consent banner: done; "Cookie settings" link in footer reopens it.
- Frontend secrets: none in the code. The chat assistant needs no API key. Never put API keys in main.js; use a backend for anything private.
- HTTPS and security headers: `_headers` and `.htaccess` (includes HSTS and a Content-Security-Policy).
- Meta titles and descriptions, social preview image, favicons, sitemap, robots.txt: done.
- Image alt text: done (decorative images have empty alt). Images compressed: WebP with PNG fallback.
- Page speed: hero image preloaded, scripts deferred, fonts use `display=swap`, below-the-fold image lazy-loaded. Test your live URL at pagespeed.web.dev.
- Colour contrast: all text pairs checked at 4.5:1 or better.
- Mobile: tested at 390px wide with no sideways scrolling.
- Custom 404: done. Broken links: all internal links checked.
- Form validation: required fields, email format, 20-character message minimum, consent tick, live error messages.
- Spam protection: hidden honeypot field, minimum fill time, 60-second resend limit. For stronger protection add Cloudflare Turnstile or hCaptcha (needs a free key from them).
- Single clear CTA: one primary action everywhere, "Book a strategy call".

## Colours
The site uses a light theme. Every colour is a variable at the top of style.css (`--bg`, `--ink`, `--gold`, `--rose`, `--violet`, `--teal`), so a palette change is a few lines. Text colours were checked at 4.5:1 or better against their backgrounds.

## Scroll reel
The hero is the first frame of this reel: headline on the left, the lamp on the right. Scrolling fades the copy out, the lamp glides to centre, then the pinned cinematic section runs (markup `#reel` in index.html, logic at the bottom of main.js) is driven by scroll position: giant SPOT / LIGHT words part, the lamp zooms, a light burst fills the screen, text reveals word by word with a counter, then a closing scene. Scroll length is the height of `.reel` in style.css (520vh). Visitors with "reduce motion" see a single still frame.

## Chat assistant
Rule-based and runs fully in the browser. Edit the `KB` list in main.js to change answers: each entry has keywords (`k`), a reply (`t`), an optional section link (`g`, `gl`) and follow-up buttons (`c`). For free-form AI answers, connect it to an AI API through a small backend that holds your API key.

## Notes
- Fonts (Cinzel, Fraunces, Manrope) load from Google Fonts, with system fallbacks. The privacy template mentions this. Self-host the fonts if you want zero third-party requests.
- Animations switch off for visitors who enable "reduce motion" in their system settings.

## Selected work (projects)
The `#work` section cycles through projects with a spotlight sweep and a glitch cut. The six entries are samples: edit the `P` array in main.js (name, service, big word, description, number and label). Replace the numbers with real, verifiable results before launch.

## Lamp effects
The lamp (lamp.webp) is layered with live effects in `.lfx` (style.css, section "realistic lamp"): volumetric beam, floor light pool, lens bloom, anamorphic streak, a glass shine sweep, and dust motes drawn on `#motes` (main.js). Reduced-motion visitors get the still lamp.

## Intro
On the first visit of each browser session the site opens with a short intro: a dark stage, the lamp switches on and its beam lights up SPOTLIGHT letter by letter, then the pool of light widens until it reveals the page while the header and hero animate in. Visitors can press Skip intro or Esc. It is skipped for reduced-motion visitors and does not replay in the same session. Markup is `#intro` in index.html, styles are in the "intro" block of style.css, logic is at the top of main.js, and the class that starts it is set in consent.js (to test again, open the site in a new private window).

## Colours
The palette is ivory backgrounds, deep indigo (#3b3a8f) and gold (#965a05 text, #f0aa32 fills). All colour tokens are at the top of the last block in style.css ("v4"). Service cards, roadmap bars and project slides take their hue from `--c`, alternating gold and indigo.

## Lamp artwork
`lamp.svg` is a hand-built, resolution-independent lamp (brushed-metal doors, hinges, vents, screws, chrome bezel, Fresnel lens). `lamp-4k.webp` is the same artwork rendered at 4080 px with a transparent background; the scroll reel uses it so the zoom stays sharp. The older cut-out `lamp.webp`/`lamp.png` are no longer used and can be deleted.
