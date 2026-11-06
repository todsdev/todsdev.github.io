## MODIFIED Requirements

### Requirement: Design tokens
The site SHALL define its colors as CSS custom properties. The default (gray) theme SHALL use these exact values: `--bg #0e0e0e`, `--surface #161616`, `--surface-2 #1f1f1f`, `--text #d6d6d6`, `--text-muted #8a8a8a`, `--text-dim #5c5c5c`, `--highlight #ffffff`. Each phosphor theme SHALL override only these seven tokens. All UI colors SHALL come from these tokens.

#### Scenario: Tokens available globally
- **WHEN** any page is rendered
- **THEN** all seven tokens are defined on the root element with the values above

#### Scenario: No off-palette UI colors
- **WHEN** the site's stylesheets are inspected
- **THEN** UI color declarations reference the tokens, with the language-switcher flag artwork as the only exception

#### Scenario: Theme overrides tokens only
- **WHEN** the green or amber theme is active
- **THEN** the only computed difference from the gray theme is the values of the seven tokens, and no layout, font or spacing changes

### Requirement: Contrast
All text and meaningful UI SHALL meet WCAG 2.1 AA contrast against their background in every theme: 4.5:1 for normal text, 3:1 for large text and UI components.

#### Scenario: Muted text on the lightest surface
- **WHEN** `--text-muted` text is placed on `--surface-2`
- **THEN** the contrast ratio is at least 4.5:1

#### Scenario: Every theme
- **WHEN** the gray, green and amber themes are each checked
- **THEN** `--text`, `--text-muted` and `--highlight` reach at least 4.5:1 on `--bg`, `--surface` and `--surface-2`, and `--text-dim` stays below 3:1 (decorative only)

## REMOVED Requirements

### Requirement: Single dark theme
**Reason**: The terminal's `theme` command adds opt-in phosphor color themes. The site stays dark-only.
**Migration**: Replaced by "Dark themes only". The gray theme stays the default, and there's still no light theme and no theme toggle in the page UI.

## ADDED Requirements

### Requirement: Dark themes only
The site SHALL render the dark gray theme by default, whatever the system color-scheme preference. It SHALL also offer two dark phosphor themes, green and amber, chosen only through the terminal's `theme` command. There SHALL be no light theme and no theme control in the page UI. A stored theme SHALL be applied before first paint on every page, including the 404 page.

#### Scenario: Light OS preference
- **WHEN** a visitor's system prefers a light color scheme
- **THEN** the site still renders the dark gray theme

#### Scenario: Stored theme
- **WHEN** a visitor who chose the green theme opens any page
- **THEN** the first paint is already green, with no flash of the gray theme

#### Scenario: Storage blocked
- **WHEN** browser storage is unavailable
- **THEN** the gray theme is shown, and `theme green` still applies for the current page
