# Design

## Context

- **Placeholders:** `<Section id="contact">` is empty, and there is no footer.
- **Today's contacts schema:** `kind` (email | github | linkedin | other), a localized `label` and `url`. Three entries, used nowhere else yet.
- **The `js` class:** `BaseLayout` swaps `no-js` for `js` on `<html>` in a blocking inline script before first paint, so no-JS styles are pure CSS and cause no shift.
- **Reusable pieces:**
  - the terminal-action pattern from projects and courses (`$ ` hidden, command, visually hidden localized destination with no whitespace before it);
  - `links.newTab`;
  - `formatMonth`, `isoDate` and the month dictionaries.
- **Constraints:**
  - CLS 0;
  - AA contrast;
  - GitHub Pages (static only: no server redirects);
  - commands in English.

## Goals / Non-Goals

**Goals:**
- No readable phone number in any built HTML, with the phone and WhatsApp lines identical to a normal render once JavaScript runs, and no flash or shift.
- A working page without JavaScript for every contact except phone and WhatsApp.

**Non-Goals:**
- No obfuscation of the email (requested in clear).
- No protection of the résumés' printed text or the repository YAML (approved as is).

## Decisions

1. **Encoding the protected kinds.**
   - **Which kinds:** `phone` and `whatsapp` are protected by kind.
   - **At build time:** `src/lib/contact.ts` encodes the value and url as `btoa(reverse(str))` and renders them only as `data-enc-value` and `data-enc-url` on the line. The line's visible part is the no-JS note.
   - **At runtime:** an inline script placed right after the list (`is:inline`, synchronous, so it runs before the rest of the page is parsed and painted) decodes each protected line. It fills the value and builds the actions: `$ call`/`$ copy` for phone, `$ chat` for WhatsApp, with the localized `?text=` appended from a `data-wa-text` attribute.
   - **Showing the right state:** CSS shows the note under `.no-js` and the value and actions under `.js`. The JS state is the one painted, so nothing swaps after paint.
   - **Alternative:** a deferred module script. Rejected: it would fill the lines after first paint and risk a shift and a flash of the note.
   - **Alternative:** a meta-refresh page for WhatsApp. Rejected: it would just move the number into another static HTML file.

2. **Copy.**
   - **Markup:** `$ copy` is a `<button type="button">` that only exists for JS. It's hidden under `.no-js` with `display: none`; under `.js` it is in the flow from the start, so it causes no shift.
   - **Reserved width:** its two labels, `$ copy` and `> copied to clipboard`, share one grid cell (`display: inline-grid; grid-area: 1/1`). The inactive one is `visibility: hidden`, so the button is always as wide as the longer label and the swap moves nothing.
   - **Script:** `src/scripts/contact.ts` uses `navigator.clipboard.writeText`, with a hidden-textarea `execCommand('copy')` fallback. It toggles the labels for 2,000 ms and writes the message into one visually hidden `aria-live="polite"` region in the section. Clearing and re-setting the region makes repeated copies announce again.

3. **vCard.**
   - **Static files:** vCard 3.0 text is built by `vcard()` in `src/lib/contact.ts`: `FN`, `N`, `TITLE` (profile role), `EMAIL;TYPE=INTERNET`, `URL` (the locale's site URL), `URL;TYPE=LinkedIn`, `URL;TYPE=GitHub`, with CRLF line endings. Static endpoints `src/pages/contact.vcf.ts`, `src/pages/pt-br/contact.vcf.ts` and `src/pages/es/contact.vcf.ts` emit it with no `TEL`.
   - **With JS:** the click handler fetches the same URL, inserts `TEL;TYPE=CELL:+5521971470428` (decoded from the phone line) before `END:VCARD`, and triggers a Blob download named `contact.vcf`. The `$ wget contact.vcf` link's `href` is the static file, so no-JS visitors still get a card.
   - **Alternative:** embed the vCard text in the page. Rejected, because the endpoint keeps one source of truth.

4. **Résumé.**
   - **Files:** stripped with the same scratch `pdf-lib` tool as the certificates: Info dictionary, XMP and page timestamps removed. A render comparison must show the pages pixel-identical. They're stored as `public/resume/resume-{en,pt-br,es}.pdf`.
   - **Link:** `Contact.astro` checks `existsSync(public/resume/resume-<locale>.pdf)` at build time and falls back to `resume-en.pdf`. The link has `download="resume.pdf"`. It is same-origin, so there is no new tab.
   - **Accessible name:** it names the résumé and its language.

5. **Line layout.**
   - **Markup:** `ul.contacts` with `li` per contact: `label` (muted), `· value` (text), then the actions. On wide screens a subgrid aligns label and value columns, like the courses list.
   - **Narrow screens (< 40rem):** label and value on one line, actions on the next.
   - **Closing actions:** the vCard and résumé actions sit on a closing line under the list, as a small `ul` of two.
   - **Accessible names:** from dictionary templates, e.g. "mail, write to trod.dev@gmail.com", "open, Instagram profile of Thiago Rodrigues (opens in a new tab)".

6. **Footer.**
   - **Component:** `Footer.astro` is rendered by `BaseLayout` after the page slot, so the 404 page gets it too. It takes the locale.
   - **Data:**
     - the profile `name` and `sourceUrl`;
     - the build date, `new Date()` at build time, formatted as `d Mon yyyy` with the month dictionaries (`formatDay`, a small addition next to `formatMonth`), with `isoDate` as `datetime`.
   - **Hint slot:** `<slot name="hint" />`, wrapped in `{Astro.slots.has("hint") && …}`, so an empty slot renders nothing.

## Risks / Trade-offs

- **[Encoded number is trivially reversible]** → Accepted (approved). It stops pattern-matching scrapers, which is the realistic threat. The README states it.
- **[Inline script ordering]** → It must sit after the list, inside the section. A check verifies with JavaScript that the protected lines have their values at the first layout-shift observer tick (CLS 0).
- **[Clipboard API needs a secure context]** → GitHub Pages and localhost are secure. The fallback covers older browsers.
- **[Build date changes every deploy]** → Intended ("last build"). Tests read it from the page rather than hardcoding it.

## Migration Plan

The schema, the contacts content and the profile `sourceUrl` land in one commit, so the build never breaks. Rollback is a revert of the merge commit.
