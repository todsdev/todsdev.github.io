# Tasks

Every commit is gated on `npm run lint`, `npm run check`, `npm run format:check` and `npm test`, judged by exit code with untruncated output. From group 2 on, commits that touch tests also run `npm run test:e2e`.

A test's task is done only when its row in "Breakage evidence" records the observed failure. Breakages are temporary edits or a doctored `dist` copy. They are never committed, and `git status` is checked before each commit. The real phone number never goes in a test, fixture, commit message or log.

## 1. Setup

- [x] 1.1 Create branch `feat/e2e-ci`, commit the artifacts and open a draft PR; verify the PR is draft and `openspec validate e2e-ci --strict` passes

## 2. Playwright scaffolding

- [x] 2.1 Add `@playwright/test` and direct `yaml`, `playwright.config.ts` per design decision 1, the ignore entries and the ambient types per decision 8, and the scripts `test:e2e`, `test:e2e:ui` and `test:e2e:smoke`; verify `npm ls @types/node` is empty, and `npm run check`, `lint` and `format:check` pass with a trivial spec
- [x] 2.2 Add `support/fixtures.ts` with the auto Umami block and the `events` fixture per decision 2, then tests A5 and A6; verify both pass in both projects, that A6 fails with the block removed, and that `grep -r` finds no stand-in code in `dist/`
- [x] 2.3 Add `support/content.ts` and `support/terminal.ts`; verify the loader can't return a contact's `value` or `url`, leaving `support/phone.ts` (task 9.3) as the only reader of `2-phone.yaml`, with a check in the next test group that uses it
- [x] 2.4 Document `test:e2e`, `test:e2e:ui`, the browser install and the port in the README's Scripts section and CLAUDE.md; verify the documented commands run as written on a clean `node_modules`

## 3. CI workflow

- [x] 3.1 Add `ci.yml` per decision 5; verify the workflow runs on the PR, every step reports, and the check is named `Gates and browser tests`
- [x] 3.2 Show that each gate blocks: push a temporary commit that fails lint, format or a unit test, and one that fails a browser test, then revert them; verify the check fails each time and the HTML report artifact appears only for the browser test failure
- [x] 3.3 Document in the README's Deployment section what runs on a PR; verify `npm run format:check` passes

## 4. Hero tests

- [x] 4.1 Write H1–H5 in `hero.spec.ts`, recording whether H1 uses the clock or the fallback from decision 3; verify they pass in both projects and fail against their breakages

## 5. i18n and navigation tests

- [x] 5.1 Write I1–I5 in `i18n.spec.ts`, using accessible names through role locators; verify they pass and fail against their breakages
- [x] 5.2 Write N1 and N2 in `navigation.spec.ts`; verify they pass and fail against their breakages

## 6. Section and résumé tests

- [x] 6.1 Write S1–S5 in `sections.spec.ts`, reading expectations from the dictionaries and content; verify they pass and fail against their breakages
- [x] 6.2 Write S6–S10; verify they pass, S7 asserts no digits of the phone, and all fail against their breakages
- [x] 6.3 Write R1 and R2 in `resume.spec.ts`; verify they pass and fail against their breakages

## 7. Terminal tests

- [x] 7.1 Write T1–T4 in `terminal.spec.ts`; verify T1 runs only in desktop, T2 only in mobile, and all fail against their breakages
- [x] 7.2 Write T5–T9, with expectations from dictionaries and content, never `terminal.json`; verify they pass and fail against their breakages
- [x] 7.3 Write T10–T13 with `__noop_check__` as the constant, and A3 and A4 in `analytics.spec.ts`; verify they pass, and `grep` shows the constant is the only throwaway terminal input in `tests/e2e`

## 8. 404 and analytics tests

- [x] 8.1 Write F1–F3 in `not-found.spec.ts`, serving `/404.html` as the navigation response for the cases `astro preview` rejects; verify they pass and fail against their breakages
- [x] 8.2 Write A1 and A2; verify they pass and fail against their breakages, and the captured request is the only evidence used, with no `window` recording

## 9. SEO and built output tests

- [x] 9.1 Write E1–E5 in `seo.spec.ts`; verify they pass and fail against their breakages
- [ ] 9.2 Write B1 and B2 in `build-output.spec.ts`; verify they run once per run and fail against their breakages
- [ ] 9.3 Write `support/phone.ts`, B3 and B4 per decision 4, reading the number from `2-phone.yaml` at test time, with a fictional number in B4; verify B3 passes on `dist/`, fails naming the file on a scratch doctored copy for the international, national and subscriber forms with separators, for JSON-LD, each `terminal.json`, `tel:` and `wa.me/`, and fails on an empty `DIST`
- [ ] 9.4 Search the output and HTML report of the failing runs from 9.3 for the real digits, printing only whether they match; verify there is no match, and that `tests/e2e` and the CI workflow hold no copy of the number

## 10. Deploy workflow and smoke

- [ ] 10.1 Change `deploy.yml` per decision 6; verify `gh workflow run deploy.yml --ref feat/e2e-ci` runs the build and skips deploy, and later pushes to the PR start no `deploy.yml` run
- [ ] 10.2 Write M1–M4 in `smoke.spec.ts`; verify `npm run test:e2e:smoke` passes against the live site with no beacon sent, that M4 fails with the block removed only against a local preview, and that the others fail against a doctored local preview through `SMOKE_URL`
- [ ] 10.3 Add the `smoke` job per decision 7; verify with `actionlint` or by reading the parsed workflow in `gh workflow view` that it needs `deploy`, and that the skipped run from 10.1 also skipped it
- [ ] 10.4 Update the README's Deployment section and CLAUDE.md for `ci.yml`, the deploy condition, the smoke job, the required check on `main` and the relation to verify-scripts, adding `test:e2e` to the verification notes; verify `npm run format:check` passes and the spec's documentation scenarios hold

## 11. Integration

- [ ] 11.1 Run `npx playwright test --repeat-each=3` locally and in one CI run with retries off; verify there are no failures, and fix the cause of any flake without relaxing a check unless the control in CLAUDE.md proves the check wrong
- [ ] 11.2 Read the durations from three PR runs with `gh run view` and record them in this file; verify each is under 5 minutes, and report to the owner if any exceeds it, proposing browser caching per decision 5
- [ ] 11.3 Confirm with a script that every name in `full.sh`'s `SUITES` appears in `design.md`'s tables and that every test in "Breakage evidence" has an observed failure; verify the script reports 92 of 92 suites and no empty rows
- [ ] 11.4 Run `./full.sh` in the background to confirm the private suites still pass with the repo's new files; verify it reports 0 failed

## Breakage evidence

Fill "Observed" with the failing assertion, and the project where it failed. Planned breakages may be replaced by better ones if the row says so.

| Test | Planned breakage | Observed |
| --- | --- | --- |
| H1 | Stop `hero.ts` before the typo is fixed | `expect(state).toBe("done")` received `"typing"`, in desktop and mobile. H1 uses the clock (`page.clock`), not the fallback |
| H2 | Remove the reduced-motion branch from the hero | `data-hero-state` expected `final`, received `typing`, in desktop and mobile |
| H3 | Change the photo's `src` to a missing file | `naturalWidth` expected `> 0`, received `0`, in desktop and mobile |
| H4 | Remove the skip listeners from `hero.ts` | `data-hero-state` expected `done`, received `typing`, for both key and pointer, in desktop and mobile |
| H5 | Add a second `h1` to the hero | `locator('h1')` count expected 1, received 2, in desktop and mobile |
| I1 | Remove the `x-default` alternate | The alternates list lacked the `x-default` entry (`toEqual` mismatch), in desktop and mobile |
| I2 | Revert a switcher name to the language only | Link `EN — English` not found (`getByRole` with `exact`), in desktop and mobile. The names are literal in the test, because a dictionary-driven expectation would follow the breakage |
| I3 | Drop the hash in the switcher script | URL expected `/pt-br/#projects`, received `/pt-br/`, in desktop and mobile |
| I4 | Redirect `/es/` too, or use the browser language | Used the browser language instead of the saved choice: the saved-choice test got `/#about` instead of `/pt-br/#about`, and the browser-language test got `pt-BR` redirected (`lang` expected `en`), in desktop and mobile |
| I5 | Render the switcher links without `href` when JS is off | Removed the `href`: the `href` expectation `/` failed (link `EN — English` has no `href`), in desktop (mobile skips) |
| S1 | Swap two sections in `Portfolio.astro` | Section ids `toEqual` mismatch (`about` and `experience` swapped), in desktop and mobile |
| S2 | Remove one journey step from the markup | `.about__step` `toHaveText` expected one more item than received, in desktop and mobile |
| S3 | Hide one experience entry's marker | `.xp__marker[data-thread-marker]` count expected 1, received 0 (the attribute removed), in desktop and mobile |
| S4 | Change a project's `rel` and swap two cards | Reversed cards: first heading expected `GloboPop`, received `todsdev.github.io`. Then `rel="nofollow"` alone: `rel` expected `noopener`, received `nofollow`. Run separately, because the first masks the second. Both in desktop and mobile |
| S5 | Render a skills group's items without a list | `toMatchAriaSnapshot` mismatch: no `list` or `listitem` nodes (a `div` instead of the `ul`), in desktop and mobile |
| S6 | Drop the destination from a course's accessible name | Accessible name expected the course destination, received `open cert , (opens in a new tab)`, in desktop and mobile |
| S7 | Remove the runtime phone fill from `contact.ts` | The fill is in `Contact.astro`'s inline script (not `contact.ts`); removing `el.textContent = value` left the phone line with 0 digits, expected at least 10, in desktop and mobile. The no-JS test correctly still passed |
| S8 | Remove the footer's privacy link | Link `cookieless stats by Umami` not found (the `href` removed), in desktop and mobile |
| S9 | Keep sections hidden by not running `reveal.ts` | `[data-reveal]:not(.is-visible)` count expected 0, received 7, in desktop and mobile |
| S10 | Gate section visibility on JS in CSS | Computed opacities were not all `1` without JS (the `.js` gate removed from the hidden rule), in desktop and mobile |
| N1 | Stop `nav.ts` from marking the active link | `aria-current` expected `location`, received empty, for both the click and the deep link, in desktop and mobile. The deep link is its own test: a hash-only `goto` after a load didn't scroll in mobile |
| N2 | Move the switcher before the nav in the DOM | The first Tab stop expected `Home`, received `EN — English`, in desktop |
| R1 | Point the Spanish résumé link to the English PDF | `href` expected `/resume/resume-es.pdf`, received `/resume/resume-en.pdf` (via the fallback in `src/lib/resume.ts`), in desktop and mobile |
| R2 | Change the terminal's `resume` path | Download URL expected `/resume/resume-pt-br.pdf`, received `/resume/resume-en.pdf` (the path hard-coded in `src/lib/terminal-data.ts`), in desktop and mobile |
| T1 | Remove Esc handling or the focus return | Removed the focus return: after Esc the opener link was `inactive`, expected focused, in desktop (T1 skips mobile) |
| T2 | Remove the `>_` button | Removed the button's `data-terminal-open` hook: tapping it left the dialog hidden, expected visible, in mobile (T2 skips desktop) |
| T3 | Fetch `terminal.json` on page load | `loads` before any opening expected `[]`, received 3 requests, in desktop and mobile |
| T4 | Remove `inert` from the page behind the dialog | Used `dialog.show()` instead of `showModal()`, which leaves the page behind interactive: a nav link took focus (expected `false`, received `true`), in desktop and mobile |
| T5 | Edit a built `terminal.json` help line in a doctored copy | Changed one help string in the `strings` that `terminal-data.ts` writes into `terminal.json`, which is the same as doctoring the built file: the `help` output differed from the dictionary's lines by one line (`toEqual`), in desktop and mobile |
| T6 | List `.secrets` in plain `ls` | Plain `ls` printed `.secrets` first: the output differed by one line from the expected `ls` (`toEqual`), in desktop and mobile |
| T7 | Remove one egg from the `cat .secrets` output | The last egg line was missing: `toEqual` expected one more line than received, in desktop and mobile |
| T8 | Change the `ping` output | The first `ping` line was missing: `toEqual` expected one more line than received (command `ping thiago`), in desktop and mobile |
| T9 | Make `:q` do nothing in vim mode | After `:q` the prompt stayed `-- NORMAL --`, expected `visitor@todsdev:~$`, in desktop and mobile |
| T10 | Echo the password into the log | The log contained `__noop_check__`: expected `false`, received `true`, in desktop and mobile |
| T11 | Stop persisting the theme | Stored theme expected `amber`, received `null`, in desktop and mobile. A second breakage, applying the stored theme 500 ms late, failed the before-first-paint check (theme set at 512 ms, first paint at 28 ms or earlier) |
| T12 | Render typed input as HTML in the log | The echo line read `visitor@todsdev:~$ x` instead of the typed markup, in desktop and mobile |
| T13 | Leave the terminal open after `cd` | The dialog stayed visible, expected hidden, in desktop and mobile |
| F1 | Always use English on the 404 page | `lang` expected `pt-BR`, received `en` on `/pt-br/projetos/velho`, in desktop and mobile |
| F2 | Use `innerHTML` for the 404 path | The markup, script tag and quotes paths failed (the shown path no longer matched, `/` instead of the typed markup); the long, emoji, malformed and accented paths, which hold no HTML, still passed. Desktop at 320px |
| F3 | Remove the no-JS generic path | h1 expected `bash: /this-page: command not found`, received `bash: : command not found`, in desktop. A second breakage, setting `lang` 500 ms late, failed the first-paint check (set at 509 ms, first paint before 20 ms) |
| A1 | Keep the query in `notFoundPath` | Sent `location.pathname + location.search` instead: the validator drops a path with `?`, so no `not_found` event arrived (expected one) for `/pt-br/velho?x=1#y`, in desktop and mobile. The page URL has its own query, so `notFoundPath` alone can't show the query: the script's argument is where it would leak |
| A2 | Send `not_found` on every page | A locale page sent a `not_found` event (list expected empty, received one), in desktop and mobile |
| A3 | Remove `data-event` from a nav link | No `nav_click` event was intercepted (the list stayed empty, expected one), in desktop and mobile |
| A4 | Report the raw terminal input as the command | The `terminal_command` events were missing the `unknown` one: the validator drops a raw `__noop_check__`, so the list was short by one, in desktop and mobile |
| A5 | Call `window.umami.track` with no guard | Unguarded `window.umami!.track(...)` in `track()`: the terminal log read `terminal unavailable. Reload the page to try again.` instead of containing `help`, in desktop and mobile |
| A6 | Remove the block from the fixture | `expect(failed).toContain("https://cloud.umami.is/script.js")` received `[]`, in desktop and mobile |
| E1 | Keep the query in the canonical | Canonical expected `https://todsdev.github.io/`, received `https://todsdev.github.io/?utm_source=test`, in desktop (the file skips mobile) |
| E2 | Change `og:locale` for one locale | Changed `pt-br` to `pt_PT`: the `og:locale:alternate` list on the English page differed from `[pt_BR, es_ES]` (`toEqual`), in desktop |
| E3 | Serve a wrong-size PNG in a doctored copy | Replaced by a better breakage: the generator's height set to 600 in `src/lib/seo.ts`, so the built PNG is 1200×600: `[width, height]` differed from `[1200, 630]` (locale `en`), in desktop |
| E4 | Emit the canonical on the 404 page | The counts differed from all zeros (canonical 1), in desktop |
| E5 | Add a `telephone` field with a fictional number | The keys included `telephone`, expected absent, in desktop |
| B1 | Add the 404 page to the sitemap | |
| B2 | Remove the sitemap line from robots | |
| B3 | Write the number from the YAML into a scratch doctored copy (each form and file, per 9.3) | |
| B4 | Remove the separator tolerance from the matcher | |
| M1 | Doctored preview: wrong `lang` | |
| M2 | Doctored preview: remove the 404 script | |
| M3 | Doctored preview: remove `og/en.png` | |
| M4 | Remove the block, against a local preview only | |

## Workflow follow-up

- Archive on the branch: sync the delta specs, run `openspec validate --all --strict`, update the README's counts for specs and archived changes (21 and 19, read at archive time), and move the change to `openspec/changes/archive/`.
- Merge with a merge commit once the checks are green and no deploy is running.
- Before archiving, update the README's "Automated browser verification" bullet to mention the new suite.

### Post-merge checklist

- Wait for the deploy, including the new `smoke` job, then run the live suites from CLAUDE.md, `seo-phone` among them. Also confirm that PRs no longer start a `Build and deploy` run.
- Confirm the check's name exists on this PR's head commit, which targets `main` (`ci.yml` runs only on pull requests, so a commit on `main` never carries it). `<PR>` is this PR's number. The command must print `Gates and browser tests`:

  ```sh
  gh api "repos/todsdev/todsdev.github.io/commits/$(gh pr view <PR> --json headRefOid --jq .headRefOid)/check-runs" --jq '.check_runs[].name'
  ```

- Apply the branch protection approved by the owner: the CI check required, no required reviews, admins not enforced.

  ```sh
  gh api -X PUT repos/todsdev/todsdev.github.io/branches/main/protection --input - <<'JSON'
  {
    "required_status_checks": {
      "strict": false,
      "checks": [{ "context": "Gates and browser tests" }]
    },
    "enforce_admins": false,
    "required_pull_request_reviews": null,
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }
  JSON
  ```

- Read the rule back and confirm it matches the `site-deployment` scenario:

  ```sh
  gh api repos/todsdev/todsdev.github.io/branches/main/protection --jq '{checks: .required_status_checks.checks, admins: .enforce_admins.enabled, reviews: .required_pull_request_reviews}'
  ```

- Clean up: `git checkout main && git pull`, then delete the branch locally and on origin.
