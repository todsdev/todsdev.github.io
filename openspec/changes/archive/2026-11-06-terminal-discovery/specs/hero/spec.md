## MODIFIED Requirements

### Requirement: Runs once per page load
The sequence SHALL run at most once per page load on its own. It SHALL NOT restart on scrolling, anchor navigation or resizing. If the page loads with a hash targeting a section other than the hero, the hero SHALL start in its final state. The terminal's `./hello` command is the only exception: it SHALL replay the whole sequence, including the photo's power-on, with the same timing, skip behavior and reduced-motion fallback as on load.

#### Scenario: Navigating back to the hero
- **WHEN** the sequence has finished and the visitor scrolls away and back, or activates the Home link
- **THEN** the hero stays in its final state

#### Scenario: Deep link to another section
- **WHEN** a visitor opens `/#skills`
- **THEN** the hero is already in its final state when scrolled to

#### Scenario: Replay from the terminal
- **WHEN** a visitor who opened `/#skills` (so the intro never played) runs `./hello` in the terminal with motion allowed
- **THEN** the hero plays the full sequence from the prompt line to the photo's power-on, and ends in the same final state as on load
