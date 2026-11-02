# content-model Specification

## Purpose

Defines the structured, validated content that powers the portfolio: the content collections, their fields, translatable text with English fallback, and build-time validation that rejects invalid data.

## Requirements

### Requirement: Content collections
Portfolio content SHALL live in YAML files organized into these collections, each validated against a schema: profile, contacts, experience, projects, skills, courses, education, languages.

#### Scenario: Collections available at build
- **WHEN** the site builds
- **THEN** all eight collections are loaded and validated, and are available to pages

### Requirement: Collection fields
Each collection SHALL define fields for its domain. Projects SHALL have a `status` of `live` or `building`. Skills SHALL be grouped by category. Courses SHALL have `title`, `issuer`, `date`, `certificateUrl` and `featured`.

#### Scenario: Valid project status
- **WHEN** a project entry has `status: building`
- **THEN** it validates

#### Scenario: Invalid project status
- **WHEN** a project entry has `status: paused`
- **THEN** the build fails, naming the entry, the field and the allowed values

#### Scenario: Skills grouped by category
- **WHEN** skills are loaded
- **THEN** each skill entry belongs to a named category, and the skills can be listed grouped by that category

### Requirement: Common optional fields
Every collection entry SHALL accept the optional fields `order` (number), `featured` (boolean) and `hidden` (boolean). Hidden entries SHALL be excluded from rendered pages, and lists SHALL sort by `order` ascending.

#### Scenario: Hidden entry
- **WHEN** an entry has `hidden: true`
- **THEN** it does not appear on any rendered page

#### Scenario: Ordering
- **WHEN** two entries in one collection have `order: 2` and `order: 1`
- **THEN** the entry with `order: 1` is listed first

### Requirement: Translatable fields
Human-readable text fields SHALL be objects with `en`, `pt-br` and `es` keys, where only `en` is required.

#### Scenario: English only
- **WHEN** a translatable field provides only `en`
- **THEN** it validates

#### Scenario: Missing English
- **WHEN** a translatable field provides `pt-br` but not `en`
- **THEN** the build fails with a message naming the entry and field

### Requirement: Translation fallback with warning
When a translatable field lacks the requested locale, the English value SHALL be used, and the build SHALL emit a warning naming the collection, entry, field and missing locale. The warning SHALL NOT fail the build.

#### Scenario: Missing Spanish translation
- **WHEN** an experience entry's `role` has no `es` value and the Spanish page is built
- **THEN** the English role is used for Spanish, and the build log contains a warning that identifies the experience entry, the `role` field and `es`
- **AND** the build exits with status 0

### Requirement: Invalid data fails the build
Content that violates its schema (a missing required field, a malformed URL, a wrong type, an invalid date or an unknown enum value) SHALL fail the build with a message identifying the file, the field and the problem.

#### Scenario: Malformed URL
- **WHEN** a course entry has `certificateUrl: not-a-url`
- **THEN** the build exits non-zero with a message naming that course file and `certificateUrl`

#### Scenario: Missing required field
- **WHEN** a contact entry omits its required URL
- **THEN** the build exits non-zero with a message naming the entry and the missing field

### Requirement: Profile photo field
The profile SHALL have a required `photo` field: a path, relative to the profile file, to a local image that is optimized at build time. A missing or unreadable image SHALL fail the build with a message naming the profile file and the `photo` field.

#### Scenario: Valid photo path
- **WHEN** `photo` points to an existing image next to `profile.yaml`
- **THEN** the build succeeds and the image is available to pages as an optimized asset

#### Scenario: Missing image
- **WHEN** `photo` points to a file that does not exist
- **THEN** the build exits non-zero with a message naming the profile file and `photo`

### Requirement: Profile availability field
The profile SHALL have an `availability` field with a boolean `enabled` and a translatable `label`. Both can be changed in content alone, without code changes. The label follows the translatable-field rules (only `en` required, English fallback with a build warning).

#### Scenario: Turning availability off
- **WHEN** `availability.enabled` is set to `false`
- **THEN** the build succeeds and pages render no availability status

#### Scenario: Changing the label
- **WHEN** `availability.label.en` is changed to "available for freelance"
- **THEN** the English pages show the new label after rebuilding, with no code change

#### Scenario: Invalid availability
- **WHEN** `availability.enabled` is not a boolean, or `availability.label.en` is missing
- **THEN** the build fails with a message naming the profile file and the field

### Requirement: Profile location is translatable
The profile `location` SHALL be a translatable field (only `en` required, English fallback with a build warning), so it can be written in each page's language.

#### Scenario: Translated location
- **WHEN** `location` is `{ en: "Rio de Janeiro, Brazil", pt-br: "Rio de Janeiro, Brasil", es: "Rio de Janeiro, Brasil" }`
- **THEN** pages receive the location in their own language

#### Scenario: Plain string rejected
- **WHEN** `location` is written as a plain string, or `location.en` is missing
- **THEN** the build fails with a message naming the profile file and `location`

### Requirement: Profile journey field
The profile SHALL have a `journey` field: a non-empty list of steps, each with a non-empty `years` string and a translatable `text`. A `years` value ending with a dash denotes an ongoing range.

#### Scenario: Valid journey
- **WHEN** `journey` lists steps such as `{ years: "2016–2022", text: { en: …, pt-br: …, es: … } }`
- **THEN** the build succeeds and the steps are available to pages in content order

#### Scenario: Invalid journey
- **WHEN** a journey step is missing `years` or `text.en`, or `journey` is empty
- **THEN** the build fails with a message naming the profile file and the field

### Requirement: Profile focus field
The profile SHALL have a translatable `focus` field summarizing the owner's technical focus (e.g. `Android · Kotlin · Jetpack Compose`).

#### Scenario: Missing focus
- **WHEN** `focus.en` is missing
- **THEN** the build fails with a message naming the profile file and `focus.en`

### Requirement: Collection coverage
Every collection SHALL contain at least one entry, real or placeholder, so each schema is exercised by every build.

#### Scenario: Fresh build
- **WHEN** the site builds from a clean checkout
- **THEN** every collection has at least one entry and validation passes

### Requirement: Fallback verified by fixture test
The translation fallback (English value plus a warning naming collection, entry, field and missing locale, emitted once) SHALL be covered by an automated test that uses fixture data, not production content. Production content MAY therefore be fully translated.

#### Scenario: Missing translation fixture
- **WHEN** the automated tests localize a fixture field that has only `en` for `es`
- **THEN** the test asserts the English value is returned and one warning names the fixture's collection, entry, field and `es`

#### Scenario: Warning deduplicated
- **WHEN** the same missing translation is localized twice
- **THEN** only one warning is emitted

#### Scenario: Fully translated production content
- **WHEN** every translatable field in `src/content/` has all three locales
- **THEN** the build emits no fallback warnings and the fallback is still verified by the tests
