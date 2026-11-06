# footer Specification

## Purpose

Defines the site footer shown on every page: the build credit with a link to the source repository, the copyright year, the localized last build date, and a reserved slot for the terminal hint.

## Requirements

### Requirement: Footer content
Every page SHALL end with a footer containing:
- "built with Astro + OpenSpec" ("feito com Astro + OpenSpec" / "hecho con Astro + OpenSpec"), linking to the profile's `sourceUrl` in a new tab with a localized accessible name;
- © with the build year and the profile name.

All footer text SHALL come from the dictionaries, the profile and the build; none is hardcoded. All text SHALL meet AA contrast.

#### Scenario: Portuguese footer
- **WHEN** the Portuguese page built on 2026-11-04 is shown
- **THEN** its footer reads "feito com Astro + OpenSpec", links to `https://github.com/todsdev/todsdev.github.io`, and shows "© 2026 Thiago Rodrigues"

#### Scenario: 404 page
- **WHEN** the 404 page is shown
- **THEN** it has the same footer

### Requirement: Analytics line
Every footer SHALL end with the analytics line "cookieless stats by Umami" ("estatísticas sem cookies pelo Umami" / "estadísticas sin cookies con Umami"), linking to `https://umami.is/privacy` in a new tab. Its accessible name SHALL add the localized destination ("Umami privacy policy" / "política de privacidade do Umami" / "política de privacidad de Umami") and the locale's new-tab note.

#### Scenario: Analytics line
- **WHEN** the Spanish page is shown
- **THEN** its footer has a line reading "estadísticas sin cookies con Umami" that links to `https://umami.is/privacy` with `target="_blank"` and `rel="noopener"`, and whose accessible name ends with "política de privacidad de Umami (se abre en una pestaña nueva)"
- **AND** Tab reaches it with a visible outline, and at 320px nothing overflows

### Requirement: Last build date
The footer SHALL show the last build date as day, short month (from the locale's month dictionary) and year, in a `<time>` element whose `datetime` is the full `YYYY-MM-DD` date.

#### Scenario: Spanish build date
- **WHEN** the Spanish page built on 2026-11-04 is shown
- **THEN** the footer shows "4 nov 2026" in a `<time datetime="2026-11-04">`

### Requirement: Terminal hint slot
The footer SHALL provide a named slot for the terminal hint, which the terminal change fills. While it's empty, the footer SHALL render nothing extra for it and reserve no space.

#### Scenario: Empty slot
- **WHEN** no hint is provided
- **THEN** the footer has no empty element or gap where the hint will go

### Requirement: Stable footer at every width
The footer SHALL wrap without horizontal overflow at 320px, and its link SHALL be reachable by keyboard with a visible focus indicator. It SHALL cause no layout shift.

#### Scenario: 320px
- **WHEN** the footer is shown at 320px
- **THEN** nothing overflows the viewport, and Tab reaches the repository link with a visible outline
