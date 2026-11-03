# hero Specification

## Purpose

Defines the hero section: the terminal-style typed introduction of the owner's name and role, the CRT-style photo, the availability status, and how they stay accessible, skippable and stable across devices, preferences and locales.

## Requirements

### Requirement: Hero content
The hero SHALL show a dim terminal prompt line, the owner's name, the role on a second line prefixed with `> `, a photo, and, when enabled, an availability status. The name and photo come from the profile content.

#### Scenario: Final hero content
- **WHEN** the English home page is rendered and the sequence has finished (or is skipped or disabled)
- **THEN** the hero shows `~/portfolio $ ./hello` in `--text-muted`, the name "Thiago Rodrigues", the line `> Android Developer`, the profile photo, and the status badge if it is enabled

### Requirement: Semantic final content
The final hero text SHALL exist in the HTML as real content: the name in the page's only `h1`, and the role and status as text. The animated layer SHALL be hidden from assistive technology, so screen readers announce each text once, without typing artifacts.

#### Scenario: Screen reader
- **WHEN** a screen reader reads the hero at any moment during or after the sequence
- **THEN** it announces the name as a level-1 heading and the role "Android Developer" once, without typo, partial or duplicated text

#### Scenario: No JavaScript markup
- **WHEN** the built HTML is inspected
- **THEN** the `h1` contains the full name and the role text is present in full

### Requirement: Role stays in English
The typed and final role text SHALL be the English job title from the profile (`Android Developer`) in every locale. The prompt line and the status label SHALL be translated.

#### Scenario: Spanish page
- **WHEN** the `/es/` hero is shown
- **THEN** the role reads `Android Developer`, while the prompt line and the status label are in Spanish

### Requirement: Typing sequence
On page load, the hero SHALL animate in this order:
1. The prompt line appears.
2. The name is typed character by character at irregular intervals of 70–160 ms.
3. The second line types the role with its last word in lowercase (`> Android developer`) at 45–100 ms per character.
4. A pause of about 750 ms.
5. That last word is erased at about 40 ms per character.
6. The word is retyped correctly (`Developer`) at 45–100 ms per character.

#### Scenario: Full sequence
- **WHEN** a visitor loads the home page with motion allowed and JavaScript enabled
- **THEN** the prompt line appears, the name is typed with irregular per-character delays between 70 and 160 ms, and `> Android developer` is typed with delays between 45 and 100 ms
- **AND** after about a 750 ms pause, `developer` is erased one character at a time at about 40 ms each, and `Developer` is typed, ending on `> Android Developer`

### Requirement: Typing cursor
A blinking block cursor in `--highlight` SHALL sit at the end of the line being typed. It moves to the second line when the role starts and keeps blinking at the end of the role after the sequence ends. Under reduced motion the cursor does not blink.

#### Scenario: Cursor follows typing
- **WHEN** the name has finished and the role starts typing
- **THEN** the cursor moves from the end of the name to the end of the second line

#### Scenario: After the sequence
- **WHEN** the sequence has finished
- **THEN** the cursor remains after `Developer` and keeps blinking

### Requirement: Skip to final state
Any click or key press during the sequence SHALL immediately show the hero's final state: full text, photo powered on, and status shown if enabled.

#### Scenario: Key press mid-sequence
- **WHEN** a visitor presses any key while the name is still being typed
- **THEN** the full name, `> Android Developer`, the visible photo and the status (if enabled) are shown at once, and no further animation steps run

#### Scenario: Click after the sequence
- **WHEN** a visitor clicks after the sequence has finished
- **THEN** nothing in the hero changes

### Requirement: Runs once per page load
The sequence SHALL run at most once per page load. It SHALL NOT restart on scrolling, anchor navigation or resizing. If the page loads with a hash targeting a section other than the hero, the hero SHALL start in its final state.

#### Scenario: Navigating back to the hero
- **WHEN** the sequence has finished and the visitor scrolls away and back, or activates the Home link
- **THEN** the hero stays in its final state

#### Scenario: Deep link to another section
- **WHEN** a visitor opens `/#skills`
- **THEN** the hero is already in its final state when scrolled to

### Requirement: Photo presentation
The hero SHALL show the profile photo next to the title on wide viewports and above it on narrow viewports, rendered in grayscale with a subtle scanline overlay, optimized at build time into responsive modern formats, with translated alternative text that names the owner.

#### Scenario: Desktop layout
- **WHEN** the hero is shown at 1280px wide
- **THEN** the photo is beside the title block

#### Scenario: Mobile layout
- **WHEN** the hero is shown at 320px wide
- **THEN** the photo is above the title block and does not overflow the viewport

#### Scenario: Optimized image
- **WHEN** the built HTML is inspected
- **THEN** the photo is served from build-generated files in modern formats with explicit width and height, and its `alt` names the owner in the page's language

### Requirement: CRT power-on
After typing finishes, the photo SHALL "power on" like an old CRT: a brief brightness flash followed by a fade-in to its resting grayscale state. Until then its slot SHALL be reserved but dark.

#### Scenario: Power-on after typing
- **WHEN** the final character `r` of `Developer` has been typed
- **THEN** the photo flashes briefly bright and then fades in to its grayscale resting state

### Requirement: Availability status
When availability is enabled in the profile, a status badge `● <label>` SHALL appear next to the role, after the photo has powered on. The label comes from the profile content in the page's language, falling back to English. When availability is disabled, no badge SHALL be rendered.

#### Scenario: Enabled
- **WHEN** availability is enabled with label "open to work" and the photo has powered on
- **THEN** `● open to work` appears next to the role

#### Scenario: Translated label
- **WHEN** the `/pt-br/` hero is shown and a Portuguese label is provided
- **THEN** the badge shows the Portuguese label

#### Scenario: Disabled
- **WHEN** availability is disabled in the profile
- **THEN** no status badge is rendered in any locale, with no code change

### Requirement: Static fallback
Without JavaScript, or when the visitor prefers reduced motion, the hero SHALL show its final state immediately, with no typing, flash or fade, the photo visible and the status shown if enabled.

#### Scenario: JavaScript disabled
- **WHEN** the page loads with JavaScript disabled
- **THEN** the prompt line, name, `> Android Developer`, photo and status (if enabled) are all visible at once

#### Scenario: Reduced motion
- **WHEN** a visitor with `prefers-reduced-motion: reduce` loads the page
- **THEN** the final state is shown immediately and nothing in the hero animates

### Requirement: No layout shift
Typing, erasing, the photo power-on and the status reveal SHALL NOT move or resize surrounding content. The final lines' space and the photo slot are reserved from the first paint.

#### Scenario: Layout stability during the sequence
- **WHEN** the full sequence runs at 1280px and at 320px
- **THEN** the hero's box and the position of content below it do not change, and the hero contributes no layout shift

### Requirement: Name on one line when it fits
At viewports 1280px and wider, the hero name SHALL render on a single line at its full size (the existing maximum), beside the photo. On narrower viewports where the full-size name doesn't fit its column, its size SHALL scale down fluidly to keep it on one line, down to a minimum readable size (about 2.5rem). It SHALL wrap only when the column is too narrow even at that minimum. The photo's size range and the hero's zero layout shift are unchanged.

#### Scenario: Wide viewport
- **WHEN** the hero is shown at 1280px or wider in any locale
- **THEN** "Thiago Rodrigues" occupies exactly one line at the full name size (5.5rem)

#### Scenario: Fallback sizing
- **WHEN** the hero is shown at a width where the full-size name doesn't fit its column (e.g. 768px)
- **THEN** the name is shown smaller, on one line, without horizontal overflow

#### Scenario: Narrow viewport
- **WHEN** the column is too narrow to fit the name on one line even at the minimum size
- **THEN** the name wraps onto additional lines and stays fully readable, without horizontal overflow

#### Scenario: Typing reserves the final layout
- **WHEN** the typing sequence runs, whether the name fits on one line or wraps
- **THEN** the animated name occupies exactly the final text's lines and width at every step, and the hero contributes no layout shift
