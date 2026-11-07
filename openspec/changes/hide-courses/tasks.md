# Tasks

Every commit is gated on `npm run lint`, `npm run check`, `npm run format:check` and `npm test`, judged by exit code with untruncated output. Commits that touch the site or the tests also run `npm run test:e2e`.

A new test's task is done only when its row in "Breakage evidence" records the observed failure. Breakages are temporary edits. They are never committed, and `git status` is checked before each commit.

## 1. Setup

- [x] 1.1 Create branch `feat/hide-courses`, commit the artifacts and open a draft PR; verify the PR is draft and `openspec validate hide-courses --strict` passes

## 2. Flag and section list

- [x] 2.1 Add `courses: { enabled: false }` to `profile.yaml` and the schema per design decision 1; verify the build fails naming the profile file and field when `courses` is removed or `enabled` is `"no"`, and passes as committed
- [x] 2.2 Add `renderedSections(courses)` to `src/lib/sections.ts` with unit tests for both values; verify `npm test` covers both and the order is unchanged otherwise

## 3. Page

- [x] 3.1 Render sections and nav links from `renderedSections` in `Portfolio.astro` and `SiteNav.astro` per decision 2; verify `grep` finds no `id="courses"`, `#courses` or `data-event="certificate"` in `dist/**/*.html`, and the nav has six links per locale
  Committed together with 3.1, 3.2 and 3.3: the site and its e2e expectations must change atomically.
- [x] 3.2 Add `meta.descriptionNoCourses` to the three dictionaries with the spec's texts and pick the key by the flag; verify the built `<meta name="description">`, `og:description` and `twitter:description` per locale match the spec
  Committed together with 3.1, 3.2 and 3.3: the site and its e2e expectations must change atomically.
- [x] 3.3 Adapt S1, S9, S10, N2, E1 and E2 to `sections()` and the flag, and skip S6 with the spec's reason, adding `coursesEnabled()` and `sections()` to `support/content.ts` per decision 6; verify `npm run test:e2e` passes and S6 reports skipped with that reason
  Committed together with 3.1, 3.2 and 3.3: the site and its e2e expectations must change atomically.
- [x] 3.4 Write C1 and C2 in `courses-off.spec.ts`; verify they pass in both projects and fail against their breakages

## 4. Terminal

- [x] 4.1 Add the `section` tag and `available(sections)` to `src/lib/terminal.ts` per decision 3, and pass `sections` to `formatHelp`, `suggest` and the known names, with unit tests for both flag states (help, Tab on `c` and `cd c`, `suggest("cert")`, `ls`); verify `npm test` passes and the updated existing tests still assert the flag-on output
- [x] 4.2 Make `terminal-data.ts` omit `certs` and `help.certs` when off, and the shell dispatch only available commands; verify each built `terminal.json` has no `certs`, `courses` or course title, and `certs` reports `unknown` to analytics
  Committed together with 4.2 and 4.3: the terminal's output and its e2e expectations must change atomically.
- [x] 4.3 Adapt T5 and T6 to `sections()`, then write C3 and C4; verify they pass and C3 and C4 fail against their breakages
  Committed together with 4.2 and 4.3: the terminal's output and its e2e expectations must change atomically.

## 5. Certificates

- [x] 5.1 `git mv` the three PDFs to `src/content/courses/certificates/`, add `src/pages/certificates/[name].pdf.ts` per decision 4, and update the three YAML comments; verify `dist/certificates` is absent with the flag off, and with it on temporarily the three built files have the same SHA-256 as the originals in `main`
- [ ] 5.2 Write C5; verify it passes and fails against both of its breakages

## 6. Docs

- [ ] 6.1 Update the README: drop "and courses" from the introduction, document `courses.enabled` next to the availability badge (what it hides, how to turn it back on, re-running task 7.1's check), mark `certs` and the certificate hosting as flag-dependent, and update the certificate hosting path; verify `npm run format:check` passes and the spec's documentation scenarios hold

## 7. Integration

- [ ] 7.1 Turn the flag on locally without committing, run `npm test`, `npm run test:e2e`, and `./run.sh` for `c-layout`, `c-links` and `c-stable`, then compare `dist/` with a `main` build from a `git worktree`, normalizing the build date and asset hashes; verify everything passes, C1–C5 report skipped, the only `dist/` differences are those two, and record the result in this file; revert the flag
- [ ] 7.2 In `~/portfolio-verify-scripts`, add `COURSES` and `SECTIONS` to `lib.mjs`, apply design decision 7 to the listed suites, add `c-off` and classify it in `full.sh`, then commit and push there with the evidence; verify the three `c-*` suites print one `SKIP` line, `c-off` fails against C1's breakage once, and `full.sh` accepts the classification
- [ ] 7.3 Run `./full.sh` in the background; verify it reports 0 failed, with `c-layout`, `c-links` and `c-stable` skipped and `c-off` passing

## Breakage evidence

Fill "Observed" with the failing assertion and the project where it failed.

| Test | Planned breakage | Observed |
| --- | --- | --- |
| C1 | Render `Courses` regardless of the flag | `#courses` count: expected 0, received 1 (`en`), in desktop and mobile |
| C2 | Add a stray `<div id="courses">` at the end of `<main>` | `window.scrollY` after `/#courses`: expected 0, received 2 (`en`), in desktop and mobile; C1 also failed on the extra `#courses` |
| C3 | Drop the `section` tag from `certs` | `en help` lists `certs`: expected the names not to contain it, in desktop (the first assertion; the later ones follow it) |
| C4 | Always include `certs` in `terminal.json` | `terminal.json keys` (`en`): expected no `certs` property, received the five courses, in desktop |
| C5 | `getStaticPaths` ignoring the flag; then the old description key | |
| c-off | Render `Courses` regardless of the flag | |

## Workflow follow-up

- Archive on the branch: sync the delta specs, run `openspec validate --all --strict`, update the README's counts (21 specs, 20 archived changes, 93 deeper suites, read at archive time), and move the change to `openspec/changes/archive/`.
- Merge, deploy and live run per CLAUDE.md, adding `c-off` and `curl -I` of the three certificate URLs (each expected 404).
- Post-merge: `gh release create v1.1.0 --target <merge sha> --title v1.1.0 --notes "Courses section hidden behind profile courses.enabled (off). Course content and components stay in the repo; set the flag to true to restore them."`
