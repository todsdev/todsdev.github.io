# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/setup-base`. Never push directly to `main`; the first deploy happens by merging the PR from `feat/setup-base`.

After completing each task during `/opsx:apply`:
1. Mark the task done (`- [x]`) in this file.
2. Stage only that task's changes plus this file, and commit them with a Conventional Commit message (e.g. `feat(nav): add active section indicator`, `chore(deps): add eslint and prettier`, `ci: add pages deploy workflow`).
3. Push to `feat/setup-base`.

Manual checks marked "in preview" mean `npm run build && npm run preview`, then inspecting `http://localhost:4321` in a browser (DevTools for markup, network and emulated media).

## 1. Project scaffold

- [x] 1.1 Create `package.json` (name `todsdev.github.io`, `private: true`, `type: module`, `engines.node: ">=24"`) and install `astro`, plus `@astrojs/check` and `typescript` as dev deps; verify `npm install` succeeds and `package-lock.json` is created
- [x] 1.2 Add `astro.config.mjs` with `site: 'https://todsdev.github.io'`, `output: 'static'`, no `base` and no adapter; verify `npx astro info` runs without config errors
- [x] 1.3 Add `tsconfig.json` extending `astro/tsconfigs/strict`; verify `npx astro check` reports 0 errors
- [x] 1.4 Add `.gitignore` covering `node_modules/`, `dist/`, `.astro/`, `.env*`, `.DS_Store`; verify `git status` shows no build or dependency output after a build
- [x] 1.5 Add `dev`, `build` and `preview` scripts and a temporary minimal `src/pages/index.astro`; verify `npm run build` exits 0 and produces `dist/index.html`

## 2. Quality tooling

- [x] 2.1 Install `eslint`, `typescript-eslint` and `eslint-plugin-astro`; add flat `eslint.config.js` (no stylistic rules; ignore `dist/` and `.astro/`) and a `lint` script; verify `npm run lint` exits 0, and exits non-zero after temporarily adding an unused variable
- [x] 2.2 Install `prettier` and `prettier-plugin-astro`; add `.prettierrc` (plugin only) and `.prettierignore` (`dist/`, `.astro/`, `openspec/`, `.claude/`, `package-lock.json`), plus `format` and `format:check` scripts; run `npm run format` and verify `npm run format:check` exits 0
- [x] 2.3 Add a `check` script (`astro check`); verify it exits 0, and exits non-zero after temporarily introducing a type error
- [x] 2.4 Write `README.md` with prerequisites (Node 24 via `.nvmrc`), `npm ci` and every npm script; verify each documented command runs as written

## 3. Visual identity foundation

- [x] 3.1 Add `src/styles/tokens.css` with the seven color tokens (exact values), `color-scheme: dark`, spacing, `--nav-height` and font-family tokens; verify in preview that DevTools shows all seven on `:root` with the specified values
- [x] 3.2 Install `@fontsource/vt323` and `@fontsource/ibm-plex-mono` (400 and 700) and define the title and body font stacks with monospace fallbacks; verify in preview that the network tab shows woff2 files only from `localhost`, and that text such as "ação, español" renders in IBM Plex Mono
- [x] 3.3 Add `src/styles/global.css` (reset, body in `--text` on `--bg`, links, a 2px `--highlight` `:focus-visible` outline, a skip-to-content link) and a reduced-motion block that disables transitions, animations and smooth scrolling; verify in preview that tabbing shows a visible focus ring and that with emulated `prefers-reduced-motion: reduce` no computed transition or animation remains
- [x] 3.4 Check that no text style uses `--text-dim` and that `--text-muted`/`--text`/`--highlight` meet AA on all three surfaces (expected ratios ≥ 4.77; see design.md); verify by grepping the CSS for `--text-dim` (only decorative selectors) and checking with DevTools' contrast checker

## 4. i18n core

- [x] 4.1 Configure Astro i18n in `astro.config.mjs` (`defaultLocale: 'en'`, locales `en`, `{ path: 'pt-br', codes: ['pt-BR'] }`, `es`, `prefixDefaultLocale: false`); verify `npm run build` still exits 0
- [x] 4.2 Create `src/i18n/en.ts` (nav labels, section prompt commands, skip link, language names, switcher labels, 404 strings), plus `pt-br.ts` and `es.ts` typed `satisfies Dictionary`; verify `npm run check` exits 0, and exits non-zero naming the key after temporarily deleting one key from `es.ts`
- [x] 4.3 Create `src/i18n/index.ts` with the locale list, locale→`lang` map (`en`, `pt-BR`, `es`), typed `t(locale, key)` and `localePath(locale, hash?)`; verify `npm run check` exits 0 and `localePath('pt-br', '#about')` is typed to return `/pt-br/#about`
- [x] 4.4 Create `src/layouts/BaseLayout.astro` (props `locale`, `title`, `description`): `<html lang>`, charset, viewport, title, meta description, favicon (`public/favicon.svg`), font and CSS imports, the inline `js`-class script, and `hreflang` alternates for `en`, `pt-BR`, `es` and `x-default` with absolute URLs; verify that built pages contain each element
- [x] 4.5 Add `src/pages/index.astro`, `src/pages/pt-br/index.astro` and `src/pages/es/index.astro` as thin wrappers using the layout (replacing the temporary page); verify `dist/index.html`, `dist/pt-br/index.html` and `dist/es/index.html` exist, with `lang` `en`, `pt-BR` and `es`, and that there is no `dist/en/`
- [x] 4.6 Document in `README.md` how to add or translate a UI string and how locales map to URLs; verify the documented file paths exist

## 5. Content model

- [x] 5.1 Create `src/content.config.ts` with the `localized()` and `common` schema helpers and the eight collections (fields per design.md; projects `status` enum `live | building`; courses with a required `featured`; URLs via `.url()`); verify `npx astro sync` exits 0
- [x] 5.2 Add placeholder YAML entries for every collection under `src/content/` (profile "Thiago Rodrigues", role "Android Developer" in all three locales; at least one English-only experience field); verify `npm run build` exits 0
- [x] 5.3 Implement `src/lib/content.ts` (`localize`, `getEntries` with hidden filtering and `order` sorting, deduplicated `reportMissingTranslations(locale)`); verify the build log shows a `[content] missing pt-br …` and `es` warning for the English-only field, and that the build still exits 0
- [x] 5.4 Verify the failure paths by temporarily setting a course `certificateUrl: not-a-url`, removing a contact `url`, removing a profile `role.en` and setting a project `status: paused`: each makes `npm run build` exit non-zero with a message naming the file and field. Revert afterwards (no commit for the reverts)
- [x] 5.5 Verify that `hidden: true` removes an entry from `getEntries` results and that `order` sorting holds (temporary log or check script); revert any temporary code
- [x] 5.6 Document the collections, translatable-field format, fallback warnings and common fields in `README.md`; verify that the documented example YAML validates when added as an entry

## 6. Layout shell and navigation

- [x] 6.1 Create `src/components/Section.astro` (props `id`, `locale`, prompt key): `<section id>` with `data-reveal`, an `<h2>` terminal prompt (`$ ` aria-hidden plus the dictionary command, VT323) and a default slot; verify the built markup for one section matches
- [x] 6.2 Create `src/components/Portfolio.astro` rendering `header` + `nav` + `main` with the seven sections in order (`hero`, `about`, `experience`, `projects`, `skills`, `courses`, `contact`), the hero holding the single `h1` with the profile name, and calling `reportMissingTranslations(locale)`; verify in each built page that the section ids and order match and there is exactly one `h1`
- [x] 6.3 Create `src/components/SiteNav.astro`: fixed header with translated section links, horizontally scrollable link list, a right-side slot for the switcher, and sections offset by `scroll-margin-top: var(--nav-height)`; verify in preview that the nav stays fixed while scrolling, and that at 320px wide all links are reachable and a section title isn't hidden after jumping to it
- [x] 6.4 Add `src/scripts/nav.ts`: IntersectionObserver active-section tracking (hero forced active at top) that sets `aria-current="location"` and `is-active` on exactly one link, with CSS for the `> ` prefix and the blinking `--highlight` block cursor (steady under reduced motion); verify in preview, by scrolling through every section, that exactly one link is active and the hero is active at top
- [x] 6.5 Enable smooth anchor scrolling under `prefers-reduced-motion: no-preference` only; verify in preview that clicking a link scrolls smoothly and sets the hash, that opening `/#skills` and `/es/#skills` lands on skills with its link active, and that jumps are instant with reduced motion emulated
- [x] 6.6 Add `src/scripts/reveal.ts` and the CSS for the fade + upward entrance (once per section, hidden only under `.js`); verify in preview that sections fade up when first scrolled into view, that all are visible with JS disabled, and that they are visible immediately with reduced motion emulated
- [x] 6.7 Verify keyboard-only use in preview: skip link first, then nav links, then switcher in order, with a visible focus everywhere and no traps

## 7. Language switcher

- [x] 7.1 Create pixel-art SVG flags for the USA, Brazil and Spain (`shape-rendering="crispEdges"`) and `src/components/LanguageSwitcher.astro` with three links (locale-root `href`, `hreflang`, `lang`, dictionary `aria-label`, visible `EN`/`PT`/`ES`, `aria-current="true"` on the active one), placed on the right of the nav; verify in preview that all three are visible at 320px and 1440px, and that the accessible names appear in DevTools' accessibility pane
- [x] 7.2 Add flag state CSS (grayscale when inactive, color when active, color on `:hover`/`:focus-visible`); verify in preview on `/pt-br/` that Brazil is in color and the others gray, and that hovering or focusing Spain previews its color
- [x] 7.3 Add `src/scripts/locale.ts`: on switcher click, store `localStorage['preferred-locale']` and navigate to the target with `location.hash` kept; verify in preview that `/#projects` → ES goes to `/es/#projects`, and that with JS disabled the link goes to `/es/`
- [x] 7.4 Add the redirect on the unprefixed `/` page only, as an `is:inline` script placed in `<head>` before any stylesheet or external script (stored `pt-br`/`es` → `location.replace` with the hash; never reads `navigator.language`); verify that in built `dist/index.html` the script is inline and comes before the first `<link rel="stylesheet">`, that a DevTools Performance recording of `/` with PT stored shows no paint before navigation (no English flash, including with 4x CPU throttling), and in preview that after choosing PT, opening `/#contact` goes to `/pt-br/#contact`, that `/es/` is not redirected, that choosing EN stops the redirect, and that with storage cleared and the browser language set to Spanish `/` stays English

## 8. Scroll thread

- [x] 8.1 Create `src/components/ScrollThread.astro` inside `main` (`--text-dim` track, `--text-muted` fill scaled by `--progress` defaulting to 1, `aria-hidden`, `pointer-events: none`, `<slot name="markers" />`, a narrow-screen gutter that doesn't overlap content); verify in preview with JS disabled that the thread is fully drawn from the first to the last section and doesn't overlap text at 320px
- [x] 8.2 Add `src/scripts/thread.ts` (rAF-throttled passive scroll and resize, a clamped progress value written to `--progress`, `data-reached` toggled on `[data-thread-marker]` elements, skipped under reduced motion); verify in preview that the line grows and shrinks with scrolling, is near zero at top and full at bottom, and stays fully drawn with reduced motion emulated
- [x] 8.3 Verify the marker hook by temporarily adding a `[data-thread-marker]` element through the slot at mid-page: it renders on the line and gains or loses `data-reached` as the line passes it. Remove it afterwards and document the marker contract in `README.md`

## 9. Placeholder 404

- [x] 9.1 Create `src/pages/404.astro` using `BaseLayout` with the English dictionary (`lang="en"`), a message and a link to `/`; verify that `dist/404.html` exists and contains `href="/"`, and that `npm run preview` serves it for an unknown path

## 10. Deployment workflow

- [x] 10.1 Create `.github/workflows/deploy.yml` per design (push/PR to `main` plus `workflow_dispatch`; build job with `setup-node` from `.nvmrc`, `npm ci`, check/lint/format:check/build, and `upload-pages-artifact` skipped on PRs; deploy job gated to non-PR events in the `github-pages` environment; permissions `contents: read`, `pages: write`, `id-token: write`; concurrency group `pages`, `cancel-in-progress: false`); verify with `actionlint` (or `npx --yes yaml-lint`) and confirm that the workflow run triggered by this task's push shows build passing and deploy skipped
- [x] 10.2 Verify (read-only, no settings changes) that the Pages source is already GitHub Actions: `gh api repos/todsdev/todsdev.github.io/pages --jq .build_type` returns `workflow`. If it doesn't, stop and ask the maintainer to fix it in Settings → Pages
- [x] 10.3 Document how deployment works (PR checks, deploy on merge to `main`, rollback through a revert PR) in `README.md`; verify that the description matches `deploy.yml`

## 11. Integration

- [x] 11.1 From a clean `npm ci`, run `npm run check && npm run lint && npm run format:check && npm run build`; verify that all exit 0 and that the build log contains only the expected translation-fallback warnings
- [ ] 11.2 In preview, walk through all three locales end to end (nav active state, hash-preserving switch, persistence, thread, reveal, reduced motion, keyboard) and verify that no console errors or failed network requests occur
- [ ] 11.3 Verify that the latest PR workflow run on `feat/setup-base` succeeds (`gh pr checks`), with build passing and deploy skipped

## Workflow follow-up

- Mark the draft PR ready for review and merge it into `main`. This merge triggers the first deployment.
- Verify that the deploy run on `main` succeeds (`gh run watch`), that `https://todsdev.github.io/`, `/pt-br/` and `/es/` serve correctly with styles, fonts and favicon (no asset 404s), and that an unknown path serves the placeholder 404.
- Archive the change with `/opsx:archive` once the deployed site is verified.
