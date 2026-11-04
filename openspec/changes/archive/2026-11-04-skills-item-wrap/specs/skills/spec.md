## MODIFIED Requirements

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
