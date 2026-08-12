# alu-dewolf.be — Aluminium De Wolf

Website for Aluminium De Wolf (ADW), a family-run installer in Belgium working in
solar panels, home batteries, EV charging and automated roller shutters.

Live at **https://alu-dewolf.be**. Review build: **https://adw-11aug.vercel.app**

Built by **Kathleen Deviaene** (Noemsø Designs) in 2026, replacing the owner's
original Microsoft FrontPage site from 2006.

## What it is

A static site — plain HTML, one CSS file, a little inline JavaScript. No build step,
no framework, no database. That is deliberate: it loads fast, it cannot break in an
update, and it can be hosted anywhere, including the owner's existing one.com plan.

**48 pages, in three languages.** Dutch is the primary language; French and English
are full parity translations, not partial ones. Belgium's language situation makes
this necessary rather than optional — ADW sits near the linguistic border and serves
customers on both sides of it.

```
index.html, solar.html, why.html, projects.html   redirect / entry pages
nl/   Dutch      (primary)     16 pages
fr/   French                   16 pages
en/   English                  16 pages
assets/                        CSS, images, fonts
sitemap.xml, robots.txt        search engines
404.html                       not-found page
```

Each language folder carries the same set: home, solar panels, home batteries,
inverters, battery sizing, payback time, capacity tariff, energy management,
EV chargers, subsidies & VAT, projects, why us, FAQ, privacy.

## Running it locally

There is nothing to install. Serve the folder over HTTP — opening the files
directly with `file://` will break fonts and some scripts:

```bash
python3 -m http.server 8123
# then open http://localhost:8123
```

## Enquiry form

All 42 forms across the site post to **Formspree** (`f/mjgnykgk`), which emails the
submission on to ADW. The subject line identifies which page the enquiry came from,
so ADW can see whether someone was reading about batteries or roller shutters when
they got in touch.

The form asks for an **inspection**, not a quote. No price is promised anywhere on
the site before someone has looked at the roof — that is a deliberate commercial
choice by the owner, and the `.quote` CSS classes and surrounding copy should not be
reworded without asking him.

## Safety net

Every significant change is tagged before it happens, so any of them can be undone:

| Tag | Undoes |
|---|---|
| `pre-domain-swap` | The switch from the Vercel test address to alu-dewolf.be (650 URLs) |
| `pre-form-everywhere` | Rolling the enquiry form out to every page |
| `pre-home-reorder` | The homepage section reordering |
| `pre-energie-images`, `-v2` | Energy-page image changes |
| `pre-rolluiken-roma-removal` | Removal of Roma branding from the roller-shutter pages |

## Deployment

Pushing to `main` does **not** publish the site by itself. Deployment is a separate
step — see the ADW Go-Live Runbook for the GitHub-to-one.com upload path.

## Copy accuracy

Early drafts described the energy-management system as software ADW had written
itself. That was not accurate and was corrected in `b238667` and `90c2cf7` — the
authorship wording is gone from all three languages. The pages now describe the
system by what it does for the customer, which is the claim that can be stood
behind.
