## ADDED Requirements

### Requirement: Contact kinds and value
Each contact SHALL have a `kind`: one of `email`, `phone`, `whatsapp`, `linkedin`, `github`, `instagram` or `other`. It SHALL also have a translatable `label`, a `url`, and a required, non-empty `value`: the plain text shown on its line. An unknown kind or a missing value SHALL fail the build, naming the entry and the field.

#### Scenario: Phone contact
- **WHEN** a contact has `kind: phone`, `value: +55 21 97147-0428` and `url: tel:+5521971470428`
- **THEN** it validates

#### Scenario: Unknown kind
- **WHEN** a contact has `kind: telegram`
- **THEN** the build fails, naming the entry, `kind` and the allowed values

#### Scenario: Missing value
- **WHEN** a contact has no `value`
- **THEN** the build fails, naming the entry and `value`

### Requirement: Profile source URL
The profile MAY have a `sourceUrl`: the URL of the site's source repository, used by the footer. A malformed URL SHALL fail the build, naming the profile and `sourceUrl`.

#### Scenario: Repository link
- **WHEN** the profile has `sourceUrl: https://github.com/todsdev/todsdev.github.io`
- **THEN** it validates, and the footer links to it
