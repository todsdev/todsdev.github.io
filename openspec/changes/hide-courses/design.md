# Design: hide-courses

## Context

See proposal.md for the motivation, and the specs for the requirements. The current code shapes the approach as follows:

- **One section list drives everything:** `sectionIds` in `src/lib/sections.ts` (pure) feeds `Portfolio.astro` (rendering), `SiteNav.astro` (links), `terminal-data.ts` (`sections`, which `ls`, `cd` and Tab use) and the browser tests. `nav.ts`, `thread.ts` and `reveal.ts` read the DOM, so they follow whatever is rendered.
- **`certs` lives outside the section list:** it's an entry in `COMMANDS` (`src/lib/terminal.ts`) and a handler in `terminal-shell.ts`. `help`, Tab, `suggest` ("did you mean") and `KNOWN` (analytics) all read `COMMANDS`.
- **`terminal.json` embeds the whole `terminal` dictionary**, including `help.certs`, plus a `certs` array.
- **Astro copies `public/` verbatim.** There's no per-file condition, so the PDFs under `public/certificates/` are always published.
- **The description is a single key**, `meta.description`. It's used for the meta, `og:description` and `twitter:description`. The JSON-LD, the share images, the about content and the 404 page don't mention courses (checked).
- **Courses have no thread markers.** Only experience events carry `data-thread-marker`.
- **The availability badge** is `profile.availability.enabled`, read in `Hero.astro`. The verify-scripts h34b, h34c and h52 detect it in the fetched HTML and print `SKIP` when it's absent.

## Goals / Non-Goals

**Goals:**

- One boolean, read in a few places, with everything else derived from the section list.
- The flag set back to `true` gives the same HTML as `main` today, apart from the build date and asset hashes. This is checked with a diff (task 7.1).

**Non-Goals:**

- A general per-section toggle. Only courses get a flag. The helper takes the flag as an argument, so a second one would be a small change later.
- Hiding courses in dev only, or per locale.

## Decisions

### 1. The flag: `profile.courses.enabled`

```yaml
# src/content/profile/profile.yaml
courses:
  enabled: false
```

The schema is `courses: z.object({ enabled: z.boolean() })`, required like `availability`, so a typo fails the build instead of silently hiding the section.

- **Alternative: a new `site` collection.** Cleaner in name, but it adds a collection, a schema and a README row for one boolean.
- **Alternative: `hidden: true` on every course entry.** That needs five edits, still renders an empty section, and doesn't reach `certs` or the PDFs.

### 2. The section list: `renderedSections(courses: boolean)`

`sectionIds` stays the full ordered list (the type and the dictionary keys need every id). A new pure function in `sections.ts`, `renderedSections(courses)`, returns it without `"courses"` when the flag is false.

- **`Portfolio.astro`** reads the profile once, computes the list, renders from it and passes it to `SiteNav` as a prop.
- **`terminal-data.ts`** computes the same list.

So the page, the nav and the terminal can't disagree.

### 3. Terminal commands tied to a section

`Command` gets an optional `section?: SectionId`, and `certs` gets `section: "courses"`. A command with a `section` is available only when `data.sections` includes it.

- **Shared helper:** `available(sections)` returns the usable commands, and `help`, `complete`, `suggest` and the analytics names all go through it. `complete()` already receives `sections`. `formatHelp`, `suggest` and the known names gain the same parameter.
- **The shell** dispatches only the available names, so `certs` reaches `notFound` and analytics reports `unknown`.
- **Single source:** `terminal.json`'s `sections`. No second flag is shipped to the browser.
- **`terminal-data.ts`** omits `certs` from the payload when it's off (the field becomes optional in `TerminalData`), and drops `help.certs` from `strings`. `formatHelp` already falls back to `""` for a missing key, but `certs` isn't listed anyway.

**Alternative: a `courses: boolean` in `terminal.json`.** It's redundant with `sections`, and it's itself a mention of courses in the file.

### 4. Certificates through an endpoint

The three PDFs move, byte for byte (`git mv`), to `src/content/courses/certificates/`. The collection's loader matches only `**/*.yaml`, so they aren't entries.

`src/pages/certificates/[name].pdf.ts` does the publishing:

- **`getStaticPaths()`** returns one path per PDF in that directory while the flag is on, and `[]` while it's off.
- **`GET`** returns the file's bytes (`readFileSync`, already declared in `node-build.d.ts`) with `Content-Type: application/pdf`.

The URLs (`/certificates/<name>.pdf`) and the bytes are unchanged, so the `certificateUrl`s and the "no metadata" requirement still hold.

- **Alternative: an `astro:build:done` hook that deletes `dist/certificates`.** It needs the YAML parsed in `astro.config.mjs`, the dev server would still serve the files, and deleting output after the build is harder to reason about.
- **Alternative: keep them in `public/` and accept that they stay reachable.** That doesn't meet the request.

### 5. Description: a second key

`meta.descriptionNoCourses` is added to the three dictionaries, with the texts in the `search-and-sharing` delta. `Portfolio.astro` picks the key from the flag.

**Alternative: build the list ("experience, projects, skills and courses") from parts.** That means conjunction rules in three languages for one sentence.

### 6. Browser tests

`support/content.ts` gains two helpers, both read from the YAML and not from the page:

- `coursesEnabled()`, which reads `profile.yaml`;
- `sections()`, which is `renderedSections(coursesEnabled())`.

**Adapted tests:**

| Test | Change |
| --- | --- |
| S1, S9, S10 | iterate `sections()` instead of `sectionIds` |
| S6 | `test.skip(!coursesEnabled(), "courses are off (profile courses.enabled: false)")` |
| N2 | nav order from `sections()` |
| T5 | `formatHelp(strings, sections)` |
| T6 | `formatLs(sections())` |
| E1, E2 | the description key chosen by the flag |

**New `courses-off.spec.ts`:** every test has `test.skip(coursesEnabled(), "courses are on (profile courses.enabled: true)")`.

| Test | Checks | Breakage that must fail it |
| --- | --- | --- |
| C1 | per locale: no `#courses`, no nav link to it, no `[href$="#courses"]`, no `[data-event="certificate"]`, no `[data-thread-marker]` outside `#experience` | render `Courses` regardless of the flag |
| C2 | `/#courses`: scroll position 0, hero active, no page error | add a stray `<div id="courses">` far down the page |
| C3 | per locale: `help` has no `certs` line, `ls`/`ls -a` have no `courses/`, `cd courses` prints the cd error, `certs` prints "command not found" with the help hint, `cert` gets no "did you mean certs", Tab on `c` lists `cat  cd  clear  contact`, Tab on `cd c` gives `cd contact` | drop the `section` tag from `certs` |
| C4 | each `terminal.json`: no `certs` key, no `courses` in `sections`, no `help.certs`, no course title or issuer (from the YAMLs) | always include `certs` in the payload |
| C5 | each certificate path from the moved directory returns 404, `dist/certificates` doesn't exist, and the meta and share descriptions and the JSON-LD contain no course word | `getStaticPaths` ignoring the flag; the old description key |

C4 and C5 read files and tags only, so they run once, in desktop, like the SEO tests.

### 7. Verify-scripts

`lib.mjs` exports `COURSES` (a boolean read with a regex from the repo's `profile.yaml`, the same way `an-markup` reads contact values) and `SECTIONS` (the ordered ids without `courses` when it's false).

| Suites | Treatment |
| --- | --- |
| `c-layout`, `c-links`, `c-stable` | `if (!COURSES) { console.log('SKIP <name>: courses are off (profile courses.enabled: false)'); process.exit(0); }`: same output and exit code as h34b, h34c and h52, decided by the flag rather than the HTML (proposal assumption 3) |
| `kbd`, `l-nav`, `t64`, `an-sections`, `an-markup` | hardcoded seven-section lists replaced by `SECTIONS` |
| `t66` | the reveal check uses the last section before `contact` in `SECTIONS` instead of `courses` |
| `an-events`, `an-blocked`, `an-live` | the certificate click and its expected event only while `COURSES` |
| `tm-commands`, `tm-shell` | `certs` in the visible commands and in the Tab `c` list only while `COURSES` |
| `seo-meta` | expected descriptions per flag |
| `c-off` (new suite) | the same absence checks as C1–C5 against `BASE`, so it also runs live. Prints `SKIP` while `COURSES`. Added to `SUITES` in `full.sh` |
| `t65`, `an-track`, `l-width` | unchanged: a lenient focus list, a synthetic attribute probe and a comment |
| `c-shot`, `c-adobe` | tools, unchanged. `c-shot` has nothing to capture while off |

## Risks / Trade-offs

- **Broken direct links:** someone holding a direct certificate link gets a 404 while the flag is off. → The owner asked for exactly this. Turning the flag on restores the same URLs.
- **Flag-on rot:** with the flag off in CI, the flag-on branch of the code is tested only by hand. → Task 7.1 turns the flag on locally, runs the unit tests, `npm run test:e2e`, the three `c-*` suites and a normalized `diff -r` of `dist/` against a `main` build, then reverts. The README says to repeat this when the flag goes back on.
- **A stale flag in live checks:** live checks read the flag from the local checkout, which could differ from what's deployed. → They run only after `git pull` on `main`, following the CLAUDE.md order.
- **A regex-read flag:** the verify-scripts read the flag with a regex, which could misread a reformatted YAML. → The regex requires the `courses:` / `enabled:` pair and throws if it doesn't match, instead of defaulting.
- **`help` text:** the "courses and certificates" description stays in the dictionaries. It's only removed from `terminal.json` and the output.

## Migration Plan

1. Merge and deploy as usual. The `smoke` job doesn't touch courses.
2. Live run per CLAUDE.md, plus `c-off` and a targeted `curl -I` of the three certificate URLs, each expected to return 404.
3. Release `v1.1.0` on the merge commit.
4. **Rollback or re-enable:** set `courses.enabled: true` in a `fix/` change. No code revert is needed.
