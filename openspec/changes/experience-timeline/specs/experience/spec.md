# Spec Delta

## Purpose

Defines the experience section: a timeline of the owner's positions anchored to the scroll thread, with localized periods, terminal-style tech tags and the OBS Olympic Games as a nested event list, all driven by the experience collection and accessible in every locale.

## ADDED Requirements

### Requirement: Experience section title
The experience section SHALL keep its translated terminal-prompt title and its `experience` id.

#### Scenario: Title per locale
- **WHEN** the section is rendered in English, Brazilian Portuguese or Spanish
- **THEN** its heading reads `$ ls ./experience`, `$ ls ./experiencia` or `$ ls ./experiencia` respectively

### Requirement: Timeline order
The section SHALL render every visible experience entry as an ordered list, newest first by start date, with the `order` field breaking ties.

#### Scenario: Seeded order
- **WHEN** the section is rendered with the seeded content
- **THEN** the entries appear as act digital (client: Globo), then Horus, then Olympic Broadcasting Services

#### Scenario: Hidden entry
- **WHEN** an experience entry has `hidden: true`
- **THEN** it doesn't appear in the timeline

### Requirement: Localized period
Each entry SHALL show its period as `<start> – <end>` using localized month abbreviations from the dictionaries and the year. Current positions (no `end`) SHALL end with the translated word for "present", the same word the about journey uses. Both ends SHALL be `<time>` elements with machine-readable `datetime` values (`YYYY-MM`).

#### Scenario: Closed period per locale
- **WHEN** the act digital entry (start 2025-01, end 2026-03) is rendered
- **THEN** its period reads `Jan 2025 – Mar 2026` in English, `jan 2025 – mar 2026` in Portuguese and `ene 2025 – mar 2026` in Spanish, with `datetime="2025-01"` and `datetime="2026-03"`

#### Scenario: Current position
- **WHEN** the OBS entry (start 2016-08, no end) is rendered
- **THEN** its period reads `Aug 2016 – present`, `ago 2016 – atual` or `ago 2016 – actualidad`, and only the start is a `<time>` element

### Requirement: Entry content
Each entry SHALL show the company, the role and location in the page's language (falling back to English), the description in the page's language as prose capped at the reading measure, and one tag per tech item. Entries without tech items show no tag list.

#### Scenario: Spanish entry
- **WHEN** the Horus entry is rendered in Spanish
- **THEN** it shows "Horus", the Spanish role, the location, the Spanish description (lines of at most about 65 characters) and the tags Kotlin, Java, Spring Boot, Python and REST APIs

#### Scenario: No tech items
- **WHEN** an entry's `tech` list is empty, like OBS
- **THEN** no tag list is rendered for it

### Requirement: Terminal-style tech tags
Tech tags SHALL be small, monospace, terminal-like tokens drawn from the black/gray design tokens: no colored pills and no `--highlight`. They SHALL wrap without horizontal overflow and stay readable (AA contrast) at 320px.

#### Scenario: Tags at 320px
- **WHEN** an entry with six tags is shown at 320px
- **THEN** the tags wrap onto as many lines as needed, none overflows the viewport, and their text contrast is at least 4.5:1

### Requirement: Primary timeline markers
Each entry SHALL have a primary marker on the scroll thread, vertically aligned with its period line, using the thread's marker contract (`data-thread-marker`, `data-reached`). A marker SHALL show its "passed" state once the thread's fill reaches it, and its "upcoming" state otherwise. Markers are decorative and hidden from assistive technology.

#### Scenario: Alignment
- **WHEN** the section is shown at 1280px or 320px in any locale
- **THEN** each primary marker is horizontally centered on the thread line and vertically centered within its entry's period line

#### Scenario: Passed while scrolling
- **WHEN** the visitor scrolls down past an entry
- **THEN** that entry's marker switches to "passed" as the fill reaches it, and switches back if the visitor scrolls up above it

#### Scenario: Reduced motion or no JavaScript
- **WHEN** the visitor prefers reduced motion or JavaScript is disabled
- **THEN** every marker shows its "passed" state

### Requirement: OBS events
An experience entry with `events` SHALL render them as a nested list of compact terminal-output lines under the entry, newest first by year (ties keep content order). Each line shows the year, the event name in the page's language and the role (`2024  Paris 2024 Olympic Games  ·  Quality Control Specialist`), with the year in its own aligned column at every width.

#### Scenario: Events per locale
- **WHEN** the OBS entry is rendered in Portuguese
- **THEN** it lists eight events from 2026 down to 2016, including `2024  Jogos Olímpicos de Paris 2024  ·  Quality Control Specialist`

#### Scenario: Aligned years at 320px
- **WHEN** the events are shown at 320px
- **THEN** every event name starts at the same x position after its year, and wrapped names align under the name, not the year

### Requirement: Secondary event ticks
Each event SHALL have a small secondary tick on the scroll thread, aligned with its line, visibly dimmer and smaller than the primary markers, following the same passed/upcoming behavior and the same reduced-motion and no-JS fallback. Ticks are decorative and hidden from assistive technology.

#### Scenario: Rhythm on the thread
- **WHEN** the OBS entry is on screen
- **THEN** eight ticks sit on the thread line, one per event line, each smaller and dimmer than a primary marker

### Requirement: Accessible and stable timeline
The timeline SHALL be an ordered list with nested event lists, all text SHALL meet AA contrast, and rendering, scrolling and marker state changes SHALL cause no layout shift.

#### Scenario: Markup
- **WHEN** the section markup is inspected
- **THEN** it has one `ol` of entries, a nested list of events under OBS, `<time datetime>` periods, and every marker and tick is `aria-hidden`

#### Scenario: No layout shift
- **WHEN** the page loads and the visitor scrolls through the section
- **THEN** no layout shift is recorded, and marker state changes don't move or resize any element
