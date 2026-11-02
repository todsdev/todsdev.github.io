# Spec Delta

## MODIFIED Requirements

### Requirement: Checks gate deployment
A deployment SHALL proceed only if the type check, lint, format check, automated tests and build all succeed.

#### Scenario: Failing check blocks deploy
- **WHEN** any quality check, the automated tests or the build fail during the workflow
- **THEN** no deployment occurs and the previously published site remains live
