# site-deployment Specification

## Purpose

Defines how the built site is published to GitHub Pages: what triggers a deployment, which checks gate it, and where the result is served.

## Requirements

### Requirement: Deploy on push to main
Every push to the `main` branch SHALL trigger an automated build and, if it succeeds, a deployment to GitHub Pages.

#### Scenario: Push to main
- **WHEN** a commit is pushed to `main`
- **THEN** an automated workflow builds the site and publishes it to GitHub Pages

#### Scenario: Manual redeploy
- **WHEN** a maintainer manually triggers the deployment workflow
- **THEN** the current `main` is built and deployed

### Requirement: Checks gate deployment
A deployment SHALL proceed only if the type check, lint, format check, automated tests and build all succeed.

#### Scenario: Failing check blocks deploy
- **WHEN** any quality check, the automated tests or the build fail during the workflow
- **THEN** no deployment occurs and the previously published site remains live

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

### Requirement: Published at user site URL
The deployed site SHALL be served from `https://todsdev.github.io/` at the root path, with asset URLs resolving correctly there.

#### Scenario: Visiting the published site
- **WHEN** a visitor opens `https://todsdev.github.io/` after a successful deployment
- **THEN** the home page loads with its styles and favicon, without broken asset requests

### Requirement: Non-overlapping deployments
Deployments SHALL NOT run concurrently; a newer deployment supersedes a queued older one.

#### Scenario: Rapid successive pushes
- **WHEN** two pushes to `main` occur before the first deployment finishes
- **THEN** deployments run one at a time and the final published site reflects the latest commit

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
