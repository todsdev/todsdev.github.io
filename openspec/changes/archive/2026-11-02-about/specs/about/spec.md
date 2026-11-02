# Spec Delta

## Purpose

Defines the about section: the owner's summary, a terminal-style journey of how he got here, and a neofetch-style block of key facts, all driven by the content collections and presented accessibly in every locale.

## ADDED Requirements

### Requirement: About section title
The about section SHALL keep its translated terminal-prompt title (e.g. `$ cd ~/about`) and its `about` id, as defined for all sections.

#### Scenario: Title per locale
- **WHEN** the about section is rendered in English, Brazilian Portuguese or Spanish
- **THEN** its heading reads `$ cd ~/about`, `$ cd ~/sobre` or `$ cd ~/sobre-mi` respectively

### Requirement: Summary paragraph
The about section SHALL show the profile summary in the page's language as a readable body-text paragraph, falling back to English when a translation is missing.

#### Scenario: Portuguese summary
- **WHEN** the `/pt-br/` about section is rendered
- **THEN** it shows the profile's `pt-br` summary as a paragraph in the body font

### Requirement: Journey block
Below the summary, the about section SHALL render every profile journey step, in content order, styled as terminal output. Each step shows its years and its text in the page's language.

#### Scenario: Seeded journey
- **WHEN** the English about section is rendered with the seeded profile
- **THEN** it lists three steps in order, starting with `2016–2022` and "Biological Sciences at UFRJ", each showing its years followed by its text

#### Scenario: Translated step text
- **WHEN** the Spanish about section is rendered
- **THEN** each step's text is the Spanish version, and the years are unchanged

### Requirement: Open-ended year ranges
A journey `years` value ending with a dash (e.g. `2016–`) SHALL be rendered with the page language's word for "present". Other values are shown as written.

#### Scenario: Ongoing step per locale
- **WHEN** a step's years are `2023–`
- **THEN** it reads `2023–present` in English, `2023–atual` in Portuguese and `2023–actualidad` in Spanish

#### Scenario: Closed range
- **WHEN** a step's years are `2016–2022`
- **THEN** it reads `2016–2022` in every locale

### Requirement: Facts block
The about section SHALL show a key/value facts block in a neofetch style, with keys in a dim color and values in a bright color. It lists location (profile location in the page's language), languages (every visible language entry as name and proficiency, in content order), education (every visible education entry as degree and institution), and focus (profile focus). Keys are translated UI labels; values come from content in the page's language.

#### Scenario: English facts
- **WHEN** the English about section is rendered with the seeded content
- **THEN** the facts read: location "Rio de Janeiro, Brazil"; languages "Portuguese (Native) · English (Fluent) · Spanish (Basic)"; education "Bachelor's Degree in Biological Sciences · Universidade Federal do Rio de Janeiro (UFRJ)"; focus "Android · Kotlin · Jetpack Compose"

#### Scenario: Translated labels and values
- **WHEN** the Portuguese about section is rendered
- **THEN** the keys are the Portuguese labels, the location reads "Rio de Janeiro, Brasil", and the language names, proficiencies and degree are the `pt-br` values

#### Scenario: Spanish location
- **WHEN** the Spanish about section is rendered
- **THEN** the location reads "Rio de Janeiro, Brasil"

#### Scenario: Hidden entries
- **WHEN** a language entry has `hidden: true`
- **THEN** it does not appear in the facts block

### Requirement: Responsive layout
On wide viewports the summary and journey SHALL form the main column, with the facts block in a side column. On narrow viewports the section SHALL be a single column, with the facts block after the journey. Nothing overflows horizontally.

#### Scenario: Desktop
- **WHEN** the about section is shown at 1280px wide
- **THEN** the facts block sits beside the summary and journey

#### Scenario: Mobile
- **WHEN** the about section is shown at 320px wide
- **THEN** summary, journey and facts appear in that order in one column, without horizontal overflow

### Requirement: No hardcoded about text
All user-visible text in the about section SHALL come from the content collections (summary, journey, facts values) or the locale dictionaries (labels, headings, the word for "present").

#### Scenario: Changing content
- **WHEN** a journey step's text or the profile focus is edited in `profile.yaml`
- **THEN** the rebuilt about section shows the new text with no code change

### Requirement: Semantic and accessible markup
The facts block SHALL be a description list (`dl`/`dt`/`dd`), and the journey an ordered list. The journey and facts blocks SHALL have headings below the section's `h2`. All about text SHALL meet WCAG AA contrast, including the dim facts keys.

#### Scenario: Markup structure
- **WHEN** the about section's markup is inspected
- **THEN** the facts are a `dl` with one `dt`/`dd` pair per fact, the journey is an `ol` with one `li` per step, and both blocks have `h3` headings

#### Scenario: Key contrast
- **WHEN** the facts keys and values are checked against the section background
- **THEN** both have a contrast ratio of at least 4.5:1

### Requirement: Motion
The about section SHALL use the same entrance motion as the other sections, with no additional animation, and SHALL respect reduced motion like every section.

#### Scenario: No extra animation
- **WHEN** the about section has entered the viewport
- **THEN** no element inside it is animating
