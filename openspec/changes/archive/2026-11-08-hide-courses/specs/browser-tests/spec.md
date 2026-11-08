## MODIFIED Requirements

### Requirement: Core coverage
The suite SHALL cover the hero, locale routing and the language switcher, every section per locale, résumé links per locale, the terminal, the 404 page in three locales with path escaping, analytics events, SEO tags, the sitemap, robots and the phone check.

#### Scenario: Hero
- **WHEN** the home page loads with motion allowed
- **THEN** the typing ends on the owner's name and "Android Developer", and the photo is present and loaded

#### Scenario: Language switcher
- **WHEN** the switcher is read from the accessibility tree on each locale page
- **THEN** its names are `EN — English`, `PT — Português` and `ES — Español`, and the current locale is marked

#### Scenario: Sections per locale
- **WHEN** each locale page loads
- **THEN** the sections the courses flag allows render in order with that locale's titles

#### Scenario: Résumé per locale
- **WHEN** each locale page's résumé link is read
- **THEN** it points to that locale's PDF, which returns 200 with a PDF body

#### Scenario: Terminal
- **WHEN** a visitor opens the terminal and runs `help`, `ls -a`, `cat .secrets`, sampled easter eggs and `theme`
- **THEN** each output matches the content and dictionaries, and the terminal closes with focus returned

#### Scenario: Unsafe 404 path
- **WHEN** a path holding markup, a very long string or malformed encoding reaches the 404 page
- **THEN** it appears as plain text, nothing runs, and the page doesn't overflow at 320px

#### Scenario: SEO tags
- **WHEN** each locale page is inspected
- **THEN** its description, canonical, hreflang, Open Graph and Twitter tags and JSON-LD match its locale, and the 404 page has none of them except `noindex`

## ADDED Requirements

### Requirement: Tests follow the courses flag
The suite SHALL read `courses.enabled` from the profile file at test time, never from the page. Tests of the courses section and its certificates SHALL skip with the reason `courses are off (profile courses.enabled: false)` while it is `false`. Tests that assert courses are absent SHALL skip with the reason `courses are on (profile courses.enabled: true)` while it is `true`. Shared section lists SHALL leave out courses while it is `false`.

#### Scenario: Flag off
- **WHEN** the suite runs with `courses.enabled: false`
- **THEN** the courses tests are reported as skipped with that reason, and the absence tests run

#### Scenario: Flag on
- **WHEN** the suite runs with `courses.enabled: true`
- **THEN** the courses tests run, and the absence tests are reported as skipped with that reason

### Requirement: Courses absence coverage
While courses are off, the suite SHALL check in every locale that the section, its nav link, any `#courses` link or anchor, any thread marker inside a courses section, the course mention in the description, the terminal's `certs` and `courses/` (in `help`, Tab, `ls`, `cd` and each `terminal.json`) and the hosted certificate URLs are all absent.

#### Scenario: Certificate URLs
- **WHEN** courses are off and each hosted certificate path is requested from the local build
- **THEN** each returns 404

#### Scenario: Terminal data
- **WHEN** courses are off and each locale's `terminal.json` is fetched
- **THEN** it has no `certs`, no `courses` section and no course title or issuer
