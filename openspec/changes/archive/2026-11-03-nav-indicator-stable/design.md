# Design

## Context

`SiteNav.astro` draws the indicator only on `.site-nav__link.is-active`: `::before` holds `content: "> " / ""` and `::after` is a 0.6em × 1.1em inline-block cursor with a 0.2em margin and a blink animation. Activation therefore adds about 2 × 0.6em + 0.8em ≈ 28px at 14px. A live trace showed load shifts of exactly +28px x-movement on the links after the active one, at the moment `is-active` is applied.

## Decisions

- **Always render both pseudo-elements on every link,** with `visibility: hidden`. `.is-active` switches them to `visibility: visible`, and only the active cursor runs the blink animation. Hidden pseudo-elements still take up layout space, so widths never change. Visibility and color changes aren't layout shifts.
- **Link padding:** `padding-inline` from `--space-2` to 0 on all widths, including the < 360px rule. The reserved slots act as the horizontal spacing and focus rings still surround the whole link. `min-height` is kept for tap targets.
  - *Alternative:* positioning the indicator absolutely inside existing padding. Rejected: 8px of padding (4px at narrow widths) can't hold the ~17px prefix without overlapping neighbors.
- **Accessibility:** `content: "> " / ""` (empty alt text) is unchanged, and the cursor has no text. Inactive hidden pseudo-elements are also excluded from the accessibility tree because they're hidden.
- **Verification (`~/portfolio-verify-scripts`):**
  - `l-navstable.mjs`: samples every nav element's box at each scroll step from top to bottom, plus around anchor jumps, in 3 locales at 1280px and 320px, and asserts that no box changes while the active link does change.
  - A load comparison: JS-disabled boxes (no active link) against JS-enabled boxes after initialization.
  - `l-nav`, `t63`, `t64` and `kbd` are rerun. `l-cls.mjs` against the live site is the acceptance check.

## Risks / Trade-offs

- [Wider spacing between nav labels (about 32px instead of 20px)] → Accepted. It's still within the strip on desktop, and at 320px the strip scrolls as before, with the active label fitting.
- [The active label at 320px is unchanged in width] → The width equals today's active width (120px max), already verified to fit the 162px strip.

## Migration Plan

`feat/nav-indicator-stable` with a draft PR, one commit per task, merge with a merge commit, confirm the deploy, run the live CLS acceptance, archive and delete the branch.
