# Proposal: e2e-ci

## Why

Pull requests run only the type check, lint, format check, unit tests and build. All browser verification lives in a private repo and runs by hand on the owner's Mac, so a PR can be green while the site is broken. This change puts the core of those checks in the public repo and runs them on every PR.

## What Changes

- **Browser tests in the repo:** a Playwright suite in `tests/e2e/`, run against the production build served locally, in Chromium desktop and Chromium mobile. It adds the scripts `test:e2e` and `test:e2e:ui`, documented in the README and CLAUDE.md.
- **Core coverage, not a port of all 92 suites:** 55 tests cover hero, i18n, sections, résumés, terminal, 404, analytics, SEO, sitemap, robots and the no-phone check. Four more form the smoke subset. `design.md` maps each test to the suites it replaces and lists what stays only in `~/portfolio-verify-scripts`. That repo isn't changed.
- **Test rules:** Umami is blocked in every test, and events are asserted from intercepted requests. The no-phone check reads the number from `src/content/contacts/2-phone.yaml` at test time and searches the built pages and the three `terminal.json` files for it, and its failure output never shows the digits. Throwaway terminal input is the constant `__noop_check__`. Animations use reduced-motion emulation or Playwright's clock. Each test must be shown to fail against a deliberate breakage, recorded in `tasks.md`.
- **CI workflow:** a new `ci.yml` on pull requests to `main` runs install, lint, check, format check, unit tests, build and Playwright, with a 5-minute target. It retries once only in CI, keeps a trace on the first retry and uploads the HTML report on failure.
- **`deploy.yml`:** the deploy job gets an explicit condition: `main` only, on push or manual dispatch (owner's decision, which keeps the manual redeploy fallback). The `pull_request` trigger moves out to `ci.yml`, so gates don't run twice on a PR.
- **Post-deploy smoke (owner approved):** a job after a successful deploy runs the smoke subset against `https://todsdev.github.io` with analytics blocked, through `test:e2e:smoke`. A failure turns the run red but doesn't roll back.
- **Branch protection (owner approved):** a post-merge step requires the CI check before merge, with no required reviews and admins not enforced. The exact `gh` command is in the post-merge checklist in `tasks.md`.

### Current state of `deploy.yml`

Read during this proposal, before any change:

- Triggers: `push` to `main`, `pull_request` to `main`, `workflow_dispatch`.
- The deploy job's condition is `github.event_name != 'pull_request'`, and the Pages artifact upload uses the same condition. A PR can't publish today, but the rule is a negative one and doesn't name `main`.
- The `github-pages` environment allows only the `main` branch, which is a second layer that stays.
- `main` has no branch protection or ruleset.

### Accepted trade-off: the phone number in the repo

The real phone number is public in this repo: `src/content/contacts/2-phone.yaml`, `3-whatsapp.yaml`, `src/lib/contact.test.ts`, `openspec/specs/contact/spec.md` and their git history. This is deliberate. The protection is meant only to stop quick scraping of the HTML, which is why the page assembles the number at runtime. The owner accepted this during review, so there is no history rewrite and no separate change.

The new tests hold no copy of the number. They read it from the content file at test time and mask it in all their output.

## Capabilities

### New Capabilities

- `browser-tests`: what the repo's browser test suite guarantees: where it runs, what it covers, how it treats analytics, the phone number and animations, and how each test proves it can fail.

### Modified Capabilities

- `site-deployment`: PR verification moves to its own workflow and adds browser tests, only `main` can publish, a smoke check follows each deployment, and merging to `main` requires the CI check.
- `repository-docs`: the README and CLAUDE.md document how to run the browser tests.

## Impact

- **New:** `playwright.config.ts`, `tests/e2e/`, `.github/workflows/ci.yml`.
- **Changed:** `.github/workflows/deploy.yml`, `package.json` and `package-lock.json` (`@playwright/test`, and `yaml` as a direct devDependency), `.gitignore`, `.prettierignore`, `eslint.config.js`, `src/lib/node-build.d.ts` (ambient types for tests only), `README.md`, `CLAUDE.md`.
- **Unchanged:** site behavior, design and production bundle. The verify-scripts repo also stays as it is, and it remains the source for deep and live checks.
- **Workflow:** PR check names change (`CI` replaces `Build and deploy` on PRs). The deploy run takes about a minute longer because of the smoke job.

Out of scope: other browsers, visual regression screenshots, Lighthouse CI, custom domain, changes to the site's behavior or design.
