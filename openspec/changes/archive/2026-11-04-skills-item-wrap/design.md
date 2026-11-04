# Design

## Context

- **Markup today:** each `li` is `display: inline` and holds the item text plus an `aria-hidden` separator `" · "`. The no-break space keeps the dot with the previous item, and the trailing space is the only break opportunity between items. The text inside an item can also break at its own spaces, which is the problem.
- **Measured on the live site:** the text column is 585px at 1280, 303px at 375 and 248px at 320. The widest item, "Spec-Driven Development (SDD)", is about 279px with its separator. So it can't fit on one line at 320 and fits at every other width.
- **Must not change:**
  - numbering, from CSS counters on the line elements;
  - copy output, currently `Kotlin · Jetpack Compose`;
  - the accessibility tree (items named by the skill alone);
  - the 1.7 line-height rhythm.

## Goals / Non-Goals

**Goals:**
- Items behave as unbreakable units unless they alone exceed the column.
- Byte-identical copy text and an unchanged accessibility tree.

**Non-Goals:**
- No hyphenation, no font-size changes and no content edits (such as shortening "Spec-Driven Development (SDD)").

## Decisions

1. **Each item is an inline-block capped at the column width.**
   - **CSS:** `li { display: inline-block; max-width: 100%; vertical-align: top; }`.
   - **Why it works:**
     - An inline-block is an atomic inline, so the line breaker treats it as one unit: it moves to the next line whole.
     - `max-width: 100%` lets an item wider than the column wrap inside its own box instead of overflowing. Its continuation starts at the box's left edge, which is the text column, because an over-wide item always begins a line.
     - `vertical-align: top` with the inherited font and line-height keeps every row exactly one line-height tall, so the gutter numbers stay on their rows.
   - **Alternative:** `white-space: nowrap` on items. Rejected: an item wider than the column would overflow at 320px instead of wrapping.

2. **The space between items moves outside the item box.**
   - **Why:** a trailing space at the end of an inline-block's content is stripped. So `" · "` inside the item would lose its gap ("Kotlin ·Jetpack").
   - **Separator:** inside the `li`, it becomes `" ·"`, still `aria-hidden` and still attached to its item, so it can never start a line.
   - **Space:** a literal space text node goes between `li` elements, as the inter-item gap and the break opportunity.
   - **Unchanged output:** copy still reads `Kotlin · Jetpack Compose`, the same characters in the same order. The space is plain whitespace between list items, so it adds no list items or names to the accessibility tree.

3. **Verification by measurement.** `s-wrap.mjs` runs at 1280, 375 and 320px in every locale. For each `li`, it compares the number of visual rows (from `getClientRects` on its text) with its single-line width (a `nowrap` clone in the same `ul`). It fails if an item spans more than one row while its single-line width fits the column. It also checks that no row starts with `·` and that nothing overflows. The existing `s-file`, `s-a11y` and `s-stable` checks must pass unchanged.

## Risks / Trade-offs

- **[Earlier wraps leave ragged right edges]** → Expected and acceptable for a file listing. Lines stay within `--measure`.
- **[Inline-block baseline vs. row height]** → `vertical-align: top` avoids extra line-box height from baseline alignment. `s-file`'s check that numbers align with their first row would catch any drift.

## Migration Plan

No data migration. Rollback is a revert of the merge commit.
