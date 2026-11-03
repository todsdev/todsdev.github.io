# Spec Delta

## ADDED Requirements

### Requirement: Experience events field
Experience entries MAY have an `events` list. Each event has an integer `year`, a translatable `name` (only `en` required, English fallback with a build warning) and a non-empty `role` text kept as written in every locale (job titles). Invalid events SHALL fail the build with a message naming the file and field.

#### Scenario: Valid events
- **WHEN** the OBS entry lists events such as `{ year: 2024, name: { en: "Paris 2024 Olympic Games", pt-br: "Jogos Olímpicos de Paris 2024", es: "Juegos Olímpicos de París 2024" }, role: "Quality Control Specialist" }`
- **THEN** the build succeeds and the events are available to pages with the name in the page's language

#### Scenario: Invalid event
- **WHEN** an event's `year` is not an integer, its `name.en` is missing, or its `role` is empty
- **THEN** the build fails with a message naming the experience file and the event field

#### Scenario: Entries without events
- **WHEN** an experience entry has no `events`
- **THEN** it validates and renders no event list
