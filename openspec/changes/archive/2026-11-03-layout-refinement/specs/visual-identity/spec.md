# Spec Delta

## ADDED Requirements

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
