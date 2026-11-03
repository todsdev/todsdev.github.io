# navigation Specification

## Purpose

Defines the one-page structure and how visitors move through it: the ordered sections, the fixed top navigation with its active-section indicator, smooth scrolling and hash-addressable sections.

## Requirements

### Requirement: Ordered one-page sections
The home page of every locale SHALL contain these sections in order: hero, about, experience, projects, skills, courses, contact. Each SHALL have a stable, locale-independent id equal to its name.

#### Scenario: Section order and ids
- **WHEN** the home page of any locale is rendered
- **THEN** it contains sections with ids `hero`, `about`, `experience`, `projects`, `skills`, `courses`, `contact`, in that order

### Requirement: Placeholder sections
Until their content changes land, each section SHALL render as an empty placeholder that still shows its terminal-prompt title.

#### Scenario: Placeholder rendering
- **WHEN** the experience section is rendered in this change
- **THEN** it shows its translated terminal-prompt title and no other content

### Requirement: Fixed top navigation
The site SHALL show a navigation bar fixed to the top of the viewport, with one link per section (in section order) and the language switcher on its right side. Navigation SHALL stay usable on narrow screens.

#### Scenario: Scrolling the page
- **WHEN** a visitor scrolls anywhere on the page
- **THEN** the navigation bar stays visible at the top

#### Scenario: Narrow viewport
- **WHEN** the page is viewed at 320px wide
- **THEN** every section link is reachable without breaking the layout and the language switcher remains visible

#### Scenario: Anchored section not hidden
- **WHEN** a visitor navigates to a section
- **THEN** the section's title is not covered by the fixed navigation bar

### Requirement: Active section indicator
The link for the section currently in view SHALL be marked with a `> ` prefix, a blinking block cursor and the highlight color, and SHALL be exposed to assistive technology as the current location. Exactly one link is active at a time.

#### Scenario: Scrolling into a section
- **WHEN** the about section becomes the section in view
- **THEN** the about link shows `> ` and the blinking cursor and is marked as the current location, and no other link is

#### Scenario: Top of the page
- **WHEN** the page is scrolled to the very top
- **THEN** the hero link is active

### Requirement: Smooth anchor scrolling
Activating a navigation link SHALL scroll smoothly to its section, except under reduced motion, where the jump is instant.

#### Scenario: Clicking a link
- **WHEN** a visitor activates the projects link
- **THEN** the page scrolls smoothly to the projects section and keyboard focus can continue from there

### Requirement: Hash-addressable sections
Each section SHALL be reachable by URL hash, and the URL SHALL reflect the section chosen through navigation.

#### Scenario: Deep link
- **WHEN** a visitor opens `/#skills` or `/es/#skills`
- **THEN** the page loads scrolled to the skills section with the skills link active

#### Scenario: Navigating updates the hash
- **WHEN** a visitor activates the courses link
- **THEN** the URL hash becomes `#courses`

### Requirement: Active label readable at the narrowest width
At the narrowest supported width (320px), the active navigation link, including its `> ` prefix and cursor, SHALL fit fully inside the visible link strip in every locale, while the language switcher stays visible with its codes and every link stays reachable by keyboard and by scrolling the strip.

#### Scenario: Longest active labels at 320px
- **WHEN** the page is viewed at 320px and the active link is Experience (EN), Experiência or Habilidades (PT), or Experiencia, Proyectos or Habilidades (ES)
- **THEN** the whole active label, prefix and cursor are visible inside the strip without clipping

#### Scenario: Keyboard reachability
- **WHEN** a keyboard user tabs through the nav at 320px
- **THEN** every section link and every language control receives focus and is scrolled fully into view

#### Scenario: Wider screens unaffected
- **WHEN** the page is viewed at 360px or wider
- **THEN** the nav keeps its current spacing and label size
