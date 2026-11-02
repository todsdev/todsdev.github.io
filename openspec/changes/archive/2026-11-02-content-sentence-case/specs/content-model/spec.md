# Spec Delta

## ADDED Requirements

### Requirement: Sentence case for prose content
Prose content fields (profile summary, journey step text, experience description, project description) SHALL start with an uppercase first letter in every locale. The text is fixed in the content data, not by styling. Leading digits or punctuation are skipped when finding the first letter, and a leading word from an allowlist of names with their own casing (e.g. `iOS`, `gRPC`) is accepted. A violation SHALL fail the build with a message naming the file, field and locale.

#### Scenario: Lowercase journey step
- **WHEN** a journey step's `pt-br` text is "controle de qualidade em 8 edições"
- **THEN** the build exits non-zero with a message naming the profile file, the journey step's `text.pt-br` field and the sentence-case rule

#### Scenario: Capitalized prose
- **WHEN** every prose field starts with an uppercase letter, e.g. "Quality control at 8 Olympic Games with OBS"
- **THEN** the build succeeds

#### Scenario: Allowed exceptions
- **WHEN** a description starts with "iOS app…", "8 Olympic Games…" or "¿Qué…?"
- **THEN** it is accepted: "iOS" is an allowlisted name, and the first letters of the others ("O", "Q") are uppercase

#### Scenario: Non-prose fields
- **WHEN** a URL, enum value, path or name with its own casing (e.g. "act digital") starts with a lowercase letter
- **THEN** it is not checked by this rule
