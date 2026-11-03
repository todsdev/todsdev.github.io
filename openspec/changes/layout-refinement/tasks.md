# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/layout-refinement`. Never push directly to `main`. After each task: mark it done here, make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass, commit only that task's changes plus this file with a Conventional Commit message, and push.

New browser checks go in `~/portfolio-verify-scripts` as `l-*.mjs` (`./run.sh <script>`, or `BASE=https://todsdev.github.io node <script>` for live).

## 1. Branch and PR

- [x] 1.1 Create `feat/layout-refinement` from up-to-date `main`, commit the change artifacts, push and open a draft PR; verify with `gh pr view --json isDraft,headRefName`

## 2. Hero name on one line

- [x] 2.1 Widen `--content-max` from 52rem to 60rem and add `--measure: 39em`. Cap `.about__summary` at `var(--measure)`. Verify that every section's left and right content edges match the hero's at 1280, 1440 and 1920px, that the about summary lines hold at most about 65 characters, that the about facts column and journey still lay out correctly, and that the `a43`, `a-space` and `t81` checks pass
- [x] 2.2 Make `.hero__text` a size container, pass `--name-chars` on the `h1`, and set the name size to `min(clamp(3rem, 2rem + 6vw, 5.5rem), max(2.5rem, calc(100cqi / (var(--name-chars) * 0.4))))`. Verify with `l-name.mjs`: one line at the full 88px size at 1280, 1440 and 1920px in all locales; one line at a smaller size at 768px; a single line or a clean wrap without overflow at 375 and 320px; photo width unchanged from the current build at each width
- [x] 2.3 Verify the typing animation still reserves the final layout: overlay and real text match within 1px and CLS is 0 during the full sequence at 1280px (one line) and at the narrowest width that wraps, if any. Rerun `h42`, `h43` and `h61`

## 3. Tilde

- [x] 3.1 Add the `"VT323 Tilde"` face (`unicode-range: U+007E`, IBM Plex Mono latin-400 file, tuned `size-adjust` and ascent/descent overrides) and put it first in `--font-title`. Verify with `l-tilde.mjs` on the hero prompt and on `$ cd ~/about` / `~/sobre` / `~/sobre-mi`: the `~` renders in IBM Plex Mono (CDP), its vertical center is within the lowercase band, the next glyph keeps its monospace position (±1px), copy-paste yields `~`, the woff2 request count is unchanged, and zoomed screenshots look right at both sizes

## 4. Scroll-thread track

- [x] 4.1 Change the track to `color-mix(in srgb, var(--text-dim) 45%, var(--bg))`. Verify with `l-track.mjs`: track contrast is between 1.3 and 2:1, the fill color is unchanged, the thread is fully drawn without JS and under reduced motion, and `t81` and `t82` still pass. Save a 1280px screenshot of the margin

## 5. Nav at 320px

- [x] 5.1 Add the narrow-width (< 360px) spacing and label size for the nav and the language switcher. Verify with `l-nav.mjs`: at 320px every active label in EN/PT/ES (Experience, Experiência, Habilidades, Experiencia, Proyectos, ...) fits fully inside the strip; tabbing reaches every link and language control and scrolls each into view; switcher codes stay visible; computed nav styles at 360px and 1280px are unchanged. Rerun `t63` and `kbd`

## 6. Font loading

- [x] 6.1 Identify which characters on each page trigger the latin-ext font files, and decide which woff2 files are needed above the fold; record the finding in the PR description
- [x] 6.2 Preload the above-the-fold woff2 files in `BaseLayout.astro` via `?url` imports (`as="font" type="font/woff2" crossorigin`). Verify the preload URLs equal the `@font-face` URLs in the built CSS and each font file is requested once
- [x] 6.3 Add the metric-matched `"VT323 Fallback"` and `"IBM Plex Mono Fallback"` faces and insert them into the token stacks. Verify that with web fonts blocked (request interception) the nav link widths and hero name width match the web-font layout within 1px, and with fonts artificially delayed by 1s no visible element moves on the swap (`l-swap.mjs`: sub-pixel layout boxes compared before and after the swap, with a mismatched-fallback control that must detect movement; request interception suppresses Layout Instability entries locally, so `l-cls.mjs` is the live acceptance check)
- [x] 6.4 Remove both fixed items from the known issues in `openspec/config.yaml` (keep the content conventions); verify the YAML parses and the CLI context no longer lists them

## 7. Integration

- [ ] 7.1 Run all verification suites (setup-base, hero, about, sentence case and the new `l-*` checks) plus a clean `npm ci && npm run check && npm run lint && npm run format:check && npm test && npm run build`; verify everything passes, then confirm the PR checks are green

## Workflow follow-up

- Archive the change, merge with a merge commit, confirm the deploy run starts and succeeds.
- Live: run `l-cls.mjs` against `https://todsdev.github.io` (10 loads × 3 locales × 2 widths, cache disabled) and expect CLS 0 on every load; spot-check name, tilde, track and nav live.
- Delete `feat/layout-refinement` locally and on origin.
