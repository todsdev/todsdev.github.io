# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/contact-footer`. Never push directly to `main`. After each task:
- Mark it done here.
- Make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass.
- Commit only that task's changes plus this file, with a Conventional Commit message.
- Push.

New browser checks go in `~/portfolio-verify-scripts` as `k-*.mjs`. Files from `~/Downloads` are untrusted: keep them in their own scratch directory and only parse or rewrite them.

## 1. Branch and PR

- [x] 1.1 Commit the change artifacts on `feat/contact-footer`, push and open a draft PR. Verify with `gh pr view --json isDraft,headRefName`

## 2. Content model and content

- [x] 2.1 Extend the contacts schema (kinds `phone`, `whatsapp`, `instagram`; required `value`) and add the optional profile `sourceUrl`. In the same commit, replace the contacts with the six entries from proposal.md (labels per design, order 1–6) and set `sourceUrl`. Verify:
  - `npm run build` passes with no fallback warnings;
  - `kind: telegram`, a missing `value` and a malformed `sourceUrl` (each temporarily) fail the build, naming the entry and field.
- [x] 2.2 Strip the three résumés with the scratch `pdf-lib` tool and store them in `public/resume/`. Verify:
  - a byte scan finds no Info entries, XMP or page timestamps;
  - the renders are pixel-identical to the originals (all pages);
  - the files are valid two-page PDFs.
- [x] 2.3 Add the contact and footer dictionary keys to en/pt-br/es: labels for actions and notes, copy feedback, the WhatsApp message, accessible-name templates and footer strings, with exact strings from the specs. Verify `npm run check` fails if a locale lacks a key (temporarily)

## 3. Contact section

- [x] 3.1 Add `src/lib/contact.ts` (actions per kind, `encode`/`decode`, `whatsappUrl`, `vcard`) plus `formatDay` in `period.ts`, with tests. Verify `npm test` covers:
  - actions per kind;
  - encode/decode round-trip, and that the encoded form contains no phone digits in order;
  - the WhatsApp URL per locale (exact encoded text);
  - vCard fields with and without `TEL` and CRLF endings;
  - `formatDay` per locale, UTC-safe.
- [x] 3.2 Add the vCard endpoints for the three locales. Verify that each built `.vcf` has the fields from the "Static card" scenario and no `TEL`
- [x] 3.3 Create `src/components/Contact.astro` (lines, protected-line markup, inline decode script, closing vCard and résumé actions with fallback) and `src/scripts/contact.ts` (copy, vCard download), and render the section. Verify in built HTML and with `k-markup.mjs`:
  - order and line text;
  - actions per kind with hrefs, `target` and `rel`;
  - accessible names;
  - the WhatsApp text per locale;
  - no phone digits, `tel:` or `wa.me/` in any built HTML file (grep across `dist`);
  - with JS, the phone and WhatsApp lines are complete;
  - without JS, the note shows and the other links work;
  - the résumé link per locale, plus the fallback with `resume-es.pdf` temporarily removed;
  - no hardcoded contact text (grep).
- [x] 3.4 Style the section per design.md. Verify with `k-layout.mjs` at 1280px and 320px in all locales:
  - columns at 1280px;
  - label and value on one line at 320px with actions below;
  - no overflow;
  - text ≥ 4.5:1;
  - Tab order with a visible outline;
  - copy feedback (clipboard content, label swap, live region, back after about 2s, no box change);
  - the downloaded vCard includes `TEL`.

## 4. Footer

- [ ] 4.1 Create `src/components/Footer.astro` with the hint slot and render it from `BaseLayout`. Verify with `k-footer.mjs` in all locales and on the 404 page:
  - credit text per locale and the repository link;
  - © year and name;
  - the build date localized with `datetime`;
  - no element for the empty hint slot;
  - no overflow at 320px;
  - keyboard focus on the link.

## 5. Integration

- [ ] 5.1 Verify no layout shift: CLS 0 and unchanged section boxes through load, scroll, focus and copy (`k-stable.mjs`), plus `l-cls.mjs` (60 loads)
- [ ] 5.2 Document contacts, phone protection, vCard, résumés and the footer in the README. Then run all verification suites plus a clean `npm ci && npm run check && npm run lint && npm run format:check && npm test && npm run build`. Verify that everything passes and the PR checks are green

## Workflow follow-up

- Archive the change, merge with a merge commit, and confirm the deploy run starts and succeeds.
- Live checks against `https://todsdev.github.io`: `l-cls.mjs` (10 loads × 3 locales × 2 widths, CLS 0), plus the `k-*`, `c-*`, `s-*`, `p-*` and `x-*` checks.
- Delete `feat/contact-footer` locally and on origin.
