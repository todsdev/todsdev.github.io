# Spec Delta

## ADDED Requirements

### Requirement: Lighthouse targets
The locale pages (`/`, `/pt-br/`, `/es/`) SHALL score 100 in Accessibility, Best Practices and SEO and at least 95 in Performance, on mobile and desktop, as the median of 3 Lighthouse runs against the local production build.

#### Scenario: Measured results
- **WHEN** Lighthouse runs against the production build for each page and form factor
- **THEN** each median meets its target, or the gap is reported to the owner with a proposed fix

## REMOVED Requirements

### Requirement: Not-found page
**Reason**: The placeholder is replaced by the terminal-style page.
**Migration**: See the `not-found-page` capability.
