# todsdev.github.io

One-page personal portfolio of Thiago Rodrigues (Android Developer), built with [Astro](https://astro.build) and served by GitHub Pages at <https://todsdev.github.io/>.

## Prerequisites

- Node 24 (pinned in `.nvmrc`; run `nvm use` if you use nvm)
- npm (ships with Node)

## Getting started

```sh
nvm use
npm ci
npm run dev
```

## Scripts

| Command                | What it does                                                |
| ---------------------- | ----------------------------------------------------------- |
| `npm run dev`          | Start the dev server at `http://localhost:4321`             |
| `npm run build`        | Build the static site into `dist/`                          |
| `npm run preview`      | Serve the built `dist/` locally                             |
| `npm run check`        | Type-check `.astro` and `.ts` files                         |
| `npm run lint`         | Lint with ESLint                                            |
| `npm run format`       | Format all files with Prettier                              |
| `npm run format:check` | Verify formatting without writing changes                   |
| `npm test`             | Run the automated tests (`*.test.ts`, Node built-in runner) |

## Languages

The site is published in three locales:

| Locale             | URL       | `<html lang>` | Dictionary          |
| ------------------ | --------- | ------------- | ------------------- |
| English (default)  | `/`       | `en`          | `src/i18n/en.ts`    |
| Português (Brasil) | `/pt-br/` | `pt-BR`       | `src/i18n/pt-br.ts` |
| Español            | `/es/`    | `es`          | `src/i18n/es.ts`    |

Each locale page lives in `src/pages/` (`index.astro`, `pt-br/index.astro`, `es/index.astro`); locale helpers are in `src/i18n/index.ts`.

### Adding or translating a UI string

All user-visible UI text comes from the dictionaries; never hardcode text in components.

1. Add the key to `src/i18n/en.ts` (the source of truth).
2. Add the same key to `src/i18n/pt-br.ts` and `src/i18n/es.ts`. A missing or extra key fails `npm run check`.
3. Use it in a component with `t(locale, "group.key")` from `src/i18n/index.ts`; keys are type-checked.

## Content

Portfolio data lives in YAML under `src/content/<collection>/`, one file per entry, validated by the Zod schemas in `src/content.config.ts`.

| Collection   | Fields (L = translatable)                                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profile`    | `name`, `role` (L), `location` (L), `summary` (L), `journey`, `focus` (L), `photo`, `availability` — single entry                                                                |
| `contacts`   | `kind` (`email` \| `github` \| `linkedin` \| `other`), `label` (L), `url`                                                                                                        |
| `experience` | `company`, `role` (L), `location` (L), `start`, `end` (omit if current), `description` (L), `tech[]`, `events[]?`                                                                |
| `projects`   | `title`, `description` (L), `status` (`live` \| `building`), `ownership` (`contributor` \| `owner`), `owner?`, `via?`, `url?`, `repoUrl?`, `stores?`, `screenshots[]?`, `tech[]` |
| `skills`     | `category` (L), `items[]` — one entry per category                                                                                                                               |
| `courses`    | `title`, `issuer`, `date`, `certificateUrl`, `featured` (required)                                                                                                               |
| `education`  | `institution`, `degree` (L), `start`, `end?`                                                                                                                                     |
| `languages`  | `name` (L), `proficiency` (L)                                                                                                                                                    |

Every entry also accepts optional `order` (number, ascending), `featured` (boolean) and `hidden` (boolean; hidden entries are never rendered).

### Experience events

An experience entry may list sub-events (the Olympic Games under OBS). They render under the entry in the timeline, newest first, each with a small tick on the scroll thread:

```yaml
# src/content/experience/<entry>.yaml (excerpt)
events:
  - year: 2024
    name:
      en: Paris 2024 Olympic Games
      pt-br: Jogos Olímpicos de Paris 2024
      es: Juegos Olímpicos de París 2024
    role: Quality Control Specialist
```

`year` is an integer and `name` is translatable. `role` is a job title, shown as written in every locale.

### Profile about fields

The about section reads these profile fields:

```yaml
# src/content/profile/profile.yaml (about excerpt)
location:
  en: Rio de Janeiro, Brazil
  pt-br: Rio de Janeiro, Brasil
  es: Rio de Janeiro, Brasil
journey:
  - years: 2016–2022
    text:
      en: Biological Sciences at UFRJ
      pt-br: Ciências Biológicas na UFRJ
  - years: 2023–
    text:
      en: Android development
focus:
  en: Android · Kotlin · Jetpack Compose
```

- `location` and `focus` are translatable and appear in the about facts block.
- `journey` is a non-empty list of steps, rendered in order. `years` is a plain string shown as written. A trailing dash (`2023–`) marks an ongoing range, rendered as `2023–present` / `2023–atual` / `2023–actualidad`. `text` is translatable.

### Profile photo and availability

The hero reads two profile fields from `src/content/profile/profile.yaml`:

```yaml
# src/content/profile/profile.yaml (excerpt)
photo: ./photo.jpg
availability:
  enabled: true
  label:
    en: open to work
    pt-br: disponível
    es: disponible
```

- `photo` is a path relative to `profile.yaml`. The image is optimized at build time (AVIF/WebP, responsive sizes). To change the photo, drop the new file next to `profile.yaml` and update the path (or overwrite `photo.jpg`). A 4:5 portrait works best (the current one is 960×1200). Strip location metadata before committing, because the original file is published too. A missing file fails the build with `photo: image file not found`.
- `availability` drives the `● open to work` badge in the hero. Set `enabled: false` to hide it, or change `label` to reword it. No code changes are needed. The label is translatable and falls back to English.

### Projects

Each project becomes a card in the projects section, featured projects first, then by `order`.

- `ownership` is `owner` for your own projects or `contributor` for apps you worked on for someone else. Contributor projects need `owner`, the name of the organization that owns the app (e.g. `Globo`). `owner` projects must not set it.
- `via` is the plain name of the company you did the work through (e.g. `act digital`). It isn't translated: the connector words come from the dictionaries, giving "contributor · via act digital" / "colaborador · vía act digital" in the badge.
- `stores.playStore` must be a `https://play.google.com/` URL and `stores.appStore` an `https://apps.apple.com/` URL. Each link you set gets a `$ open play-store`, `$ open app-store`, `$ open site` (`url`) or `$ open repo` (`repoUrl`) action. `building` projects show `[building... ▓▓▓░░░]` instead of their store links.
- `screenshots` are paths relative to the project YAML; the card shows the first one in a phone frame (9:19.5, e.g. 600×1300), in grayscale until hovered or focused. Strip metadata before committing. A missing file fails the build.
- The ownership note under the cards is built from the contributor projects: one sentence pair per `owner`/`via` group, with titles joined in each locale's list format, e.g. "GloboPop, Premiere and Combate Play are owned by Globo. I contributed to them as an Android developer through act digital." Its wording lives in the `projects.note` dictionary templates; adding, hiding or renaming a contributor project updates it automatically.

### Courses

Each course is one line in the courses section (`ls -l` style): localized date · issuer · title · `$ open cert`. Featured courses come first, then the rest, newest first; courses with the same date follow `order`.

- `title` and `issuer` are shown exactly as printed on the certificate. They are names, so they aren't translated.
- `date` is the completion date (`YYYY-MM-DD`). The page shows the month and year from the locale's month dictionary ("Nov 2022" / "nov 2022").
- `certificateUrl` opens in a new tab:
  - **Udemy:** use the official `https://www.udemy.com/certificate/UC-…/` URL.
  - **Share links that can expire (e.g. Adobe):** host the PDF instead. Put it in `public/certificates/<issuer>-<course>.pdf` and use its absolute site URL (`https://todsdev.github.io/certificates/…`). Keep the original link in a YAML comment.
- Before publishing a PDF, strip its metadata: the Info dictionary (title, author, producer, dates), XMP, and generator annotations. Check that it still renders the same page.

### Translatable fields

A translatable field is an object with `en` (required), `pt-br` and `es` (optional):

```yaml
# src/content/projects/my-app.yaml
title: My App
description:
  en: An Android app.
  pt-br: Um app Android.
status: live
ownership: contributor
owner: Acme
via: act digital
stores:
  playStore: https://play.google.com/store/apps/details?id=com.example.myapp
  appStore: https://apps.apple.com/br/app/id000000000
screenshots:
  - src: ./my-app.webp
    alt:
      en: My App home screen with a list of videos.
      pt-br: Tela inicial do My App com uma lista de vídeos.
tech:
  - Kotlin
order: 2
```

Missing translations fall back to English and print a build warning such as `[content] missing es translation: projects/my-app.description → using en`. Warnings never fail the build.

### Sentence case

Prose fields (profile `summary`, journey `text`, experience and project `description`) must start with a capital letter in every locale, e.g. `Quality control at 8 Olympic Games with OBS`. Fix the text itself rather than using CSS `text-transform`. A lowercase start fails the build (`must start with an uppercase letter`). Leading digits and punctuation are skipped (`8 Olympic…`, `¿Qué…?`), and names with their own casing such as `iOS` or `gRPC` are allowed as the first word (see `OWN_CASING_WORDS` in `src/lib/sentence-case.ts`).

Invalid data — a missing required field, a malformed URL, a wrong type or an unknown enum value — fails the build with the file and field in the error message.

## Scroll thread markers

The scroll thread (`src/components/ScrollThread.astro`) is a decorative line in the left gutter whose drawn length follows scroll progress. Other sections can add markers to it:

- A marker is any element with the `data-thread-marker` attribute, either placed in the thread's `markers` slot (absolutely positioned, e.g. `style="top: 40%"`) or anywhere inside `<main>`.
- While the drawn line extends past a marker's vertical center, `src/scripts/thread.ts` sets `data-reached` on it, and removes it when the line retracts. Style both states with CSS, e.g. `[data-thread-marker][data-reached] { … }`.
- The thread is `aria-hidden` and ignores pointer events, so markers are decorative too; put any meaningful text in the section itself.

```astro
<ScrollThread>
  <span
    slot="markers"
    data-thread-marker
    class="marker"
    style="top: 40%"
  ></span>
</ScrollThread>
```

## Deployment

The site deploys to GitHub Pages through `.github/workflows/deploy.yml` (the repository's Pages source is set to **GitHub Actions**).

- **Pull requests to `main`:** the **Check and build** job runs `npm ci`, `npm run check`, `npm run lint`, `npm run format:check`, `npm test` and `npm run build`. Nothing is deployed.
- **Push or merge to `main`** (or a manual **Run workflow**): the same checks and build run, the `dist/` output is uploaded as the Pages artifact, and the **Deploy to GitHub Pages** job publishes it. If any check fails, nothing is deployed and the live site stays as it was.
- **Concurrency:** deployments run one at a time. A newer queued run replaces an older queued one, and an in-progress deployment is never cancelled.
- **Workflow:** work on a feature branch and open a PR; never push directly to `main`. Merging the PR deploys.
- **Rollback:** open a PR that reverts the offending merge and merge it; the workflow redeploys the previous state.
