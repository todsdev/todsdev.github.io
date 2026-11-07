# browser-tests Specification

## Purpose

Defines the repository's own browser test suite: where it runs, what it covers, how it treats analytics, the phone number and animations, and how each test proves it can fail.

## Requirements

### Requirement: Test commands
The project SHALL provide `npm run test:e2e`, which runs every browser test headless and exits non-zero when any test fails, and `npm run test:e2e:ui`, which opens the same tests in an interactive debugging interface.

#### Scenario: Passing run
- **WHEN** a developer runs `npm run test:e2e` on a clean checkout with dependencies and the browser installed
- **THEN** the site is built and served locally, all tests run, and the command exits with status 0

#### Scenario: Failing test
- **WHEN** a browser test fails
- **THEN** `npm run test:e2e` exits with a non-zero status and names the failing test

### Requirement: Local production build
Pull request runs SHALL test the production build served locally. They SHALL NOT contact the live site.

#### Scenario: Pull request run
- **WHEN** the browser tests run for a pull request
- **THEN** every page under test comes from the local build's output, and no request goes to `https://todsdev.github.io`

### Requirement: Desktop and mobile
Browser tests SHALL run in Chromium at a desktop viewport and at an emulated touch phone viewport. Tests that read only built files MAY run once. No other browser is required.

#### Scenario: Page tests
- **WHEN** a test exercises a rendered page
- **THEN** it runs in both configurations, unless it covers an input the other one doesn't have, such as a keyboard shortcut or a touch-only button

#### Scenario: Built-file tests
- **WHEN** a test reads only built files, such as the sitemap or the phone scan
- **THEN** it runs once per run

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
- **THEN** all seven sections render in order with that locale's titles

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

### Requirement: Mapping to deeper checks
The change design SHALL name, for each browser test, the verification suites it replaces, and SHALL list every remaining verification suite with the reason it stays outside the repository.

#### Scenario: Every suite accounted for
- **WHEN** the suites in the verification repository's `SUITES` list are compared with the design's tables
- **THEN** each one appears as replaced in part or as staying, with a reason

### Requirement: Expectations independent of the output under test
Expected values SHALL come from the content files and dictionaries, not from `terminal.json` or the rendered page under test.

#### Scenario: Terminal output
- **WHEN** a terminal test checks a command's output
- **THEN** the expected text is read from the dictionaries or content, so a wrong `terminal.json` fails the test

### Requirement: Analytics never leave the test
Every browser test SHALL prevent the Umami script and endpoint from reaching the network, so a run can never count as a visit or send an event.

#### Scenario: Any test
- **WHEN** a test loads a page
- **THEN** requests to Umami hosts are stopped in the browser, with no opt-in needed from the test

#### Scenario: Run against the live site
- **WHEN** the smoke subset loads the real production host
- **THEN** the tracker request is observed and stopped, and no event reaches Umami

### Requirement: Events asserted by interception
Tests SHALL assert analytics events from requests intercepted in the browser, using a test-only tracker stand-in served by interception. The stand-in SHALL NOT be part of the built site.

#### Scenario: Not-found event
- **WHEN** a visitor opens `/pt-br/velho?x=1#y`
- **THEN** one intercepted `not_found` event carries `path` `/pt-br/velho` and `locale` `pt-br`, and the request is stopped before leaving the browser

#### Scenario: Locale page
- **WHEN** a locale page loads
- **THEN** no `not_found` event is intercepted

### Requirement: Phone number check
A test SHALL read the phone number from the contact content at test time, normalize it to digits, and fail if a built page or `terminal.json` holds it or a `tel:` or `wa.me/` link. Test files, fixtures and CI secrets SHALL NOT hold the number.

#### Scenario: Number in a built page
- **WHEN** the number is written into a built page with or without the country code, with or without the area code, and with any separators
- **THEN** the check fails and names that file

#### Scenario: Number in the terminal data
- **WHEN** the number is written into any of the three built `terminal.json` files
- **THEN** the check fails and names that file

#### Scenario: Other numbers
- **WHEN** the check scans the current build, which holds App Store IDs, dates, image sizes and asset hashes
- **THEN** it reports nothing

#### Scenario: Failure output
- **WHEN** the check fails
- **THEN** its message and report name the file, the form found and its shape, with every digit masked

#### Scenario: Matcher self-test
- **WHEN** the suite runs
- **THEN** the matcher is tested with a fictional number against each form it must match and against values it must not match

#### Scenario: Scan covers the build
- **WHEN** the check runs
- **THEN** it fails unless it read a complete number and found all the expected files, so an empty scan can't pass

### Requirement: Inert throwaway input
Terminal input typed only to reach an error or a neutral state SHALL be a constant that can never become a command, not a real word.

#### Scenario: Unknown command
- **WHEN** a test needs an unknown command
- **THEN** it types `__noop_check__`, which the event validator's command pattern rejects because of its underscores, so it always reports as `unknown`

### Requirement: No fixed waits and no test code in production
Tests SHALL handle animation through reduced-motion emulation, a controlled clock or conditions they wait for, not fixed delays. The built site SHALL hold no test-only code.

#### Scenario: Typing sequence
- **WHEN** a test checks the hero's typing
- **THEN** it advances or awaits the sequence by its state, with no fixed sleep

#### Scenario: Production build
- **WHEN** the built output is searched for test markers and the tracker stand-in
- **THEN** none is found

### Requirement: Proven failure
Each browser test SHALL be shown to fail at least once against a deliberate breakage before it counts. The change's task list SHALL record the breakage and the observed failure for each test.

#### Scenario: New test
- **WHEN** a test is added by this change
- **THEN** the task list names the temporary breakage and the failure it caused, and the breakage is never committed

### Requirement: Diagnostics in CI
Failed tests SHALL retry once in CI and never locally. The first retry SHALL record a trace, and CI SHALL upload the HTML report as an artifact when the browser tests fail.

#### Scenario: Failure in CI
- **WHEN** a test fails twice in CI
- **THEN** the check fails and the HTML report, with the trace, is available as a run artifact

#### Scenario: Failure locally
- **WHEN** a test fails locally
- **THEN** it doesn't retry
