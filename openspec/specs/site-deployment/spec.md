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
A deployment SHALL proceed only if the type check, lint, format check and build all succeed.

#### Scenario: Failing check blocks deploy
- **WHEN** any quality check or the build fails during the workflow
- **THEN** no deployment occurs and the previously published site remains live

### Requirement: Pull request verification
Pull requests targeting `main` SHALL run the same checks and build as a deployment, without publishing.

#### Scenario: Pull request opened
- **WHEN** a pull request targeting `main` is opened or updated
- **THEN** the checks and build run and report status on the pull request
- **AND** nothing is deployed

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
