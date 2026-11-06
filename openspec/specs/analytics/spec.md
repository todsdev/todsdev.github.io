# analytics Specification

## Purpose
Defines the site's cookieless visitor analytics: which tracker loads and where it reports, which page views and click events are recorded with which data, and the privacy and stability guarantees tracking must keep.

## Requirements

### Requirement: Cookieless tracker on every page
Every page SHALL load the Umami Cloud tracker (`https://cloud.umami.is/script.js`) with website ID `22e09e62-a897-496c-9972-736ca18ac3ce`, asynchronously, so it never blocks parsing, first paint or the site's own scripts. The site SHALL set no cookies and SHALL need no consent banner.

#### Scenario: Tracker on all pages
- **WHEN** `index.html`, `pt-br/index.html`, `es/index.html` and `404.html` are inspected in the build
- **THEN** each loads `https://cloud.umami.is/script.js` once, `async`, with `data-website-id="22e09e62-a897-496c-9972-736ca18ac3ce"`

#### Scenario: No cookies
- **WHEN** a visitor loads the live home page and clicks a tracked action
- **THEN** no cookie is set for `todsdev.github.io` or any Umami host

### Requirement: Production host only
The tracker SHALL report only when the page is served from `todsdev.github.io`. Local development, previews and other hosts SHALL send nothing.

#### Scenario: Local preview
- **WHEN** the built site is previewed at `http://localhost:4321` and a tracked action is clicked
- **THEN** no request is sent to an Umami beacon endpoint

### Requirement: Page views per path
Each page load on the production host SHALL record one page view for its path (`/`, `/pt-br/`, `/es/`, or the unknown path that served the 404 page). The URL hash SHALL be excluded, and visitors whose browser sends Do Not Track SHALL NOT be recorded.

#### Scenario: Deep link
- **WHEN** a visitor opens `https://todsdev.github.io/pt-br/#contact`
- **THEN** one page view for `/pt-br/` is recorded, without `#contact`

#### Scenario: Saved-locale redirect
- **WHEN** a visitor with a saved Portuguese preference opens `/` and is redirected to `/pt-br/`
- **THEN** only the `/pt-br/` page view is recorded

#### Scenario: Do Not Track
- **WHEN** a visitor whose browser sends Do Not Track loads a page
- **THEN** no page view or event is sent

### Requirement: Not-found event
The 404 page SHALL record a `not_found` event whose data is the requested path (pathname only, no query or hash), so missing pages can be told apart from real ones.

#### Scenario: Unknown path
- **WHEN** a visitor opens `https://todsdev.github.io/old-page?x=1`
- **THEN** a `not_found` event with `path` `/old-page` is recorded

### Requirement: Contact events
Each contact action click SHALL record a `contact` event with the contact `kind` (`email`, `phone`, `whatsapp`, `linkedin`, `github`, `instagram`) and the `action` (`mail`, `call`, `chat`, `open`, `copy`). The vCard download SHALL record a `vcard` event. The résumé download SHALL record a `resume` event with the `language` of the file served after fallback (`en`, `pt-br`, `es`).

#### Scenario: Copy email
- **WHEN** a visitor clicks "$ copy" on the email line of the English page
- **THEN** a `contact` event with `kind` `email`, `action` `copy` and `locale` `en` is recorded, and the address is copied as before

#### Scenario: Résumé in Spanish
- **WHEN** a visitor clicks "$ wget resume.pdf" on the Spanish page
- **THEN** a `resume` event with `language` `es` and `locale` `es` is recorded, and the PDF downloads as before

#### Scenario: vCard
- **WHEN** a visitor clicks "$ wget contact.vcf"
- **THEN** a `vcard` event is recorded, and the downloaded card still includes the phone number

### Requirement: Project and certificate events
Each project link click SHALL record a `project_link` event with the project's content ID and the `link` kind (`play-store`, `app-store`, `site`, `repo`). Each "$ open cert" click SHALL record a `certificate` event with the course's content ID.

#### Scenario: Store link
- **WHEN** a visitor clicks "$ open play-store" on the GloboPop card in Portuguese
- **THEN** a `project_link` event with `project` `globopop`, `link` `play-store` and `locale` `pt-br` is recorded, and the store listing opens in a new tab as before

#### Scenario: Certificate
- **WHEN** a visitor clicks "$ open cert" on a course line
- **THEN** a `certificate` event with that course's content ID is recorded

### Requirement: Section view events
On the locale pages, each section (`hero`, `about`, `experience`, `projects`, `skills`, `courses`, `contact`) SHALL record one `section_view` event with its `section` ID the first time, per page load, it reaches the area of the viewport that makes it the active section in the navigation. This is the scroll-depth measure. During a scroll started by a navigation click, only the destination section SHALL be recorded, when it becomes active.

#### Scenario: Scrolling down
- **WHEN** a visitor loads `/es/` and scrolls slowly to the bottom
- **THEN** exactly seven `section_view` events are recorded, in page order, each with `locale` `es`

#### Scenario: Scrolling back up
- **WHEN** the visitor then scrolls back to the top
- **THEN** no further `section_view` event is recorded

#### Scenario: Short last section
- **WHEN** the page is scrolled to its end and the last section never reaches that area
- **THEN** its `section_view` is still recorded once, when the navigation marks it active

#### Scenario: Deep link
- **WHEN** a visitor opens `/#contact`
- **THEN** `section_view` is recorded for `contact`, and not for the sections the jump skipped without showing them in that area

#### Scenario: Nav jump from the hero
- **WHEN** a visitor at the top of `/` clicks the "Contact" navigation link and the page smooth-scrolls to the contact section
- **THEN** only a `nav_click` event with `section` `contact` and a `section_view` event for `contact` (once it becomes active) are recorded
- **AND** no `section_view` is recorded for `about`, `experience`, `projects`, `skills` or `courses`, which the scroll passed on the way

#### Scenario: Scrolling after a nav jump
- **WHEN** the nav jump has ended and the visitor then scrolls normally back up through `courses`
- **THEN** `section_view` is recorded for `courses`, as for any normal scroll

### Requirement: Navigation click events
Each click on a section link in the site navigation SHALL record a `nav_click` event with the target `section` ID.

#### Scenario: Nav link
- **WHEN** a visitor clicks the "Projetos" link in the Portuguese navigation, by mouse or with Enter
- **THEN** a `nav_click` event with `section` `projects` and `locale` `pt-br` is recorded, and the page scrolls to the section as before

### Requirement: Event interface for client features
Client-side features SHALL report events only through one documented tracking interface that applies the same allowlist and adds `locale`. Invalid data SHALL be dropped, never sent. For the terminal it SHALL define `terminal_open` (no fields) and `terminal_command` (`command`). `terminal_command` SHALL carry only the name of a command the terminal recognizes, or `unknown`, never arguments or other visitor text.

#### Scenario: Command with arguments
- **WHEN** the terminal reports the input `cd ~/about --verbose`, and `cd` is a recognized command
- **THEN** a `terminal_command` event with only `command` `cd` and the page `locale` is recorded

#### Scenario: Unrecognized input
- **WHEN** the terminal reports the input `hello my name is Ana`
- **THEN** a `terminal_command` event with `command` `unknown` is recorded

#### Scenario: Invalid data
- **WHEN** a feature reports an event with an unknown name, an unknown field or a value that isn't a lowercase slug
- **THEN** nothing is sent

### Requirement: Allowlisted event data
Every event SHALL carry the page `locale` (`en`, `pt-br`, `es`), and its other data SHALL come only from the fixed fields above, which are enums, section IDs, content IDs or recognized command names. Event data SHALL NEVER contain a contact value, a URL, or text typed or copied by the visitor. The phone number SHALL still never appear in built HTML.

#### Scenario: Phone line clicked
- **WHEN** a visitor clicks "$ call" or "$ copy" on the phone line, or "$ chat" on the WhatsApp line
- **THEN** the event data holds only `kind`, `action` and `locale`, with no digit sequence of the number

#### Scenario: Built HTML
- **WHEN** `dist/**/*.html` is searched after the build
- **THEN** no phone digits, `tel:` or `wa.me/` appear, and no `data-event-*` attribute holds a URL

### Requirement: Tracking never changes the page
Tracking SHALL NOT alter layout, focus, navigation or the behavior of any action, and SHALL NOT cause layout shift. When the tracker is blocked, fails to load or JavaScript is off, every link and action SHALL work exactly as without analytics.

#### Scenario: Tracker blocked
- **WHEN** requests to Umami are blocked and a visitor scrolls the page, uses the navigation, copy, the vCard, the résumé, a store link and a certificate link
- **THEN** each works as before, and no uncaught script error occurs

#### Scenario: Layout stability
- **WHEN** the CLS check runs with the tracker loaded
- **THEN** the cumulative layout shift is the same as without it (0)

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
