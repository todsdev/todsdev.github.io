# Design

## Context

The repository is empty apart from OpenSpec scaffolding and `.nvmrc` (`24`). It is the `todsdev` GitHub Pages **user** site, so it is served at the domain root (`https://todsdev.github.io/`) with no `/<repo>/` base path, and GitHub Pages can only serve static files. The motivation is in proposal.md. The required behavior is in the seven delta specs under `specs/`; this document covers only how to meet them.

## Goals / Non-Goals

**Goals:**
- Give each later section change (hero, about, experience…) one obvious place to plug in: a section component, its dictionary keys and its collection, without touching the shell.
- Have CI run exactly the local commands, so a green run locally means a green run in CI.
- Ship no client JavaScript framework. Interactivity comes from small vanilla TypeScript modules, and the page must stay readable without JS.

**Non-Goals:**
- Rendering collection data inside sections (sections are empty placeholders).
- Automated browser and e2e tests. Interactive behavior is verified manually against `npm run preview`, per task.
- Preview deployments for pull requests.

## Decisions

### Framework, language, tooling (unchanged)
- **Astro + strict TypeScript.** Static HTML by default, zero JS unless opted in, with built-in i18n routing and Content Collections. `tsconfig.json` extends `astro/tsconfigs/strict`. `output: 'static'` with no adapter, so no endpoints can exist.
  - *Alternatives:* Vite + React (an SPA, which hurts SEO), Next.js export (heavy), plain HTML (no type checking or collections).
- **Type checking** uses `astro check` (`@astrojs/check`), which covers both `.astro` and `.ts`.
- **Lint and format:** ESLint flat config (`typescript-eslint` recommended plus `eslint-plugin-astro`, with no stylistic rules) and Prettier with `prettier-plugin-astro`.
  - *Alternative:* Biome, but its `.astro` support is partial.
- **npm scripts:** `dev`, `build`, `preview`, `check` (`astro check`), `lint` (`eslint .`), `format` (`prettier --write .`), `format:check` (`prettier --check .`). Use npm with a committed lockfile, so CI can run `npm ci`.

### Project layout
```
astro.config.mjs                site, i18n, static output
src/content.config.ts           collection schemas
src/content/<collection>/*.yaml placeholder data (profile/ holds one entry)
src/i18n/en.ts | pt-br.ts | es.ts   UI dictionaries
src/i18n/index.ts               locale list, t(), localized paths, lang codes
src/lib/content.ts              getEntries(), localize() + fallback warnings
src/layouts/BaseLayout.astro    <html lang>, meta, hreflang, fonts, global CSS
src/components/SiteNav.astro    nav links + LanguageSwitcher
src/components/LanguageSwitcher.astro + flags/*.svg
src/components/Section.astro    <section id> + terminal-prompt <h2> + reveal hook
src/components/ScrollThread.astro   line + <slot name="markers">
src/components/Portfolio.astro  ordered sections for a given locale
src/pages/index.astro | pt-br/index.astro | es/index.astro   thin wrappers → Portfolio
src/pages/404.astro             placeholder (English dictionary)
src/scripts/{nav,reveal,thread,locale}.ts   client behavior
src/styles/{tokens,global}.css
```

### Visual identity
- **Tokens.** `tokens.css` declares the seven colors on `:root`, plus spacing, the nav height and font-family tokens. `color-scheme: dark` is set and there is no light-scheme media query.
- **Contrast.** Measured against `--bg`/`--surface`/`--surface-2`: `--text` 13.3/12.5/11.3, `--text-muted` 5.6/5.2/4.8 and `--highlight` 19.3/18.1/16.5 all pass AA. `--text-dim` only reaches 2.9/2.7/2.5, which fails even the 3:1 bar for UI components, so it is limited to decoration (dividers, the unfilled thread track). This is captured in the visual-identity spec.
- **Fonts.** `@fontsource/vt323` (400) and `@fontsource/ibm-plex-mono` (400 and 700) are imported in the layout. Astro bundles the woff2 files into `dist/`, so they are self-hosted. The CSS includes latin and latin-ext ranges for the accents used in pt-BR and es, with `font-display: swap`. The fallback stack is `ui-monospace, Menlo, Consolas, monospace`.
  - *Alternative:* hand-copied woff2 files in `public/`. Fontsource gives versioned files and ready-made `@font-face` rules.
- **Terminal titles.** `Section.astro` renders `<h2><span aria-hidden="true">$ </span>{t('section.about.prompt')}</h2>`. Each dictionary holds the full command (`cd ~/about`, `ls ./experience`, `cat skills.txt`…), so translators control the wording.
- **Focus.** A global `:focus-visible` outline of 2px `--highlight` with an offset. A "skip to content" link is the first focusable element.

### Motion
- **Reveal.** An inline head script adds `js` to `<html>`. The CSS hides `.js [data-reveal]:not(.is-visible)` with `opacity: 0; transform: translateY(12px)`, so content stays visible without JS. `reveal.ts` uses one IntersectionObserver (threshold about 0.15) that adds `is-visible` once and then unobserves.
- **Reduced motion.** Under `@media (prefers-reduced-motion: reduce)`, transitions and animations are none, `[data-reveal]` is always visible, `scroll-behavior: auto`, the cursor does not blink and the thread is drawn at full length. The scripts also check `matchMedia` and skip their observers and listeners.

### Navigation
- **Section ids** are fixed English slugs shared by all locales, so hashes survive language switches.
- **Nav.** A `position: fixed` header. Sections get `scroll-margin-top: var(--nav-height)`. On narrow screens the link list scrolls horizontally (`overflow-x: auto`) while the language switcher sits outside that list and stays pinned on the right. There is no hamburger menu, which keeps every link one tap away and avoids a menu with focus trapping.
- **Active link.** `nav.ts` uses an IntersectionObserver with `rootMargin` set so the active band sits just under the nav. The topmost intersecting section wins, and at `scrollY === 0` the hero is forced active. The active link gets `aria-current="location"` and an `is-active` class. CSS draws `> ` with `::before` and the block cursor with `::after` (`--highlight`, `steps(1)` blink animation). Both are generated content, so screen readers rely on `aria-current`.
- **Smooth scroll.** `html { scroll-behavior: smooth }` inside a `prefers-reduced-motion: no-preference` query. Native anchor navigation updates the hash, and the browser handles deep links on load.

### Scroll thread
- `ScrollThread.astro` sits inside `<main>` (`position: relative`), absolutely positioned at the left gutter from the first section's top to the last section's bottom. It has a 1px `--text-dim` track and a `--text-muted` fill using `transform: scaleY(var(--progress))` with `transform-origin: top`. That is GPU-friendly and needs no layout work on scroll. It is marked `aria-hidden="true"` and `pointer-events: none`.
- `thread.ts` calculates `progress = scrollY / (scrollHeight − innerHeight)`, clamped to 0..1. It recalculates in a `requestAnimationFrame`-throttled, passive scroll listener (and on resize) and writes `--progress`. The default CSS value is `1`, so the thread is fully drawn with no JS or under reduced motion.
- **Marker hook.** `<slot name="markers" />` sits inside the thread container. A marker is any element with `data-thread-marker` and an inline `top` (px or % of the thread). On each update, `thread.ts` toggles `data-reached` on markers whose offset is ≤ the drawn length. The future experience-timeline change only adds marker elements and styles; it never touches the thread script.
- On narrow screens the left gutter shrinks to about 12px and content padding reserves it, so the thread never overlaps text.

### i18n
- **Routing.** `astro.config.mjs` sets `i18n: { defaultLocale: 'en', locales: ['en', { path: 'pt-br', codes: ['pt-BR'] }, 'es'], routing: { prefixDefaultLocale: false } }`. The pages are three thin files rather than a dynamic `[locale]` route, so English stays at `/` with no `/en/`.
- **Dictionaries.** `en.ts` exports `const en = {...} as const`, and `pt-br.ts`/`es.ts` are typed `satisfies Dictionary` where `Dictionary` mirrors `en`'s shape with string values. A missing or extra key fails `astro check`. `t(locale, key)` uses typed dot-path keys. Components take `locale` as a prop and never contain literal UI text. Language names (for aria-labels) live in every dictionary, each written in its own language.
- **Metadata.** `BaseLayout` maps locales to `lang` codes (`en`, `pt-BR`, `es`) and emits `<link rel="alternate" hreflang>` for all three plus `x-default` (→ `/`), using absolute URLs built from `Astro.site`.
- **Switcher.** Three `<a>` elements with `href` set to the locale root, `hreflang`, `lang` and an `aria-label` with the language name. The active one gets `aria-current="true"`. Each contains an inline pixel-art SVG (a small grid with `shape-rendering="crispEdges"`) and the visible code. CSS applies `filter: grayscale(1)` to inactive flags and removes it on `:hover`/`:focus-visible` and on `[aria-current]`. The flag artwork is the only exception to the token-only color rule.
- **Hash-preserving switch.** On click, `locale.ts` stores the choice and appends `location.hash` to the target. Without JS the plain `href` still reaches the locale root.
- **Persistence.** Uses `localStorage['preferred-locale']`. A tiny `is:inline` script, emitted only on the unprefixed `/` page, sits in `<head>` right after the charset/viewport meta and before any stylesheet or external script. It is synchronous, so it runs before first paint and the English page never flashes. It is wrapped in `try/catch` in case storage is blocked. If the stored value is `pt-br` or `es`, it calls `location.replace('/<locale>/' + location.hash)`. It never reads `navigator.language`, and `/pt-br/` and `/es/` never redirect.
  - *Interpretation note:* the requirement says the choice must be "persisted" without defining when it is applied. Applying it only on `/` honours it for returning visitors while keeping explicit locale links stable. Revisit this before apply if a different meaning was intended.
- **404.** GitHub Pages serves a single root `404.html`, so the placeholder 404 uses the English dictionary with `lang="en"`.

### Content model
- **Loaders.** `src/content.config.ts` defines eight collections using the `glob({ pattern: '**/*.yaml', base: './src/content/<name>' })` loader (one file per entry; `profile/` holds a single `profile.yaml`).
- **Shared schema pieces:**
  - `localized(z.string())` → `z.object({ en: S, 'pt-br': S.optional(), es: S.optional() }).strict()`
  - `common` → `{ order: z.number().int().optional(), featured: z.boolean().optional(), hidden: z.boolean().optional() }`
  - URLs use `z.string().url()`. Dates use `z.coerce.date()`.
- **Fields per collection.** Each collection extends `common`. Fields marked as localized (L) use `localized(...)`:
  - profile: name, role (L), location, summary (L)
  - contacts: kind (`email | github | linkedin | other`), label (L), url
  - experience: company, role (L), location, start, end (optional; means current), description (L), tech[]
  - projects: title, description (L), status (`live | building`), url (optional), repoUrl (optional), tech[]
  - skills: category (L), items[]. One entry per category, which gives the grouping.
  - courses: title, issuer, date, certificateUrl, featured (required here, overriding the optional common field)
  - education: institution, degree (L), start, end (optional)
  - languages: name (L), proficiency (L)
- **Validation.** Astro validates entries on `astro sync`/`build`/`check`. Zod failures abort with the file path and field path. Contact `url` accepts `mailto:` through `.url()`.
- **Fallback and warnings.** `localize(value, locale, ctx)` returns `value[locale] ?? value.en`. On fallback it records `{collection, id, field, locale}`. `getEntries(collection, locale)` filters out `hidden`, sorts by `order`, and localizes recursively. To surface warnings even though sections don't render data yet, `Portfolio.astro` calls `reportMissingTranslations(locale)` once per locale page. That walks every collection and logs deduplicated `console.warn("[content] missing es translation: experience/acme.role → using en")` lines. Warnings never throw.
  - *Alternative:* an Astro integration hook. Collections aren't readily available in integration hooks, so the page-level call is simpler.
- **Placeholders.** One entry per collection. The profile has all three locales filled. At least one experience entry is English-only, which shows the warning path in a normal build.

### CI/CD (unchanged)
`.github/workflows/deploy.yml`:
- Triggers: push to `main`, `pull_request` to `main`, `workflow_dispatch`.
- **build** job: `setup-node` with `node-version-file: .nvmrc` and npm cache → `npm ci` → `check`, `lint`, `format:check`, `build` → `upload-pages-artifact` (skipped on PRs).
- **deploy** job: `needs: build`, runs only for events other than PRs, environment `github-pages`, uses `actions/deploy-pages`.
- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Concurrency: group `pages` with `cancel-in-progress: false`.

### Delivery
Work happens on `feat/setup-base`. The draft PR is opened right after these artifacts are committed. During apply, each task gets its own Conventional Commit and a push, so PR checks run continuously. Nothing is pushed directly to `main`, and merging the PR performs the first deploy.

## Risks / Trade-offs

- [Pages source not set to "GitHub Actions"] → The first deploy job fails. Mitigation: the source was already set manually; a read-only task verifies it before merge.
- [Astro's i18n `codes` vs `path` handling for `pt-br`] → `Astro.currentLocale` may return the path rather than the code. Mitigation: `src/i18n/index.ts` owns the locale→`lang` mapping explicitly instead of relying on Astro's value.
- [Fixed nav covering anchored headings] → Mitigation: `scroll-margin-top` from the shared `--nav-height` token.
- [Scroll listener cost] → Mitigation: rAF throttling, a passive listener and a transform-only update.
- [Redirect flash on `/` for returning pt-br/es visitors] → Mitigation: the redirect script is inline in `<head>` and runs before paint.
- [Fallback warnings becoming noise] → Mitigation: warnings are deduplicated, and only placeholder data is English-only.
- [No automated browser tests] → Interactive behavior (active link, hash switch, persistence, thread) could regress unnoticed. Mitigation: explicit manual verification steps in tasks. Add Playwright in a later change if needed.
- [Prettier touching generated or OpenSpec files] → Mitigation: `.prettierignore` covers `dist/`, `.astro/`, `openspec/`, `.claude/` and `package-lock.json`.

## Migration Plan

1. Implement on `feat/setup-base`, with one Conventional Commit and push per task to the draft PR. PR runs verify the build without deploying.
2. Confirm the Pages source is "GitHub Actions" (read-only check).
3. Mark the PR ready and merge it into `main`. The merge triggers the first deployment; then verify the live site.

Rollback: open a PR that reverts the merge and merge it. The workflow redeploys the previous state. Alternatively, disable Pages in Settings.
