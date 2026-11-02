# Design

## Context

- **Current about section:** rendered by `Section.astro` in `Portfolio.astro` as a placeholder (`contentSections.map(id => <Section id locale />)`). `Section` already provides the `<section id data-reveal>` wrapper, the translated `$ <command>` `h2` and a default slot.
- **Content helpers:** `src/lib/content.ts` holds both the Astro-bound helpers (`getEntries`, `reportMissingTranslations`, which import `astro:content`) and the pure fallback logic (`localize`, `localizeDeep`, the warning set).
- **Seeded content:** after the content seed, `profile`, `languages` and `education` hold real, fully translated data. Profile `location` is currently a plain string ("Rio de Janeiro, Brazil"); this change makes it translatable.
- **Testing:** the repo has no test runner. Node 24 (pinned) runs `.ts` files natively (`process.features.typescript === "strip"`), and Astro's tsconfig sets `allowImportingTsExtensions`.

Motivation is in proposal.md, and behavior is in the four delta specs.

## Goals / Non-Goals

**Goals:**
- Reuse `Section.astro` so the about section keeps the shared title, id, reveal and scroll offset. Only its body is new.
- Make the fallback testable without Astro, by moving the pure logic into a module with no runtime imports.
- Keep CI and local commands identical: `npm test` runs locally and as a workflow step.

**Non-Goals:**
- Rendering experience, projects, skills or contacts, or adding the OBS `events` field (experience-timeline).
- A general test framework (Vitest, Playwright). The single test file uses Node's built-in runner.

## Decisions

### Component: `About.astro` inside `Section`
`Portfolio.astro` renders `<Section id="about" locale={locale}><About locale={locale} /></Section>`. The other placeholder sections stay as they are. `About.astro` loads everything it needs: `getEntries("profile" | "languages" | "education", locale)`.

```html
<div class="about">
  <div class="about__main">
    <p class="about__summary">{profile.summary}</p>
    <div class="about__journey">
      <h3 class="about__cmd">$ cat journey.log</h3>        <!-- dictionary -->
      <ol role="list">
        <li><span class="about__years">[2016–2022]</span> {text}</li>
      </ol>
    </div>
  </div>
  <aside class="about__facts" aria-labelledby="about-facts-title">
    <h3 id="about-facts-title" class="about__cmd">$ neofetch</h3>  <!-- dictionary -->
    <dl>
      <div><dt>location</dt><dd>Rio de Janeiro, Brazil</dd></div>
      <div><dt>languages</dt><dd>Portuguese (Native) · English (Fluent) · Spanish (Basic)</dd></div>
      <div><dt>education</dt><dd>{degree} · {institution}</dd></div>
      <div><dt>focus</dt><dd>Android · Kotlin · Jetpack Compose</dd></div>
    </dl>
  </aside>
</div>
```
- `<div>` wrappers inside `<dl>` are valid HTML and allow grid styling per row.
- The `$ ` prefix of the block headings is `aria-hidden`, as in section titles.
- *Alternative:* a separate `<section>` for the facts. Rejected: the about section is already the landmark, and an `aside` with a heading is enough.

### Styling
- **Grid:** one column by default. From `48rem`, `grid-template-columns: minmax(0, 1fr) minmax(14rem, 18rem)` with `gap: var(--space-5)`. DOM order is summary → journey → facts, so mobile order needs no `order:` tricks.
- **Summary:** body font (IBM Plex Mono), `--text`, `max-width: 60ch`, `line-height: 1.7`.
- **Block headings (`h3`):** body font, small size, `--text-muted`. VT323 stays reserved for the hero and section titles, per visual-identity.
- **Journey:**
  - Monospace terminal-output look: years in `--text-muted` brackets, text in `--text`.
  - A `ch`-based hanging indent, so wrapped lines align under the text, not the years.
- **Facts:**
  - Each row is a 2-column grid (`dt` fixed `ch` width, `dd` flexible). `dt` uses `--text-muted` (5.59:1 on `--bg`, AA) and `dd` uses `--text` (13.28:1).
  - `--highlight` is not used, since it's reserved for the cursor and active nav link. "Bright" therefore means `--text`.
  - A thin `--surface-2` left border evokes neofetch's column without the ASCII art.
- **Motion:** none beyond `Section`'s existing `data-reveal`.

### Content model
- **Profile schema changes:**
  ```ts
  location: localizedText, // was: text
  journey: z.array(z.object({ years: text, text: localizedText })).min(1),
  focus: localizedText,
  ```
  `localizeDeep` already walks arrays and nested objects, so `profile.journey[i].text` resolves per locale with field paths like `journey[1].text` in warnings.
- **Open-ended years:** a `years` value matching `/[–-]$/` gets the dictionary's `about.present` appended (`present` / `atual` / `actualidad`). This is done in `About.astro`, keeping the content a plain string.
- **Seed** (in `profile.yaml`):

  | years | en | pt-br | es |
  |---|---|---|---|
  | `2016–2022` | Biological Sciences at UFRJ | Ciências Biológicas na UFRJ | Ciencias Biológicas en la UFRJ |
  | `2016–` | quality control at 8 Olympic Games with OBS | controle de qualidade em 8 edições dos Jogos Olímpicos com a OBS | control de calidad en 8 ediciones de los Juegos Olímpicos con OBS |
  | `2023–` | Android development, from multiplatform at Horus to Globo apps | desenvolvimento Android, do multiplataforma na Horus aos apps da Globo | desarrollo Android, del multiplataforma en Horus a las apps de Globo |

  `focus` is `Android · Kotlin · Jetpack Compose` in all three locales. `location` becomes `{ en: "Rio de Janeiro, Brazil", pt-br: "Rio de Janeiro, Brasil", es: "Rio de Janeiro, Brasil" }`.
- **Other `location` fields:** `experience.location` stays a plain string (out of scope). Nothing else reads `profile.location` today, so the type change only affects the about facts.

### Testable fallback: `src/lib/localize.ts` + `node --test`
- **Move** `LocalizedValue`, `Localized<T>`, `FallbackContext`, `isLocalizedValue`, `localize`, `localizeDeep` and the warning set from `content.ts` into `src/lib/localize.ts`.
- **No runtime imports:** only `import type { Locale } from "../i18n"`, which type stripping erases. The locale keys are a local constant, checked against the shared type with `satisfies readonly Locale[]`, plus a compile-time assertion that it covers every `Locale`.
- **Injectable warnings:** `localize` takes an optional `warn` sink, defaulting to `console.warn`, so tests can capture warnings without patching globals. A `resetFallbackWarnings()` export clears the dedupe set between tests.
- **`content.ts`** imports from `./localize` and keeps only the Astro-bound helpers. Behavior is unchanged.
- **`src/lib/localize.test.ts`** uses `node:test` and `node:assert/strict` with inline fixtures (a fake `experience/fixture-role` entry with `en`-only fields). It checks:
  1. English fallback for `es`
  2. one warning naming collection, entry, field and locale
  3. deduplication
  4. no warning for `en` or when the translation exists
  5. `localizeDeep` handles nested arrays (`journey[0].text`) and leaves non-localized objects (image metadata) untouched
- **Script:** `"test": "node --test \"src/**/*.test.ts\""`. Node 24 expands the glob itself, with no shell globbing involved.
  - *Alternative:* Vitest. Rejected for now: it would be a new dependency for one file. Revisit with Playwright in polish.
- **Type check:** `astro check` must still pass on the test file (`node:test` types come from `@types/node`?). Not installed. To avoid a new dependency, the test file is excluded from `astro check` via `tsconfig.json` `exclude` and gets a small ambient declaration for `node:test`/`node:assert/strict` used only by tests (`src/lib/node-test.d.ts`). ESLint still lints it.
  - *Fallback:* if a typed declaration proves brittle, add `@types/node` as a dev dependency and record it in the PR (task 3.1 decides, with evidence).

### CI
`deploy.yml` build job: add `- name: Test` / `run: npm test` after "Format check" and before "Build". PR runs inherit it, matching the site-deployment and site-build deltas.

### i18n
New dictionary keys:

| key | en | pt-br | es |
|---|---|---|---|
| `about.journeyCommand` | `cat journey.log` | `cat jornada.log` | `cat trayectoria.log` |
| `about.factsCommand` | `neofetch` | `neofetch` | `neofetch` |
| `about.present` | `present` | `atual` | `actualidad` |
| `about.facts.location` | location | localização | ubicación |
| `about.facts.languages` | languages | idiomas | idiomas |
| `about.facts.education` | education | formação | formación |
| `about.facts.focus` | focus | foco | enfoque |

## Risks / Trade-offs

- [Native TS test loading needs explicit `.ts` import extensions] → The test imports `./localize.ts`, and `localize.ts` has no runtime imports. `content.ts` keeps its extensionless imports, since Vite resolves those.
- [Ambient `node:test` declaration drifting from Node's real API] → It only declares the handful of functions used (`test`, `assert.equal`, `deepEqual`, `match`). The test still runs against the real runtime, so a wrong declaration can't hide a failing assertion.
- [Facts column too narrow for long education values] → `dd` wraps normally, and the side column has a `14rem` minimum. Verified at 1280px and 768px.

## Migration Plan

Same delivery as before: `feat/about` with a draft PR, one Conventional Commit and push per task, CI (now including `npm test`) on the PR, and deployment on merge. Rollback: merge a revert PR.
