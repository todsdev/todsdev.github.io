# Design

## Context

After `setup-base`, the hero is `<Section id="hero" titleTag="p">` in `src/components/Portfolio.astro`, showing the `$ whoami` prompt (`prompt.hero` in the dictionaries) and an `h1` with `profile.name`. The site has:
- client scripts as small vanilla modules (`src/scripts/*.ts`) imported from components;
- `html.js` set inline in `<head>`, and a global reduced-motion rule that disables all animations and transitions;
- the `--highlight` block cursor style already used by the nav;
- `profile` content loaded through `getEntries()`, which localizes fields and warns on fallback.

Astro 7 exposes `image()` in collection schema context, and `sharp` is installed. The motivation is in proposal.md and the behavior is in the three delta specs.

## Goals / Non-Goals

**Goals:**
- Keep one source of truth for the hero text: the real DOM content. The animation is a purely visual overlay derived from it, so accessibility and layout don't depend on JavaScript.
- Reach zero layout shift without hard-coding widths.
- Keep the content model the only place to change the photo, the role and the availability.

**Non-Goals:**
- Typing sound, a replay control, or animating anything other than the hero.
- Adding the real photo (a content update) or Playwright tests (polish change).

## Decisions

### Component structure
`src/components/Hero.astro` replaces the placeholder in `Portfolio.astro`. It keeps `<section id="hero" data-reveal>`, so nav tracking, reveal and the thread keep working, but it no longer uses `Section.astro`, because the hero's prompt format (`~/portfolio $ ./hello`) differs from the `$ <command>` section titles.

```html
<section id="hero" class="hero" data-reveal data-hero-state="final">
  <div class="hero__text">
    <p class="hero__prompt">~/portfolio $ ./hello</p>       <!-- translated -->
    <h1 class="hero__line hero__name" data-type="name">Thiago Rodrigues</h1>
    <p class="hero__line hero__role">
      <span aria-hidden="true">&gt; </span><span data-type="role">Android Developer</span>
      <span class="hero__status">● open to work</span>  <!-- only if enabled -->
    </p>
  </div>
  <figure class="hero__photo"><Picture …/></figure>
</section>
```
- `data-hero-state` takes `final` (the default in HTML), `pending`, `typing` or `done`. CSS keys off it. The server always renders `final`, so content is complete without JavaScript.
- The `●` is `aria-hidden` and only the label is announced.

### Overlay typing (accessibility and zero layout shift)
- For each `[data-type]` element, `hero.ts` appends an `aria-hidden="true"` overlay positioned exactly over the real text (`position: absolute; inset: 0`, same font metrics). It holds one `<span>` per character of the final text.
- While animating, the real text gets `color: transparent`, so it is still laid out (reserving the exact final size, including wrapping on narrow screens) and still read by assistive technology. Untyped overlay characters have `visibility: hidden`.
- Typing toggles visibility per character, so line breaks never jump mid-word, because the overlay wraps exactly like the final text.
- **Typo:** the overlay character for the last word's first letter is temporarily rendered lowercase (`D`→`d`). VT323 is monospace, so the width is identical. "Erasing" hides characters again, and "retyping" shows them with the correct case.
- **Cursor:** a zero-width inline-block element moved after the last visible character, with the block drawn by an absolutely positioned `::after` (`--highlight`, the same `steps(1)` blink as the nav). Because it is zero-width, moving it never reflows text.
- **No typo case:** if the role's last word doesn't start with an uppercase letter, the typo steps are skipped. This keeps the behavior data-driven rather than tied to "Developer".
  - *Alternative:* typing into an empty element. Rejected: it causes layout shift and screen readers read partial text, which violates the "Semantic final content" and "No layout shift" requirements.

### Sequence and timing
- `hero.ts` runs one async timeline (`await sleep(ms)` steps) guarded by an `AbortController`:
  - prompt line fades in → name (each delay `70 + rand*90` ms) → cursor moves → role with lowercase typo (`45 + rand*55` ms) → 750 ms pause → erase the last word (40 ms each) → retype (`45 + rand*55` ms) → power-on → status.
- **Skip:** `pointerdown` and `keydown` listeners on `window` (capture, once) abort the timeline and call `finish()`, which sets every character visible with the correct case, the cursor at the end, the photo on and the status shown.
  - Skipping doesn't call `preventDefault`, so the click or key still does its normal job (e.g. Tab still moves focus, and a click on a nav link still navigates).
  - The listeners are removed when the sequence finishes, so later clicks don't affect the hero.
- **Once per load:** the script runs once at module evaluation, and nothing re-triggers it.
- **Start conditions:** the animation runs only if JavaScript runs, motion is allowed, and `location.hash` is empty or `#hero`. Otherwise the hero stays `final`.
- **Waiting for fonts:** before starting, the script awaits `document.fonts.load('1em VT323')` (capped at about 1 s), so overlay metrics match the real text.

### Pre-paint state (no flash of final content)
To avoid painting the final text and then hiding it, the inline head script (where `html.js` is set) also sets `html.hero-pending` when the start conditions above hold.
- CSS under `.hero-pending` hides the real hero text and darkens the photo from first paint.
- `hero.ts` then removes `hero-pending` and drives the states.
- If `hero.ts` fails to load, a 4 s timeout in the inline script removes `hero-pending`, so content is never stuck hidden.
- This is done in `BaseLayout`'s existing inline script, which only runs on pages that contain a hero (marked by a layout prop) so that the 404 page is unaffected.

### Photo
- **Schema:** the profile schema becomes `({ image }) => common.extend({ …, photo: image(), availability: z.object({ enabled: z.boolean(), label: localizedText }) })`, and `profile.yaml` has `photo: ./photo.png`.
  - `image()` resolves relative to the YAML file and fails the build with the file and field if the image is missing.
  - `localizeDeep` already passes non-localized objects through. The `ImageMetadata` object has `src`, `width`, `height` and `format`, none of which is `en`, so it is untouched.
- **Rendering:** `<Picture src={profile.photo} formats={['avif','webp']} widths={[240, 360, 480, 720]} sizes="(min-width: 48rem) 18rem, 60vw" alt=… loading="eager" />`. That gives explicit width and height (no layout shift) and modern formats. The alt text comes from the dictionary key `hero.photoAlt` (`"Portrait of {name}"`) with the name interpolated.
- **Look:** `filter: grayscale(1) contrast(1.05)` on the image. The scanlines are a `::after` overlay with `repeating-linear-gradient` using `color-mix(in srgb, var(--bg) 35%, transparent)` at 3px intervals, so it stays token-based.
- **Power-on:** a CSS keyframe on `[data-hero-state="done"] .hero__photo img`:
  - 0%: `opacity: 0`
  - 8%: `opacity: 1; filter: grayscale(1) brightness(2.2)`
  - 20%: `brightness(1.4)`
  - 100%: resting `grayscale(1)`
  - About 900 ms total, starting with a quick horizontal-line `scaleY(0.02)` → `1` squash, as on old CRTs.
  - The status badge has a transition delayed by the power-on duration. `animationend` isn't needed because the CSS chains the timing.
  - The global reduced-motion rule removes both, and the `final` state shows everything.
- **Placeholder:** a neutral, generic silhouette on a gray gradient, 720×900 PNG at `src/content/profile/photo.png`, generated once with `sharp` (already installed) from an inline SVG. Replacing it later is a one-file content change.
- **Layout:** the hero is a CSS grid. Narrow screens use one column with the photo first (`order: -1`). From `48rem` there are two columns: the text block, then the photo at `min(18rem, 35vw)`. The photo box has a fixed `aspect-ratio: 4 / 5` from first paint.

### Status
- The badge is rendered server-side only when `profile.availability.enabled`, with the label localized through `getEntries` (fallback warning included).
- It's hidden (`visibility: hidden`) until the `done` state plus the power-on delay, so its space is reserved and nothing shifts.
- The `●` uses `--text` and the label `--text-muted`. No `--highlight`, which is reserved for the cursor.

### i18n
- New dictionary keys:
  - `hero.prompt`: `~/portfolio $ ./hello`, `~/portfolio $ ./ola`, `~/portfolio $ ./hola`
  - `hero.photoAlt`
- `prompt.hero` (`whoami`) is removed. Navigation and `Section.astro` only use `prompt.*` for the other six sections, so the type `prompt.${SectionId}` narrows to exclude `hero`.
- The role uses `profile.role.en` directly (from the raw entry, not the localized one). The localized `role` stays for meta titles.

## Risks / Trade-offs

- [Overlay metrics drift from the real text, e.g. if a font fallback is active] → Mitigation: wait for VT323 to load before starting, and use the same element styles via a shared class. Verification compares overlay and real-text bounding boxes.
- [`image()` behavior with the YAML glob loader in Astro 7 is unverified in this repo] → Mitigation: the first content-model task verifies a build with `photo` plus the missing-file failure before anything depends on it.
- [Pre-paint hidden state sticks if the script fails] → Mitigation: the 4 s inline timeout clears `hero-pending`. Content is never hidden without JavaScript, because the class is only added by JavaScript.
- [Skip listener swallowing user intent] → Mitigation: no `preventDefault`; the first interaction both skips and performs its normal action.
- [Two blinking cursors (nav and hero) at once] → Accepted. They share the same style and they reinforce the terminal motif.
- [Reveal fade-up on the hero overlapping the typing start] → Mitigation: the prompt line fades in during the reveal, and the name typing starts after about 300 ms.

## Migration Plan

Same delivery as setup-base: work on `feat/hero` with a draft PR, one Conventional Commit and push per task, CI checks on the PR, and deployment on merge to `main`. Rollback: merge a revert PR.
