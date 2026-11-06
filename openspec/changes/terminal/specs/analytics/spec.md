## ADDED Requirements

### Requirement: Terminal jumps
A scroll started by the terminal's `cd` command SHALL count for `section_view` like a navigation jump: only its destination section SHALL be recorded, when it becomes active. It SHALL NOT record a `nav_click` event.

#### Scenario: cd from the hero
- **WHEN** a visitor at the top of `/` opens the terminal and runs `cd contact`
- **THEN** the events after `terminal_open` are `terminal_command {command: "cd"}` and `section_view {section: "contact"}` only, with no `nav_click` and no `section_view` for the sections passed on the way

### Requirement: Terminal actions record the section events
A terminal command that performs a tracked page action SHALL also record that action's event, exactly as the page's own control does, in addition to `terminal_command`. `resume` SHALL record `resume` with the `language` of the file served, and `sudo hire-me` SHALL record `contact` with `kind` `email` and `action` `mail` when it opens the email. Other terminal commands SHALL record only `terminal_command`.

#### Scenario: Résumé from the terminal
- **WHEN** a visitor on `/pt-br/` runs `resume` in the terminal
- **THEN** `terminal_command {command: "resume"}` and `resume {language: "pt-br"}` are recorded, each with `locale` `pt-br`, and nothing else

#### Scenario: Hire me
- **WHEN** a visitor on `/` runs `sudo hire-me`, types any password and presses Enter
- **THEN** `terminal_command {command: "sudo"}` and `contact {kind: "email", action: "mail"}` are recorded, each with `locale` `en`, and the password appears in no event

#### Scenario: Open a profile
- **WHEN** `open linkedin` is run
- **THEN** only `terminal_command {command: "open"}` is recorded
