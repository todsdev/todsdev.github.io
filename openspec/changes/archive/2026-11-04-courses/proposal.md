# Proposal

## Why

The courses section is an empty placeholder under `$ ls ./courses`, and the courses collection holds only a placeholder entry. Thiago has five completion certificates: two Kotlin/Android courses on Udemy and three programming courses from Curso em Vídeo. Listing them with working certificate links backs up the skills section with verifiable evidence. The three Curso em Vídeo certificates are only reachable through Adobe share links, which can expire, so the site should host copies itself.

## What Changes

- **Content:** five real courses replace the placeholder. Every field was read from the certificate itself, as printed (verified on 2026-11-04):

  | LinkedIn name | Title (as printed) | Issuer | Date | Certificate |
  |---|---|---|---|---|
  | Kotlin - MVVM - HILT & More | Marvel App - Kotlin - MVVM - Hilt e muito mais. | Udemy | 2022-11-22 | `https://www.udemy.com/certificate/UC-2ec0adb8-eaf1-475b-9481-ef6d7106aef8/` |
  | Curso completo de Kotlin para Android | Curso completo de Kotlin para Android | Udemy | 2022-09-13 | `https://www.udemy.com/certificate/UC-6fa6953c-5976-4d2a-8e99-489179ceb703/` |
  | JAVA Básico | JAVA BÁSICO [40 HORAS] | Curso em Vídeo | 2022-06-29 | `https://todsdev.github.io/certificates/cursoemvideo-java-basico.pdf` |
  | JAVA POO | JAVA POO [40 HORAS] | Curso em Vídeo | 2022-06-29 | `https://todsdev.github.io/certificates/cursoemvideo-java-poo.pdf` |
  | Algoritmo | ALGORITMO [40 HORAS] | Curso em Vídeo | 2021-10-13 | `https://todsdev.github.io/certificates/cursoemvideo-algoritmo.pdf` |

  - **Featured:** the two Kotlin courses (`featured: true`); the other three are `featured: false`.
  - **Titles:** proper names, kept exactly as printed (approved): the `[40 HORAS]` suffixes, the capitals and the trailing period. They are not translated.
  - **Udemy:** the official `udemy.com/certificate/…` URL is the `certificateUrl`.
  - **Curso em Vídeo:** each certificate PDF, captured from its Adobe share link, is stored under `public/certificates/` with its metadata stripped. Its absolute site URL is the `certificateUrl`, and the original Adobe link is kept in a YAML comment. The metadata removed includes the full name in Title and Author, the producer and the timestamps.
- **Courses section** (title unchanged, translated as today: `$ ls ./courses` / `$ ls ./cursos`, approved):
  - **Format:** `ls -l`-style output, one line per course: localized date (short month + year, from the same month dictionaries as the experience section: `Nov 2022` / `nov 2022` / `nov 2022`) · issuer · title · `$ open cert`.
  - **Order:** featured courses first, then the rest; within each group, newest first. Courses with the same date follow `order`. All five are visible.
  - **Columns:** date, issuer and title line up as columns on wide screens. On mobile, date and issuer stay on one line above the title.
  - **Action:** `$ open cert` keeps the command in English in every locale, per the terminal-text rule. It opens in a new tab with `rel="noopener"`. Its accessible name starts with the command and names the course and the new tab in the page's language.
  - **Data-driven:** all content comes from the courses collection, with no hardcoded text.
- **Accessibility:**
  - The courses are one list, and dates use `<time datetime>`.
  - All text meets AA contrast.
  - Every action is reachable by keyboard with a visible focus at 320px.
- **Verification:** browser checks for:
  - order and localized dates in every locale;
  - the links: the local PDFs return 200, and each Udemy link is a well-formed `udemy.com/certificate/<id>/` URL whose certificate exists. Udemy's own certificate image for that ID must return 200, because udemy.com sits behind a Cloudflare bot check that answers automated requests inconsistently (approved);
  - accessible names, the 320px layout and no layout shift.

  A live CLS check and live 200s for the hosted PDFs run after merge.

Assumptions (recorded here, no input needed):
- **Tie order:** JAVA BÁSICO and JAVA POO share a date, so `order` puts JAVA BÁSICO first, following your listing order. With that, every course gets an `order` matching its final position (1–5).
- **`datetime` precision:** `<time datetime>` carries the full date (`2022-11-22`), which is more precise than the visible month.
- **Issuer name:** "Curso em Vídeo", as the certificate's logo reads. The legal entity printed in the footer is not used.
- **Shared label:** the "opens in a new tab" string moves from `projects.newTab` to a shared `links.newTab` dictionary key used by projects and courses. Projects output is unchanged.

## Capabilities

### New Capabilities
- `courses`: the courses section: order, line format with localized dates, the `$ open cert` action and its accessible name, mobile layout, accessibility and stability, plus the rule that hosted certificate files have no metadata.

### Modified Capabilities
<!-- None: the courses collection fields (title, issuer, date, certificateUrl, featured) are unchanged. -->

## Impact

- Content:
  - `src/content/courses/*.yaml`: five entries; the placeholder is removed.
  - `public/certificates/*.pdf`: three files.
- New `src/components/Courses.astro`, wired into `Portfolio.astro`.
- `src/lib/period.ts`: a month formatter shared with the experience periods, with tests.
- New `src/lib/courses.ts` (ordering), with tests.
- `src/i18n/*.ts`: courses accessible-name template; `newTab` moves to `links.newTab`.
- `README.md`: certificate hosting.
- New browser checks `c-*.mjs` in `~/portfolio-verify-scripts`.
- No new project dependencies. A scratch-only PDF tool (`pdf-lib`) is used outside the repo to strip metadata.
