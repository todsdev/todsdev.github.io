## MODIFIED Requirements

### Requirement: Terminal jumps
A scroll started by the terminal's `cd` or `./hello` command SHALL count for `section_view` like a navigation jump: only its destination section SHALL be recorded, when it becomes active. It SHALL NOT record a `nav_click` event.

#### Scenario: cd from the hero
- **WHEN** a visitor at the top of `/` opens the terminal and runs `cd contact`
- **THEN** the events after `terminal_open` are `terminal_command {command: "cd"}` and `section_view {section: "contact"}` only, with no `nav_click` and no `section_view` for the sections passed on the way

#### Scenario: Hello from a deep link
- **WHEN** a visitor opens `/#contact`, opens the terminal and runs `./hello`
- **THEN** the events after `terminal_open` are `terminal_command {command: "hello"}` and `section_view {section: "hero"}` only, with no `section_view` for the sections passed on the way up
