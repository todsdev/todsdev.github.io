# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/experience-location-i18n`. Never push directly to `main`. After each task: mark it done here, make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass, commit only that task's changes plus this file with a Conventional Commit message, and push.

## 1. Branch and PR

- [x] 1.1 Create `feat/experience-location-i18n` from up-to-date `main`, commit the change artifacts, push and open a draft PR; verify with `gh pr view --json isDraft,headRefName`

## 2. Translatable experience location

- [x] 2.1 Change experience `location` to `localizedText` and write the three locations in en/pt-br/es as specified; update the README content table. Verify `npm run build` passes with no fallback warnings; a plain-string location and a missing `location.en` (temporarily) each fail the build naming the file and `location` (revert)
- [ ] 2.2 Verify the timeline shows each location in the page's language in all three locales (built HTML and `x-style`/`x-markers`/`x-stable` still pass, since longer Portuguese/Spanish meta lines must not break alignment or cause shifts)

## 3. Integration

- [ ] 3.1 Run all verification suites plus a clean `npm ci && npm run check && npm run lint && npm run format:check && npm test && npm run build`; verify everything passes and the PR checks are green

## Workflow follow-up

- Archive the change, merge with a merge commit, confirm the deploy run starts and succeeds.
- Live: `l-cls.mjs` (10 loads × 3 locales × 2 widths, CLS 0) and the `x-*` checks against `https://todsdev.github.io`.
- Delete `feat/experience-location-i18n` locally and on origin.
