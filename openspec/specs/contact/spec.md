# contact Specification

## Purpose

Defines the contact section: contacts from the collection as terminal-style lines with per-kind actions, copy feedback, a localized WhatsApp message, a phone number kept out of the static HTML, vCard and résumé downloads, and the accessibility and stability guarantees.

## Requirements

### Requirement: Contact section title
The contact section SHALL keep its terminal-prompt title, translated per locale: `$ ./contact.sh`, `$ ./contato.sh`, `$ ./contacto.sh`.

#### Scenario: Spanish title
- **WHEN** the Spanish page is shown
- **THEN** the contact section heading reads `$ ./contacto.sh`

### Requirement: Contact lines from the collection
The section SHALL render one line per visible contact, in `order`: label · value · actions. The label comes from the content in the page's language. The section SHALL NOT contain hardcoded contact text.

#### Scenario: Current order
- **WHEN** the section is shown in any locale with JavaScript
- **THEN** the lines are email, phone, whatsapp, linkedin, github, instagram, in that order

#### Scenario: Email line
- **WHEN** the email line is shown in English
- **THEN** it reads "email · trod.dev@gmail.com · $ mail $ copy"

### Requirement: Actions per kind
Each contact SHALL offer actions by kind, as English commands:
- email: `$ mail` (its `mailto:` URL) and `$ copy`;
- phone: `$ call` (its `tel:` URL) and `$ copy`;
- whatsapp: `$ chat`;
- linkedin, github, instagram: `$ open`.

External links SHALL open in a new tab with `rel` containing `noopener`. Every action's accessible name SHALL start with its command and name the destination (and the new tab, for external links) in the page's language.

#### Scenario: Instagram
- **WHEN** the instagram line is inspected on the Portuguese page
- **THEN** it has exactly one action, `$ open`, linking to `https://www.instagram.com/ogtods/` in a new tab, with a Portuguese accessible name that contains "open" and names Instagram and the new tab

### Requirement: Copy with feedback
`$ copy` SHALL copy the contact's value to the clipboard. For about 2 seconds the action SHALL read "> copied to clipboard" ("> copiado para a área de transferência" / "> copiado al portapapeles"), then return to `$ copy`. The same message SHALL be announced through an `aria-live` region. Showing and hiding the message SHALL NOT move or resize anything. Without JavaScript, no copy actions are shown.

#### Scenario: Copy the email in Spanish
- **WHEN** a visitor activates `$ copy` on the email line of the Spanish page
- **THEN** the clipboard holds "trod.dev@gmail.com", the action reads "> copiado al portapapeles" and the live region announces it, and after about 2 seconds the action reads `$ copy` again

### Requirement: WhatsApp message
`$ chat` SHALL open WhatsApp for the contact's number with a prefilled, URL-encoded `text` in the page's language:
- en "Hi Thiago! I saw your portfolio and would like to talk."
- pt-br "Olá, Thiago! Vi o seu portfólio e gostaria de conversar."
- es "¡Hola, Thiago! Vi tu portafolio y me gustaría conversar."

#### Scenario: Portuguese message
- **WHEN** the `$ chat` link is inspected on the Portuguese page with JavaScript
- **THEN** it is `https://wa.me/5521971470428?text=` followed by the URL-encoded Portuguese message

### Requirement: Phone number protection
No built page SHALL contain the phone number in readable form: neither its digits in order (with or without separators), nor a `tel:` link, nor a `wa.me/` link. With JavaScript, the phone and WhatsApp lines SHALL get their value and links at runtime, before they are painted. Without JavaScript, both lines SHALL show their label and a translated note: "enable JavaScript to see the number" / "ative o JavaScript para ver o número" / "activa JavaScript para ver el número".

#### Scenario: Static HTML
- **WHEN** every built HTML file is searched
- **THEN** none contains "5521971470428", "21971470428", "97147-0428", "97147 0428", "tel:" or "wa.me/"

#### Scenario: With JavaScript
- **WHEN** the page loads with JavaScript
- **THEN** the phone line shows "+55 21 97147-0428" with `$ call` (`tel:+5521971470428`) and `$ copy`, and the WhatsApp line shows the number with `$ chat`

#### Scenario: Without JavaScript
- **WHEN** the page loads with JavaScript disabled
- **THEN** the phone and WhatsApp lines show their label and the note, with no actions, and the email, linkedin, github and instagram lines and their links still work

### Requirement: Contact card download
The section SHALL offer `$ wget contact.vcf`, linking to a vCard built at build time for the page's locale. The vCard contains name, role, email, website, LinkedIn and GitHub, and no phone. With JavaScript, activating the action SHALL download the same card with the phone added as `TEL`, named `contact.vcf`.

#### Scenario: Static card
- **WHEN** the Spanish page's vCard URL is fetched
- **THEN** it is a valid vCard with `FN:Thiago Rodrigues`, the role, `EMAIL` trod.dev@gmail.com, the website `https://todsdev.github.io/es/`, the LinkedIn and GitHub URLs, and no `TEL` line

#### Scenario: Downloaded card with JavaScript
- **WHEN** a visitor activates `$ wget contact.vcf` with JavaScript
- **THEN** the downloaded `contact.vcf` has the same fields plus `TEL` `+5521971470428`

### Requirement: Résumé download
The section SHALL offer `$ wget resume.pdf`, linking to `/resume/resume-<locale>.pdf` for the page's locale. If that file doesn't exist at build time, it links to the English file. The published résumés SHALL carry no document metadata (no Info dictionary entries and no XMP).

#### Scenario: Locale file
- **WHEN** the Portuguese page is built with all three résumés present
- **THEN** `$ wget resume.pdf` links to `/resume/resume-pt-br.pdf`, which returns 200 as a PDF

#### Scenario: Fallback
- **WHEN** `resume-es.pdf` is missing at build time
- **THEN** the Spanish page's `$ wget resume.pdf` links to `/resume/resume-en.pdf`

### Requirement: Accessible and stable contact list
The contacts SHALL be one list with one item per contact. The ` · ` separators and `$` prompts are hidden from assistive technology. All text SHALL meet AA contrast. Every action SHALL be reachable by keyboard with a visible focus indicator at 320px, and nothing SHALL overflow. Loading (including the runtime phone lines), scrolling, focus and copy feedback SHALL cause no layout shift.

#### Scenario: 320px
- **WHEN** the section is shown at 320px in any locale
- **THEN** each contact's label and value are readable, its actions wrap without overflow, and Tab reaches every action in order with a visible outline

#### Scenario: No layout shift
- **WHEN** the page loads, the visitor scrolls through the section, focuses each action and triggers a copy
- **THEN** no layout shift is recorded
