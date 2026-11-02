# Spec Delta

## ADDED Requirements

### Requirement: Automated tests
The project SHALL provide a test command (`npm test`) that runs automated tests for logic that production content can't reliably exercise, using fixtures. It SHALL exit non-zero when any test fails, and SHALL need no dependencies beyond the pinned Node runtime.

#### Scenario: Passing tests
- **WHEN** a developer runs `npm test` on a clean checkout with dependencies installed
- **THEN** all tests run and the command exits with status 0

#### Scenario: Failing test
- **WHEN** a test assertion fails, e.g. the fallback no longer returns the English value
- **THEN** `npm test` exits with a non-zero status and names the failing test
