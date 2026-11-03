# Design

## Context

Measured on the current build:
- **Hero name:** 88px VT323 at 1280px needs 563px on one line, but its column is 472px. The content width is capped at 52rem (832px), the photo column is `min(16rem, 32vw)` (256px) and the gap is 40px. VT323 advances exactly 0.4em per glyph (563 / 88 / 16 = 0.400). At 375px the name needs 349px against a 339px column.
- **Tilde:** VT323's `~` is a small raised mark (screenshot of the hero prompt confirmed it). It appears in the hero prompt and in section titles (`cd ~/about`), all of which come from the dictionaries.
- **Track:** `--text-dim` (#5c5c5c) on `--bg` is 2.89:1, and the fill (`--text-muted`) is 5.59:1.
- **Nav at 320px:** the strip is 119px. Active labels with `> ` and the cursor need 128–136px (from the config known issue).
- **Fonts on `/`:** VT323 and IBM Plex Mono, latin and latin-ext 400, all requested lazily through Fontsource's `@font-face` with `font-display: swap`. No preloads. The fallback stack is `ui-monospace, Menlo, Consolas, monospace`, whose glyph advances (0.6em) differ from VT323's (0.4em), so a late VT323 swap can resize hero text and a late Plex swap can shift nav text.

Motivation is in proposal.md, and requirements are in the four delta specs.

## Goals / Non-Goals

**Goals:**
- Fix each item at its root (sizing, glyph source, token mix, breakpoint, font loading) without touching content or markup semantics.
- Keep every existing guarantee: zero hero layout shift, the overlay mirroring the real text, the no-JS and reduced-motion fallbacks, keyboard reachability.

**Non-Goals:**
- Changing the photo's size range or the grid gap.
- New fonts or weights, font subsetting, or self-hosting changes beyond preloading.

## Decisions

### 1. Hero name: wider content plus fallback fluid size
- **Content width:** `--content-max` goes from 52rem to **60rem**. At 1280px the hero text column is 960 − 64 (main padding) − 256 (photo) − 40 (gap) = 600px, and "Thiago Rodrigues" needs 563px at 5.5rem (88px), so it fits on one line with about 37px of headroom. 60rem is the smallest value in the 60–64rem range that fits (the minimum is about 57.7rem). The photo column and the grid gap (`--space-5`) are unchanged.
- **Reading measure:** a new `--measure: 39em` token, which is 65 × IBM Plex Mono's 0.6em advance. CSS `ch` is avoided because it measures 7.5px rather than the real 9px advance in this font, so `65ch` would only hold about 54 characters. `.about__summary` uses `max-width: var(--measure)` instead of `60ch`. Experience and project descriptions will use the same token when those sections render them.
- **Alignment:** every section is a child of `main`, which uses `--content-max`, so all sections widen together. Verified by comparing each section's left and right edges with the hero's at 1280, 1440 and 1920px.
- **Fallback fluid size:** only applies when the full-size name doesn't fit its column:
- **Container:** `.hero__text { container-type: inline-size; }`.
- **Font size:** `Hero.astro` passes the name length as a custom property: `style="--name-chars: {name.length}"` on the `h1`. Then:
  ```css
  .hero__name {
    font-size: min(
      clamp(3rem, 2rem + 6vw, 5.5rem),                                   /* current size */
      max(2.5rem, calc(100cqi / (var(--name-chars) * 0.4)))              /* fit-to-column fallback */
    );
  }
  ```
  `100cqi` is the column width. At 1280px and 1024px the column (600px) holds the full 88px name, so the current size applies unchanged. At 768px (column about 434px) the name shrinks to about 68px on one line. At 375px and 320px it fits on one line at about 53px and 44px, and it wraps only below the 2.5rem floor.
  - *Alternatives:* shrinking the name to fit 52rem (about 76px at 1280px) was rejected in review in favor of a wider content column. Widening only the hero would misalign it with the other sections.
- **Typing overlay:** the overlay lives inside the `h1` and inherits its font size, so it still mirrors the real text's lines in both the one-line and wrapped cases. The "No layout shift" and overlay-alignment checks are rerun at 1280, 768, 375 and 320px.

### 2. Tilde: `unicode-range` substitute face
- In `fonts.css`, a face named `"VT323 Tilde"` covers only the `~` character:
  ```css
  @font-face {
    font-family: "VT323 Tilde";
    src: url("…/ibm-plex-mono-latin-400-normal.woff2") format("woff2");
    unicode-range: U+007E;
    size-adjust: <tuned>;            /* Plex advance 0.6em → match VT323's 0.4em */
    ascent-override: <tuned>;
    descent-override: <tuned>;
    font-display: swap;
  }
  ```
  `--font-title` becomes `"VT323 Tilde", "VT323", …`. Because of the `unicode-range`, the browser uses the substitute face for `~` and VT323 for everything else. No markup changes are needed, and every VT323 use (hero prompt, section titles) gets the fix. The text is unchanged for copy-paste and screen readers.
- **Tuning:** start at `size-adjust: 66.67%`, which gives exactly VT323's 0.4em advance, so monospace columns are kept. Then adjust `ascent-override` so the glyph's vertical center sits in the middle of VT323's lowercase height. This is tuned with measured glyph boxes and zoomed screenshots, and if a 0.4em advance makes the tilde too small, a compromise advance is acceptable as long as the glyphs after it still line up.
- **URL resolution:** the face's `src` uses the same Fontsource file that `ibm-plex-mono/latin-400.css` already uses. Vite emits one hashed asset for one source file, so no extra download happens.
  - *Alternative:* wrapping each `~` in a `<span>` with IBM Plex Mono. Rejected as the first choice: every dictionary string with `~` would need a render helper, and the `unicode-range` face achieves the same with no markup. It stays as the fallback if the face approach fails with the bundler.
- **Spec note:** `visual-identity`'s "Self-hosted typography" keeps VT323 for the title text. The `~` glyph substitute is the one deliberate exception, and it's defined by the new "Legible tilde" requirement.

### 3. Scroll-thread track
`.scroll-thread__track { background: color-mix(in srgb, var(--text-dim) 45%, var(--bg)); }` gives about #313131, roughly 1.48:1 against `--bg`, within the specified 1.3–2:1. The fill rule, the `--progress` default of 1, and the reduced-motion `transform: none` are untouched.

### 4. Nav below 360px
`@media (max-width: 22.49rem)` (just under 360px):
- `.site-nav`: `padding-inline` from `--space-3` to `--space-2`, and `gap` from `--space-3` to `--space-2`.
- `.site-nav__link`: `padding-inline` from `--space-2` to `--space-1`, and font size from 0.875rem to 0.8125rem.
- Language switcher: link `padding-inline` from 0.4rem to 0.25rem, and gap from `--space-1` to 2px. Flags and codes stay.

Expected budget at 320px: the strip grows from 119px to about 150px, and the longest active label shrinks from 136px to about 120px. Verified per label and locale. The existing `focusin`/active `revealInStrip` logic keeps any focused link fully in view.
- *Alternative:* showing only the active label in full and collapsing the others. Rejected for now: it changes navigation behavior more than this refinement needs.

### 5. Font loading: preload + metric-matched fallbacks
- **Preload:** in `BaseLayout.astro`:
  ```astro
  import plex400 from "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2?url";
  import vt323 from "@fontsource/vt323/files/vt323-latin-400-normal.woff2?url";
  ```
  and `<link rel="preload" as="font" type="font/woff2" crossorigin href={…}>` early in `<head>`, right after the charset and viewport metas and before the styles.
  - The `?url` imports resolve to the same hashed `/_astro/…woff2` as the `@font-face` `src`, which is verified in the built HTML so there are no double downloads.
  - `crossorigin` is required for font preloads to be reused.
- **latin-ext:** the latin-ext files currently also load on `/`. The implementation first identifies which character triggers them, using the page text against the latin `unicode-range`. If above-the-fold text needs them, they're preloaded too. Otherwise they're left lazy.
- **Metric-matched fallbacks:** `fonts.css` defines `"VT323 Fallback"` and `"IBM Plex Mono Fallback"` as `src: local("Menlo"), local("DejaVu Sans Mono"), local("Courier New")`, with `size-adjust` set so the advance matches (0.4em and 0.6em) plus `ascent-override` and `descent-override` set to the web fonts' metrics.
  - The token stacks become `"VT323 Tilde", "VT323", "VT323 Fallback", ui-monospace, …` and `"IBM Plex Mono", "IBM Plex Mono Fallback", ui-monospace, …`.
  - Even if a web font arrives late, the swap keeps line boxes and advances the same, so CLS stays 0.
- **Live verification:** `l-cls.mjs` loads `/`, `/pt-br/` and `/es/` at 1280px and 375px, 10 times each, with the cache disabled. It records `layout-shift` entries, and every load must report 0.

### Verification scripts (in `~/portfolio-verify-scripts`)
- `l-name.mjs`: the name is on one line at 1280, 1440 and 1920px in all locales, wraps without overflow at the narrowest widths, matches the overlay within 1px, and has CLS 0 during typing at 1280 and 320px.
- `l-tilde.mjs`: CDP platform fonts for a `~`-only text range report IBM Plex Mono, the glyph's vertical center sits within the lowercase band, the character after `~` keeps its monospace x position, copy-paste gives `~`, and zoomed screenshots are saved.
- `l-track.mjs`: track contrast is between 1.3 and 2, the fill is unchanged, and the no-JS and reduced-motion fallbacks still show it fully drawn.
- `l-nav.mjs`: at 320px every active label in each locale fits the strip, tabbing keeps every link and language control reachable and in view, and 360px+ spacing is unchanged.
- `l-cls.mjs`: repeated CLS runs, local and live.

## Risks / Trade-offs

- [`cqi` units or `color-mix` unsupported in old browsers] → Both are supported in all current engines (2023+). Older browsers fall back to the `clamp` floor and the plain `--text-dim` track.
- [Tilde substitute looks off at small sizes (section titles about 28px)] → Tuning is checked at both hero-prompt and section-title sizes, with zoomed screenshots.
- [Metric overrides on local fallback fonts vary by OS] → They only matter before the web fonts load. Preloading makes late swaps rare, and the overrides keep dimensions close where they do happen. The live repeated-CLS check is the acceptance gate.
- [Wider content column makes long prose lines harder to read] → Prose is capped at `--measure` (about 65 characters), and the journey and facts lines are short.
- [Name length changes in content] → The fallback sizing uses the name's character count, so a longer name still fits one line where possible, and wraps otherwise.

## Migration Plan

Same delivery as before: a `feat/layout-refinement` branch with a draft PR, one Conventional Commit per task, and CI. Merge with a merge commit, confirm the deploy run, run the live CLS checks, archive, and delete the branch. Rollback: merge a revert PR.
