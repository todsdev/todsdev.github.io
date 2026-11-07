# Spec Delta

## Purpose

Defines the terminal-style page served for every unknown path: how it finds the visitor's language and path from the URL alone, what it shows, and how it behaves without JavaScript.

## ADDED Requirements

### Requirement: Terminal-style content
The not-found page SHALL show `bash: <path>: command not found` in English and lowercase in every locale, then one short translated line, then a `$ cd ~` link. The link's visible command stays in English and its accessible name adds the localized destination.

#### Scenario: Unknown path
- **WHEN** a visitor opens `/old-page`
- **THEN** the response status is 404 and the page shows `bash: /old-page: command not found`, the English line and `$ cd ~` linking to `/`

### Requirement: Language from the path
The page SHALL resolve its locale from the first segment of `location.pathname`: `pt-br` gives Portuguese, `es` gives Spanish, and anything else gives English. It SHALL use the path alone, never saved preferences or the browser language.

#### Scenario: Portuguese path
- **WHEN** a visitor opens `/pt-br/projetos/velho`
- **THEN** `<html lang>` is `pt-BR`, and the title, skip link, translated line and footer are in Portuguese
- **AND** `$ cd ~` links to `/pt-br/`, and the error line stays in English

#### Scenario: Spanish path
- **WHEN** a visitor opens `/es/viejo`
- **THEN** `<html lang>` is `es`, the translated content is in Spanish and `$ cd ~` links to `/es/`

#### Scenario: Similar prefix is not a locale
- **WHEN** a visitor opens `/espresso` or `/pt-bradley/x`
- **THEN** the page is in English and `$ cd ~` links to `/`

### Requirement: Same footer in the detected locale
The page SHALL show the same footer as the locale pages, without the terminal hint, in the detected locale, and exactly one footer SHALL be visible and exposed to assistive technology.

#### Scenario: Spanish footer
- **WHEN** a visitor opens `/es/viejo`
- **THEN** one footer is visible, with the Spanish credit, build date and analytics line, and no terminal hint

### Requirement: Safe path display
The requested path SHALL always be inserted as plain text, so markup in a URL can never render or run. A path longer than 80 characters SHALL be truncated with `…`, and the line SHALL wrap instead of overflowing.

#### Scenario: Markup in the path
- **WHEN** a visitor opens `/<img src=x onerror=alert(1)>`
- **THEN** the characters appear as text, no element is created from them and no script runs

#### Scenario: Very long path
- **WHEN** a visitor opens a path of 5000 characters on a 320px viewport
- **THEN** the shown path is at most 81 characters including `…`, and the page has no horizontal overflow

#### Scenario: Malformed encoding
- **WHEN** a visitor opens `/%E0%A4%A`
- **THEN** the page renders with the path as received and no script error

### Requirement: Without JavaScript
Without JavaScript, the page SHALL render in English with a generic path, and SHALL show only the English content.

#### Scenario: JavaScript disabled
- **WHEN** a visitor opens `/pt-br/velho` with JavaScript disabled
- **THEN** `<html lang>` is `en`, the page shows `bash: /this-page: command not found`, the English line and `$ cd ~` linking to `/`

### Requirement: No visible swap
The language and path SHALL be settled before first paint: no other locale's text is ever painted, and the page has no layout shift.

#### Scenario: Portuguese load
- **WHEN** `/pt-br/velho` loads with layout-shift entries observed
- **THEN** the cumulative layout shift is 0 and English text is never painted

### Requirement: Excluded from search
The page SHALL declare `<meta name="robots" content="noindex">`, and SHALL have no canonical, `hreflang`, Open Graph, Twitter or structured-data tags.

#### Scenario: Built 404 page
- **WHEN** `404.html` is inspected in the build
- **THEN** it has the `noindex` tag and none of the tags above

### Requirement: Page event unchanged
The page SHALL send the same `not_found` event, with the requested path, and its `locale` field SHALL be the detected locale.

#### Scenario: Portuguese path event
- **WHEN** a visitor opens `/pt-br/velho?x=1`
- **THEN** one `not_found` event is recorded with `path` `/pt-br/velho` and `locale` `pt-br`
