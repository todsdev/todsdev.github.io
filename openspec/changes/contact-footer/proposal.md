# Proposal

## Why

The contact section is the last empty placeholder, and the site has no footer. Recruiters who reach the end of the page need one place to get in touch the way they prefer: email, phone, WhatsApp, LinkedIn, GitHub or Instagram. They should also be able to save a contact card and download the résumé in their language. The phone number should stay out of reach of simple HTML scrapers. The footer credits how the site is built and when it was last updated.

## What Changes

- **Content model:**
  - `contacts.kind` gains `phone`, `whatsapp` and `instagram`.
  - Contacts get a required `value`: the plain text shown on the line, e.g. `trod.dev@gmail.com`, `+55 21 97147-0428`, `linkedin.com/in/tods`.
  - The profile gets an optional `sourceUrl`, the site's repository, used by the footer.
- **Contacts content**, replaced in this order:

  | # | kind | value | url |
  |---|---|---|---|
  | 1 | email | `trod.dev@gmail.com` | `mailto:trod.dev@gmail.com` |
  | 2 | phone | `+55 21 97147-0428` | `tel:+5521971470428` |
  | 3 | whatsapp | `+55 21 97147-0428` | `https://wa.me/5521971470428` |
  | 4 | linkedin | `linkedin.com/in/tods` | `https://www.linkedin.com/in/tods/` |
  | 5 | github | `github.com/todsdev` | `https://github.com/todsdev` |
  | 6 | instagram | `@ogtods` | `https://www.instagram.com/ogtods/` |

- **Contact section** (title unchanged, translated as today: `$ ./contact.sh` / `$ ./contato.sh` / `$ ./contacto.sh`, approved): one terminal-style line per contact, label · value · actions.
  - **Actions, as commands in English:**
    - email: `$ mail` and `$ copy`;
    - phone: `$ call` and `$ copy`;
    - whatsapp: `$ chat`;
    - linkedin, github, instagram: `$ open`.
  - **Copy feedback:** `$ copy` copies the value. For about 2 seconds the action itself reads "> copied to clipboard" ("> copiado para a área de transferência" / "> copiado al portapapeles"), and an `aria-live` region announces it. The action reserves room for the longer text, so nothing moves.
  - **WhatsApp:** it opens with a prefilled message in the page's language, URL-encoded as `?text=`:
    - en "Hi Thiago! I saw your portfolio and would like to talk."
    - pt-br "Olá, Thiago! Vi o seu portfólio e gostaria de conversar."
    - es "¡Hola, Thiago! Vi tu portafolio y me gustaría conversar."
  - **Phone protection** (approved): the phone number appears nowhere in the static HTML: not as text, not as `tel:` and not in the WhatsApp URL. Both lines get their value and links from JavaScript at runtime, decoding an encoded form. Without JavaScript, the phone and WhatsApp lines show a translated "enable JavaScript to see the number" note. Every other contact keeps working.
  - **`$ wget contact.vcf`** (approved: assembled at click): vCard data is built at build time from the content, one per locale: name, role, email, website, LinkedIn and GitHub. It's served as a static `.vcf` without the phone. With JavaScript, clicking the action downloads that card with the phone added.
  - **`$ wget resume.pdf`:** downloads the résumé in the page's language from `public/resume/` (`resume-en.pdf`, `resume-pt-br.pdf`, `resume-es.pdf`), falling back to English when a locale's file is missing.
    - The three files come from `~/Downloads/`. All three open fine (two pages each, in the right language), with no scripts, actions, embedded files or encryption.
    - They have no Author field. All remaining metadata is stripped anyway (approved): Title, Creator "Chromium", Producer "Skia/PDF m153" and creation dates.
    - Their printed text, including the phone number in the header, is published as is (approved).
- **Footer**, on every page:
  - "built with Astro + OpenSpec" ("feito com Astro + OpenSpec" / "hecho con Astro + OpenSpec"), linking to the repository;
  - © plus the current year (the build year) and the name;
  - the last build date, localized ("4 Nov 2026" / "4 nov 2026" / "4 nov 2026") in a `<time datetime>`;
  - an empty, named slot for the terminal hint (added by the terminal change).
- **Accessibility:**
  - Contacts are a list.
  - External links open in a new tab, and their localized accessible names start with the command and name the destination and the new tab.
  - Copy feedback is announced.
  - All text meets AA contrast, and everything is reachable by keyboard at 320px.
- **Verification:** browser checks for:
  - order and the actions per contact;
  - copy feedback;
  - the WhatsApp text per locale;
  - the phone absent from the static HTML and present after JS;
  - the no-JS state;
  - vCard content, with and without JS;
  - résumé per locale and the fallback;
  - the 320px layout and no layout shift.

  A live CLS check runs after merge.

Assumptions (recorded here, no input needed):
- **Protection scope:** "Static HTML" covers every built page. The check fails if any page contains the phone digits in order (with or without separators), a `tel:` link or a `wa.me/` link. The encoded form (base64 of the reversed number) is allowed. The number is still in the public repository's YAML and in the résumés, so this stops naive HTML scrapers, not a determined reader.
- **Labels:** contact labels are lowercase terminal tokens, translated: email / e-mail / correo, phone / telefone / teléfono. "whatsapp", "linkedin", "github" and "instagram" stay as names.
- **Role in the vCard:** it comes from the profile's `role`, which is "Android Developer" in every locale today, so the three cards differ only in their website URL.
- **Footer date:** the build date uses the same month dictionaries as the experience and courses sections (day, short month, year). `datetime` is the full date.
- **Footer placement:** the footer lives in the base layout, so the 404 page gets it too.
- **Footer text:** "built with" is a label, so it's translated. "Astro + OpenSpec" are names.

## Capabilities

### New Capabilities
- `contact`: the contact section: order, line format, actions per kind, copy feedback, WhatsApp message, phone protection and no-JS state, vCard and résumé downloads, accessibility and stability.
- `footer`: the site footer: credit and repository link, year, last build date, and the terminal-hint slot.

### Modified Capabilities
- `content-model`: adds the contact kinds `phone`, `whatsapp` and `instagram`, the contact `value` field, and the optional profile `sourceUrl`.

## Impact

- Content and data:
  - `src/content.config.ts`;
  - `src/content/contacts/*.yaml` (six entries);
  - `src/content/profile/*.yaml` (`sourceUrl`).
- Files: `public/resume/resume-{en,pt-br,es}.pdf`, with metadata stripped.
- New components: `src/components/Contact.astro` and `src/components/Footer.astro`. Contact goes into `Portfolio.astro`; Footer goes into `BaseLayout.astro`.
- New `src/scripts/contact.ts`: decoding, copy and vCard download.
- New `src/lib/contact.ts`: actions, encoding, vCard text and WhatsApp URL, with tests.
- vCard endpoints: `src/pages/contact.vcf.ts` and locale variants.
- `src/i18n/*.ts`: contact and footer strings.
- `README.md`.
- New browser checks `k-*.mjs` in `~/portfolio-verify-scripts`.
