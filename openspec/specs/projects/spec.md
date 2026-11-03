# projects Specification

## Purpose

Defines the projects section: data-driven project cards with a phone-framed screenshot, ownership badge, terminal-style links and status, an ownership note, and the accessibility and layout-stability guarantees they keep.

## Requirements

### Requirement: Projects section title
The projects section SHALL keep its terminal-prompt title, translated per locale: `$ ls ./projects`, `$ ls ./projetos`, `$ ls ./proyectos`.

#### Scenario: Portuguese title
- **WHEN** the Portuguese page is shown
- **THEN** the projects section heading reads `$ ls ./projetos`

### Requirement: Data-driven cards in order
The section SHALL render one card per visible project from the projects collection, featured projects first, then by `order` ascending. All project text SHALL come from the collection; the section SHALL NOT contain hardcoded project titles, descriptions or links.

#### Scenario: Current order
- **WHEN** the section is shown in any locale
- **THEN** the cards are GloboPop, Premiere, Combate Play, todsdev.github.io, in that order

#### Scenario: Featured first
- **WHEN** a non-featured project has `order: 1` and a featured project has `order: 2`
- **THEN** the featured project's card comes first

#### Scenario: Hidden project
- **WHEN** a project has `hidden: true`
- **THEN** it has no card

### Requirement: Card content
Each card SHALL show the project title as a heading, an ownership badge, the description in the page's language capped at the reading measure, and one tech tag per tech item using the same terminal tokens as the experience section. Cards without tech items show no tag list.

#### Scenario: Spanish card
- **WHEN** the GloboPop card is shown in Spanish
- **THEN** it shows the heading "GloboPop", the badge, the Spanish description (lines of at most about 65 characters) and the tags Kotlin, Jetpack Compose, GraphQL and Modular Architecture

### Requirement: Ownership badge
Each card SHALL show its ownership as a terminal-like token. The ownership word SHALL be translated: contributor / colaborador / colaborador, and owner / proprietário / propietario. When the project has a `via` company, the badge SHALL append " · ", the localized connector (via / via / vía) and the company name.

#### Scenario: Contributor with via
- **WHEN** the Premiere card is shown in English, Portuguese and Spanish
- **THEN** its badge reads "contributor · via act digital", "colaborador · via act digital" and "colaborador · vía act digital"

#### Scenario: Owner without via
- **WHEN** the todsdev.github.io card is shown in English, Portuguese and Spanish
- **THEN** its badge reads "owner", "proprietário" and "propietario", with no separator

### Requirement: Terminal actions
Each card SHALL show one terminal-style action per link the project defines, in this order: `$ open play-store`, `$ open app-store`, `$ open site`, `$ open repo`. The commands SHALL stay in English in every locale. A project SHALL show no action for a link it doesn't define. Every action is an external link that opens in a new tab with `rel` containing `noopener`. Its accessible name SHALL contain the visible command and name the destination and the new tab in the page's language.

#### Scenario: Store app
- **WHEN** the Combate Play card is shown
- **THEN** it has exactly `$ open play-store` and `$ open app-store`, linking to the Combate Play listings on Google Play and the App Store

#### Scenario: Portfolio
- **WHEN** the todsdev.github.io card is shown
- **THEN** it has exactly `$ open site` and `$ open repo`, linking to `https://todsdev.github.io/` and `https://github.com/todsdev/todsdev.github.io`

#### Scenario: Accessible name in Portuguese
- **WHEN** the GloboPop `$ open play-store` action is inspected on the Portuguese page
- **THEN** its accessible name contains "open play-store", "GloboPop", "Google Play" and the Portuguese for "opens in a new tab"

### Requirement: Building status
A project with `status: building` SHALL show a translated status line in place of its store actions: `[building... ▓▓▓░░░]`, `[construindo... ▓▓▓░░░]`, `[construyendo... ▓▓▓░░░]`. Its site and repo actions still show when defined. Assistive technology SHALL get the status words, not the block characters.

#### Scenario: Building project with store links
- **WHEN** a `building` project defines `stores.playStore` and `repoUrl` and is shown in Spanish
- **THEN** its card shows `[construyendo... ▓▓▓░░░]` and `$ open repo`, and no `$ open play-store`

#### Scenario: Live project
- **WHEN** a `live` project is shown
- **THEN** no status line is rendered

### Requirement: Phone-framed screenshot
A project with screenshots SHALL show its first screenshot inside a simple, flat phone-shaped frame: a gray border with rounded corners and no device brand details, with the screen at a 9:19.5 aspect ratio. The image SHALL be optimized and responsive, and its space SHALL be reserved before it loads. A project without screenshots SHALL show the card without a frame.

#### Scenario: Screenshot present
- **WHEN** the GloboPop card is shown
- **THEN** a phone frame shows the GloboPop screenshot with the alt text in the page's language

#### Scenario: No screenshots
- **WHEN** a project has no `screenshots`
- **THEN** its card has no frame and no empty placeholder

### Requirement: Grayscale to color
Screenshots SHALL render in grayscale by default and switch to full color while the card is hovered or anything inside it has keyboard focus, with a short transition. With reduced motion the change SHALL be immediate. The change SHALL NOT move or resize anything.

#### Scenario: Hover
- **WHEN** the pointer hovers a card
- **THEN** its screenshot transitions from grayscale to color, and back when the pointer leaves

#### Scenario: Keyboard focus
- **WHEN** a keyboard user tabs to an action in a card
- **THEN** that card's screenshot is in color while focus stays inside the card

#### Scenario: Reduced motion
- **WHEN** the visitor prefers reduced motion and hovers a card
- **THEN** the screenshot switches to color with no transition

### Requirement: Ownership note
Under the cards, the section SHALL show a note built from the visible contributor projects. The wording comes from a localized template with singular and plural forms that names the owner and, when the group has a `via` company, ends with the template's own connector (through / por meio da empresa / a través de) and the company name. No app or owner name SHALL be hand-written in the template. With no visible contributor projects, no note is rendered.

#### Scenario: Notes per locale
- **WHEN** the page is shown in English, Portuguese and Spanish with the current content
- **THEN** the note reads, respectively:
  - "GloboPop, Premiere and Combate Play are owned by Globo. I contributed to them as an Android developer through act digital."
  - "GloboPop, Premiere e Combate Play pertencem à empresa Globo. Contribuí com eles como desenvolvedor Android por meio da empresa act digital."
  - "GloboPop, Premiere y Combate Play son propiedad de Globo. Colaboré en ellas como desarrollador Android a través de act digital."

#### Scenario: Single app
- **WHEN** only one contributor project, GloboPop, is visible
- **THEN** the notes read "GloboPop is owned by Globo. I contributed to it as an Android developer through act digital.", "GloboPop pertence à empresa Globo. Contribuí com ele como desenvolvedor Android por meio da empresa act digital." and "GloboPop es propiedad de Globo. Colaboré en ella como desarrollador Android a través de act digital."

#### Scenario: Group without via
- **WHEN** the only contributor project has `owner: Globo` and no `via`
- **THEN** the English note reads "GloboPop is owned by Globo. I contributed to it as an Android developer."

#### Scenario: Hidden contributor project
- **WHEN** Premiere is hidden
- **THEN** the English note starts "GloboPop and Combate Play are owned by Globo."

#### Scenario: No contributor projects
- **WHEN** every visible project has `ownership: owner`
- **THEN** no ownership note element is rendered

### Requirement: Ownership note grouping
The note SHALL have one sentence pair per group of contributor projects that share `owner` and `via`. Groups appear in the order of their first card. Within a group, titles keep card order and are joined with the locale's conjunction list format ("A, B and C" / "A, B e C" / "A, B y C", with no serial comma in English).

#### Scenario: Two owners
- **WHEN** visible contributor projects have two different owners
- **THEN** the note has one sentence pair per owner, in card order of each owner's first project

### Requirement: Accessible and stable cards
The cards SHALL be a list of `article` elements, each labelled by its title heading (one level below the section heading). Screenshot alt text SHALL describe the screen shown. All text SHALL meet AA contrast. Tags and actions SHALL wrap without horizontal overflow at 320px, and every action SHALL be reachable by keyboard with a visible focus indicator. Loading the page, loading images and hover or focus state changes SHALL cause no layout shift.

#### Scenario: Markup
- **WHEN** the section markup is inspected
- **THEN** it has one list whose items each contain an `article` with an `h3` title, and every screenshot has non-empty alt text in the page's language

#### Scenario: Keyboard at 320px
- **WHEN** a keyboard user tabs through the section at 320px
- **THEN** focus reaches every action in card order, each focused action is fully visible with a focus outline, and nothing overflows the viewport

#### Scenario: No layout shift
- **WHEN** the page loads, the screenshots load and the visitor hovers and focuses each card
- **THEN** no layout shift is recorded and no card element moves or resizes
