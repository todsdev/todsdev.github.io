# Design

## Context

- **Placeholder section:** `Portfolio.astro` renders `<Section id="skills">` with no content.
- **Data already exists:** the skills collection has a translatable `category`, `items` and `order`. `getEntries()` returns visible entries sorted and localized.
- **Constraints:**
  - CLS 0 on every load.
  - AA contrast for readable text. `--text-dim` is decorative only (2.89:1).
  - Widths in em, since IBM Plex Mono advances 0.6em per glyph and `ch` doesn't match it.
  - Commands stay in English; labels are translated. The `# ` prefix is file syntax, the same in every locale.

## Goals / Non-Goals

**Goals:**
- A visual `cat -n` file whose DOM is still a plain heading-plus-list outline for assistive technology and copy-paste.
- Numbering that stays correct when content changes (add, hide or reorder categories) without touching the component.

**Non-Goals:**
- No syntax highlighting, no file box or panel, and no scroll thread markers.
- No hover states: the file isn't interactive.

## Decisions

1. **Markup: an outline, not lines of text.**

   ```html
   <div class="file">
     <div class="file__group">
       <h3 class="file__line"><span aria-hidden="true"># </span>Mobile</h3>
       <ul class="file__line file__items" role="list">
         <li>Kotlin<span aria-hidden="true"> · </span></li>
         …
         <li>Video playback & streaming</li>
       </ul>
     </div>
     …
   </div>
   ```

   - `role="list"` keeps list semantics, because Safari drops them when `list-style: none`.
   - The `# ` and ` · ` spans are real text with `aria-hidden`. Copy includes them; screen readers skip them.
   - **Alternative:** one `<pre>` with the file text. Rejected: it gives no headings or lists, and its line numbers would be selectable.

2. **Line numbers from a CSS counter, on pseudo-elements with empty alt text.**
   - **Numbering:** `.file` resets `counter-reset: line`. Each `.file__line` increments it and draws `::before { content: counter(line) / ""; }`. The number is absolutely positioned in the gutter and right-aligned.
   - **Blank lines:** each `.file__group:not(:last-child)::after` is a one-line block that increments the counter and shows the number the same way. The blank line takes exactly one line-height, and no extra element is needed.
   - **Why pseudo-elements:** generated content is never copied or selectable. The `/ ""` alt text removes it from the accessibility tree.
   - **Old browsers:** browsers without alt-text support for `content` drop the whole declaration and show no numbers. That fails safe: no numbers is better than numbers read aloud.
   - **Hidden entries:** they're never rendered, so the counter has no gaps.
   - **Alternative:** real `<span aria-hidden>` numbers with `user-select: none`. Rejected: copy behavior for `user-select: none` differs across browsers, and wrapped item lines would need JavaScript to place numbers.

3. **Soft wrap under the text column.**
   - **Layout:** `.file` has `padding-left: var(--gutter)`. The gutter is 2 digits + 2 spaces = 2.4em at ≥ 40rem, and 1 digit + gap at about 1.8em below that. Numbers are positioned at `left: calc(-1 * var(--gutter))` with `width` equal to the digit area, so wrapped lines naturally align with the text column.
   - **Wrapping:** list items are `display: inline`. Each separator is `" · "`: a no-break space before the dot keeps it with the previous item, so a line never starts with `·`.
   - **Width:** the item line is capped at `--measure`.
   - **Narrow screens:** the gutter is sized in em, so at 320px it stays at about 3 glyphs. With 11 lines the numbers never exceed 2 digits. The gutter width is based on 2 digits.

4. **Typography and color.**
   - **Font:** IBM Plex Mono at regular weight throughout. Bold would load a third font file.
   - **Colors:**
     - headers in `--text`, prefixed `# ` in `--text-muted` (5.59:1);
     - items in `--text`, separators in `--text-muted`;
     - line numbers in `--text-dim` (decorative, hidden from assistive technology).
   - **Line height:** 1.7 across all lines, so blank lines and wrapped lines share one rhythm. That keeps the gutter numbers vertically aligned with their first visual line.

5. **Copy output.** Headers and item lists are block-level, so a selection serializes one header or item line per line. The blank-line pseudo-elements contribute no text, so the output has at most an empty line between categories, depending on the browser's block serialization. The spec allows either.

## Risks / Trade-offs

- **[Pseudo-element alt text support]** → Chrome, Edge, Safari 17.4+ and Firefox 128+ support it. Older browsers show no numbers, which is purely cosmetic. The browser check uses Chrome's accessibility tree.
- **[Blank line is an `::after`, which can't carry its own `::before` number]** → The `::after` content is the number itself. It is an in-flow block, `margin-left: calc(-1 * var(--gutter))`, digit-area wide and right-aligned in the same color as the other numbers, one line-height tall. So the blank line can't collapse, and its number lines up with the gutter. Verified by the numbering check.
- **[Long single items wrapping mid-item at 320px]** ("Spec-Driven Development (SDD)") → Acceptable soft wrap. Continuation lines stay in the text column, and the 320px check covers it.

## Migration Plan

No data migration. Rollback is a revert of the merge commit.
