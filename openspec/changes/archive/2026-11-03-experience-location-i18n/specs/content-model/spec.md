# Spec Delta

## ADDED Requirements

### Requirement: Experience location is translatable
Each experience entry's `location` SHALL be a translatable field (only `en` required, English fallback with a build warning), so it can be written in each page's language.

#### Scenario: Translated location
- **WHEN** an experience entry's `location` is `{ en: "Worldwide", pt-br: "Vários países", es: "Varios países" }`
- **THEN** pages receive the location in their own language

#### Scenario: Plain string rejected
- **WHEN** an experience entry's `location` is written as a plain string, or `location.en` is missing
- **THEN** the build fails with a message naming the experience file and `location`
