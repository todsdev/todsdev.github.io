# CLAUDE.md

How we work on this repo. Product behavior lives in `openspec/specs/`, content conventions in `openspec/config.yaml` (`context`), and setup and content editing in `README.md`. This file covers only the workflow and verification practices that aren't written down there.

## Change workflow (OpenSpec)

Work on one change at a time, in this order:

1. **Propose:** `/opsx:propose <name>`.
   - Inspect the code and content first.
   - Ask about ambiguities that change scope or behavior. Record minor assumptions in the proposal.
   - Content facts (titles, dates, URLs) must be read from their source, such as the certificate or the store listing. Never guess, and report anything that can't be verified.
2. **Review:** stop after the proposal and wait for the owner's review, even if the request says to go further.
3. **Apply:** `/opsx:apply`, task by task.
   - Branch: `feat/<change>` or `fix/<change>`.
   - Task 1.1 commits the artifacts and opens a draft PR.
   - After each task: mark `- [x]` in `tasks.md` and commit only that task's files plus `tasks.md`, with a Conventional Commit. Then push.
   - Gate every commit on `npm run lint`, `npm run check`, `npm run format:check` and `npm test`.
   - Never push to `main`.
4. **Archive on the branch:**
   - Sync the delta specs into `openspec/specs/` and verify them.
   - Run `openspec validate --all --strict`.
   - Move the change to `openspec/changes/archive/YYYY-MM-DD-<name>/`, commit and push.
5. **Merge with a merge commit** (`gh pr ready N && gh pr merge N --merge`) once the PR checks are green.
   - Never merge while a deploy is running: check `gh run list -w deploy.yml --status in_progress`. The deploy's concurrency group is `pages`.
6. **Wait for the deploy:**
   - Find the run for the merge commit: `gh run list -w deploy.yml --commit <sha>`.
   - If none appears within about 2 minutes, run `gh workflow run deploy.yml --ref main`. This has happened before.
   - Watch it until it succeeds.
7. **Live checks** against `https://todsdev.github.io` (see below).
8. **Cleanup:** `git checkout main && git pull`, then delete the branch locally and on origin, without asking.

When asked to "stop and report if anything fails", do exactly that. Don't work around a failure.

## Verification scripts

The scripts live in `~/portfolio-verify-scripts`, outside this repo, and are versioned in the private repo `todsdev/portfolio-verify-scripts`. Commit and push every script change there too; record the evidence in that commit as well as in this repo's task commit. They use puppeteer-core with the system Chrome.

- **Helpers:** `lib.mjs` provides `browser()`, `assert()` (prints `PASS` or `FAIL` and sets the exit code) and `BASE`.
  - `BASE` defaults to `http://localhost:4321`. Set `BASE=https://todsdev.github.io` for live runs.
- **Local runs:** `./run.sh <script>.mjs [--no-build]` builds the site (unless `--no-build`), starts `astro preview` on :4321, runs the script and stops the preview. It refuses to run if port 4321 is busy, so kill your own preview first.
- **Umami:** `lib.mjs` replaces Umami with a local stub by default (`UMAMI=stub`; also `real` and `block`), so test runs never count as visits, live runs included.
- **Suite names:** prefixed by area:
  - `h*` hero, `a*` about;
  - `t*`, `e2e`, `kbd`: navigation, i18n, thread, keyboard;
  - `l-*`: layout, fonts and CLS (`l-cls` with `RUNS=10` is 60 loads);
  - `x-*` experience, `p-*` projects, `s-*` skills, `c-*` courses, `k-*` contact and footer;
  - `an-*`: analytics;
  - `tm-*`: terminal;
  - `nf-*`: the 404 page, `seo-*`: search and sharing, `pdf-links`: résumé PDFs;
  - `lh-*`: Lighthouse and contrast (`lh-contrast` is a suite, `lh-table` a tool).
- **Real suites only:** the `SUITES` list in `full.sh` is the source of truth. The other scripts aren't checks and never count:
  - live only: `an-live`;
  - fixture only: `t83`;
  - obsolete: `t31`–`t33`;
  - tools with no assertions: `*-shot` (including `readme-shot`), `shot`, `l-baseline`, `l-fonts`, `l-latinext*`, `l-metrics`, `lh-table`, `p-tagbox`, `s-copy`, `c-adobe`;
  - debug: `dbg*`;
  - helpers: `lib`, `tm-lib`.

  `full.sh` refuses to run while any script is unclassified, so classify a new script when you add it.

- **The guard:** count a suite as failed if it exits non-zero, prints `FAIL`, or prints neither `PASS` nor `SKIP`. A crashed or aborted script otherwise looks like "0 failures".
  - A suite that can't apply to the current content (for example, the availability badge checks while the badge is off) prints one `SKIP <script>: <reason>` line and exits 0; it counts as skipped, not failed.
- **Local full run:** `./full.sh` builds once and runs every real suite with the guard. It takes longer than 10 minutes, so run it in the background.
- **Live run** after each deploy: `l-cls`, the section suites `x-*`, `p-*`, `s-*`, `c-*` and `k-*` (not the tools among them), plus `kbd`, `h42`, `l-navstable`, `tm-open`, `tm-commands`, `tm-eggs`, `tm-theme`, `an-live`, `nf-*`, `seo-*` and `pdf-links`. Add targeted checks for the change (for example, the hosted PDFs return 200, or the phone number is absent from the live HTML).
  - `an-live` sends a real visit to Umami only with `REPLAY=1`; use that only to confirm a new website ID.
- **Parallelism:** run suites sequentially. Parallel runs are only a stress tool: under CPU load, timing-sensitive checks can race (the `h42` caret race).

### Measurement pitfalls already hit

- **Smooth scrolling:** after `focus()` or Tab the page smooth-scrolls. Wait until the element stops moving before measuring.
- **Racing animations:** read animated state inside the `waitForFunction` callback that detects it, not in a later `evaluate()`.
- **Hidden elements:** `display: none` elements report a 0×0 rect at the viewport origin. Skip boxless elements (`getClientRects().length === 0`) in box diffs.
- **Inline-block boxes:** `Range.getClientRects()` also returns the boxes of inline-block children. Measure text rows from text nodes.
- **Accessibility snapshots:** a rooted `page.accessibility.snapshot({ interestingOnly: true })` collapses the tree. Use `interestingOnly: false`.
- **Accessible names:** Chrome shows `"open , …"` for a command followed by a visually hidden destination. The HTML has no space; that's an AX-tree artifact.
- **Test the test:** make a new check fail against the old behavior at least once, so it isn't vacuous.

### Prove a check is wrong before changing it

If a check fails, assume the site regressed until a control says otherwise:

- **Control:** run the check several times against the `main` build (in a `git worktree`, previewed on another port), the live site and the branch, and also under parallel load.
- **Regression:** if it fails only on the branch, fix the site.
- **Bad check:** if it also fails on `main` or live, or only intermittently, fix the check. Explain the evidence and the cause in the commit message.
- **Tolerance:** never relax a check's tolerance without that evidence.

## Other practices

- **Untrusted files** (downloads, store images, certificate PDFs): copy them into a fresh scratch directory and only parse or re-encode them.
  - **Images:** re-encode with `sharp` and confirm there is no EXIF or GPS data.
  - **PDFs:** rewrite with a scratch `pdf-lib` script that removes the Info dictionary, XMP, generator annotations and timestamps. Confirm the pages render pixel-identical to the originals.
- **No layout shift:** reserve space up front (aspect ratios, reserved grid cells). Decide JS versus no-JS states by the `<html>` `js`/`no-js` class, which is set before first paint.
- **Phone number:** it must never appear in built HTML or `terminal.json` (the résumés are a deliberate exception). After touching the contact code, run `seo-phone` (every built `.html` and `terminal.json`) or grep `dist/**/*.html` and `dist/**/terminal.json`.
- **Gate results:** judge `npm run lint`, `check`, `format:check` and `test` by their exit code, and never truncate their output (`tail`, `head`) before reading the result. A truncated lint failure went unnoticed on three commits of the `polish` change.
- **Terminal actions:** keep no whitespace between the command and its visually hidden destination (`{/* prettier-ignore */}` on that element).
- **No `@types/node`:** use the small ambient files instead (`src/lib/node-test.d.ts`, `src/lib/node-build.d.ts`).
- **Libraries:** keep `src/lib/*` pure and free of runtime imports (type-only imports are fine), so `node --test` runs them with type stripping.
