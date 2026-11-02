# Spec Delta

## MODIFIED Requirements

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
