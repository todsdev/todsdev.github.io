# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/skills`. Never push directly to `main`. After each task:
- Mark it done here.
- Make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass.
- Commit only that task's changes plus this file, with a Conventional Commit message.
- Push.

New browser checks go in `~/portfolio-verify-scripts` as `s-*.mjs`.

## 1. Branch and PR

- [x] 1.1 Commit the change artifacts on `feat/skills`, push and open a draft PR. Verify with `gh pr view --json isDraft,headRefName`

## 2. Skills file

- [x] 2.1 Create `src/components/Skills.astro` and render it in `<Section id="skills">`. Use the outline markup from design.md: per category, an `h3` with an `aria-hidden` `# ` prefix, then a `ul role="list"` with an `aria-hidden` `" · "` separator after each item except the last.
  - Verify in each built locale: header order and translations exactly as in the "Order and translations" scenario, and the Architecture item line text.
  - Verify in each locale that "Spec-Driven Development (SDD)" and "OpenSpec" are items in the list under the Practices & tools header, and under no other category. This check is also kept in `s-a11y.mjs` for the live run.
  - Verify there is no hardcoded category or item text in the component (grep).
  - Verify that hiding a category (temporarily) removes it.
- [x] 2.2 Style the file per design.md: em-based gutter, CSS-counter line numbers on `::before` with `/ ""` alt text, blank lines as numbered `::after` blocks, soft wrap under the text column, and colors. Verify with `s-file.mjs` at 1280px and 320px in all locales:
  - numbers 1–11 in order with one number per logical line, each vertically aligned with its line's first visual line;
  - wrapped continuation lines start at the text column's x;
  - no visual line starts with `·`;
  - gutter ≤ 3 glyph widths plus spacing at 320px;
  - no horizontal overflow;
  - readable text ≥ 4.5:1;
  - no bordered tokens.
- [x] 2.3 Verify accessibility and copy with `s-a11y.mjs` in all locales:
  - the accessibility tree has 4 headings named by category alone, each followed by a list whose items are named by the skill alone;
  - no node contains a line number, `#` or `·`;
  - selecting the block and reading the selection text gives the header and item lines from the "Copy in English" scenario (and the translated headers in other locales), no line starting with a digit, and at most one blank line between categories.

## 3. Integration

- [ ] 3.1 Verify no layout shift: CLS 0 and unchanged section boxes through load and a full scroll (`s-stable.mjs`), and `l-cls.mjs` (60 loads) locally. Also verify that the section's only animation is the shared entrance: no `animation` or `transition` on section descendants beyond it
- [ ] 3.2 Run all verification suites plus a clean `npm ci && npm run check && npm run lint && npm run format:check && npm test && npm run build`. Verify that everything passes and the PR checks are green

## Workflow follow-up

- Archive the change, merge with a merge commit, and confirm the deploy run starts and succeeds.
- Live checks against `https://todsdev.github.io`: `l-cls.mjs` (10 loads × 3 locales × 2 widths, CLS 0), plus the `s-*`, `p-*` and `x-*` checks.
- Delete `feat/skills` locally and on origin.
