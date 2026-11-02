# Proposal

## Why

The about section is still an empty placeholder under `$ cd ~/about`, even though the seeded profile now has a real summary, location, languages and education. This change turns that content into the second thing a visitor reads: who Thiago is, how he got from biology and Olympic broadcasting to Android, and the key facts at a glance. All of it is driven by the content collections, so it stays editable without code changes.

The seed also invalidated the content-model's "Placeholder content" requirement: there is no longer an English-only field to exercise the translation fallback. The fallback behavior is still needed, so its verification should move to a fixture-based test instead of depending on production content.

## What Changes

- **About section** (title unchanged: `$ cd ~/about`, translated):
  - **Main column:** the profile summary as a readable IBM Plex Mono paragraph, followed by a "journey" block styled like terminal output. It lists each journey step with its years.
  - **Side column:** a `neofetch`-style facts block, with dim keys and bright values: location, languages (name and proficiency), education (degree and institution), and focus.
  - **Mobile:** a single column, with the facts block after the journey.
- **Profile content:** `location` becomes translatable (en "Rio de Janeiro, Brazil"; pt-br and es "Rio de Janeiro, Brasil"). New `journey` field (a list of `{ years, text }`, where `text` is translatable) and new `focus` field (translatable). Seeded with the three journey steps and `Android · Kotlin · Jetpack Compose` in en, pt-br and es.
- **Fallback test:** the translation fallback (English value plus a build warning) is verified by an automated test on fixture data, run with Node's built-in test runner via a new `npm test` script. CI runs it before deploying.
- **Accessibility:** semantic markup (the facts block is a description list, the journey an ordered list), the same entrance motion as the other sections with nothing extra animated, and AA contrast for keys and values.

Decisions and assumptions (revise before apply if wrong):
- **Open-ended years** are written as `2016–` (a trailing dash) in `profile.yaml` and rendered with a translated word for "present" (`present` / `atual` / `actualidad`). Writing a literal `present` in the shared `years` string would show English on the Portuguese and Spanish pages. `years` otherwise stays a plain string, as requested.
- **Fact labels and block headings** come from the dictionaries, because they're UI text. All values come from the content collections.
- **Block headings:** the journey and facts blocks get small terminal-command headings (e.g. `$ cat journey.log`, `$ neofetch`) as `h3`s, so the section has a proper heading outline.
- **Value formats:** languages render as `Portuguese (Native) · English (Fluent) · Spanish (Basic)`, in collection order. Education renders as `degree · institution`.

## Capabilities

### New Capabilities
- `about`: the about section's content, layout (two columns on desktop, one on mobile), the journey block, the facts block, and their accessibility and motion behavior.

### Modified Capabilities
- `content-model`:
  - Makes profile `location` translatable, and adds the profile `journey` and `focus` fields.
  - Replaces "Placeholder content" (which required an English-only production field) with a collection-coverage requirement plus a requirement that the fallback be verified by a fixture-based automated test.
- `site-build`: adds an automated test command (`npm test`) for logic that production content can't exercise.
- `site-deployment`: the deploy gate also requires the automated tests to pass.

## Impact

- **Code:**
  - New `src/components/About.astro`, used by `Portfolio.astro` instead of the placeholder about section.
  - The pure localization logic moves from `src/lib/content.ts` to a new `src/lib/localize.ts`, so it can be tested without Astro.
  - New `src/lib/localize.test.ts`, with fixtures inline or under `test/fixtures/`.
- **Content and config:**
  - `src/content.config.ts`: profile `location` becomes translatable and gains the `journey` and `focus` fields. `src/content/profile/profile.yaml` gets the translated location and the seed data, and the README profile docs are updated.
  - `src/i18n/*.ts` gain the about labels and headings.
  - `package.json` gains a `test` script, `.github/workflows/deploy.yml` gains a test step, and the README is updated.
- **Dependencies:** none new. Node 24 runs TypeScript test files natively with `node --test`.
- **Specs:** new `about`; modified `content-model`, `site-build` and `site-deployment`.
- **Delivery:** a `feat/about` branch with a draft PR, one Conventional Commit per task, and deployment on merge.
- **Out of scope:** experience-timeline (including the OBS `events` schema), projects, skills, courses, contact-footer, terminal easter egg, polish.
