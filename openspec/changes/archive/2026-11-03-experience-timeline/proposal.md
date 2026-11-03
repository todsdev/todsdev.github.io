# Proposal

## Why

The experience section is still an empty placeholder under `$ ls ./experience`, even though the experience collection holds three real positions and the OBS entry carries eight Olympic Games. The scroll thread was built in setup-base with a marker extension point for exactly this. Turning experience into a timeline on that thread connects the page's main visual motif to its most important content.

## What Changes

- **Experience section** (title unchanged, translated): an ordered timeline of every visible experience entry, newest first by start date. With the seeded content that's act digital (client: Globo), then Horus, then Olympic Broadcasting Services. Each entry shows:
  - the period with localized month abbreviations (`Jan 2025 – Mar 2026` / `jan 2025 – mar 2026` / `ene 2025 – mar 2026`), with current positions ending in the translated "present" (the same wording as the about journey);
  - the company, role and location;
  - the description, capped at the reading measure;
  - tech tags as small terminal-like tokens in the black/gray palette.
- **Primary markers:** each entry is anchored to a marker on the scroll thread, aligned with the entry's period line. Markers switch to their "passed" state as the thread's fill reaches them, using the existing `data-reached` behavior. With reduced motion or without JavaScript, all markers show as passed.
- **OBS events (content model):** an optional `events` list on experience entries: `{ year: integer, name: translatable text, role: text }`.
  - The OBS data gets the approved pt-br and es names (table below). `role` stays in English, as it's a job title.
  - The events render under the OBS entry as compact terminal output, newest first, one line per event: `2024  Paris 2024 Olympic Games  ·  Quality Control Specialist`.
  - Each event gets a small secondary tick on the thread, dimmer than the primary markers.
- **Shared wording:** month abbreviations and "present" become shared dictionary keys (`time.*`). The about journey moves from `about.present` to `time.present` with no visible change.
- **Accessibility:** the timeline is an ordered list, periods use `<time datetime>`, events are a nested list, markers and ticks are `aria-hidden`, all text meets AA contrast, and tags stay readable at 320px.
- **Verification:** extended browser checks for order, localized periods, marker alignment at 1280px and 320px, "passed" states while scrolling, no layout shift, the reduced-motion and no-JS states, and events in all locales.

Decisions (approved in review):
- **Marker placement:** markers live inside each entry and are positioned horizontally onto the thread line, rather than in the thread's `markers` slot. The setup-base contract allows markers "in the slot or anywhere inside `<main>`", and `thread.ts` sets `data-reached` from each marker's real position. Slot markers use a percentage `top`, which can't follow entries as they reflow across widths and locales.
- **Months from the dictionaries:** month abbreviations come from the dictionaries rather than `Intl.DateTimeFormat`. That matches your examples exactly; `Intl` gives "jan. de 2025" in pt-BR and "sept" in es.
- **Ordering:** by start date, newest first. The `order` field is used only to break ties.
- **Event years on mobile:** they use a fixed 4-character column at every width, including 320px, rather than stacking above the text like the journey years. A 4-digit year is short enough to keep its column even on the narrowest screen. ("As in the about journey" is taken to mean an aligned year column.)

Decisions 1–4 above are approved. The OBS event names are set (approved in review):

| year | en | pt-br | es |
|---|---|---|---|
| 2026 | Dakar 2026 Youth Olympic Games | Jogos Olímpicos da Juventude de Dakar 2026 | Juegos Olímpicos de la Juventud de Dakar 2026 |
| 2026 | Milano Cortina 2026 Olympic Winter Games | Jogos Olímpicos de Inverno de Milão-Cortina 2026 | Juegos Olímpicos de Invierno de Milán-Cortina 2026 |
| 2024 | Paris 2024 Olympic Games | Jogos Olímpicos de Paris 2024 | Juegos Olímpicos de París 2024 |
| 2022 | Beijing 2022 Olympic and Paralympic Winter Games | Jogos Olímpicos e Paralímpicos de Inverno de Pequim 2022 | Juegos Olímpicos y Paralímpicos de Invierno de Pekín 2022 |
| 2021 | Tokyo 2020 Olympic and Paralympic Games | Jogos Olímpicos e Paralímpicos de Tóquio 2020 | Juegos Olímpicos y Paralímpicos de Tokio 2020 |
| 2018 | Buenos Aires 2018 Youth Olympic Games | Jogos Olímpicos da Juventude de Buenos Aires 2018 | Juegos Olímpicos de la Juventud de Buenos Aires 2018 |
| 2018 | PyeongChang 2018 Olympic Winter Games | Jogos Olímpicos de Inverno de PyeongChang 2018 | Juegos Olímpicos de Invierno de PyeongChang 2018 |
| 2016 | Rio 2016 Olympic and Paralympic Games | Jogos Olímpicos e Paralímpicos Rio 2016 | Juegos Olímpicos y Paralímpicos de Río 2016 |

## Capabilities

### New Capabilities
- `experience`: the experience timeline section: order, entry content, localized periods, tech tags, primary markers on the scroll thread, OBS events with secondary ticks, accessibility and fallbacks.

### Modified Capabilities
- `content-model`: adds the optional experience `events` field.

## Impact

- **Code:**
  - New `src/components/Experience.astro`, rendered inside `<Section id="experience">` in `Portfolio.astro`.
  - `src/lib/period.ts` (period formatting, unit-tested) with `src/lib/period.test.ts`.
  - `src/components/About.astro` uses `time.present`.
- **Content, config and docs:** `src/content.config.ts` (`events`), `src/content/experience/olympic-broadcasting-services.yaml` (pt-br/es names), `src/i18n/*.ts` (the `time` group and experience labels), and the README.
- **Dependencies:** none.
- **Out of scope:** projects, skills, courses, contact-footer, terminal easter egg, polish.
