# Proposal: hide-courses

## Why

The owner wants the Courses section off the live site for now, without losing it. Today courses are wired into the section list, the nav, the terminal, the meta description and the published files, so hiding them means a code change in many places. This change adds one content flag that turns all of it off and, set back on, restores it with no other edit.

## What Changes

- **One flag, off by default:** `profile.yaml` gets `courses: { enabled: false }`, shaped like `availability.enabled` and validated by the same schema. The course YAMLs, `Courses.astro`, `src/lib/courses.ts`, the dictionaries' course strings and the certificate PDFs all stay in the repo.
- **Page, all three locales:** with the flag off there is no `#courses` section, no nav link, and no `href="#courses"` or `data-event="certificate"` anywhere in the built HTML. A deep link to `/#courses` behaves like any unknown hash: the page stays at the top and nothing errors.
- **Scroll thread:** the courses section has no thread markers today (only experience events do). The thread spans the rendered sections, so it shortens on its own. Nothing to remove, but the tests check that no marker or anchor points at courses.
- **Terminal:** `ls` and `ls -a` drop `courses/`. `cd courses` prints the same "no such file or directory" error as any unknown section. Tab no longer offers `courses` or `certs`. The `certs` command is removed from the command table: it isn't listed by `help`, isn't offered by Tab or "did you mean", prints "command not found: certs" and is reported to analytics as `unknown`. The easter eggs, `.secrets` and the hint trail have no course references (checked), so they don't change.
- **`terminal.json`:** for every locale, no `certs` array, no `courses` in `sections`, and no `help.certs` string ("courses and certificates").
- **Certificates:** the three PDFs move from `public/certificates/` to `src/content/courses/certificates/` and are published by an endpoint only while the flag is on. With it off, `/certificates/*.pdf` is not in `dist/` and returns 404. Their URLs stay the same when the flag is on.
- **Other mentions, removed only while the flag is off:**
  - **Meta description**, which is also `og:description` and `twitter:description`: "…experience, projects, skills and courses." becomes "…experience, projects and skills." in each locale, from a new dictionary key `meta.descriptionNoCourses`.
  - **Checked and unaffected:** the JSON-LD `Person` (name, job title, URL, email, `sameAs`), the share images (prompt, name, job title), the about text and facts, the 404 page, the sitemap and robots.
- **Tests:**
  - **Playwright:** S6 and the course parts of S1, S9 and S10 follow the flag, and S6 skips with the reason `courses are off (profile courses.enabled: false)`. New tests C1–C5 check that everything above is absent and skip when the flag is on. Each one is shown to fail against a deliberate breakage. Section lists come from the flag read from `profile.yaml`, never from the page.
  - **Private verify-scripts:** `c-layout`, `c-links` and `c-stable` print one `SKIP` line and exit 0 while the flag is off. Twelve suites hardcode courses in their expectations and become flag-aware instead of skipping (listed in `design.md`). A new suite `c-off` checks the absence on a local build and live.
- **Docs:** the README's introduction drops "and courses". The technical section documents the flag next to the availability badge and marks `certs` and the certificate hosting as flag-dependent. CLAUDE.md is unchanged.
- **Release (post-merge checklist, not an apply task):** GitHub release `v1.1.0` on the merge commit, with a short note.

### Assumptions to confirm in review

1. **Flag location and name:** `courses.enabled` in `profile.yaml`, next to `availability`, rather than a new settings file. It's a site toggle in a person's profile, but it is the existing pattern and needs no new collection.
2. **`certs` is removed, not hidden:** with the flag off it's an unknown command, so typing it gives "command not found" and no hint at courses.
3. **The skip condition reads the flag, not the page:** h34b, h34c and h52 detect the badge in the fetched HTML. The course suites reuse their `SKIP` line and exit code, but decide from `profile.yaml`. A regression that drops the section while the flag is on then fails instead of skipping.
4. **Live checks read the flag from the local repo** after `git pull`, which then matches the deployed `main`.
5. **Counts in the README** are updated at archive time: 20 archived changes, 21 specs, and 93 deeper suites (with `c-off`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-model`: the profile gains the `courses.enabled` flag.
- `courses`: the section, its certificate files and its mentions exist only while the flag is on.
- `navigation`: the section list and nav links leave out courses when the flag is off.
- `terminal`: `help`, Tab, `ls`, `cd`, `certs` and the analytics command names follow the flag. The scenarios that name `certs` or `courses/` are restated for both states.
- `search-and-sharing`: the meta description drops courses when the flag is off.
- `browser-tests`: course coverage follows the flag, and the absence tests are added.
- `repository-docs`: the visitor introduction doesn't mention courses while they're off, and the flag is documented.

## Impact

- **Code:** `src/content.config.ts`, `src/content/profile/profile.yaml`, `src/lib/sections.ts`, `src/lib/terminal.ts`, `src/lib/terminal-data.ts`, `src/scripts/terminal-shell.ts`, `src/components/Portfolio.astro`, `SiteNav.astro`, `src/layouts/BaseLayout.astro` (description), the three dictionaries, a new `src/pages/certificates/[name].pdf.ts`, and the PDFs moved out of `public/`.
- **Content comments:** the three Curso em Vídeo YAMLs name the hosted copy's new path.
- **Tests:** `src/lib/*.test.ts` cover both flag states. In `tests/e2e/`: `support/content.ts`, `sections.spec.ts`, `navigation.spec.ts`, `terminal.spec.ts` and a new `courses-off.spec.ts`.
- **External:** `~/portfolio-verify-scripts` (`lib.mjs`, 15 suites, the new `c-off`, `full.sh`), committed and pushed there.
- **Live site:** after deploy, the three certificate URLs return 404 while the flag is off. Anyone holding a direct link loses it until the flag is turned back on.
- **No dependency changes.**
