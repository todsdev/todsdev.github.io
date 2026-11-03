# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/nav-indicator-stable`. Never push directly to `main`. After each task: mark it done here, make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass, commit only that task's changes plus this file with a Conventional Commit message, and push.

## 1. Branch and PR

- [x] 1.1 Create `feat/nav-indicator-stable` from up-to-date `main`, commit the change artifacts, push and open a draft PR; verify with `gh pr view --json isDraft,headRefName`

## 2. Stable indicator

- [x] 2.1 Render the `> ` prefix and the cursor on every nav link (hidden unless `.is-active`), with the blink only on the active cursor and link `padding-inline` set to 0 at all widths. Verify with the new `l-navstable.mjs`: scrolling top to bottom through every section in EN/PT/ES at 1280px and 320px changes the active link but moves or resizes no nav element (sub-pixel boxes, transforms neutralized), and nav boxes with JS disabled equal the boxes after `nav.ts` initializes
- [ ] 2.2 Verify nothing else regressed: `l-nav` (longest active label fits at 320px; keyboard reaches every link and language), `t63`, `t64` (exactly one active link, prefix, cursor, `aria-current`, steady cursor under reduced motion) and `kbd` pass; hidden prefixes and cursors don't appear in the accessibility tree; save 1280px and 320px nav screenshots

## 3. Correct the record

- [ ] 3.1 Append a correction note to `openspec/changes/archive/2026-11-03-layout-refinement/proposal.md` (the nav shift was the active indicator, not font loading; the font work stands on its own), comment the same on PR #8, and confirm no live doc or comment still attributes the nav shift to fonts (`grep`)

## 4. Integration

- [ ] 4.1 Run all verification suites plus a clean `npm ci && npm run check && npm run lint && npm run format:check && npm test && npm run build`; verify everything passes and the PR checks are green

## Workflow follow-up

- Archive the change, merge with a merge commit, confirm the deploy run starts and succeeds.
- Live acceptance: `l-cls.mjs` against `https://todsdev.github.io` (10 loads × 3 locales × 2 widths, cache disabled), with CLS 0 on every load; run `l-navstable.mjs` live too.
- Delete `feat/nav-indicator-stable` locally and on origin.
