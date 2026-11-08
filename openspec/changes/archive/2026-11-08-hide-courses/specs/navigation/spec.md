## MODIFIED Requirements

### Requirement: Ordered one-page sections
The home page of every locale SHALL contain these sections in order: hero, about, experience, projects, skills, courses, contact. Each SHALL have a stable, locale-independent id equal to its name. The courses section SHALL be left out while the profile's `courses.enabled` is `false`, and the others keep their order.

#### Scenario: Section order and ids
- **WHEN** the home page of any locale is rendered with courses enabled
- **THEN** it contains sections with ids `hero`, `about`, `experience`, `projects`, `skills`, `courses`, `contact`, in that order

#### Scenario: Courses off
- **WHEN** the home page of any locale is rendered with `courses.enabled` set to `false`
- **THEN** it contains sections with ids `hero`, `about`, `experience`, `projects`, `skills`, `contact`, in that order

## ADDED Requirements

### Requirement: Nav links follow the rendered sections
The navigation SHALL have exactly one link per rendered section, in section order. While courses are off, it SHALL have no courses link, and the active indicator SHALL move from skills straight to contact.

#### Scenario: Courses off
- **WHEN** a locale page is shown with `courses.enabled` set to `false`
- **THEN** the nav links are, in order, the locale's labels for hero, about, experience, projects, skills and contact

#### Scenario: Scrolling past skills
- **WHEN** courses are off and a visitor scrolls from the skills section to the contact section
- **THEN** the active nav item changes from skills to contact, with no other item in between
