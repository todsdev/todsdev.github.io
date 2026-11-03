# Proposal

## Why

The live CLS check after layout-refinement still found small layout shifts (about 0.0004 on 6 of 60 loads), all in the nav. Tracing them showed the cause was not font loading, as the old known issue claimed:
- When `nav.ts` marks a link active, it adds the `> ` prefix and the blinking cursor as generated content. That widens the link by about 28px and pushes the following links along.
- On load this happens right after the first layout, which produces the intermittent shift.
- The same width change happens every time the active section changes while scrolling.

The indicator has to stop affecting layout.

## What Changes

- **Reserved indicator space:** every nav link always has room for the `> ` prefix and the cursor. On inactive links they're present but invisible (`visibility: hidden`), and on the active link they're visible, with the cursor blinking. Switching the active link changes only visibility and color, never size or position, whether on load, while scrolling or after an anchor jump.
- **Spacing:** horizontal link padding drops to 0, because the reserved slots now provide the spacing between labels (about 32px apart, up from 20px). The narrow-screen rules from layout-refinement keep the longest active label fitting at 320px, and keyboard reachability is unchanged.
- **Accessibility unchanged:** the prefix stays hidden from assistive technology (`content: "> " / ""`), and `aria-current="location"` remains the accessible signal. Reduced motion keeps the cursor steady.
- **Verification:** a new browser check scrolls through every section in all locales at 1280px and 320px and asserts that no nav element moves or resizes as the active link changes. It also compares the nav before and after `nav.ts` initializes. Acceptance is the live CLS check: 10 cache-disabled loads × 3 locales × 2 widths, CLS 0 on every load.
- **Correcting the record:** the misdiagnosis is noted where the stale "font-swap" wording blamed fonts for the nav shift, with a correction note on the archived layout-refinement proposal and on PR #8. The font work itself (subset fix, preloads, metric-matched fallbacks) stays, because it's correct on its own merits.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `navigation`: adds "Stable active indicator" (switching the active link never moves or resizes nav elements).

## Impact

- **Code:** `src/components/SiteNav.astro` (indicator CSS and link padding).
- **Docs:** a correction note appended to `openspec/changes/archive/2026-11-03-layout-refinement/proposal.md`, and a comment on PR #8.
- **Dependencies:** none.
- **Out of scope:** any other nav redesign, experience-timeline and later sections.
