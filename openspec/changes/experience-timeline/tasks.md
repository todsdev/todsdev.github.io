# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/experience-timeline`. Never push directly to `main`. After each task: mark it done here, make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass, commit only that task's changes plus this file with a Conventional Commit message, and push. New browser checks go in `~/portfolio-verify-scripts` as `x-*.mjs`.

## 1. Branch and PR

- [x] 1.1 Create `feat/experience-timeline` from up-to-date `main`, commit the change artifacts, push and open a draft PR; verify with `gh pr view --json isDraft,headRefName`

## 2. Content model and wording

- [ ] 2.1 Add the optional `events` field to the experience schema (`year` int, localized `name`, non-empty `role`), and add the pt-br/es names from the approved table in proposal.md to the eight OBS events (exact strings). Verify `npm run build` passes with no fallback warnings, the OBS entry exposes 8 events with localized names, and an invalid event (non-integer year, missing `name.en`, empty role, each temporarily) fails the build naming the file and field (revert)
- [ ] 2.2 Add `time.months` and `time.present` to all dictionaries, move About from `about.present` to `time.present` (removing `about.present`), and add `src/lib/period.ts` with `period.test.ts`. Verify `npm test` covers closed/open periods, `datetime`, time-zone safety and all locales; `npm run check` fails if a locale lacks a month (temporarily); the about journey output is byte-identical (`a-space`, `a43`)
- [ ] 2.3 Document `events` in the README content table/section; verify the documented YAML validates

## 3. Timeline

- [ ] 3.1 Create `src/components/Experience.astro` (ordered entries newest first, `<time datetime>` periods, company `h3`, role · location, description, tags, nested events) and render it in `<Section id="experience">`. Verify in each built locale: order act digital → Horus → OBS; periods exactly as in the spec scenarios; Horus Spanish content and tags; no tag list for OBS; 8 events newest first with localized names and English roles; markup (`ol` of entries, nested events list, every marker/tick `aria-hidden`)
- [ ] 3.2 Style entries, tags and events per design.md. Verify in preview: description ≤ ~65 characters per line; tags wrap without overflow at 320px with ≥ 4.5:1 contrast; event names start at the same x after the year at 1280px and 320px with wrapped lines aligned; all text ≥ 4.5:1
- [ ] 3.3 Add primary markers and secondary ticks with their passed/upcoming styles. Verify with `x-markers.mjs`: each marker/tick centered on the thread line (±1px) and on its period/event line at 1280px and 320px in all locales; ticks smaller and dimmer than primaries; markers switch passed↔upcoming while scrolling down and up; all passed with reduced motion and without JS; markers never overlap content at 320px

## 4. Integration

- [ ] 4.1 Verify no layout shift: CLS 0 on load and while scrolling through the section (local `l-cls.mjs`, plus a scroll-based shift check), and `l-navstable` still passes
- [ ] 4.2 Run all verification suites plus a clean `npm ci && npm run check && npm run lint && npm run format:check && npm test && npm run build`; verify everything passes and the PR checks are green

## Workflow follow-up

- Archive the change, merge with a merge commit, confirm the deploy run starts and succeeds.
- Live: `l-cls.mjs` (10 loads × 3 locales × 2 widths, CLS 0) and the `x-*` checks against `https://todsdev.github.io`.
- Delete `feat/experience-timeline` locally and on origin.
