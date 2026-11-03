# Spec Delta

## MODIFIED Requirements

### Requirement: Entry content
Each entry SHALL show the company, the role and location in the page's language (falling back to English), the description in the page's language as prose capped at the reading measure, and one tag per tech item. Entries without tech items show no tag list.

#### Scenario: Spanish entry
- **WHEN** the Horus entry is rendered in Spanish
- **THEN** it shows "Horus", the Spanish role, the location "Rio de Janeiro, Brasil", the Spanish description (lines of at most about 65 characters) and the tags Kotlin, Java, Spring Boot, Python and REST APIs

#### Scenario: No tech items
- **WHEN** an entry's `tech` list is empty, like OBS
- **THEN** no tag list is rendered for it

#### Scenario: Localized locations
- **WHEN** the timeline is rendered in English, Portuguese and Spanish
- **THEN** act digital and Horus show "Rio de Janeiro, Brazil" / "Rio de Janeiro, Brasil" / "Rio de Janeiro, Brasil", and OBS shows "Worldwide" / "Vários países" / "Varios países"
