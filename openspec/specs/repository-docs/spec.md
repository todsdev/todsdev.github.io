# repository-docs Specification

## Purpose
Defines what the repository tells a visitor reading it on GitHub: what the project is and how it was built, which commands stay hidden behind a spoiler, and which license covers which files.

## Requirements

### Requirement: Visitor introduction
The README SHALL open with an introduction for visitors: what the project is, the live link, a hero screenshot stored outside `public/`, and the stack. It SHALL list only the sections the live site shows, so it names courses only while they are enabled. The existing technical documentation SHALL stay below it. It SHALL contain no GIF.

#### Scenario: Reading the README
- **WHEN** a visitor opens the repository on GitHub
- **THEN** the introduction, the live link and the screenshot come first, and the screenshot's file is not published with the site

#### Scenario: Courses off
- **WHEN** courses are off and the introduction is read
- **THEN** it lists experience, projects and skills, and doesn't mention courses

### Requirement: How it was built
The introduction SHALL describe how the site was built: Spec-Driven Development with OpenSpec, the number of specs and of archived changes counted at archive time including this change, one commit per task and automated browser verification, with links to `openspec/specs/` and `openspec/changes/archive/`.

#### Scenario: Counts match
- **WHEN** the README is compared with the repository after archiving
- **THEN** the counts equal the number of directories in `openspec/specs/` and in `openspec/changes/archive/`

### Requirement: Spoilers block
The hidden terminal commands, including those from `terminal-discovery`, SHALL be listed only inside a collapsed `<details>` block labeled "spoilers" in the Terminal section.

#### Scenario: Collapsed by default
- **WHEN** the README is rendered
- **THEN** the easter-egg table is hidden until the block is opened, and no command is left out compared with `cat .secrets`

### Requirement: License and notice
`LICENSE` SHALL contain only the plain MIT text with `Copyright (c) 2026 Thiago Rodrigues`, so GitHub detects it. `NOTICE.md` SHALL reserve all rights on personal content (texts, photo, résumés, certificates) and state that app screenshots and names belong to their owners. The README SHALL state this split.

#### Scenario: GitHub detection
- **WHEN** the repository's license is read through the GitHub API after merge
- **THEN** its SPDX id is `MIT`

#### Scenario: Reader sees the split
- **WHEN** a visitor reads the README's license section
- **THEN** it says code is MIT and personal content is covered by `NOTICE.md`, linking to both files

### Requirement: Browser test documentation
The README's technical section and `CLAUDE.md` SHALL document the browser test commands, how to install the browser they need, what runs on a pull request, and how the suite relates to the private verification scripts.

#### Scenario: New contributor
- **WHEN** someone follows the README on a clean checkout
- **THEN** the documented commands install the browser and run the tests as written

#### Scenario: Choosing a check
- **WHEN** a maintainer reads `CLAUDE.md` to verify a change
- **THEN** it says which checks run in CI and which stay in the verification scripts

### Requirement: Courses flag documentation
The README's technical section SHALL document `courses.enabled`: where it lives, what it hides (the section, its nav link, the terminal's `certs` and `courses/`, the hosted certificates and the course mention in the description) and that turning it back on needs no other edit.

#### Scenario: Turning courses back on
- **WHEN** the owner follows the README to show courses again
- **THEN** the only edit is `courses.enabled: true` in the profile
