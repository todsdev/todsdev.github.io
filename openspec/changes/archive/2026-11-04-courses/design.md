# Design

## Context

- **Placeholder section:** `Portfolio.astro` renders `<Section id="courses">` with no content. The courses collection has only `placeholder-course.yaml`.
- **Schema already exists:** `title`, `issuer`, `date` (coerced), `certificateUrl` (URL), `featured`, plus the common `order` and `hidden`.
- **Reusable pieces:**
  - `src/lib/period.ts` formats `Mon YYYY` with UTC getters from the month dictionaries.
  - Projects already render terminal actions with a visually hidden destination and `projects.newTab`.
- **Constraints:**
  - CLS 0.
  - AA contrast.
  - em-based widths (IBM Plex Mono advances 0.6em per glyph).
  - Commands in English, labels translated, accessible names localized.

## Goals / Non-Goals

**Goals:**
- An `ls -l` look with real column alignment on wide screens, and a readable two-line layout on phones.
- Certificate links that keep working when third-party share links expire.

**Non-Goals:**
- No "show all" or collapsing; all five are listed.
- No course descriptions or durations.

## Decisions

1. **Content and hosting.**
   - **Capture:** the Curso em Vídeo PDFs were captured with headless Chrome from Adobe's blob storage, where the share viewer fetches them. Each is a single page, and the content was read from the rendered page.
   - **Stripping:** done with `pdf-lib` in a scratch directory outside the repo. The script clears the Info dictionary (setting it to an empty dictionary), deletes the catalog's `/Metadata` stream, and saves without adding producer or dates (`updateMetadata: false`).
   - **Check:** a byte scan confirms no `/Title`, `/Author`, `/Creator`, `/Producer`, `/CreationDate`, `/ModDate` or `<x:xmpmeta` remains. A side-by-side render (`sips`) compares each page with the original.
   - **Files:** `public/certificates/cursoemvideo-{java-basico,java-poo,algoritmo}.pdf`. Astro copies `public/` as-is, so the URLs are stable.
   - **Links:** `certificateUrl` is the absolute production URL, so it works anywhere the content is reused. The original Adobe link goes in a YAML comment.
   - **Alternative:** link the Adobe share URLs. Rejected, because they can expire.

2. **Ordering in `src/lib/courses.ts`.**
   - **What:** `sortCourses()` is a stable sort on top of `getEntries()`. That output is already ordered by `order`, then id. The sort puts featured first, then date descending, so equal dates keep `order`.
   - **Tests:** a node test covers featured-before-newer, newest-first and the tie rule.

3. **Month formatting shared with experience.**
   - **What:** `formatMonth(date, months)` is exported from `period.ts`, and `formatPeriod` uses it internally. It returns `{ text: "Nov 2022" }` with UTC getters.
   - **Why:** both sections share the same dictionaries and time-zone safety. Courses use the full `YYYY-MM-DD` as `datetime`, also computed in UTC.
   - **Tests:** the existing period tests must stay green, and new tests cover `formatMonth`.

4. **Markup and layout.**

   ```html
   <ul class="ls" role="list">
     <li class="ls__row">
       <time class="ls__date" datetime="2022-11-22">Nov 2022</time>
       <span class="ls__issuer"><span aria-hidden="true">· </span>Udemy</span>
       <span class="ls__title"><span aria-hidden="true">· </span>Marvel App - …</span>
       <a class="ls__action" …><span aria-hidden="true">$ </span>open cert<span class="visually-hidden">, …</span></a>
     </li>
   </ul>
   ```

   - **Wide screens (≥ 40rem):**
     - The `ul` is a grid with columns `max-content max-content minmax(0, 1fr) max-content`.
     - Each `li` spans all columns with `grid-template-columns: subgrid`, so the columns align across lines like `ls -l`. The list keeps real `li` elements; `display: contents` was avoided because of its accessibility-tree history.
     - The column gap is one glyph, with the separators inside the issuer and title cells.
   - **Narrow screens (< 40rem):**
     - Each `li` is a two-column grid. Date and issuer sit on row 1, the title spans row 2, and the action goes on row 3, left-aligned.
     - The issuer's leading `· ` stays on row 1. The title's separator is hidden on mobile with `display: none`, because it would start a line.
   - **Colors:** dates and issuers in `--text-muted`, titles in `--text`, actions muted with `--highlight` on hover and focus, like the projects actions.

5. **Action and accessible name.**
   - **Command:** `open cert` is a constant in `courses.ts`, kept in English.
   - **Accessible name:** the hidden text is `, ${t("courses.destination", { title })} (${t("links.newTab")})`, written without whitespace before the hidden span, as in the projects cards. For example: "open cert, JAVA POO [40 HORAS] certificate (opens in a new tab)", "open cert, certificado de JAVA POO [40 HORAS] (abre em nova aba)".
   - **Shared label:** `projects.newTab` moves to `links.newTab`, and Projects is updated. p-markup must still pass unchanged.

6. **Link verification.**
   - **Hosted PDFs:** `c-links.mjs` maps `https://todsdev.github.io/certificates/*` to `BASE`, so it works before deploy, then fetches each file, expecting 200 with a `%PDF-` body.
   - **Udemy:** it checks the URL shape and requests `https://udemy-certificate.s3.amazonaws.com/image/<id>.jpg`, expecting 200 with an image.

## Risks / Trade-offs

- **[Udemy page availability can't be checked from automation (Cloudflare)]** → The image check proves the certificate exists, and visitors' browsers pass the bot check normally.
- **[`pdf-lib` rewrite changes the PDF structure]** → Rendering comparison before and after. The files are single-page vector certificates.
- **[Hosted PDFs duplicate the printed name, which is public anyway]** → Same information as on the visible certificate. Only the hidden metadata is removed.
- **[Subgrid support]** → Chrome 117+, Safari 16+ and Firefox 71+. Older browsers fall back to each row's own grid, unaligned but readable.

## Migration Plan

The placeholder is deleted in the same commit that adds the real entries, so the collection is never empty. Rollback is a revert of the merge commit.
