# A&K — Solar & Roller Shutters (Design Preview)

Single-page demo site for a family-run solar panel + automated roller-shutter installer.
Black / shiny-silver / gold industrial aesthetic. Self-contained: `index.html` + `assets/`.

## Preview
Open over http(s) (some browsers need it for fonts/JS):
    cd "solar-shutters-website" && python3 -m http.server 8123
    → http://localhost:8123

## ⚠️ All placeholder — swap before going live
- **Business name:** "A&K" (placeholder — rename throughout)
- **Phone / email / address / service area:** placeholder (+32 56 00 00 00, hello@alu-dewolf.be)
- **Stats & reviews:** "4.9/5, 1,200+ installs, 25+ years" and all testimonials are placeholders
- **Photos:** stock (Unsplash) in `assets/` — replace with real job photos, especially the gallery
- **Quote form:** demo only — wire to email/Formspree/backend before launch
- **Language:** English — can be rebuilt in NL / FR

## Structure
Hero → dual-service split → Solar Panels → Roller Shutters (solar-powered,
no wiring, app/voice control, weather-responsive) → Why Us (family) → Process → Projects
gallery → Testimonials → CTA → Contact/quote → Footer.

## Notes
- Roller-shutter content: solar-powered (no cabling, 7-yr warranty, app/voice control).
- Scroll-reveal via IntersectionObserver; mobile nav + smooth scroll in inline JS.
