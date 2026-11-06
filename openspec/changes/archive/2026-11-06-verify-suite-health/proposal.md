# Proposal

## Why

The full local verification run for `analytics` flagged 34 of 99 scripts. Only five of those are real checks that fail, and all five fail identically against a `main` build and against the branch, so they predate that change:
- `l-width`: 9 FAIL;
- `h43b`: 1 FAIL;
- `h34b`, `h34c`, `h52`: crash.

The other 29 aren't checks: debug helpers, measurement and screenshot tools, obsolete scripts, a fixture-only script, plus two analytics suites already fixed during that change. The guard counts them as failures because they print no `PASS`. A full run that is red for reasons nobody acts on hides real regressions, so the run must count only real checks, and every real check must pass or skip explicitly.

## What Changes

What the investigation found, with the `main`-vs-branch control (read-only, done during this proposal):

- **`l-width`, a bad check (no site fix):**
  - The Courses section's edges equal the hero's at 1024, 1280, 1440 and 1920px (for example 200–1096 at 1280px), and no visible element leaves the column.
  - The check fails only on the five `$ open cert` visually hidden destination spans. They sit flush with the right edge, so their clipped 1×1 boxes end 1px past the column (`right=1097` vs `1096`).
  - The check will skip visually hidden elements and their descendants in its box scan, as `k-footer` already does. It will be made to fail against an injected visible overflow, so it isn't vacuous.
- **`h43b`, the site behaves as specified:**
  - With the real role, the hero types "Android developer", erases the 9 letters of "developer" and ends on "Android Developer", as the hero spec's "Typing sequence" requires. `h43` passes 16/16.
  - `h43b` checks the other branch: when the role's last word is already lowercase, there's no typo and no erasing. It hardcodes the role "Mobile engineer", so it can only pass after a temporary content edit.
  - It will instead serve the built page with the role text replaced (the document-rewrite interception `h41` and `l-latinext2` already use). It then always tests that branch against the real build, with no content edit.
- **`h34b`, `h34c`, `h52`, availability badge off on purpose:**
  - The profile has `availability.enabled: false`, and the hero spec requires no badge then. The scripts read `.hero__status` without checking for it and crash on `null`.
  - Each will check the badge first. When it's absent, it prints one `SKIP <script>: availability badge is off (profile availability.enabled: false)` line and exits 0.
- **Real suites only in the full run:**
  - A new `full.sh` in `~/portfolio-verify-scripts` runs only the real suites, sequentially, against one build, with the guard. A suite fails if it exits non-zero, prints `FAIL`, or prints neither `PASS` nor `SKIP`. A suite that only prints `SKIP` is reported as skipped, not failed.
  - Excluded, each listed by name in `full.sh` and the verify README:
    - debug helpers (`dbg*`);
    - tools with no assertions (the `*-shot`/`shot` screenshots, `c-adobe`, `l-baseline`, `l-fonts`, `l-latinext`, `l-latinext2`, `l-metrics`, `p-tagbox`, `s-copy`);
    - obsolete scripts (`t31`, `t32`, `t33`);
    - the fixture-only `t83` (needs a temporary marker);
    - the live-only `an-live`.
- **Verify README:** documents the categories, `full.sh`, the `SKIP` convention and the analytics suites (`an-*`). It also covers the Umami stub modes in `lib.mjs`, including the Local Network Access flag that live runs need.
- **`CLAUDE.md`:**
  - the full local run is `./full.sh`, and only the suites it lists count;
  - the guard rule includes `SKIP`;
  - the suite-name list gains `an-*` (analytics) and notes `an-live` for live runs.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. No site behavior changes: the investigation found no site defect. The change is limited to the verification scripts (outside the repo) and `CLAUDE.md`, so `.openspec.yaml` sets `skip_specs: true`.

## Impact

- **Repo:** `CLAUDE.md` only (verification practices). No source, content or spec changes.
- **`~/portfolio-verify-scripts`** (not versioned): `l-width.mjs`, `h43b.mjs`, `h34b.mjs`, `h34c.mjs`, `h52.mjs`, `an-live.mjs` (the real beacon replay becomes opt-in with `REPLAY=1`, so routine live runs never count a visit), a new `full.sh`, and `README.md`.
- **Branch:** `fix/verify-suite-health`, as the owner named it. The repo diff is small because most of the work is in the unversioned scripts. The PR records the evidence and the results.
- **Assumption:** obsolete and fixture-only scripts are kept (not deleted), only excluded from the full run, matching the verify README's "kept for reference".
