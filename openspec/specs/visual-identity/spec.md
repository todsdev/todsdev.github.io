# visual-identity Specification

## Purpose

Defines the portfolio's look and feel: a single dark black/gray theme driven by design tokens, terminal-style section titles, self-hosted typography, subtle entrance motion and the accessibility baseline every page must meet.

## Requirements

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

### Requirement: Highlight reserved for emphasis
The `--highlight` color SHALL be used only for the active navigation link, the blinking cursor, and emphasis on hover or focus.

#### Scenario: Resting state
- **WHEN** a page is shown with no hover or focus
- **THEN** `--highlight` appears only on the active navigation link and its cursor

### Requirement: Dim token is decorative only
The `--text-dim` token (contrast below 3:1 on every surface) SHALL NOT be used for text or for UI controls that convey information. Only decorative elements such as dividers and the unfilled scroll-thread track may use it.

#### Scenario: Readable text
- **WHEN** any text on the site is inspected
- **THEN** its color is `--text`, `--text-muted` or `--highlight`, never `--text-dim`

### Requirement: Self-hosted typography
The site SHALL use VT323 for the hero text block (prompt line, name, role and status) and for section titles, and IBM Plex Mono for all other text. Both are served from the site's own origin, with fallback monospace fonts and non-blocking font loading.

#### Scenario: No third-party font requests
- **WHEN** a page loads
- **THEN** all font files are requested from the site's own origin and no request is made to a third-party font service

#### Scenario: Accented characters
- **WHEN** Portuguese or Spanish text with accented characters is rendered
- **THEN** it is displayed in the specified font without falling back for those glyphs

#### Scenario: Hero text block
- **WHEN** the hero is rendered in any locale
- **THEN** its prompt line, name, role and status badge are all rendered in VT323

### Requirement: Terminal-prompt section titles
Each section title SHALL be presented as a terminal prompt (for example `$ cd ~/about`, `$ ls ./experience`, `$ cat skills.txt`), with the command text coming from the active locale's dictionary.

#### Scenario: Title in English
- **WHEN** the about section is rendered in English
- **THEN** its heading reads as a terminal prompt such as `$ cd ~/about`

#### Scenario: Title translated
- **WHEN** the same section is rendered in another locale
- **THEN** the prompt text comes from that locale's dictionary

### Requirement: Section entrance motion
Sections SHALL enter with a subtle fade and small upward offset the first time they scroll into view. Content SHALL remain visible if scripting is unavailable.

#### Scenario: Section scrolls into view
- **WHEN** a section enters the viewport for the first time
- **THEN** it transitions from transparent and slightly offset to fully visible in place

#### Scenario: Scripting disabled
- **WHEN** the page is loaded with JavaScript disabled
- **THEN** all sections are fully visible without animation

### Requirement: Reduced motion
When the visitor prefers reduced motion, the site SHALL show no animations or smooth scrolling, render all content fully visible, show the scroll thread fully drawn and show the cursor without blinking.

#### Scenario: Reduced motion preference
- **WHEN** a visitor with `prefers-reduced-motion: reduce` loads and scrolls the page
- **THEN** no element animates, sections are visible immediately, anchor jumps are instant and the scroll thread is fully drawn

### Requirement: Contrast
All text and meaningful UI SHALL meet WCAG 2.1 AA contrast against their background in every theme: 4.5:1 for normal text, 3:1 for large text and UI components.

#### Scenario: Muted text on the lightest surface
- **WHEN** `--text-muted` text is placed on `--surface-2`
- **THEN** the contrast ratio is at least 4.5:1

#### Scenario: Every theme
- **WHEN** the gray, green and amber themes are each checked
- **THEN** `--text`, `--text-muted` and `--highlight` reach at least 4.5:1 on `--bg`, `--surface` and `--surface-2`, and `--text-dim` stays below 3:1 (decorative only)

### Requirement: Keyboard and focus accessibility
All interactive elements SHALL be reachable and operable by keyboard in a logical order, show a clearly visible focus indicator, and be built from semantic HTML landmarks and elements.

#### Scenario: Keyboard-only navigation
- **WHEN** a visitor tabs through the page
- **THEN** every link and control receives focus in reading order with a visible focus indicator, and none is skipped or trapped

#### Scenario: Semantic structure
- **WHEN** the page markup is inspected
- **THEN** it uses `header`, `nav`, `main` and `section` landmarks, with one `h1` and section headings in a correct hierarchy

### Requirement: Content width and reading measure
The shared content column SHALL be at most 60rem wide, and every section SHALL align to it. Prose paragraphs (the about summary, and experience and project descriptions where rendered) SHALL be capped at a reading measure of about 65 characters, so wider content doesn't produce longer lines.

#### Scenario: Sections align
- **WHEN** the page is viewed at 1280px, 1440px and 1920px
- **THEN** every section's content starts at the same left edge and stays within the same 60rem column as the hero

#### Scenario: Prose measure
- **WHEN** the about summary is rendered at 1280px or wider
- **THEN** its lines hold at most about 65 characters, even though the column is wider

### Requirement: Legible tilde in the title font
Wherever text is set in the title font (VT323), the `~` character SHALL render as a normal, legible tilde: vertically centred in the lowercase height, with the same advance width as the surrounding glyphs. The underlying text SHALL be unchanged, so copy-paste and screen readers get `~`.

#### Scenario: Hero prompt
- **WHEN** the hero prompt `~/portfolio $ ./hello` is rendered
- **THEN** its `~` is drawn from the substitute face (not VT323's raised glyph), sits around the middle of the lowercase letters, and the following characters keep their monospace positions

#### Scenario: Section titles
- **WHEN** a section title such as `$ cd ~/about` is rendered in any locale
- **THEN** its `~` uses the same substitute rendering

#### Scenario: Copying text
- **WHEN** a visitor copies the hero prompt
- **THEN** the copied text is exactly `~/portfolio $ ./hello`

### Requirement: No layout shift from font loading
The fonts used above the fold SHALL be preloaded. Each self-hosted font SHALL have a metric-matched fallback, so that swapping from the fallback to the web font changes no text dimensions. Font loading SHALL contribute no layout shift.

#### Scenario: Preloaded fonts
- **WHEN** any page's HTML is inspected
- **THEN** it preloads (`rel="preload" as="font" type="font/woff2" crossorigin`) the same woff2 files that the `@font-face` rules use for above-the-fold text, so no font is downloaded twice

#### Scenario: Repeated live loads
- **WHEN** the live home page is loaded repeatedly in each locale at desktop and mobile widths (at least 10 loads per combination, with the cache disabled)
- **THEN** every load records a cumulative layout shift of 0

#### Scenario: Late font
- **WHEN** a web font arrives after first paint
- **THEN** the swap doesn't move or resize the nav, the hero or any other content

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
