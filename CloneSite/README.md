# GrabOn Clone — Local Working Copy

This folder contains a **locally working HTML/CSS/JS clone** of the GrabOn coupons website homepage, extracted from network traffic for UI reference and study.

> **Note:** This is a static clone — it depends on the original GrabOn CDN for images (logos, banners, merchant icons) since those are referenced by absolute URLs. The CSS and JS are loaded locally.

## File Structure

```
CloneSite/
├── index.html              ← Open this in a browser
├── css/
│   └── pure-framework.css  ← Yahoo Pure CSS framework (GrabOn's base grid)
├── js/
│   └── go-h-v138.js        ← GrabOn's main JavaScript bundle (interactivity)
└── README.md               ← You are here
```

## How It Works

| Asset | Where it lives | Source |
|-------|---------------|--------|
| Base CSS framework | `css/pure-framework.css` | Originally `go-h-v15.css` from GrabOn CDN |
| Site-specific CSS | Inline `<style>` in `index.html` | GrabOn's responsive/layout/animation styles (~4,690 lines) |
| Page interactivity | `js/go-h-v138.js` | GrabOn's webpack bundle (search, modals, etc.) |
| Images (logos, banners) | CDN (`cdn.grabon.in`) | Still loaded remotely — not bundled locally |

## Removed Junk Files

These files were in the original extraction but were **browser extension artifacts**, not part of the GrabOn site:

- `CloneSite.css` — Was actually a duplicate of `main.html` (mislabeled, identical md5 hash)
- `CloneSite.html` — Redundant body-only copy of `main.html`
- `js`, `js.js`, `dom.js` — uBlock Origin and Wappalyzer browser extension scripts
- `main.html`, `main.css`, `go-h-v138.js` — Original unorganized files (moved to `css/` and `js/` folders)

## What Still Requires Internet

Since the HTML body contains absolute image URLs (`https://cdn.grabon.in/gograbon/images/...`), you need an internet connection for:
- Brand logos and merchant icons
- Banner images
- The GrabOn favicon

The CSS layout and JS interactivity work fully offline.
