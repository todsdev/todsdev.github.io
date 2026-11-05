# Spec Delta

## MODIFIED Requirements

### Requirement: Footer content
Every page SHALL end with a footer containing:
- "built with Astro + OpenSpec" ("feito com Astro + OpenSpec" / "hecho con Astro + OpenSpec"), linking to the profile's `sourceUrl` in a new tab with a localized accessible name;
- © with the build year and the profile name;
- the analytics line "cookieless stats by Umami" ("estatísticas sem cookies pelo Umami" / "estadísticas sin cookies con Umami"), linking to `https://umami.is/privacy` in a new tab with a localized accessible name ("Umami privacy policy" / "política de privacidade do Umami" / "política de privacidad de Umami", followed by the locale's new-tab note).

All footer text SHALL come from the dictionaries, the profile and the build; none is hardcoded. All text SHALL meet AA contrast.

#### Scenario: Portuguese footer
- **WHEN** the Portuguese page built on 2026-11-04 is shown
- **THEN** its footer reads "feito com Astro + OpenSpec", links to `https://github.com/todsdev/todsdev.github.io`, and shows "© 2026 Thiago Rodrigues"

#### Scenario: 404 page
- **WHEN** the 404 page is shown
- **THEN** it has the same footer

#### Scenario: Analytics line
- **WHEN** the Spanish page is shown
- **THEN** its footer has a line reading "estadísticas sin cookies con Umami" that links to `https://umami.is/privacy` with `target="_blank"` and `rel="noopener"`, and whose accessible name ends with "política de privacidad de Umami (se abre en una pestaña nueva)"
- **AND** Tab reaches it with a visible outline, and at 320px nothing overflows
