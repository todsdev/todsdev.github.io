# Spec Delta

## Purpose

Defines what search engines and link previews read from the site: per-locale metadata, generated share images, the sitemap and robots files, and structured data that never includes the phone number.

## ADDED Requirements

### Requirement: Page description and canonical URL
Each locale page SHALL have a localized `<meta name="description">` and a canonical link with the absolute URL in the form GitHub Pages serves: `https://todsdev.github.io/`, `/pt-br/` and `/es/`, with the trailing slash.

#### Scenario: Portuguese canonical
- **WHEN** `/pt-br/` is opened with `?utm_source=cv`
- **THEN** its canonical is `https://todsdev.github.io/pt-br/` and its description is in Portuguese

### Requirement: Open Graph tags
Each locale page SHALL declare `og:title`, `og:description`, `og:url`, `og:type`, `og:locale`, an `og:locale:alternate` for each other locale, and `og:image` as an absolute URL with `og:image:width`, `og:image:height` and a localized `og:image:alt`.

#### Scenario: Spanish tags
- **WHEN** `/es/` is inspected
- **THEN** `og:url` equals its canonical, `og:locale` is `es_ES`, the alternates are `en_US` and `pt_BR`, and `og:image` is an absolute URL to the Spanish image, 1200×630, with Spanish alt text

#### Scenario: LinkedIn required tags
- **WHEN** any locale page is inspected
- **THEN** `og:title`, `og:image`, `og:description` and `og:url` are all present and non-empty

### Requirement: Twitter card tags
Each locale page SHALL declare `twitter:card` as `summary_large_image`, with `twitter:title`, `twitter:description`, `twitter:image` and `twitter:image:alt` matching its Open Graph values.

#### Scenario: English card
- **WHEN** `/` is inspected
- **THEN** `twitter:card` is `summary_large_image` and the other values equal their Open Graph values

### Requirement: Share images
The build SHALL generate one PNG share image per locale, 1200×630 and under 5 MB: the owner's name in VT323 and the localized job title on the site's dark background, with the hero's prompt line. Each SHALL carry no metadata.

#### Scenario: Generated images
- **WHEN** the site is built on a machine without VT323 installed
- **THEN** `/og/en.png`, `/og/pt-br.png` and `/og/es.png` exist, each is 1200×630 and under 5 MB, and the text is drawn in the bundled fonts

#### Scenario: Localized job title
- **WHEN** the images are compared
- **THEN** they show "Android Developer", "Desenvolvedor Android" and "Desarrollador Android" respectively

### Requirement: Sitemap
The site SHALL serve `/sitemap.xml` listing the three locale home pages, each with `xhtml:link` alternates for `en`, `pt-BR`, `es` and `x-default`. It SHALL NOT list the 404 page.

#### Scenario: Sitemap content
- **WHEN** `/sitemap.xml` is parsed
- **THEN** it has exactly three `url` entries equal to the canonical URLs, each with four alternates, and no `404`

### Requirement: Robots file
The site SHALL serve `/robots.txt`, allowing all crawlers and pointing to the absolute sitemap URL.

#### Scenario: Robots content
- **WHEN** `/robots.txt` is requested
- **THEN** it returns 200 as plain text and contains `Sitemap: https://todsdev.github.io/sitemap.xml`

### Requirement: Structured data
Each locale page SHALL include one JSON-LD `Person` with `name`, the localized `jobTitle`, `url`, `email` and `sameAs` holding the LinkedIn, GitHub and Instagram URLs from the contacts. It SHALL have no `telephone` and SHALL be valid JSON that can't close its script element.

#### Scenario: Person content
- **WHEN** the JSON-LD of `/pt-br/` is parsed
- **THEN** it has `@type` `Person`, `jobTitle` "Desenvolvedor Android", `url` `https://todsdev.github.io/pt-br/`, `email` `trod.dev@gmail.com`, three `sameAs` URLs and no phone field

### Requirement: No phone number in built pages
A check SHALL fail if any built HTML file or `terminal.json` contains the phone number, with or without separators, a `tel:` link or a `wa.me/` link. The structured data and metadata SHALL be covered by this check. The résumés are a deliberate exception and SHALL NOT be checked.

#### Scenario: Phone added by mistake
- **WHEN** the number is written into a built HTML file's JSON-LD, with any separators
- **THEN** the check reports a failure naming that file

#### Scenario: Phone in the terminal data
- **WHEN** the number is written into a built `terminal.json`
- **THEN** the check reports a failure naming that file

#### Scenario: Résumés are not checked
- **WHEN** the check runs on a build whose résumés contain the number
- **THEN** it passes
