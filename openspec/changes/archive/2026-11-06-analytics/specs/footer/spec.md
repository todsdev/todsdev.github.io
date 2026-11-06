# Spec Delta

## ADDED Requirements

### Requirement: Analytics line
Every footer SHALL end with the analytics line "cookieless stats by Umami" ("estatísticas sem cookies pelo Umami" / "estadísticas sin cookies con Umami"), linking to `https://umami.is/privacy` in a new tab. Its accessible name SHALL add the localized destination ("Umami privacy policy" / "política de privacidade do Umami" / "política de privacidad de Umami") and the locale's new-tab note.

#### Scenario: Analytics line
- **WHEN** the Spanish page is shown
- **THEN** its footer has a line reading "estadísticas sin cookies con Umami" that links to `https://umami.is/privacy` with `target="_blank"` and `rel="noopener"`, and whose accessible name ends with "política de privacidad de Umami (se abre en una pestaña nueva)"
- **AND** Tab reaches it with a visible outline, and at 320px nothing overflows
