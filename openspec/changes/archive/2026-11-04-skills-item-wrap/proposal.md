# Proposal

## Why

Skill items currently wrap anywhere, so a single technology name can be split across two lines. Examples: "Video playback &" / "streaming" at desktop width, "Code" / "review", and "Spec-Driven Development" / "(SDD)" on phones. A name split in two is harder to scan. In a file listing, each entry should move to the next line as a whole.

## What Changes

- **Whole items:** each skill item wraps as a unit. When an item doesn't fit at the end of a line, the whole item moves to the next line.
- **Internal breaks only when needed:** an item breaks internally only when the item alone is wider than the text column. With the current content, that's only "Spec-Driven Development (SDD)" at 320px: about 279px of text against a 248px column. At 375px and wider, every item fits on one line.
- **Separators:** the ` · ` separator still never starts a line. It stays attached to the item before it.
- **No other change:** the line numbering (one number per logical line, 1–11), the copy-paste output, the accessibility tree, colors and spacing all stay as they are.
- **Verification:** browser checks at 1280px, 375px and 320px in every locale. They confirm:
  - no item breaks mid-item unless its single-line width exceeds the text column;
  - no line starts with `·`;
  - nothing overflows;
  - the existing numbering, copy and accessibility checks still pass.

  A live CLS check runs after merge.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `skills`: the "Text-file presentation" requirement changes from "items wrap naturally" to "items wrap as whole units, breaking internally only when wider than the text column".

## Impact

- `src/components/Skills.astro`: item markup and styles only.
- New browser check `s-wrap.mjs` in `~/portfolio-verify-scripts`.
- No content, schema or dictionary changes, and no new dependencies.
