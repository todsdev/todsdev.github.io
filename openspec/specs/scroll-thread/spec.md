# scroll-thread Specification

## Purpose

Defines the scroll thread: a thin vertical line on the left of the page that draws itself as the visitor scrolls, connecting all sections, with an extension point for later timeline markers.

## Requirements

### Requirement: Scroll-driven thread
The page SHALL display a thin vertical line on its left side, spanning from the first section to the last, whose drawn length grows and shrinks in proportion to the page's scroll progress (0% at the top, 100% at the bottom).

#### Scenario: Top of page
- **WHEN** the page is scrolled to the top
- **THEN** the thread's drawn portion has zero (or minimal) length

#### Scenario: Scrolling down and up
- **WHEN** the visitor scrolls to the middle of the page and then back up
- **THEN** the drawn portion grows to about half its full length and then shrinks again

#### Scenario: Bottom of page
- **WHEN** the page is scrolled to the bottom
- **THEN** the thread is fully drawn, connecting all sections

### Requirement: Thread is decorative
The thread SHALL be hidden from assistive technology, SHALL NOT intercept pointer input, and SHALL NOT overlap or obscure section content at any supported viewport width.

#### Scenario: Screen reader
- **WHEN** the page is read by a screen reader
- **THEN** the thread is not announced

#### Scenario: Narrow viewport
- **WHEN** the page is viewed at 320px wide
- **THEN** the thread does not cover any text or control

### Requirement: Static fallback
With reduced motion preferred or scripting unavailable, the thread SHALL be shown fully drawn and static.

#### Scenario: Reduced motion
- **WHEN** a visitor with `prefers-reduced-motion: reduce` scrolls the page
- **THEN** the thread is fully drawn and does not change length

### Requirement: Timeline marker extension point
The thread SHALL provide a slot where other sections can place markers at a position along the thread. Each marker SHALL be flagged as reached once the drawn line passes it, so later changes can style it.

#### Scenario: Marker placed by a section
- **WHEN** a section supplies a marker positioned alongside one of its items
- **THEN** the marker renders on the thread at that position

#### Scenario: Marker reached
- **WHEN** the drawn line extends past a marker's position
- **THEN** the marker is flagged as reached, and the flag is removed if the line retracts above it

#### Scenario: No markers supplied
- **WHEN** no section supplies markers, as in this change
- **THEN** the thread renders normally with an empty slot

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
