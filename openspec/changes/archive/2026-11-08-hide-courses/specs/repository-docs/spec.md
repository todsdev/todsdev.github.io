## MODIFIED Requirements

### Requirement: Visitor introduction
The README SHALL open with an introduction for visitors: what the project is, the live link, a hero screenshot stored outside `public/`, and the stack. It SHALL list only the sections the live site shows, so it names courses only while they are enabled. The existing technical documentation SHALL stay below it. It SHALL contain no GIF.

#### Scenario: Reading the README
- **WHEN** a visitor opens the repository on GitHub
- **THEN** the introduction, the live link and the screenshot come first, and the screenshot's file is not published with the site

#### Scenario: Courses off
- **WHEN** courses are off and the introduction is read
- **THEN** it lists experience, projects and skills, and doesn't mention courses

## ADDED Requirements

### Requirement: Courses flag documentation
The README's technical section SHALL document `courses.enabled`: where it lives, what it hides (the section, its nav link, the terminal's `certs` and `courses/`, the hosted certificates and the course mention in the description) and that turning it back on needs no other edit.

#### Scenario: Turning courses back on
- **WHEN** the owner follows the README to show courses again
- **THEN** the only edit is `courses.enabled: true` in the profile
