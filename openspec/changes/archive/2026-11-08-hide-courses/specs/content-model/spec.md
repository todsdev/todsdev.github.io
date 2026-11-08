## ADDED Requirements

### Requirement: Profile courses flag
The profile SHALL have a `courses` field with a boolean `enabled` that turns the courses section and everything tied to it on or off. It can be changed in content alone, without code changes, and setting it back to `true` SHALL restore everything it hides. The course entries and certificate files SHALL stay in the repository either way.

#### Scenario: Turning courses off
- **WHEN** `courses.enabled` is set to `false`
- **THEN** the build succeeds, and the course YAMLs and certificate files are still in the repository

#### Scenario: Turning courses back on
- **WHEN** `courses.enabled` is set back to `true` with no other edit
- **THEN** the courses section, its nav link, the terminal's `certs` and `courses/`, the meta description that names courses and the hosted certificate URLs all return as they were before the flag existed

#### Scenario: Invalid flag
- **WHEN** `courses` is missing from the profile, or `courses.enabled` is not a boolean
- **THEN** the build fails with a message naming the profile file and the field
