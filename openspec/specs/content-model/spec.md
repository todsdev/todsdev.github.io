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

### Requirement: Placeholder content
The repository SHALL include minimal placeholder entries that exercise every collection schema, including at least one translatable field with all three locales and one with English only.

#### Scenario: Fresh build
- **WHEN** the site builds from a clean checkout
- **THEN** every collection has at least one entry and validation passes
