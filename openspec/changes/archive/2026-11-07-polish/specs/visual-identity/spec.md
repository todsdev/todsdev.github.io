# Spec Delta

## MODIFIED Requirements

### Requirement: Dim token is decorative only
The `--text-dim` token (contrast below 3:1 on every surface) SHALL NOT be used for text or for UI controls that convey information. Decorative elements such as dividers and the unfilled scroll-thread track may use it. It MAY also color purely decorative text that is hidden from assistive technology, either with `aria-hidden="true"` or, for CSS-generated content that has no element to carry that attribute, with empty alternative text (`content: <value> / ""`).

#### Scenario: Readable text
- **WHEN** any text exposed to assistive technology is inspected
- **THEN** its color is `--text`, `--text-muted` or `--highlight`, never `--text-dim`

#### Scenario: Decorative line numbers
- **WHEN** the Skills line numbers are inspected
- **THEN** they are colored `--text-dim`, are generated content with empty alternative text, and are absent from the accessibility tree

### Requirement: Contrast
All text and meaningful UI SHALL meet WCAG 2.1 AA contrast against their background in every theme: 4.5:1 for normal text, 3:1 for large text and UI components. The only exception is decorative text allowed by the dim-token requirement.

#### Scenario: Muted text on the lightest surface
- **WHEN** `--text-muted` text is placed on `--surface-2`
- **THEN** the contrast ratio is at least 4.5:1

#### Scenario: Every theme
- **WHEN** the gray, green and amber themes are each checked
- **THEN** `--text`, `--text-muted` and `--highlight` reach at least 4.5:1 on `--bg`, `--surface` and `--surface-2`, and `--text-dim` stays below 3:1 (decorative only)

#### Scenario: Every low-contrast text is hidden
- **WHEN** all text below 4.5:1 is listed, in every theme and including pseudo-elements
- **THEN** every entry is absent from the accessibility tree
