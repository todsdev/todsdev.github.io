# skills Specification

## Purpose

Defines the skills section: the skills collection rendered as the numbered contents of a text file, with category headers, item lines, a decorative line-number gutter, and the semantic, copy-paste and layout guarantees underneath.

## Requirements

### Requirement: Skills section title
The skills section SHALL keep its terminal-prompt title, translated per locale: `$ cat skills.txt`, `$ cat habilidades.txt`, `$ cat habilidades.txt`.

#### Scenario: Spanish title
- **WHEN** the Spanish page is shown
- **THEN** the skills section heading reads `$ cat habilidades.txt`

### Requirement: Categories and items from the collection
The section SHALL render every visible skills entry as a category header line followed by one item line. Categories are in `order` ascending, and items keep their file order and their own casing. Category names come from the content in the page's language. All text SHALL come from the collection; the section SHALL NOT contain hardcoded category or item text.

#### Scenario: Order and translations
- **WHEN** the section is shown in English, Portuguese and Spanish
- **THEN** the headers read, in order:
  - "# Mobile", "# Architecture", "# Backend", "# Practices & tools";
  - "# Mobile", "# Arquitetura", "# Backend", "# Práticas e ferramentas";
  - "# Móvil", "# Arquitectura", "# Backend", "# Prácticas y herramientas".

#### Scenario: Item line
- **WHEN** the Architecture category is shown in any locale
- **THEN** its item line reads "MVVM · MVP · Clean Architecture · Modular Architecture · SOLID"

#### Scenario: Practices & tools items
- **WHEN** the section is shown in English, Portuguese and Spanish
- **THEN** "Spec-Driven Development (SDD)" and "OpenSpec" are items in the list under the Practices & tools header ("Practices & tools" / "Práticas e ferramentas" / "Prácticas y herramientas"), and not under any other category

#### Scenario: Hidden category
- **WHEN** a skills entry has `hidden: true`
- **THEN** neither its header nor its items are rendered, and line numbers stay continuous

### Requirement: Text-file presentation
The section SHALL look like `cat -n` output, in plain monospace text with no bordered tokens. Each category header is prefixed with `# `. Items are separated by ` · ` and wrap as whole units under the text column: an item that doesn't fit at the end of a line moves to the next line entirely. An item SHALL break internally only when, on its own, it is wider than the text column. A separator never starts a visual line.

#### Scenario: Plain text, not tokens
- **WHEN** the section is shown
- **THEN** headers read "# <category>", items are plain text joined by " · ", and no item has a border or background

#### Scenario: Whole items at desktop width
- **WHEN** the Mobile item line wraps at 1280px
- **THEN** "Video playback & streaming" sits entirely on one visual line, and no other item is split across lines

#### Scenario: Whole items on phones
- **WHEN** the section is shown at 375px or 320px in any locale
- **THEN** every item that fits within the text column on its own is on a single visual line, and nothing overflows the viewport

#### Scenario: Item wider than the column
- **WHEN** "Spec-Driven Development (SDD)" is shown at 320px, where its single-line width exceeds the text column
- **THEN** it may break internally, its continuation stays in the text column, and nothing overflows

### Requirement: Line-number gutter
A dim, right-aligned gutter SHALL number every logical line from 1 without gaps, including one blank numbered line between consecutive categories. A wrapped item line SHALL keep a single number on its first visual line.

#### Scenario: Numbering with the current content
- **WHEN** the section is shown at any width
- **THEN** the gutter shows 1 to 11 in order: header, items and blank lines for the first three categories (1–9), then the last header (10) and items (11)

#### Scenario: Wrapped item line
- **WHEN** the Mobile item line wraps onto three visual lines at 320px
- **THEN** only its first visual line has a number, and the next category's numbering continues from the following integer

### Requirement: Accessible structure
Underneath the visual file, each category SHALL be an `h3` (one level below the section heading) followed by a list with one item per skill. The line numbers, the `# ` prefix and the ` · ` separators SHALL NOT appear in the accessibility tree. Headings SHALL be named by the category alone, and list items by the skill alone.

#### Scenario: Accessibility tree
- **WHEN** the accessibility tree of the Portuguese section is inspected
- **THEN** it contains the heading "Arquitetura" followed by a list of 5 items whose names are "MVVM", "MVP", "Clean Architecture", "Modular Architecture" and "SOLID", and no line number, "#" or "·" text

### Requirement: Clean copy-paste
Selecting the whole file block and copying it SHALL give the file's text without line numbers. Each header (with its `# ` prefix) and each item line (with its ` · ` separators) comes out on its own line, in order, with at most one blank line between categories.

#### Scenario: Copy in English
- **WHEN** a visitor selects the skills block and copies it
- **THEN** the copied text contains the line "# Mobile" followed by the line "Kotlin · Jetpack Compose · Android SDK · Coroutines / Flow · Room · Retrofit · Hilt · Firebase · Android TV · Video playback & streaming", and no digit appears at the start of any line

### Requirement: Readable and stable at every width
All readable text (headers, `# ` prefix, items and separators) SHALL meet AA contrast. The line numbers are decorative and may use the dim token. At 320px the gutter SHALL stay narrow (at most 3 digit widths plus spacing), wrapped items SHALL align with the text column, not the gutter, and nothing SHALL overflow horizontally. Rendering and the section entrance SHALL cause no layout shift, and nothing in the section is animated beyond the shared entrance.

#### Scenario: 320px
- **WHEN** the section is shown at 320px in any locale
- **THEN** every wrapped continuation line starts at the same x as its item line, no element overflows the viewport, and text contrast is at least 4.5:1

#### Scenario: No layout shift
- **WHEN** the page loads and the visitor scrolls through the section
- **THEN** no layout shift is recorded and no element in the section moves or resizes
