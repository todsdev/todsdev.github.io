# Spec Delta

## ADDED Requirements

### Requirement: Subtle unfilled track
The unfilled part of the thread SHALL be subtle enough not to read as a sidebar: its contrast against the page background SHALL be between 1.3:1 and 2:1, so the line's path is still visible. It is derived from the design tokens. The filled part keeps its current color and behavior.

#### Scenario: Track contrast
- **WHEN** the unfilled track and the page background are measured
- **THEN** their contrast ratio is at least 1.3:1 and at most 2:1

#### Scenario: Fill unchanged
- **WHEN** the page is scrolled
- **THEN** the drawn portion keeps its current color (`--text-muted`) and grows with scroll progress as before

#### Scenario: Static fallback unchanged
- **WHEN** JavaScript is disabled or reduced motion is preferred
- **THEN** the thread is still fully drawn in the fill color
