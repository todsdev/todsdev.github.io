# Spec Delta

## ADDED Requirements

### Requirement: Browser test documentation
The README's technical section and `CLAUDE.md` SHALL document the browser test commands, how to install the browser they need, what runs on a pull request, and how the suite relates to the private verification scripts.

#### Scenario: New contributor
- **WHEN** someone follows the README on a clean checkout
- **THEN** the documented commands install the browser and run the tests as written

#### Scenario: Choosing a check
- **WHEN** a maintainer reads `CLAUDE.md` to verify a change
- **THEN** it says which checks run in CI and which stay in the verification scripts
