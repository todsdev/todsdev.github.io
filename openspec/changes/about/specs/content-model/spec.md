# Spec Delta

## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Placeholder content
**Reason**: Real content has replaced the placeholders, and all of it is fully translated, so production content can no longer be required to keep an English-only field just to exercise the fallback.
**Migration**: Collection presence is covered by "Collection coverage". Fallback behavior is covered by "Fallback verified by fixture test" (a fixture-based automated test run by `npm test` and in CI).
