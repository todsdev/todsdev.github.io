# Spec Delta

## ADDED Requirements

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
