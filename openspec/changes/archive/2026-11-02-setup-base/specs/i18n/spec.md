# Spec Delta

## Purpose

Defines how the site is offered in English, Brazilian Portuguese and Spanish: locale URLs, dictionary-driven UI text, the language switcher, preference persistence and language metadata for browsers and search engines.

## ADDED Requirements

### Requirement: Locale routes
The site SHALL be available in English at `/` (the default, with no prefix), Brazilian Portuguese at `/pt-br/` and Spanish at `/es/`. Each locale SHALL serve the full one-page structure.

#### Scenario: Locale home pages
- **WHEN** a visitor requests `/`, `/pt-br/` or `/es/`
- **THEN** the home page is served in English, Brazilian Portuguese or Spanish respectively

#### Scenario: No English prefix
- **WHEN** the built output is inspected
- **THEN** English is served from the root, with no `/en/` route

### Requirement: Dictionary-driven UI text
All UI strings (navigation, section titles, labels, aria-labels, the 404 page) SHALL come from per-locale dictionaries, with no user-visible text hardcoded in templates. Every locale SHALL define every key, or the type check fails.

#### Scenario: Missing dictionary key
- **WHEN** a key exists in the English dictionary but not in the Spanish one
- **THEN** the type check exits non-zero and names the missing key

#### Scenario: Rendering a locale
- **WHEN** the Spanish page is rendered
- **THEN** all navigation labels and section titles appear in Spanish

### Requirement: Language switcher
The navigation SHALL include, on its right side and visible at every viewport width, one control per locale. Each shows a pixel-art flag (USA, Brazil, Spain), its code (`EN`, `PT`, `ES`) and an accessible name with the language name.

#### Scenario: Switcher contents
- **WHEN** any page is rendered
- **THEN** the switcher shows the USA flag with `EN`, the Brazil flag with `PT` and the Spain flag with `ES`, each with an accessible name such as "English", "Português (Brasil)" or "Español"

#### Scenario: Mobile visibility
- **WHEN** the page is viewed at 320px wide
- **THEN** all three switcher controls are visible without opening a menu

### Requirement: Flag states
Inactive flags SHALL render in grayscale and the active locale's flag in full color. Hovering or focusing an inactive flag SHALL preview its color. The active control SHALL be marked as current for assistive technology.

#### Scenario: Viewing the Portuguese page
- **WHEN** the `/pt-br/` page is shown
- **THEN** the Brazil flag is in color and marked current, and the USA and Spain flags are grayscale

#### Scenario: Hover or focus preview
- **WHEN** a visitor hovers over or focuses the Spain flag while on English
- **THEN** the Spain flag shows in color until hover or focus ends

### Requirement: Switching keeps the section
Switching language SHALL open the equivalent page in the chosen locale with the current section hash preserved.

#### Scenario: Switch from a section
- **WHEN** a visitor viewing `/#projects` selects Spanish
- **THEN** the browser navigates to `/es/#projects` and shows the projects section

#### Scenario: Scripting disabled
- **WHEN** a visitor without JavaScript selects a language
- **THEN** they reach that locale's home page

### Requirement: Persisted language choice
A language chosen through the switcher SHALL be remembered in the browser. When a returning visitor opens the unprefixed root `/` with a stored non-English choice, they SHALL be sent to that locale with the hash preserved. Explicit locale URLs SHALL never be redirected.

#### Scenario: Returning visitor
- **WHEN** a visitor who previously chose Portuguese opens `/#contact`
- **THEN** they are taken to `/pt-br/#contact`

#### Scenario: No flash of English content
- **WHEN** a visitor who previously chose Portuguese opens `/`
- **THEN** the redirect runs from an inline script in `<head>`, before first paint and before any external script or stylesheet loads, so no English content is ever painted

#### Scenario: Explicit locale URL
- **WHEN** a visitor who previously chose Portuguese opens `/es/`
- **THEN** the Spanish page is shown with no redirect

#### Scenario: Choosing English again
- **WHEN** that visitor then selects English
- **THEN** the stored choice becomes English and `/` no longer redirects

### Requirement: No browser-language redirect
The site SHALL NOT redirect or switch locale based on the browser's language or `Accept-Language` settings.

#### Scenario: First visit with a Spanish browser
- **WHEN** a first-time visitor whose browser language is Spanish opens `/`
- **THEN** the English page is shown

### Requirement: Language metadata
Each page SHALL declare its language on `<html lang>` (`en`, `pt-BR`, `es`) and SHALL link to all locale versions with `hreflang` alternates, including an `x-default` that points to English, using absolute URLs.

#### Scenario: Portuguese page metadata
- **WHEN** the `/pt-br/` page is inspected
- **THEN** it has `<html lang="pt-BR">` and alternate links for `en`, `pt-BR`, `es` and `x-default` with absolute `https://todsdev.github.io/` URLs
