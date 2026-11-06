# Tasks

## Commit workflow (applies to every task)

All work happens on `fix/verify-suite-health`. Never push directly to `main`. After each task:
- Mark it done here.
- Make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass.
- Commit only that task's repo files plus this file, with a Conventional Commit message. Script changes in `~/portfolio-verify-scripts` aren't versioned: record what changed and the evidence in the commit message.
- Push.

## 1. Branch and PR

- [x] 1.1 Commit the change artifacts on `fix/verify-suite-health`, push and open a draft PR. Verify with `gh pr view --json isDraft,headRefName`

## 2. Checks

- [x] 2.1 `l-width.mjs`: skip visually hidden elements and their descendants in the box scan. Verify:
  - it passes on the branch build and on the live site;
  - with a visible element temporarily injected past the column edge in `#courses` (through `evaluate`, not a site edit), it FAILs;
  - the control is recorded: on the unchanged `main` build, the old check fails only on the five `.visually-hidden` spans (1px past the edge).
- [ ] 2.2 `h43b.mjs`: serve the built `/` with the role text rewritten to a role whose last word is lowercase (document-rewrite interception), and read the expected final role from that rewrite instead of hardcoding it. Verify:
  - it passes three times in a row;
  - it FAILs when the rewrite is replaced by the real role, which has 9 erase steps, so it isn't vacuous;
  - `h43.mjs` (the real typo sequence) still passes.
- [ ] 2.3 `h34b.mjs`, `h34c.mjs`, `h52.mjs`: check for `.hero__status` first, and when it's absent print one `SKIP <script>: availability badge is off (profile availability.enabled: false)` line and exit 0. Verify:
  - each prints that line and exits 0 on the current build;
  - with `availability.enabled: true` temporarily set (built, then reverted, not committed), each runs its assertions instead of skipping, and the result is recorded.

- [ ] 2.4 `an-live.mjs`: make the real beacon replay opt-in (`REPLAY=1`), so routine live runs never count a visit. Without it, print one `SKIP` line for the replay step. Verify that a live run without `REPLAY` sends no request to the real gateway (Node `fetch` isn't called; logged) and that every other check still passes

## 3. Full run and documentation

- [ ] 3.1 Add `~/portfolio-verify-scripts/full.sh`. It builds once, runs only the real suites sequentially on :4321, and reports passed, skipped and failed suites. The guard counts a suite as failed if it exits non-zero, prints `FAIL`, or prints neither `PASS` nor `SKIP`. The excluded scripts from proposal.md are listed by name with their category. Verify:
  - a run on `main` reports 0 failed, with only `h34b`, `h34c` and `h52` skipped;
  - a deliberately crashing scratch suite added to its list (temporarily) is reported failed;
  - every `.mjs` in the folder is either in the suite list or in an exclusion list (a check inside `full.sh` that fails on unlisted scripts).
- [ ] 3.2 Update the verify `README.md`:
  - the categories (suites, live-only, fixture-only, tools, debug, obsolete);
  - `full.sh` and the `SKIP` convention;
  - the analytics suites;
  - the `lib.mjs` Umami modes (stub, real, block) and the Local Network Access flag.

  Verify that every script named in the README exists, and that the suite list matches `full.sh`.
- [ ] 3.3 Update `CLAUDE.md`:
  - the full local run is `./full.sh`, and only its suites count;
  - the guard includes `SKIP`;
  - the suite names gain `an-*`, plus `an-live` in the live run.

  Verify with `npm run format:check` and a read-through that it matches the verify README.

## Workflow follow-up

- Archive the change on the branch (no spec sync: `skip_specs`; run `openspec validate --all --strict`), merge with a merge commit once the checks are green and no deploy is running, and watch the deploy succeed. The site output doesn't change.
- Live checks against `https://todsdev.github.io`: the standard live set, plus `l-width` and `an-live` (no beacon replay needed; skip the replay step).
- Delete `fix/verify-suite-health` locally and on origin.
