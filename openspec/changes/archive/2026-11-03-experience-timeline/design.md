# Design

## Context

- **Experience section today:** a placeholder `<Section id="experience">` in `Portfolio.astro` (the about section shows the pattern: `<Section id="about"><About /></Section>`).
- **Experience schema:** `company`, localized `role`, `location`, `start`/`end` (`z.coerce.date`, UTC midnight), sentence-case `description`, and `tech[]`. The OBS YAML already holds an `events` list (English only), currently stripped by the schema.
- **Scroll thread:** `ScrollThread.astro` sits inside `main` at `left: calc(var(--thread-gutter) / 2)`, and `main` has `padding-left: var(--thread-gutter)` (2.5rem, or 0.75rem below 40rem). `thread.ts` toggles `data-reached` on every `main [data-thread-marker]` whose vertical center is at or above the drawn end. Under reduced motion it draws the thread fully, so every marker is reached. Without JS no marker gets `data-reached`.
- **Existing wording:** the about journey uses `about.present`, and its years use a hanging-indent column on wide screens and stack on narrow ones.

## Goals / Non-Goals

**Goals:**
- Markers that stay aligned with their entries at every width and locale with no extra JS: they're laid out with the entry and positioned onto the thread line with CSS.
- Pure, unit-tested period formatting, following the `localize.ts` pattern (no runtime imports, `node --test`).

**Non-Goals:**
- Changing `thread.ts` or the thread's look. Only marker elements and their styles are added.
- Projects, skills and the later sections.

## Decisions

### Markup (`Experience.astro`)
```html
<ol class="xp" role="list">
  <li class="xp__entry">
    <p class="xp__period">
      <span class="xp__marker" data-thread-marker aria-hidden="true"></span>
      <time datetime="2025-01">Jan 2025</time> – <time datetime="2026-03">Mar 2026</time>
    </p>
    <h3 class="xp__company">act digital (client: Globo)</h3>
    <p class="xp__meta">Android Developer · Rio de Janeiro, Brazil</p>
    <p class="xp__desc">…</p>
    <ul class="xp__tags" role="list"><li>Kotlin</li>…</ul>
    <ol class="xp__events" role="list">          <!-- only when events exist -->
      <li class="xp__event">
        <span class="xp__tick" data-thread-marker aria-hidden="true"></span>
        <span class="xp__year">2024</span><span class="xp__event-text">Paris 2024 Olympic Games · Quality Control Specialist</span>
      </li>
    </ol>
  </li>
</ol>
```
- `h3` under the section's `h2` keeps the heading outline consistent with about.
- **Ordering:** `getEntries("experience", locale)` (hidden filtered, localized), then sorted by `start` descending, with `order` breaking ties. Events are sorted by `year` descending, which is stable, so ties keep content order.

### Marker placement
- Each marker is absolutely positioned relative to its `.xp__entry` (`position: relative`).
- Horizontally, the entry's left edge is `main`'s content edge, so the thread line is at `-var(--thread-gutter) / 2` from it: `left: calc(var(--thread-gutter) / -2); translate: -50% 0`.
- Vertically, the marker is centered on the period line: `top: calc(var(--period-line) / 2)` with `translate: -50% -50%`. Ticks are centered on their own event line.
- This is laid out with the content, so it reflows with wrapping and locales automatically. `thread.ts` already measures each marker's real box.
- The README marker contract ("in the slot or anywhere inside `<main>`") already covers this.
  - *Alternative:* the thread's `markers` slot with a percentage `top`. Rejected: it can't follow content that reflows.
- **Sizes:** primary markers are a 9px square in the pixel style. Ticks are 5px × 1px horizontal dashes. Both fit inside the narrow gutter (12px) without touching content.

### Marker states (tokens only, no `--highlight`)
- **Default (no JS):** passed, meaning a filled `--text-muted` primary and a `--text-muted` tick at 70% opacity.
- **Upcoming (JS on, not reached):** `.js [data-thread-marker]:not([data-reached])`. The primary becomes `--bg` with a 1px `--text-dim` border, and the tick becomes `--text-dim`. Upcoming markers are decorative, so `--text-dim` is allowed.
- **Reduced motion:** `thread.ts` draws the thread fully, so every marker is reached and passed. A CSS reduced-motion rule also forces the passed look as a safeguard.
- **No layout shift:** state changes alter only colors and borders. The border is always present (transparent when passed), so the box never resizes.

### Period formatting (`src/lib/period.ts`)
- `formatPeriod(start, end, months, present)` returns `{ start: { text, datetime }, end: { text, datetime } | { text: present } }`, using `getUTCMonth()`/`getUTCFullYear()` so time zones never shift a month.
- **Months:** 12 abbreviations per locale in the dictionaries (`time.months`):
  - en: Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
  - pt-br: jan fev mar abr mai jun jul ago set out nov dez
  - es: ene feb mar abr may jun jul ago sep oct nov dic
- **Present:** `time.present` (present / atual / actualidad), moved from `about.present`. About is updated, and its output is unchanged (verified).
- **Tests:** `src/lib/period.test.ts` covers closed and open periods, the `datetime` format, time-zone safety and all three locales' samples.

### Styling
- **Entries:** separated by `--space-5`. Each period line is muted in IBM Plex Mono, the company is an `h3` in the body font (VT323 stays reserved for section titles), and the meta line is muted. The description is capped at `max-width: var(--measure)`.
- **Tags:** `font-size: 0.75rem`, `padding: 0 0.5ch`, a 1px `--surface-2` border, `--text-muted` text, square corners and `flex-wrap`. They look like terminal tokens with no colored fills.
- **Events:** font-size 0.875rem, with a hanging indent (`padding-left: calc(4 × 0.6em + 2 × 0.6em)`, plus a matching negative `text-indent`). The 4-digit year is an inline-block of exactly `2.4em`, followed by 2 spaces of 0.6em. That's the same em-based technique as the journey (CSS `ch` doesn't match IBM Plex Mono's advance), and it's used at every width.

### Dictionaries
New keys: `time.months` (an array of 12 strings) and `time.present`. Typed `Dictionary` checks guarantee every locale has all 12 months. `experience` needs no other labels: content provides the text, and the separators (` – `, ` · `) are punctuation.

## Risks / Trade-offs

- [Marker x depends on `--thread-gutter` and the entry starting at `main`'s content edge] → True for all sections today. The verification asserts that the marker center equals the thread x within 1px at 1280px and 320px in all locales.
- [Dictionary arrays (months) are a new shape in `Dictionary`] → The `Widen` type maps string arrays to `string[]`, which is checked by `astro check`. A missing month count is caught by the unit test.

## Migration Plan

Same delivery as before: `feat/experience-timeline` with a draft PR and one commit per task, then archive, merge with a merge commit, confirm the deploy, run the live checks and delete the branch.
