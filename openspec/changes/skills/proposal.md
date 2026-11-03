# Proposal

## Why

The skills section is still an empty placeholder under `$ cat skills.txt`. The skills collection already holds four translated categories with their items. Showing them as the output of `cat -n` fits the terminal theme. It also keeps skills visually distinct from the bordered tech tags in experience and projects, so the page doesn't repeat the same component a third time.

## What Changes

- **Skills section** (title unchanged and translated as today: `$ cat skills.txt` / `$ cat habilidades.txt`): rendered as the contents of a text file.
  - **Line-number gutter:** a dim gutter numbers every line. It is decorative, hidden from assistive technology and never copied.
  - **Category headers:** each category is a comment-style header line in the page's language: `# Mobile` / `# Mobile` / `# Móvil`, `# Architecture` / `# Arquitetura` / `# Arquitectura`.
  - **Items:** a category's items follow on one line, separated by ` · `, and wrap naturally under the text column.
  - **Blank lines:** a blank numbered line separates categories.
  - **Order:** categories come in `order` (Mobile, Architecture, Backend, Practices & tools), and items in file order.
  - **Data-driven:** all content comes from the skills collection, with no hardcoded text.
  - **Plain text:** no bordered tokens.
- **Accessibility:**
  - Underneath the visual file, each category is an `h3` followed by a list of its items.
  - Screen readers don't get the line numbers, the `# ` prefix or the separators.
  - All readable text meets AA contrast.
  - At 320px the gutter stays narrow and wrapped items stay in the text column.
- **Copy-paste:** selecting and copying the block gives clean text with no line numbers. Each line comes out as written, e.g. `# Mobile` then `Kotlin · Jetpack Compose · …`.
- **Motion:** the same section entrance as the other sections, and nothing else animated.
- **Verification:** browser checks for:
  - category order and translations in every locale;
  - continuous line numbers that are hidden from the accessibility tree;
  - the copy-paste output;
  - wrapping at 320px;
  - no layout shift.

  A live CLS check runs after merge.

Assumptions (recorded here, no input needed):
- **Line numbering:** numbers count logical lines, as `cat -n` does. A category's item line has one number even when it wraps onto several visual lines; continuation lines have no number, like soft wrap in an editor. With the current content that's 11 numbered lines: 4 headers, 4 item lines and 3 blank lines.
- **Copied prefix:** the `# ` prefix and the ` · ` separators are part of the copied text, so the paste reads like the file. Only the line numbers are left out. Screen readers skip all three.
- **No line-number panel:** the file is plain terminal output on the page background, with no box around it, like the other sections.

## Capabilities

### New Capabilities
- `skills`: the skills section rendered as a numbered text file: order, translated category headers, item lines, line-number gutter, semantic structure for assistive technology, copy-paste output, layout at 320px and stability.

### Modified Capabilities
<!-- None: the skills collection already has `category` (translatable), `items` and `order`. -->

## Impact

- New `src/components/Skills.astro`, wired into `Portfolio.astro`.
- No schema, content or dictionary changes. The section title strings already exist.
- New browser checks `s-*.mjs` in `~/portfolio-verify-scripts`.
- No new dependencies.
