# Spec Delta

## MODIFIED Requirements

### Requirement: Pull request verification
Pull requests targeting `main` SHALL run the same checks and build as a deployment, plus the browser tests, in a workflow that has no deployment job.

#### Scenario: Pull request opened
- **WHEN** a pull request targeting `main` is opened or updated
- **THEN** lint, type check, format check, automated tests, build and browser tests run in that order and report one status on the pull request
- **AND** nothing is deployed

#### Scenario: A gate fails
- **WHEN** any of those steps exits non-zero
- **THEN** the status on the pull request is failed

#### Scenario: Time target
- **WHEN** a typical pull request's verification completes
- **THEN** it takes under 5 minutes

## ADDED Requirements

### Requirement: Only main publishes
The deployment job SHALL state explicitly that it runs only for `main`, on a push or a manual trigger. No other event or branch SHALL publish.

#### Scenario: Manual trigger on a feature branch
- **WHEN** a maintainer triggers the deployment workflow on another branch
- **THEN** the deployment job is skipped and nothing is published

#### Scenario: Manual trigger on main
- **WHEN** a maintainer triggers the deployment workflow on `main`
- **THEN** the site is built and deployed

### Requirement: Post-deploy smoke check
After each successful deployment, an automated job SHALL check the live site's home in three locales, a 404 page and that `og:image` is reachable, with analytics blocked.

#### Scenario: Healthy deployment
- **WHEN** a deployment succeeds and the live checks pass
- **THEN** the workflow run succeeds and no event reaches Umami

#### Scenario: Broken deployment
- **WHEN** a live check fails after its retry
- **THEN** the workflow run is marked failed, and the published site stays as it is until a maintainer acts

#### Scenario: Skipped or failed deployment
- **WHEN** the deployment job is skipped or fails
- **THEN** the smoke job doesn't run

### Requirement: Required check before merge
The `main` branch SHALL require the pull request verification check to pass before merge. It SHALL NOT require reviews, and the rule SHALL NOT be enforced for administrators.

#### Scenario: Reading the rule
- **WHEN** the branch protection of `main` is read after this change is merged
- **THEN** the verification check is required, no reviews are required, and enforcement for administrators is off
