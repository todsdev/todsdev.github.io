# Spec Delta

## MODIFIED Requirements

### Requirement: Not-found event
The 404 page SHALL record a `not_found` event whose data is the requested path (pathname only, no query or hash), so missing pages can be told apart from real ones. Its `locale` SHALL follow the page, as for every event: the locale resolved from the requested path.

#### Scenario: Unknown path
- **WHEN** a visitor opens `https://todsdev.github.io/old-page?x=1`
- **THEN** a `not_found` event with `path` `/old-page` and `locale` `en` is recorded

#### Scenario: Localized path
- **WHEN** a visitor opens `https://todsdev.github.io/pt-br/velho?x=1`
- **THEN** a `not_found` event with `path` `/pt-br/velho` and `locale` `pt-br` is recorded
