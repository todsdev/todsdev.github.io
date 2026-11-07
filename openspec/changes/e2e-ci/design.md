# Design: e2e-ci

## Context

See proposal.md for motivation and the current state of `deploy.yml`, and specs for requirements. What shapes the approach:

- **The verify-scripts suites are Mac-bound:** they use puppeteer-core with the system Chrome and hard-coded paths. They can't run on a GitHub runner as they are, and many measure pixels or milliseconds that a shared runner makes noisy.
- **`track()` only calls `window.umami`:** with the script aborted, `track()` drops its queue and no request exists to intercept. The real script also doesn't report outside `todsdev.github.io` (`data-domains`), so even with network access it would send nothing on localhost. Asserting events therefore needs a stand-in.
- **`astro preview` answers 500** for `%2F` and malformed escapes, and GitHub Pages answers 400 for the malformed one. `nf-escape` already works around this by serving `/404.html` as the navigation response.
- **`astro check` covers `**/*`** and the repo has no `@types/node`, by rule. `process` is declared with only `cwd()` in `src/lib/node-build.d.ts`. `@playwright/test` depends only on `playwright`, so it doesn't bring `@types/node`.
- **Reduced motion shows the hero's final state at once,** so reduced motion alone can't prove that the typing works.
- **The terminal's `SLUG` pattern is `^[a-z0-9-]{1,64}$`,** so `__noop_check__` can never be reported as a known command.
- **Timing today:** a PR's gates and build took 32 s on the last PR run (`42355516568`). `actions/upload-artifact` is at v7 and the repo's other actions are already current.

## Goals / Non-Goals

**Goals:**

- Catch a broken site on the PR, in under 5 minutes, without flaky failures.
- Keep tests readable and tied to the specs, with expectations read from sources.

**Non-Goals:**

- Replacing pixel, timing, CLS, contrast, font or PDF-internal checks. They stay in verify-scripts.
- Gating deployment on Playwright in `deploy.yml`. The PR check does that, and branch protection requires it before merge.
- Changing `~/portfolio-verify-scripts`. Its README line calling it "the basis for Playwright tests" stays as it is.

## Decisions

### 1. Layout and configuration

```
playwright.config.ts
tests/e2e/
  support/fixtures.ts     test + auto Umami block + `events` fixture + tracker stand-in
  support/content.ts      reads dictionaries and content YAML (never contacts' phone values)
  support/terminal.ts     open by key or touch, run a command, read its output
  support/phone.ts        reads the number, builds the matcher, masks the output
  hero, i18n, sections, navigation, resume, terminal, not-found, analytics, seo .spec.ts
  build-output.spec.ts    files only, desktop project
  smoke.spec.ts           live subset, smoke project only
```

- **Server:** port 4322, so it never collides with `run.sh` on 4321. `reuseExistingServer: false`, so a stale preview can't be tested by accident.
- **Build:** locally the server command is `npm run build && npm run preview`. In CI it's only the preview, because the build gate already ran. Rebuilding would add about 20 s for nothing.
- **Projects:** `desktop` (Desktop Chrome, 1280 wide) and `mobile` (`devices['Pixel 7']`, with touch and a coarse pointer, so the real `>_` path runs). `build-output.spec.ts` is ignored in `mobile`, and tests needing 320px set the viewport themselves.
- **CI:** `retries: CI ? 1 : 0`, `trace: 'on-first-retry'`, `forbidOnly: CI`, HTML reporter with `open: 'never'`, plus the `github` reporter in CI.
- **Smoke:** when `SMOKE_URL` is set, the config defines only a `smoke` project with that `baseURL` and no server. `test:e2e:smoke` sets it to the live URL. That's a third script, needed only for this job.

Alternative rejected: `reuseExistingServer: !CI` is the common default, but it would silently test whatever is on the port.

### 2. Analytics: block by default, stand-in on request

An auto fixture calls `context.route` for `*.umami.is` and `*.umami.dev`, and aborts everything. No test can forget it. `gateway.umami.is` is covered, and the `.dev` entry guards against a future endpoint change.

The `events` fixture layers on top:

1. It fulfills `cloud.umami.is/script.js` with a small stand-in held in the test code: `window.umami = { track(name, data) { fetch(ENDPOINT, { method: 'POST', body: JSON.stringify({ name, data }) }).catch(() => {}) } }`.
2. A route on `ENDPOINT` records `request.postData()` and aborts the request.

So assertions read a real intercepted request, and nothing leaves the browser. The body is `text/plain`, so no preflight happens. The stand-in reaches the page only through interception, so the bundle holds no test code.

Alternatives rejected:

- **Load the real script:** it contacts Umami and reports nothing on localhost anyway.
- **The `window.__umami` recording that verify-scripts uses:** it doesn't intercept a request, which the owner asked for.
- **`--host-resolver-rules` with a local server:** it's more machinery, and `page.route` now suffices.

The limit is that no test here proves compatibility with Umami's real script. `an-live` stays for that.

### 3. Hero: clock for the sequence, reduced motion for the final state

H1 uses `page.clock.install()` before navigating, waits for `data-hero-state="typing"`, then advances the clock in steps until `done`, asserting the typo appears on the way. `hero.ts` uses `setTimeout` and `performance.now`, which the clock controls. CSS animations aren't controlled, and H1 doesn't assert them. If the clock interacts badly with the font-load wait, the fallback is a web-first assertion on `done` with real time, still no fixed sleep; task 4.1 records which one was used.

### 4. No-phone check

`support/phone.ts` reads `value` from `src/content/contacts/2-phone.yaml` at test time with `yaml`, and normalizes it to digits. No test file holds the number. The matcher accepts any digits as a parameter, so B4 can test it with a fictional number:

```js
const SEP = "[\\s\\u00a0\\-.()+_]*"; // the same separators as seo-phone
const spaced = (d) => new RegExp([...d].join(SEP));
const forms = (digits) => ({
  international: digits, // +55, area code and number
  national: digits.slice(2), // area code and number
  subscriber: digits.slice(4), // number only
});
```

It scans the 4 built `.html` files and the 3 `terminal.json` files. `tel:` and `wa.me/` are also rejected, as the `search-and-sharing` requirement says.

Measured during this review, with masked output, against the current `dist/`: no form and no link was found in any of the 7 files, and the matcher found the real number when written with `+`, spaces, parentheses, dots, a non-breaking space, and without the area code. It's an exact search, so an unrelated number can't match unless it happens to hold the same digits.

Other choices:

- **Failure output:** the test collects masked strings (the file, the form and the shape with every digit replaced by `#`) and asserts that list is empty. It never passes the regex or the file text to `expect`, because Playwright prints both on failure, and CI logs and reports are public.
- **Doctored copy:** `DIST=<dir>` points the test at a copy of the build, which is how its failure is shown. The copy lives in scratch and is deleted afterwards.
- **Non-empty scan:** the test requires a number of at least 11 digits and all 7 files, so an empty scan fails.
- **Contacts:** only `support/phone.ts` reads `2-phone.yaml`. `support/content.ts` never loads `value` or `url` from `contacts`. S7 checks that the phone line appears after decoding without asserting its digits.

`seo-phone` stays in verify-scripts as the live check.

### 5. CI workflow

`ci.yml`, on `pull_request` to `main`, one job named **Gates and browser tests**, `timeout-minutes: 10`, `permissions: contents: read`, cancelling superseded runs per ref. No path filters, because a required check must report on every PR.

Steps in order: `npm ci`, `npm run lint`, `npm run check`, `npm run format:check`, `npm test`, `npm run build`, `npx playwright install --with-deps --only-shell chromium`, `npm run test:e2e`. Each is a plain step with no pipes, so the exit code decides. Then `actions/upload-artifact@v7` with `if: failure()`, the path `playwright-report/` and `retention-days: 7`.

| Step | Estimate |
| --- | --- |
| Install, gates and build | about 35 s (measured) |
| Browser and system dependencies | about 40 s (estimate) |
| 55 tests in two projects, default workers | about 2 min (estimate) |
| **Total** | about 3.5 min |

Task 11.2 measures three PR runs and reports to the owner if any exceeds 5 minutes, proposing `actions/cache` on the browser folder as the first remedy.

### 6. `deploy.yml`

```yaml
deploy:
  if: >-
    github.ref == 'refs/heads/main' &&
    (github.event_name == 'push' ||
     github.event_name == 'workflow_dispatch')
```

- **Trigger:** the `pull_request` trigger is removed, because `ci.yml` covers it and keeping it would run the gates twice. The `if` is a second statement of the rule, and the environment's branch policy is a third.
- **Other edits:** the upload step uses the same condition. The build job's PR-only `cancel-in-progress` expression can never be true now, so it goes.
- **Proof before merging:** `gh workflow run deploy.yml --ref feat/e2e-ci` must skip deploy and smoke. That's safe, because the environment policy would refuse a publish from that branch anyway.

### 7. Post-deploy smoke

A `smoke` job in `deploy.yml`, with `needs: deploy` and no `pages` concurrency, so it never blocks a later deploy. It installs Chromium and runs `npm run test:e2e:smoke`, using the same blocking fixture. A failure marks the run red and doesn't roll back. The README's rollback process applies.

CLAUDE.md step 6 ("watch it until it succeeds") now includes this job, and step 5's in-progress check may wait about a minute longer.

### 8. Tooling for the new files

- **Ignore lists:** `playwright-report/` and `test-results/` go in `.gitignore`, `.prettierignore` and ESLint's `ignores`.
- **Types:** `process` in `node-build.d.ts` gains `env`, and `node:fs` gains what the phone scan needs. `tests/e2e` type-checks under `astro check` with no `@types/node`. `skipLibCheck` is already on through the Astro strict config, so Playwright's references to Node types don't fail. Task 2.1 verifies this.
- **YAML:** `yaml` becomes a direct devDependency at the hoisted 2.9.x, so no new package is installed. Today it's only transitive.

### 9. Proving each test fails

Breakages are temporary working-tree edits, or a doctored `dist` copy, and are never committed. `git status` must be clean of them before each commit. `tasks.md` holds a row per test with the planned breakage and, once done, the observed failure.

## Ported tests and the suites they replace

Each replaced suite stays in verify-scripts, which keeps checking more than the test here does. "Replaces" means the core behavior now also runs on every PR. D = desktop, M = mobile.

| ID | Test | Runs | Replaces (core of) |
| --- | --- | --- | --- |
| H1 | Typing passes through the typo and ends on name and role | D M | `h43`, `h36` |
| H2 | Reduced motion: final state at once, nothing animating | D M | `h36` |
| H3 | Photo loaded, with localized alt, per locale | D M | `h34` |
| H4 | A key or tap skips to the final state | D M | `h44` |
| H5 | One `h1`, role exactly once, no partial text exposed | D M | `h45` |
| I1 | Locale routes: `lang` and hreflang alternates | D M | `e2e` |
| I2 | Switcher names, codes, href, hreflang, current marker | D M | `t71` |
| I3 | Switching keeps the hash and stores the choice | D M | `t73` |
| I4 | Saved choice redirects `/` only; browser language never does | D M | `t74` |
| I5 | Without JS the switcher is a plain link | D | `t73` |
| S1 | Seven sections in order, translated nav and titles, per locale | D M | `e2e` |
| S2 | About: heading structure, four facts, three journey steps | D M | `a44` |
| S3 | Experience: entries, markers and ticks match the content | D M | `x-markers` |
| S4 | Projects: order, badges, actions, rel, localized alt | D M | `p-markup` |
| S5 | Skills: headings and lists from the accessibility tree | D M | `s-a11y` |
| S6 | Courses: links, new tab, accessible names; hosted PDF returns 200 | D M | `c-layout`, `c-links` |
| S7 | Contact: lines in order, phone line appears at runtime, no-JS note | D M | `k-markup` |
| S8 | Footer: credit, year, build date attribute, privacy link, hint | D M | `k-footer` |
| S9 | Scrolling reveals everything, thread drawn, no overflow or page error | D M | `e2e`, `t66`, `t63` |
| S10 | Without JS everything is visible and the thread is drawn | D M | `t66`, `t81` |
| N1 | Nav click and deep link: lands, hash set, one active link | D M | `t64`, `t65` |
| N2 | Tab order: skip link, nav, switcher; skip link targets `#main` | D | `kbd` |
| R1 | Résumé link per locale points to that locale's PDF, 200, `%PDF-` | D M | `k-markup`, `pdf-links` |
| R2 | Terminal `resume` opens the same PDF | D M | `tm-nav` |
| T1 | `/` and `` ` `` open; Esc and close button close; focus returns; no opening from a field | D | `tm-open` |
| T2 | `>_` button opens the terminal with the input focused | M | `tm-open` |
| T3 | `terminal.json` loads only on first opening; log survives a reopen | D M | `tm-open` |
| T4 | Modal named "terminal", localized input label, inert page | D M | `tm-a11y` |
| T5 | `help` per locale | D M | `tm-commands` |
| T6 | `ls` hides `.secrets`, `ls -a` lists it first | D M | `tm-commands` |
| T7 | `cat .secrets` shows the header and all easter eggs | D M | `tm-commands` |
| T8 | Sampled eggs: `ping`, `git blame`, `brew coffee`, `adb devices` | D M | `tm-commands` |
| T9 | `vim` enters and `:q` leaves the mode | D M | `tm-eggs` |
| T10 | `sudo hire-me`: the password never reaches log or history | D M | `tm-sudo` |
| T11 | `theme amber` recolors and persists; `theme gray` resets; stored theme before paint | D M | `tm-theme` |
| T12 | `__noop_check__` gives the error and help hint; typed markup stays text | D M | `tm-commands` |
| T13 | `cd projects` closes the terminal and lands on the section | D M | `tm-nav` |
| F1 | Path table in three locales: 404 status, `lang`, title, line, `cd` link, one footer | D M | `nf-locale`, `t91` |
| F2 | Markup, long, emoji-cut, malformed and accented paths stay text at 320px | D | `nf-escape` |
| F3 | Without JS: English and generic path; with JS: no other-locale text at first paint | D | `nf-nojs` |
| A1 | `not_found` from an intercepted request: path with no query, detected locale | D M | `an-events` |
| A2 | Locale page: no `not_found`, exactly one async tracker tag | D M | `an-events`, `an-host` |
| A3 | Clicks: `nav_click` and `resume` per locale | D M | `an-events` |
| A4 | `terminal_open` and `terminal_command`; `__noop_check__` reports as `unknown` | D M | `tm-an` |
| A5 | With Umami aborted: no page error, nav and terminal work | D M | `an-blocked` |
| A6 | Tracker script requested and stopped, no beacon | D M | new; `lib.mjs` guarded this |
| E1 | Description and canonical per locale, query ignored | D | `seo-meta` |
| E2 | Open Graph and Twitter tags per locale | D | `seo-meta` |
| E3 | `og:image` (mapped to local) is a 1200×630 PNG per locale | D | `seo-meta`, `seo-image` |
| E4 | The 404 page has only `noindex` | D | `seo-meta` |
| E5 | JSON-LD `Person` per locale: fields, no phone, no `<` | D | `seo-jsonld` |
| B1 | Sitemap: three URLs, four alternates each, no 404 | D | `seo-sitemap` |
| B2 | Robots: plain text, allows all, absolute sitemap | D | `seo-sitemap` |
| B3 | The number from the content file, in any form, and `tel:` or `wa.me/` are absent from built pages and `terminal.json` | D | `seo-phone` |
| B4 | Matcher self-test on a fictional number and on values it must not match | D | new |
| M1 | Live: home in three locales, right `lang` and name | smoke | `an-live` covers live separately; new |
| M2 | Live: a 404 path shows the terminal error | smoke | `t91` when run live |
| M3 | Live: `og:image` per locale returns a PNG | smoke | `seo-meta` when run live |
| M4 | Live: tracker stopped, no beacon | smoke | new |

## What stays only in verify-scripts

| Suites | Why they stay |
| --- | --- |
| `h33`, `h35`, `l-accents`, `l-fallback`, `l-fbmetrics`, `l-preload`, `l-swap`, `l-tilde` | Fonts, glyph coverage and exact computed styles. They use raw Chrome protocol font data and depend on the machine's rendering. |
| `h34b`, `h34c`, `h52`, `hoff` | Availability badge variants, which depend on a content switch. They print `SKIP` while it's off. |
| `h41`, `h41b`, `h42`, `h42-768`, `h43b`, `h51` | Millisecond gates, caret races, overlay geometry and power-on frames. `h42` already races under CPU load, so a shared runner would flake. |
| `h61`, `h61-768`, `l-cls`, `l-navstable`, `x-stable`, `p-stable`, `s-stable`, `c-stable`, `k-stable` | Layout-shift and box stability. Slow, sensitive to load, and `l-cls` needs no request interception, which the block fixture would add. |
| `a-space`, `a43`, `c-layout`\*, `k-layout`, `p-cards`, `s-file`, `s-wrap`, `x-style`, `l-name`, `l-nav`, `l-width`, `t63`\*, `t81`\*, `t82`, `x-markers`\*, `l-track` | Pixel geometry, measure, alignment and wrap at many widths. Only the behavior part, where marked \*, runs here. Visual layout checks are out of scope. |
| `t72`, `l-navstyle`, `l-nava11y` | Exact styling of flags and the nav indicator, including pseudo-elements. |
| `lh-contrast` | A deep scan across themes and pages, close to the Lighthouse work that's out of scope. |
| `pdf-links`\* | PDF annotations and metadata need `pdf-lib` and `pdfjs`; only reachability runs here. |
| `an-markup`, `an-sections`, `an-track`, `tm-an`\* | Exhaustive event matrices across locales and widths. A sample runs here, and the validator has unit tests. |
| `an-host`\* | Needs the real Umami script from the network, which the PR rule forbids. Only the tag check runs here. |
| `tm-shell`, `tm-layout`, `tm-commands`\*, `tm-eggs`\*, `tm-nav`\*, `tm-sudo`\*, `tm-theme`\* | Full command matrix per locale, history and completion, `matrix` canvas, `./hello` replay and theme contrast. A sample runs here. |
| `seo-phone`\* | The live check: it also fetches the pages and `terminal.json` files from `BASE` after a deploy. The check on the local build runs here. |

Outside the 92, these also stay: `an-live` (real tracker, live only), `t83` (fixture only), the tools, the debug scripts and the obsolete scripts.

\* Replaced in part, in the table above.

## Branch protection

Owner approved, as a post-merge step. The exact command is in the post-merge checklist in `tasks.md`.

- **When:** `ci.yml` runs only on pull requests, so the check never runs on a commit pushed to `main`. Its name exists once it has run on a PR targeting `main`. The checklist confirms that from this PR's head commit, then applies the rule after the merge.
- **`enforce_admins: false` (owner's decision):** the rule doesn't bind the owner, who is an admin. An admin can still push to `main` or merge past a failed check, so CLAUDE.md's "never push to `main`" stays a process rule.
- **`strict: false`:** a PR needn't be level with `main`, since changes land one at a time.
- **`required_pull_request_reviews: null`:** a solo owner can't approve their own PR.
- **Merging:** merge commits still work, so step 5 of the workflow doesn't change.

## Risks / Trade-offs

- [The phone number is public in the repo and its history] → Accepted by the owner. See proposal.md.
- [Traces and HTML reports hold the decoded number in DOM snapshots of the contact section, and artifacts in a public repo are downloadable by any signed-in GitHub user] → Accepted by the owner: artifacts exist only on failure and are kept for 7 days. It adds no new exposure, since a visitor with JS sees the number and the repo holds it.
- [A retry can hide a flaky test] → Task 11.1 runs the suite with `--repeat-each=3` before merging. A test that passes only on retry is a defect, not a pass.
- [Duplicated checks can drift from verify-scripts] → Accepted. This suite is smaller and tied to the specs, and a behavior change updates both, as it already must.
- [The time estimate may be wrong] → It's measured in task 11.2, with browser caching as the first remedy.
- [The clock may not fit the hero's font wait] → Decision 3's fallback avoids fixed sleeps either way.
- [The live smoke may run before the Pages CDN updates and pass against the old version] → Accepted. It catches a broken site, not version identity. The retry covers a brief failure right after deploy.
- [`--only-shell` means `test:e2e:ui` or headed runs need the full browser locally] → The README documents `npx playwright install chromium` for local use.

## Migration Plan

1. Tests and `ci.yml` land on the branch. The workflow runs from the PR itself, so it proves itself before merging.
2. `deploy.yml` changes are verified on the branch by the skipped manual run in decision 6.
3. After merging, the deploy run is the first real proof of the condition and the smoke job, followed by the usual live suites.
4. Branch protection is applied after those checks, per the post-merge checklist.
5. If it goes wrong, a revert PR restores the workflows. The site's content doesn't change, so the live site isn't at risk beyond a skipped deploy.
