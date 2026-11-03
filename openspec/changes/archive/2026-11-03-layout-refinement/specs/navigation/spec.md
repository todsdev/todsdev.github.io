# Spec Delta

## ADDED Requirements

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
