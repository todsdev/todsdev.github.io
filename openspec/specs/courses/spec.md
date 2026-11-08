# courses Specification

## Purpose

Defines the courses section: certificates from the courses collection listed like `ls -l` output, with localized dates, an `$ open cert` action, a mobile layout, and the accessibility, link and stability guarantees, including metadata-free hosted certificate files.

## Requirements

### Requirement: Courses section title
The courses section SHALL keep its terminal-prompt title, translated per locale: `$ ls ./courses`, `$ ls ./cursos`, `$ ls ./cursos`.

#### Scenario: Portuguese title
- **WHEN** the Portuguese page is shown
- **THEN** the courses section heading reads `$ ls ./cursos`

### Requirement: Courses from the collection in order
The section SHALL render one line per visible course in the courses collection. Featured courses come first, then the rest; within each group, newest first by date, with equal dates ordered by `order` ascending. Titles and issuers SHALL be shown exactly as stored, untranslated. The section SHALL NOT contain hardcoded course text.

#### Scenario: Current order
- **WHEN** the section is shown in any locale
- **THEN** the titles are, in order: "Marvel App - Kotlin - MVVM - Hilt e muito mais.", "Curso completo de Kotlin para Android", "JAVA BÁSICO [40 HORAS]", "JAVA POO [40 HORAS]", "ALGORITMO [40 HORAS]"

#### Scenario: Featured before newer
- **WHEN** a non-featured course is newer than a featured one
- **THEN** the featured course is still listed first

#### Scenario: No placeholder
- **WHEN** the section is shown
- **THEN** no "Placeholder Course" line is rendered

### Requirement: Line format with localized dates
Each line SHALL read: date · issuer · title, followed by the action. The date is the short month from the locale's month dictionary (the same one the experience section uses) plus the year, in a `<time>` element whose `datetime` is the full `YYYY-MM-DD` date.

#### Scenario: Dates per locale
- **WHEN** the Marvel App course (2022-11-22) and the Algoritmo course (2021-10-13) are shown in English, Portuguese and Spanish
- **THEN** their dates read "Nov 2022" / "nov 2022" / "nov 2022" and "Oct 2021" / "out 2021" / "oct 2021", with `datetime` "2022-11-22" and "2021-10-13"

### Requirement: Open-certificate action
Each line SHALL end with an `$ open cert` action linking to the course's `certificateUrl`. The command stays in English in every locale. The link opens in a new tab with `rel` containing `noopener`. Its accessible name SHALL start with the visible command and name the course and the new tab in the page's language.

#### Scenario: Spanish accessible name
- **WHEN** the JAVA POO action is inspected on the Spanish page
- **THEN** its accessible name contains "open cert", "JAVA POO [40 HORAS]" and "se abre en una pestaña nueva", and it links to `https://todsdev.github.io/certificates/cursoemvideo-java-poo.pdf`

### Requirement: Certificate links resolve
While courses are enabled, every `certificateUrl` SHALL point to the certificate.
- **Hosted:** files under the site's `/certificates/` path SHALL be served with status 200 as PDFs.
- **Udemy:** links SHALL be `https://www.udemy.com/certificate/<id>/` URLs whose certificate exists, shown by Udemy's certificate image for the same id returning 200.

#### Scenario: Hosted PDF
- **WHEN** courses are enabled and `https://todsdev.github.io/certificates/cursoemvideo-algoritmo.pdf` is requested after deploy
- **THEN** it returns 200 with a PDF body

#### Scenario: Udemy certificate
- **WHEN** the Marvel App course's link is checked
- **THEN** it is `https://www.udemy.com/certificate/UC-2ec0adb8-eaf1-475b-9481-ef6d7106aef8/`, and Udemy's certificate image for that id returns 200

### Requirement: Hosted certificates without metadata
Certificate files published under `/certificates/` SHALL contain no document metadata: no Info dictionary entries (title, author, creator, producer, dates) and no XMP packet. The visible certificate content SHALL be unchanged.

#### Scenario: Stripped PDF
- **WHEN** a hosted certificate PDF is inspected
- **THEN** it has no Title, Author, Creator, Producer, CreationDate or ModDate entries and no XMP metadata, and it renders the same certificate page as the original

### Requirement: Layout at every width
On wide screens, date, issuer and title SHALL line up as columns across lines. Below 40rem, each course SHALL show date and issuer on one line above its title, with the action after the title. Nothing SHALL overflow horizontally at 320px.

#### Scenario: Columns at 1280px
- **WHEN** the section is shown at 1280px
- **THEN** every date starts at the same x, every issuer starts at the same x, and every title starts at the same x

#### Scenario: Mobile at 320px
- **WHEN** the section is shown at 320px in any locale
- **THEN** each course's date and issuer share one line, its title starts on a line below them, and nothing overflows the viewport

### Requirement: Accessible and stable list
The courses SHALL be one list with one item per course. The ` · ` separators and the `$` prompt are hidden from assistive technology. All text SHALL meet AA contrast. Every action SHALL be reachable by keyboard with a visible focus indicator at 320px. Rendering, scrolling and focus SHALL cause no layout shift.

#### Scenario: Markup
- **WHEN** the section markup is inspected
- **THEN** it has one list of five items, each with one `<time datetime>` and one link

#### Scenario: Keyboard at 320px
- **WHEN** a keyboard user tabs through the section at 320px
- **THEN** focus reaches the five actions in list order, each fully visible with a focus outline

#### Scenario: No layout shift
- **WHEN** the page loads and the visitor scrolls through the section and focuses each action
- **THEN** no layout shift is recorded and no element in the section moves or resizes

### Requirement: Courses only while enabled
The courses section SHALL render only while the profile's `courses.enabled` is `true`. While it is `false`, no locale page SHALL contain the section, a course line, an `$ open cert` action, a `certificate` analytics attribute, or any link or anchor to `#courses`.

#### Scenario: Flag off
- **WHEN** `courses.enabled` is `false` and any locale page is built
- **THEN** it has no element with id `courses`, no `href` ending in `#courses`, no course title or issuer, and no `data-event="certificate"`

#### Scenario: Flag on
- **WHEN** `courses.enabled` is `true`
- **THEN** the section renders as the other requirements of this capability describe

#### Scenario: Deep link while off
- **WHEN** `courses.enabled` is `false` and a visitor opens `/#courses`
- **THEN** the page stays at the top, the hero is the active nav item, and no error is thrown

### Requirement: Hosted certificates only while enabled
Certificate files under the site's `/certificates/` path SHALL be published only while `courses.enabled` is `true`, at the same URLs as before. While it is `false`, the build output SHALL contain no `/certificates/` files and requesting one SHALL return 404.

#### Scenario: Flag off
- **WHEN** `courses.enabled` is `false` and `/certificates/cursoemvideo-algoritmo.pdf` is requested
- **THEN** the response is 404, and the build output has no `certificates` directory

#### Scenario: Flag on
- **WHEN** `courses.enabled` is `true` and the same URL is requested
- **THEN** it returns 200 with the same metadata-free PDF as before
