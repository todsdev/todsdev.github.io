# Spec Delta

## ADDED Requirements

### Requirement: Stable active indicator
The space for the active-link indicator (the `> ` prefix and the cursor) SHALL be reserved on every nav link, so that changing which link is active, on load, while scrolling or after an anchor jump, changes only the indicator's visibility and the link color, never the size or position of any nav element. This SHALL hold in every locale and at every supported width, including 320px, where the longest active label still fits fully inside the link strip.

#### Scenario: Scrolling through all sections
- **WHEN** a visitor scrolls from the top of the page through every section to the bottom, in any locale, at 1280px or 320px
- **THEN** the active link changes section by section, and no nav link, list or switcher element changes position or size

#### Scenario: Initial activation on load
- **WHEN** the page loads and the nav script marks the initial active link
- **THEN** every nav element has the same position and size as before the script ran

#### Scenario: No load-time layout shift from the nav
- **WHEN** the live home page is loaded 10 times per locale at 1280px and 375px with the cache disabled
- **THEN** every load records a cumulative layout shift of 0

#### Scenario: Inactive links
- **WHEN** a link is not active
- **THEN** its prefix and cursor are not visible and are not announced by assistive technology
