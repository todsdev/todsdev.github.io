# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/content-sentence-case`. Never push directly to `main`. After each task: mark it done here, make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass, commit only that task's changes plus this file with a Conventional Commit message, and push.

## 1. Branch and PR

- [x] 1.1 Commit the change artifacts on `feat/content-sentence-case`, push and open a draft PR to `main`; verify with `gh pr view --json isDraft,headRefName`

## 2. Content and validation

- [x] 2.1 Capitalize the prose that starts lowercase in `profile.yaml` (journey steps 2 and 3 in all locales); verify a scan of all content YAML finds no prose field starting with a lowercase letter
- [x] 2.2 Add `src/lib/sentence-case.ts` (`startsWithCapital(text)`: skips leading digits/punctuation, accepts the allowlisted names) and `src/lib/sentence-case.test.ts` (fixtures: lowercase fails; capitalized, digit-led, `¿Qué`, `iOS`/`gRPC` pass); verify `npm test` passes and fails when the rule is temporarily broken (revert)
- [ ] 2.3 Use it in `src/content.config.ts` through a `sentence` schema helper for profile `summary`, journey `text`, experience and project `description`; verify `npm run build` passes, and that temporarily lowercasing a journey step's `pt-br` text and a project `description.es` each fail the build, naming the file, field and locale (revert)

## 3. Docs, rule and journey spacing

- [ ] 3.1 Add the sentence-case rule to the `context` in `openspec/config.yaml` and to the README content docs; verify the OpenSpec CLI still parses the context and that it contains the rule
- [ ] 3.2 Verify the journey has a real space between the year label and the text: in the built HTML, visually (a gap at 1280px and on its own line at 320px), and when copied (selecting each step yields `[years] Text` with a space or line break, never `]Text`) in all three locales

## 4. Integration

- [ ] 4.1 Run all verification suites plus a clean `npm ci && npm run check && npm run lint && npm run format:check && npm test && npm run build`; verify everything passes and the PR checks are green

## Workflow follow-up

- Archive the change (`/opsx:archive content-sentence-case`), merge the PR with a merge commit, confirm the deploy, verify live, and delete the branch.
