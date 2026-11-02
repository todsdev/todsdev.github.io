# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/about`. Never push directly to `main`; the change deploys when the `feat/about` PR is merged.

After completing each task during `/opsx:apply`:
1. Mark the task done (`- [x]`) in this file.
2. Make sure `npm run check`, `npm run lint`, `npm run format:check` (and, once it exists, `npm test`) pass.
3. Stage only that task's changes plus this file, and commit them with a Conventional Commit message.
4. Push to `feat/about`.

"In preview" checks run against `npm run build && npm run preview` in headless Chrome, using new `a*.mjs` scripts in `~/portfolio-verify-scripts` (outside the repo, run with `./run.sh <script>`).

## 1. Branch and PR

- [x] 1.1 Create `feat/about` from up-to-date `main`, commit the `openspec/changes/about/` artifacts, push and open a draft PR to `main`; verify `gh pr view --json isDraft,headRefName`

## 2. Content model

- [x] 2.1 Make profile `location` translatable (`localizedText`), add `journey` (`z.array({ years: text, text: localizedText }).min(1)`) and `focus` (`localizedText`) to the profile schema, and seed them in `profile.yaml` per design.md (location en "Rio de Janeiro, Brazil", pt-br/es "Rio de Janeiro, Brasil"; open ranges written as `2016–` / `2023–`); verify `npm run build` exits 0 with no fallback warnings, and that `getEntries("profile", "es")` returns location "Rio de Janeiro, Brasil" and three journey steps with Spanish text
- [x] 2.2 Verify the failure paths by temporarily emptying `journey`, removing a step's `years`, removing `journey[0].text.en`, removing `focus.en`, writing `location` as a plain string and removing `location.en`: each makes `npm run build` exit non-zero, naming the profile file and field. Revert afterwards
- [x] 2.3 Document translatable `location`, `journey` (including the trailing-dash convention) and `focus` in the README (Content table and profile section); verify the documented YAML validates

## 3. Testable fallback

- [x] 3.1 Move the pure localization logic into `src/lib/localize.ts` (no runtime imports, injectable `warn`, `resetFallbackWarnings()`), and make `content.ts` import it; verify `npm run build` output is byte-identical for `dist/index.html` before and after, and that `npm run check` and `npm run lint` pass
- [ ] 3.2 Add `src/lib/localize.test.ts` with inline fixtures covering: English fallback, one warning naming collection, entry, field and locale, deduplication, no warning when translated or for `en`, nested arrays (`journey[0].text`), and untouched non-localized objects. Add the `test` script (`node --test "src/**/*.test.ts"`), plus a typed setup that keeps `astro check` passing without new dependencies (exclude the test from `astro check` and add a minimal ambient declaration, or document why `@types/node` is needed). Verify `npm test` passes, and that it fails naming the test when `localize` is temporarily broken (revert)
- [ ] 3.3 Add a `Test` step (`npm test`) to `.github/workflows/deploy.yml` between "Format check" and "Build", and document `npm test` in the README scripts table; verify the workflow validates and that the PR run for this push shows the Test step passing

## 4. About section

- [ ] 4.1 Add the about dictionary keys from design.md to all three locales; verify `npm run check` passes and a missing key in `es.ts` fails it (revert)
- [ ] 4.2 Create `src/components/About.astro` (summary, journey `ol` with years plus localized "present" for open ranges, facts `dl` in an `aside` with `h3` headings) and render it inside `<Section id="about">` in `Portfolio.astro`; verify in each built locale page that the summary, three journey steps (`2016–2022`, `2016–present`/`atual`/`actualidad`, `2023–…`) and four facts with the expected values appear (location "Rio de Janeiro, Brazil" on `/`, "Rio de Janeiro, Brasil" on `/pt-br/` and `/es/`), and that the markup has `dl` > `div` > `dt` + `dd` ×4, `ol` > `li` ×3 and two `h3`s
- [ ] 4.3 Style the section per design.md (grid from `48rem`, summary `60ch` in IBM Plex Mono, journey hanging indent, facts keys `--text-muted` and values `--text`); verify in preview: at 1280px the facts are beside the main column, at 320px summary → journey → facts in one column with no horizontal overflow, the body font is used (CDP), and keys/values have ≥ 4.5:1 contrast
- [ ] 4.4 Verify accessibility and motion in preview: one `h2` for the section and two `h3`s below it, the accessibility tree exposes the description list with four terms, nothing in the about section animates after its entrance, it's visible immediately with reduced motion and without JS, and a hidden language entry (temporary `hidden: true`) disappears from the facts (revert)

## 5. Integration

- [ ] 5.1 Rerun all suites in `~/portfolio-verify-scripts` (setup-base, hero and the new about scripts); verify they all pass, with no console errors and no failed requests in all three locales
- [ ] 5.2 From a clean `npm ci`, run `npm run check && npm run lint && npm run format:check && npm test && npm run build`; verify all exit 0 and the build has no warnings
- [ ] 5.3 Verify the latest PR workflow run on `feat/about` succeeds (`gh pr checks`), with the Test and build steps passing and deploy skipped

## Workflow follow-up

- Mark the PR ready and merge it into `main` with a merge commit; this deploys. Confirm a deploy run was created for the merge commit (if not, trigger `gh workflow run deploy.yml --ref main`).
- Verify the live about section on `https://todsdev.github.io/`, `/pt-br/` and `/es/`.
- Archive the change with `/opsx:archive about`.
