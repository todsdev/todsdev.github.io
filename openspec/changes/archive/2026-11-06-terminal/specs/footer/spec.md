## MODIFIED Requirements

### Requirement: Terminal hint slot
The footer of each locale page SHALL end with the terminal hint. On devices with a fine pointer that can hover, it SHALL read "press / to open the terminal" ("pressione / para abrir o terminal" / "pulsa / para abrir el terminal"), with the key styled as code. The `` ` `` key also opens the terminal but SHALL NOT be advertised. On touch devices it SHALL show only the `>_` button that opens the terminal. Without JavaScript, and on the 404 page, it SHALL render nothing and reserve no space.

#### Scenario: Empty slot
- **WHEN** no hint is provided (the 404 page)
- **THEN** the footer has no empty element or gap where the hint would go

#### Scenario: Desktop hint
- **WHEN** the Portuguese page is shown on a desktop browser
- **THEN** the footer ends with "pressione / para abrir o terminal", and no `>_` button is visible

#### Scenario: Touch device
- **WHEN** the page is shown on a phone (coarse pointer, no hover)
- **THEN** the footer ends with the `>_` button, its accessible name is localized, and the key hint isn't shown

#### Scenario: Scripting disabled
- **WHEN** a locale page is loaded without JavaScript
- **THEN** the footer shows no hint or button and has no empty gap where they would go

#### Scenario: No layout shift
- **WHEN** a locale page loads, at desktop and mobile widths
- **THEN** the hint or button is laid out from the first paint, and the footer records no layout shift
