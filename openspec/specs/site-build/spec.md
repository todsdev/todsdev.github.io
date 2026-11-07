# site-build Specification

## Purpose

Defines how the personal website is produced as static files: which pages exist, the shared page shell they use, and the checks a build must pass before it can be published.

## Requirements

### Requirement: Static build output
The project SHALL produce a fully static site (HTML, CSS, fonts, assets) from a single build command. It SHALL have no backend, server endpoints, server-side rendering at request time or database.

#### Scenario: Successful build
- **WHEN** a developer runs the build command on a clean checkout with dependencies installed
- **THEN** the build exits with status 0
- **AND** an output directory is produced containing `index.html`, `pt-br/index.html`, `es/index.html` and `404.html`

#### Scenario: No server code
- **WHEN** the build output and project configuration are inspected
- **THEN** there are no server endpoints or server adapters, and the output can be served by any static file host

#### Scenario: Build failure is reported
- **WHEN** the source contains an error that prevents compilation
- **THEN** the build exits with a non-zero status and reports the error

### Requirement: Pinned Node runtime
The project SHALL declare Node 24 as its runtime, both for local development and for automated builds.

#### Scenario: Runtime version is discoverable
- **WHEN** a developer or CI job reads the project's runtime declaration
- **THEN** it resolves to Node major version 24

### Requirement: Home page
The site SHALL serve a one-page portfolio home page at the root path that identifies the site owner, Thiago Rodrigues, as an Android Developer, using data from the profile content.

#### Scenario: Visiting the root URL
- **WHEN** a visitor requests `/`
- **THEN** an HTML page is returned with a `<title>` containing the owner's name and a single `h1` with the owner's name

### Requirement: Shared page shell
Every page SHALL be rendered within a common shell that sets the document language, character encoding, responsive viewport, page title, meta description and favicon.

#### Scenario: Page metadata present
- **WHEN** any built page is inspected
- **THEN** it declares `lang`, a UTF-8 charset, a `width=device-width` viewport, a `<title>`, a `<meta name="description">` and a favicon link

#### Scenario: Page-specific title
- **WHEN** a page provides its own title
- **THEN** the rendered `<title>` reflects that page's title

### Requirement: Quality checks
The project SHALL provide commands for type checking, linting and format verification, each exiting non-zero when it finds a problem.

#### Scenario: Clean codebase passes checks
- **WHEN** the type check, lint and format-check commands run on the unmodified scaffold
- **THEN** all of them exit with status 0

#### Scenario: Violation fails checks
- **WHEN** a source file contains a type error, lint error or formatting deviation
- **THEN** the corresponding command exits with a non-zero status

### Requirement: Automated tests
The project SHALL provide a test command (`npm test`) that runs automated tests for logic that production content can't reliably exercise, using fixtures. It SHALL exit non-zero when any test fails, and SHALL need no dependencies beyond the pinned Node runtime.

#### Scenario: Passing tests
- **WHEN** a developer runs `npm test` on a clean checkout with dependencies installed
- **THEN** all tests run and the command exits with status 0

#### Scenario: Failing test
- **WHEN** a test assertion fails, e.g. the fallback no longer returns the English value
- **THEN** `npm test` exits with a non-zero status and names the failing test

### Requirement: Lighthouse targets
The locale pages (`/`, `/pt-br/`, `/es/`) SHALL score 100 in Accessibility, Best Practices and SEO and at least 95 in Performance, on mobile and desktop, as the median of 3 Lighthouse runs against the local production build.

#### Scenario: Measured results
- **WHEN** Lighthouse runs against the production build for each page and form factor
- **THEN** each median meets its target, or the gap is reported to the owner with a proposed fix
