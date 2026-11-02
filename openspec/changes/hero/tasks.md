# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/hero`. Never push directly to `main`; the change deploys when the `feat/hero` PR is merged.

After completing each task during `/opsx:apply`:
1. Mark the task done (`- [x]`) in this file.
2. Make sure `npm run check`, `npm run lint` and `npm run format:check` pass.
3. Stage only that task's changes plus this file, and commit them with a Conventional Commit message (e.g. `feat(hero): type the name with an irregular cadence`).
4. Push to `feat/hero`.

"In preview" checks run against `npm run build && npm run preview` in headless Chrome. Reuse and extend the scripts in `~/portfolio-verify-scripts` (`./run.sh <script>`). Add the new hero scripts there, outside the repo. They feed the Playwright tests in the polish change.

## 1. Branch and PR

- [x] 1.1 Create `feat/hero` from up-to-date `main`, commit the `openspec/changes/hero/` artifacts, push, and open a draft PR to `main`; verify `gh pr view --json isDraft,headRefName` shows a draft from `feat/hero`

## 2. Content model

- [ ] 2.1 Generate the neutral placeholder `src/content/profile/photo.png` (720×900, generic silhouette on a gray gradient, made once with `sharp` from an inline SVG); verify the file is 720×900 and contains no real person
- [ ] 2.2 Extend the profile schema in `src/content.config.ts` to the `({ image }) =>` form with `photo: image()` and `availability: { enabled: boolean, label: localized }`, and add `photo: ./photo.png` and `availability` (enabled, with en/pt-br/es labels "open to work", "disponível para trabalho", "disponible para trabajar") to `profile.yaml`; verify `npm run build` exits 0 and `getEntries("profile", …)` returns `photo` as image metadata (`src`, `width`, `height`)
- [ ] 2.3 Verify the failure paths by temporarily pointing `photo` at a missing file, setting `availability.enabled: "yes"` and removing `availability.label.en`: each makes `npm run build` exit non-zero, naming the profile file and field. Also confirm that removing the `es` label only produces the fallback warning. Revert afterwards
- [ ] 2.4 Document `photo` and `availability` in the README's Content section (including how to replace the placeholder photo and turn the badge off); verify the documented YAML validates

## 3. Hero markup and static final state

- [ ] 3.1 Add dictionary keys `hero.prompt` (`~/portfolio $ ./hello` / `./ola` / `./hola`) and `hero.photoAlt` (with a `{name}` placeholder) in all three locales, and remove `prompt.hero`; verify `npm run check` exits 0 and `prompt.hero` no longer appears in `src/`
- [ ] 3.2 Create `src/components/Hero.astro` with the final-state markup from design.md: `section#hero[data-reveal][data-hero-state=final]`, the prompt line in `--text-muted`, the `h1` name, the role line with `aria-hidden` `> ` and `profile.role.en`, and the status badge only when enabled (aria-hidden `●` plus label). Use it in place of the placeholder hero in `Portfolio.astro`. Verify that in every built locale page the `h1` holds the full name, the role reads `Android Developer`, the prompt line is translated and the status label is in the page's language
- [ ] 3.3 Style the hero text block entirely in VT323 (prompt, name, role, status), with the status `●` in `--text` and the label in `--text-muted`; verify in preview that all four use VT323 (CDP platform fonts) and that the contrast of every hero text color on `--bg` is ≥ 4.5:1
- [ ] 3.4 Add the photo with `<Picture>` (avif/webp, responsive widths, `sizes`, eager loading, translated alt naming the owner) in a `4/5` aspect-ratio box, plus the grid layout (photo above the text below `48rem`, beside it from `48rem`); verify in preview that at 1280px the photo is beside the text and at 320px above it without overflow, and that the built `<img>` has width, height, a `/_astro/` src and avif/webp sources
- [ ] 3.5 Add the grayscale filter and the token-based scanline overlay to the photo; verify in preview that the computed filter includes `grayscale(1)` and the overlay pseudo-element uses a repeating gradient. Compare 2x screenshots of the photo at rest
- [ ] 3.6 Verify the static fallback: with JS disabled, and separately with reduced motion emulated, the prompt, name, role, photo and status are all visible immediately and nothing animates (no running animations or transitions in the hero)

## 4. Typing sequence

- [ ] 4.1 Add the pre-paint gate: extend `BaseLayout`'s inline head script, for pages that opt in via a new prop, to set `html.hero-pending` when JS runs, motion is allowed and the hash is empty or `#hero`, with a 4 s safety removal, plus CSS that hides the real hero text and darkens the photo under `.hero-pending`; verify the 404 page and `/#skills` never get `hero-pending`, and that blocking `hero.ts` reveals the hero after about 4 s
- [ ] 4.2 Create `src/scripts/hero.ts` with the overlay builder (per-character aria-hidden spans over each `[data-type]` element, real text transparent while animating) and the zero-width cursor; verify in preview that the overlay and real-text bounding boxes match within 1px at 1280px and 320px, and that the overlay is aria-hidden
- [ ] 4.3 Implement the timeline: prompt fade-in, name at 70–160 ms per character, cursor moving to line two, role with lowercase last word at 45–100 ms, about 750 ms pause, erase at about 40 ms per character, retype correctly, then the `done` state. Wait for VT323 to load first (capped at about 1 s), and skip the typo when the last word isn't capitalized. Verify in preview, by sampling the overlay text with timestamps: the name delays all fall within 70–160 ms and are not constant, the role delays fall within 45–100 ms, `Android developer` appears before the pause, the erase steps take about 40 ms each, and it ends on `Android Developer`
- [ ] 4.4 Add skip-to-final on the first `pointerdown`/`keydown` (capture, no `preventDefault`, listeners removed when finished) and the start conditions (no run with a non-hero hash, reduced motion or no JS); verify in preview that a key press mid-name shows the final text, photo on and status at once, that a Tab press also moves focus normally, that a click after the sequence changes nothing, and that `/#skills` loads with the hero already final
- [ ] 4.5 Verify the screen-reader view during the sequence: at several moments the accessibility tree exposes exactly one heading with the full name and one "Android Developer" text, never partial or typo text

## 5. Photo power-on and status reveal

- [ ] 5.1 Add the CRT power-on keyframes (line squash, brightness flash, fade to the grayscale rest, about 900 ms) triggered by `[data-hero-state="done"]`, with the photo slot dark until then; verify in preview, by sampling the computed opacity and filter over time after typing ends, that a brightness peak greater than 1 is followed by a settle at `grayscale(1)` with opacity 1
- [ ] 5.2 Reveal the status badge after the power-on (space reserved with `visibility: hidden`); verify in preview that the badge becomes visible only after the power-on peak, and that with `availability.enabled: false` (temporary) no badge is rendered in any locale. Revert afterwards

## 6. Integration

- [ ] 6.1 Verify there's no layout shift: record `layout-shift` entries (PerformanceObserver) during the full sequence at 1280px and 320px, and confirm the hero's box and the `#about` top stay constant; expect a CLS contribution of 0
- [ ] 6.2 Rerun the setup-base verification suites (`e2e`, `t63`–`t74`, `t81`, `t82`, `t91`, `kbd`) from `~/portfolio-verify-scripts`, updating any assertion that relied on the old `$ whoami` hero; verify they all pass, with no console errors and no failed requests in all three locales
- [ ] 6.3 From a clean `npm ci`, run `npm run check && npm run lint && npm run format:check && npm run build`; verify all exit 0 and that the only build warnings are the expected translation fallbacks
- [ ] 6.4 Verify the latest PR workflow run on `feat/hero` succeeds (`gh pr checks`), with build passing and deploy skipped

## Workflow follow-up

- Mark the PR ready and merge it into `main` with a merge commit; this deploys.
- Verify the deploy run succeeds and the live hero plays on `https://todsdev.github.io/`, `/pt-br/` and `/es/`.
- Archive the change with `/opsx:archive hero`.
