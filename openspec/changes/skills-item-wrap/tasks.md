# Tasks

## Commit workflow (applies to every task)

All work happens on `fix/skills-item-wrap`. Never push directly to `main`. After each task:
- Mark it done here.
- Make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass.
- Commit only that task's changes plus this file, with a Conventional Commit message.
- Push.

## 1. Branch and PR

- [x] 1.1 Commit the change artifacts on `fix/skills-item-wrap`, push and open a draft PR. Verify with `gh pr view --json isDraft,headRefName`

## 2. Whole-item wrapping

- [x] 2.1 In `Skills.astro`, make each item an inline-block (`max-width: 100%`, `vertical-align: top`). Change the in-item separator to `" ·"`, and put a literal space between items, per design.md. Verify with a new `s-wrap.mjs` at 1280px, 375px and 320px in all locales:
  - no item spans more than one visual row unless its single-line width exceeds the text column (only "Spec-Driven Development (SDD)" at 320px with the current content);
  - "Video playback & streaming" is on one row at 1280px;
  - no row starts with `·`;
  - over-wide items' continuation rows start at the text column;
  - no horizontal overflow.
- [ ] 2.2 Verify that numbering, copy and accessibility are unchanged: `s-file.mjs` (numbers 1–11 aligned, text column, contrast) and `s-a11y.mjs` (AX tree, practices items, copy output) pass with no edits to them, and the copied text is byte-identical to before the change at 1280px

## 3. Integration

- [ ] 3.1 Verify no layout shift (`s-stable.mjs`, `l-cls.mjs` with 60 loads), then run all verification suites plus a clean `npm ci && npm run check && npm run lint && npm run format:check && npm test && npm run build`. Verify that everything passes and the PR checks are green

## Workflow follow-up

- Archive the change, merge with a merge commit, and confirm the deploy run starts and succeeds.
- Live checks against `https://todsdev.github.io`: `l-cls.mjs` (10 loads × 3 locales × 2 widths, CLS 0), `s-wrap`, the other `s-*` checks, `p-*` and `x-*`.
- Delete `fix/skills-item-wrap` locally and on origin.
