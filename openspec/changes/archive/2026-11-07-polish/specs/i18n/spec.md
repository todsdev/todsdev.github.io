# Spec Delta

## MODIFIED Requirements

### Requirement: Language switcher
The navigation SHALL include, on its right side and visible at every viewport width, one control per locale. Each shows a pixel-art flag (USA, Brazil, Spain) and its code (`EN`, `PT`, `ES`). Each accessible name SHALL start with the visible code, followed by the language name: `EN — English`, `PT — Português` and `ES — Español`, the same on every page.

#### Scenario: Switcher contents
- **WHEN** any page is rendered
- **THEN** the switcher shows the USA flag with `EN`, the Brazil flag with `PT` and the Spain flag with `ES`, with the accessible names `EN — English`, `PT — Português` and `ES — Español`

#### Scenario: Name starts with the visible text
- **WHEN** Lighthouse audits any locale page
- **THEN** `label-content-name-mismatch` passes, with no switcher control flagged

#### Scenario: Mobile visibility
- **WHEN** the page is viewed at 320px wide
- **THEN** all three switcher controls are visible without opening a menu

### Requirement: Language metadata
Each page SHALL declare its language on `<html lang>` (`en`, `pt-BR`, `es`). Each locale page SHALL link to all locale versions with `hreflang` alternates, including an `x-default` that points to English, using absolute URLs. The not-found page SHALL have no `hreflang` alternates, and its `<html lang>` SHALL follow the requested path.

#### Scenario: Portuguese page metadata
- **WHEN** the `/pt-br/` page is inspected
- **THEN** it has `<html lang="pt-BR">` and alternate links for `en`, `pt-BR`, `es` and `x-default` with absolute `https://todsdev.github.io/` URLs

#### Scenario: Not-found page
- **WHEN** a visitor opens `/es/viejo`
- **THEN** `<html lang>` is `es` and the page has no alternate links
