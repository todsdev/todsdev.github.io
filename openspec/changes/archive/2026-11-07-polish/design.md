# Design: polish

## Context

See proposal.md for motivation and specs for requirements. What shapes the approach:

- **GitHub Pages serves one `404.html`** for every path, so the 404 page's language is known only in the browser. `/pt-br/nope` returns 404 live, and `/pt-br` redirects to `/pt-br/` (301), which confirms the trailing-slash canonical form.
- **`BaseLayout` already emits** `title`, `description` and `hreflang` on every page, including the 404 page, and renders the footer itself.
- **`track()` reads `document.documentElement.lang` once at load**, lowercased, so setting `lang` before the module runs gives `not_found` the detected locale with no analytics change.
- **`profile.role` is "Android Developer" in every locale** by design. Localized wording exists only inside `meta.title`.
- **Static endpoints are an established pattern** (`contact.vcf.ts`, `terminal.json.ts`).
- **Current résumés** have no Info, ID or XMP, and **no annotations at all**, so the rewrite recipe used for them would not meet this change's requirement.
- **New résumés** are 2-page Chromium/Skia PDFs with an Info dictionary, no XMP and the four links on page 1.

### Baseline measured during this proposal

These are one-off readings to size the work, not the required results. Lighthouse ran once on `/` against `astro preview`, which doesn't compress responses (GitHub Pages does).

| Form factor | Perf | A11y | Best Practices | SEO | LCP | CLS | TBT |
| ----------- | ---- | ---- | -------------- | --- | ----- | --- | ---- |
| Mobile | 100 | 100 | 100 | 100 | 1.5 s | 0 | 0 ms |
| Desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 | 0 ms |

So no palette, font or animation proposal looks necessary today. Task 6.1 confirms this on all pages.

`--text-dim` uses found in the code, with ratios calculated from the token values:

| Element | Use | Ratio (gray / green / amber on `--bg`) | Decorative? |
| ------- | --- | --- | --- |
| Skills `.file__line::before`, `.file__group::after` | Line numbers (**text**) | 2.89 / 2.42 / 2.43 | Yes: generated content with empty alt (`counter(line) / ""`), absent from the accessibility tree |
| Experience `.xp__marker:not([data-reached])` | Marker border, not reached | 2.89 / 2.42 / 2.43 | Yes: scroll-thread decoration |
| Experience `.xp__tick:not([data-reached])` | Tick, not reached | 2.89 / 2.42 / 2.43 | Yes: scroll-thread decoration |
| `.scroll-thread__track` | Track, 45% mix with `--bg` | ~1.5 (per its code comment) | Yes: `aria-hidden` |

**Not scored, but fixed here:** Lighthouse's `label-content-name-mismatch` flags the language switcher: visible "EN", "PT" and "ES" don't appear in the accessible names "English", "Português (Brasil)" and "Español" (WCAG 2.5.3). The audit has weight 0, so scores stay at 100. See decision 8.

## Goals / Non-Goals

**Goals:**

- Share one code path for all per-locale metadata, testable under `node --test`.
- Produce the same image on macOS and Ubuntu CI.

**Non-Goals:**

- Removing the phone number from the résumés, or checking PDFs for it. It is a deliberate exception (see proposal).
- Porting checks to Playwright, or adding them to CI (`e2e-ci`).
- A build-time phone check. The check lives in the verification suite, as requested.

## Decisions

### 1. Full PDF rewrite in a scratch directory

The files are untrusted: they are copied to a fresh scratch directory and only parsed. Their content is used as it is. A scratch `pdf-lib` script loads with `updateMetadata: false`, removes and deletes the Info object, the catalog and page `/Metadata`, and `/ID`, then saves. `save()` writes every object once with a single cross-reference section, so nothing old stays behind as it would in an incremental update.

Annotations are read first. **If a file doesn't have exactly the four expected URIs, apply stops and reports**: a wrong count means wrong source content, which a script shouldn't paper over. Non-link generator annotations, if any, are removed under the project's PDF practice and listed in the commit.

Proof, for each file: exactly the four URIs; single `startxref` and `%%EOF`; no Info or XMP, and every original Info value absent from the bytes, with Flate streams expanded; pages pixel-identical to the originals; text extracted with `pdfjs-dist`.

*Alternative rejected:* `qpdf` isn't installed, and the repo's PDF practice already uses `pdf-lib`.

### 2. 404: all locales pre-rendered, CSS picks by `<html lang>`

`404.astro` renders the skip link, translated line, `cd` link and footer once per locale, each marked `data-nf-locale`. A blocking inline script in `<head>` resolves the locale, then sets `lang` and `document.title`. CSS keyed on `<html lang>` hides the rest:

```css
html:not([lang="pt-BR"]) [data-nf-locale="pt-br"],
html:not([lang="es"]) [data-nf-locale="es"],
html:is([lang="pt-BR"], [lang="es"]) [data-nf-locale="en"] { display: none; }
```

This meets "no visible swap" deterministically, since the decision comes before any stylesheet paints. With no JavaScript, the default CSS shows English with no extra code. Reusing `Footer.astro` per locale keeps "same footer" true by construction, and `display: none` removes the others from the accessibility tree.

*Alternatives rejected:* `<template>` swaps or a client-side dictionary run after the content is parsed, which are less deterministic and would rebuild the footer on the client.

`BaseLayout` gets a `footer` slot override and a `noindex` mode that omits canonical, `hreflang` and share tags.

### 3. Path display in a small inline script

An inline script directly after the `h1` path `<span>` sets `textContent`, so the path is in place before paint. The path is `decodeURIComponent(location.pathname)` when that succeeds (so `/ação` reads properly), otherwise raw, truncated by code point so an emoji is never cut in half. No `innerHTML` anywhere. The `h1` has `lang="en"`, and the static text is `/this-page`.

The locale and path logic is inline by necessity, since a bundled module could run after first paint. It follows the repo's inline-script pattern (`preferred-locale`), and `nf-*` covers it with a table of paths in a real browser.

### 4. `src/lib/seo.ts`: pure builders, one source for every tag

Pure functions return the page's tag data, the sitemap XML, `robots.txt` and the JSON-LD object, so they run under `node --test`. `BaseLayout` renders the tags, and static endpoints serve `sitemap.xml` and `robots.txt`.

*Alternative rejected:* `@astrojs/sitemap` writes `sitemap-index.xml` and `sitemap-0.xml`, not the requested `sitemap.xml`, and adds a dependency for three URLs.

**Job title:** a new `meta.jobTitle` dictionary key, with `meta.title` kept as it is and a unit test that it ends with `jobTitle`, so they can't drift.

**JSON-LD:** `JSON.stringify` of an object built from named fields only, with `sameAs` selected by contact kind. A phone can't reach it by accident. `<` is then escaped as `<`, because `JSON.stringify` alone doesn't stop a `</script>` in content.

### 5. Share images: glyphs to SVG paths with `opentype.js`, rasterized by `sharp`

`src/pages/og/[locale].png.ts` draws the text as SVG paths from the `@fontsource` WOFF files, and `sharp` rasterizes it. A spike in scratch produced a 1200×630 PNG of about 29 KB.

*Alternatives rejected:*

- **`sharp` text with `fontfile`:** it worked in the spike but printed `Fontconfig error`, so its output depends on the host's font setup.
- **SVG `<text>`:** this relies on system fonts too.
- **`satori` + `resvg`:** two heavier dependencies for three lines of text.
- **Headless Chrome:** adds a browser to a build step that needs none.

Layout follows the hero: prompt `~/portfolio $ ./hello` in IBM Plex Mono, which also avoids VT323's poor tilde (the reason for the site's "VT323 Tilde" font); name and `> <job title>` in VT323. Colors are the gray theme's `--bg`, `--text-muted`, `--highlight` and `--text`.

LinkedIn's published requirements: `og:title`, `og:image`, `og:description` and `og:url`; at least 1200×627, recommended ratio 1.91:1, at most 5 MB ([LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/46687), read 2026-11-07). 1200×630 is 1.905:1 and satisfies them. Post Inspector remains the owner's manual check.

### 6. Verification suites are portable

Each new suite is table-driven, keeps its expectations in plain data, uses `data-*` and standard selectors, and waits on conditions rather than timers, so porting to Playwright means swapping the driver only.

| Suite | Covers |
| ----- | ------ |
| `nf-locale` | Locale, title, link and footer for a table of paths; visible content only |
| `nf-escape` | Markup in the path, long paths, malformed encoding, 320px overflow |
| `nf-nojs` | English and generic path with JavaScript off; CLS of 0 with it on |
| `seo-meta` | Description, canonical, `hreflang`, OG, Twitter; 404 has none |
| `seo-image` | Image status, type, dimensions and size, using PNG headers |
| `seo-sitemap` | Sitemap and robots, parsed |
| `seo-jsonld` | Person fields, parsed |
| `seo-phone` | Phone digits read from the contacts YAML; every HTML file and every `terminal.json` in `dist/` locally; the three locale pages, a 404 and the `terminal.json` files live |
| `pdf-links` | URIs, Info, XMP, xref count, extractable text |
| `t71` (updated) | Switcher names start with the visible code on all three pages |

`pdf-lib` and `pdfjs-dist` become dependencies of the verification repo. `lh-table` and `readme-shot` are tools with no assertions, classified under `TOOLS`.

### 7. Lighthouse setup

`lh-table` runs Lighthouse from the verification repo against `astro preview` with the system Chrome, 3 runs per page per form factor (18 total), and writes `lighthouse.md` to the change folder. The real Umami script stays in place so its cost is measured. `data-domains` keeps `localhost` from reporting, so no visit is counted.

The contrast list is measured in the browser with reduced motion emulated, because a first scan read the hero's name and role as `color: transparent` (ratio 1.09) while Lighthouse's own contrast audit passed. The likely cause is the intro animation, and task 6.2 confirms it. It also has to read pseudo-element text, which a text-node walk misses (it missed the Skills line numbers).

### 8. Language switcher names

A new `switcher.names` dictionary key holds the full strings (`EN — English`, `PT — Português`, `ES — Español`), and the link's `aria-label` uses it. The `language.*` keys don't change, because the résumé's accessible destination and the terminal also use them, and "Português (Brasil)" is still right there. The visible code keeps `aria-hidden`, since `aria-label` already replaces the link's content in the name. The `lang` attribute stays on the link, so the name is pronounced in its own language.

`t71` asserts that each name starts with the visible code on all three pages, and `lh-table` reports the `label-content-name-mismatch` result, which Lighthouse doesn't score.

### 9. Decorative text may use `--text-dim`

The `visual-identity` delta allows it only for purely decorative text hidden from assistive technology. The Skills line numbers have no `aria-hidden` attribute, and can't have one, because they are `::before` and `::after` content. They use empty alternative text (`content: counter(line) / ""`), which has the same effect, so the delta names both forms. Chrome's full accessibility tree on the live site has no line-number nodes, and `s-a11y` already asserts this. The only code change would be turning the numbers into real `aria-hidden` elements, which is more markup with no benefit to anyone using a screen reader.

Task 6.2 checks every text entry below 4.5:1 against the accessibility tree, so a later use of the token on readable text is reported.

## Risks / Trade-offs

- [**A résumé loses a link or has a different set**] → Apply stops and asks instead of adding or dropping any.
- [**Three pre-rendered copies on the 404 page**] → A few KB more on a rare page, in exchange for no flash and no client dictionary. Suites check visible content so hidden copies can't mask a failure.
- [**`astro preview` differs from GitHub Pages**] → No compression and no `/pt-br` redirect locally. The preview does answer unknown paths with status 404, as measured. The live run covers the rest, and the local Performance score errs on the low side.
- [**`opentype.js` types**] → If it has no usable types, add a small ambient file like the repo's other `.d.ts` files, rather than `@types/*` that pull in `@types/node`.
- [**LinkedIn caches previews**] → The first inspection after deploy refreshes them, which is why Post Inspector is on the checklist.

## Migration Plan

No data migration. Rollback is a PR reverting the merge, per the README. Nothing depends on the release tag.
