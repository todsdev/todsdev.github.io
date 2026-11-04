# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/courses`. Never push directly to `main`. After each task:
- Mark it done here.
- Make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass.
- Commit only that task's changes plus this file, with a Conventional Commit message.
- Push.

New browser checks go in `~/portfolio-verify-scripts` as `c-*.mjs`. Downloaded certificates are untrusted: keep them in their own scratch directory and only parse or rewrite them.

## 1. Branch and PR

- [x] 1.1 Commit the change artifacts on `feat/courses`, push and open a draft PR. Verify with `gh pr view --json isDraft,headRefName`

## 2. Content

- [x] 2.1 Strip the three Curso em Vídeo PDFs with `pdf-lib` in a scratch tool directory, and store them as `public/certificates/cursoemvideo-{java-basico,java-poo,algoritmo}.pdf`. Verify:
  - a byte scan finds no `/Title`, `/Author`, `/Creator`, `/Producer`, `/CreationDate`, `/ModDate` or XMP;
  - each stripped file renders the same page as its original (side-by-side render, viewed);
  - each file is a valid one-page PDF.
- [x] 2.2 Replace the placeholder with the five course YAMLs from proposal.md: exact titles, issuers, dates, `featured`, an `order` of 1–5 in final display order, the Udemy URLs, the hosted PDF URLs, and the original Adobe links as comments. Verify:
  - `npm run build` passes;
  - the collection loads five entries;
  - the placeholder is gone (grep).

## 3. Section

- [x] 3.1 Add `formatMonth` to `src/lib/period.ts` (`formatPeriod` uses it) and `src/lib/courses.ts` (`sortCourses`, the `open cert` command constant), with tests. Verify `npm test` covers:
  - the existing period cases unchanged;
  - `formatMonth` in all three locales, UTC-safe;
  - featured first, then newest first, with the tie kept in `order`.
- [x] 3.2 Move `projects.newTab` to `links.newTab` and add `courses.destination` ("{title} certificate" / "certificado de {title}" / "certificado de {title}"). Verify:
  - `npm run check` passes;
  - `p-markup.mjs` still passes unchanged (Projects names identical).
- [x] 3.3 Create `src/components/Courses.astro` (markup per design.md) and render it in `<Section id="courses">`. Verify in each built locale:
  - order and dates exactly as in the spec scenarios;
  - `datetime` values;
  - one list of five items;
  - hrefs, `target="_blank"` and `rel="noopener"`;
  - no hardcoded course text in the component (grep).
- [x] 3.4 Style the list per design.md (subgrid columns ≥ 40rem, stacked rows < 40rem, colors). Verify with `c-layout.mjs` at 1280px and 320px in all locales:
  - columns aligned at 1280px;
  - at 320px, date and issuer on one line with the title below;
  - no overflow;
  - text ≥ 4.5:1;
  - keyboard Tab reaches the five actions in order with a visible outline;
  - accessible names per the Spanish scenario.

## 4. Integration

- [x] 4.1 Verify the links with `c-links.mjs`:
  - hosted PDFs return 200 with a `%PDF-` body (against `BASE` before deploy);
  - the Udemy URLs are well-formed, and Udemy's certificate image for each id returns 200.
- [x] 4.2 Verify no layout shift: CLS 0 and unchanged boxes through load, a full scroll and focusing each action (`c-stable.mjs`), plus `l-cls.mjs` (60 loads)
- [x] 4.3 Document certificate hosting and stripping in the README. Then run all verification suites plus a clean `npm ci && npm run check && npm run lint && npm run format:check && npm test && npm run build`. Verify that everything passes and the PR checks are green

## Workflow follow-up

- Archive the change, merge with a merge commit, and confirm the deploy run starts and succeeds.
- Live checks against `https://todsdev.github.io`:
  - `l-cls.mjs` (10 loads × 3 locales × 2 widths, CLS 0);
  - `c-*` checks, including live 200s for the hosted PDFs;
  - `s-*`, `p-*` and `x-*` checks.
- Delete `feat/courses` locally and on origin.
