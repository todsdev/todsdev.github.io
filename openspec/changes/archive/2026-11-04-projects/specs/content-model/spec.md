## ADDED Requirements

### Requirement: Project ownership fields
Each project SHALL have a required `ownership` of `contributor` or `owner`, and MAY have `via`: the non-empty, untranslated name of the company the work was done through (for example "act digital"). Connector words ("via", "through") come from the dictionaries, not from `via`. An unknown ownership value SHALL fail the build, naming the entry, the field and the allowed values.

#### Scenario: Contributor with via
- **WHEN** a project has `ownership: contributor`, `owner: Globo` and `via: act digital`
- **THEN** it validates, and every locale gets "act digital" unchanged

#### Scenario: Empty via
- **WHEN** a project has `via: ""`
- **THEN** the build fails, naming the entry and `via`

#### Scenario: Missing ownership
- **WHEN** a project has no `ownership`
- **THEN** the build fails, naming the entry and `ownership`

#### Scenario: Invalid ownership
- **WHEN** a project has `ownership: client`
- **THEN** the build fails, naming the entry, `ownership` and the allowed values

### Requirement: Project owner field
A contributor project SHALL have an `owner`: the non-empty, untranslated name of the organization that owns the app (for example "Globo"). A contributor without `owner`, or an `owner` project that sets `owner`, SHALL fail the build, naming the entry and `owner`.

#### Scenario: Contributor without owner
- **WHEN** a project has `ownership: contributor` and no `owner`
- **THEN** the build fails, naming the entry and `owner`

#### Scenario: Owner project with owner field
- **WHEN** a project has `ownership: owner` and `owner: Globo`
- **THEN** the build fails, naming the entry and `owner`

### Requirement: Project store links
A project MAY have `stores` with an optional `playStore` and an optional `appStore`. `playStore` SHALL be an `https://play.google.com/` URL and `appStore` an `https://apps.apple.com/` URL. Any other value SHALL fail the build, naming the entry and the field. `url`, `repoUrl`, `tech` and `status` keep their meaning.

#### Scenario: Both stores
- **WHEN** a project has both store URLs on their stores' domains
- **THEN** it validates

#### Scenario: Wrong domain
- **WHEN** `stores.appStore` is `https://example.com/app`
- **THEN** the build fails, naming the entry and `stores.appStore`

### Requirement: Project screenshots
A project MAY have `screenshots`: a list of `{ src, alt }` items. `src` is a path, relative to the project file, to a local image that is optimized at build time. `alt` is translatable, non-empty text. A missing image file SHALL fail the build, naming the entry and the field.

#### Scenario: Valid screenshot
- **WHEN** a screenshot's `src` points to an existing image next to the project YAML and `alt` has an `en` value
- **THEN** it validates, and the image is available to pages as an optimized asset

#### Scenario: Missing image
- **WHEN** a screenshot's `src` points to a file that does not exist
- **THEN** the build exits non-zero with a message naming the project entry and `screenshots`

#### Scenario: Missing alt text
- **WHEN** a screenshot has no `alt`
- **THEN** the build fails, naming the entry and the field
