# Spec Delta

## Purpose

Defines how the personal website is produced as static files: which pages exist, the shared page shell they use, and the checks a build must pass before it can be published.

## ADDED Requirements

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

### Requirement: Not-found page
The site SHALL provide a simple placeholder not-found page, using the shared shell and English dictionary strings, that is served for unknown paths and links back to the home page. A terminal-style 404 is out of scope.

#### Scenario: Unknown path
- **WHEN** a visitor requests a path that does not exist on the deployed site
- **THEN** the custom not-found page is shown with a link to `/`

### Requirement: Quality checks
The project SHALL provide commands for type checking, linting and format verification, each exiting non-zero when it finds a problem.

#### Scenario: Clean codebase passes checks
- **WHEN** the type check, lint and format-check commands run on the unmodified scaffold
- **THEN** all of them exit with status 0

#### Scenario: Violation fails checks
- **WHEN** a source file contains a type error, lint error or formatting deviation
- **THEN** the corresponding command exits with a non-zero status
