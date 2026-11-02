# Spec Delta

## ADDED Requirements

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
