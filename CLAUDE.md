# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project type

Static, single-page marketing site for Control BIA, served from GitHub Pages on the custom domain `www.controlbia.com` (see [CNAME](CNAME)). `.nojekyll` disables Jekyll processing. There is **no build step, no package manager, no test suite, and no linter** — files are served as-is.

## Local development

Open [index.html](index.html) directly in a browser for a quick look, but the i18n loader uses `fetch('translations/<lang>.json')`, which most browsers block under `file://`. To exercise language switching locally, serve the directory over HTTP, e.g.:

```powershell
python -m http.server 8000
# then visit http://localhost:8000/
```

Deployment is automatic: pushing to the GitHub Pages branch publishes the site.

## Architecture

The repo is intentionally tiny — three things to know:

### 1. `index.html` is monolithic and section-marked

A single ~1664-line file holds the entire page: inline `<style>` (lines ~7–1074), all section markup, and inline `<script>` (lines ~1387–1659). Sections are delimited by comments like `<!--/* SECTION 14: Services Section HTML */-->` — use these markers to navigate rather than scrolling. Inline JS handles: Three.js 3D hero visualization, navbar scroll state, smooth-scroll anchors, `IntersectionObserver` fade-ins, `[data-count]` counter animation, mobile menu toggle, and `[loading="lazy"]` iframe deferral. Three.js is pulled from a CDN (`r128`) — there is no local copy.

### 2. Translation system: English HTML is the source of truth

[js/translation-system.js](js/translation-system.js) drives i18n by reading every element with a `data-translate="some.dotted.key"` attribute. The flow:

- On load, `storeEnglishContent()` walks the DOM and records the current English text/placeholder under each key. **The English copy lives only in `index.html`** — there is no `en.json`.
- For non-English languages, `translations/<lang>.json` is fetched on demand and cached. Currently only [translations/es.json](translations/es.json) exists.
- The active language persists in `localStorage` under `controlbia-lang`, with a browser-language fallback (`es*` → `es`, else `en`).
- Language buttons in the nav (`.lang-btn[data-lang]`) trigger `changeLanguage()`.

**Implication for edits:** when you add or change translatable copy, update the English text in `index.html` AND mirror the same nested key path in `translations/es.json`. Keys are dotted (`services.accounting.title`); array items use numeric indices (`services.accounting.features.0`). For `<input>`/`<textarea>`, the key controls `placeholder`, not `textContent`.

### 3. Visual conventions

The dark-gradient + glass-morphism look is achieved with hand-tuned CSS variables and Three.js lighting constants. The 3D hero has labelled brightness knobs near the top of `init3DVisualization()` (`AMBIENT_BRIGHTNESS`, `MAIN_LIGHT_BRIGHTNESS`, `SIDE_LIGHT_BRIGHTNESS`, `GLOW_BRIGHTNESS`) — tweak these rather than scattering magic numbers.
