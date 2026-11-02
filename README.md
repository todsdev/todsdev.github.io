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

| Command                | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Start the dev server at `http://localhost:4321` |
| `npm run build`        | Build the static site into `dist/`              |
| `npm run preview`      | Serve the built `dist/` locally                 |
| `npm run check`        | Type-check `.astro` and `.ts` files             |
| `npm run lint`         | Lint with ESLint                                |
| `npm run format`       | Format all files with Prettier                  |
| `npm run format:check` | Verify formatting without writing changes       |

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

| Collection   | Fields (L = translatable)                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `profile`    | `name`, `role` (L), `location`, `summary` (L), `photo`, `availability` — single entry            |
| `contacts`   | `kind` (`email` \| `github` \| `linkedin` \| `other`), `label` (L), `url`                        |
| `experience` | `company`, `role` (L), `location`, `start`, `end` (omit if current), `description` (L), `tech[]` |
| `projects`   | `title`, `description` (L), `status` (`live` \| `building`), `url?`, `repoUrl?`, `tech[]`        |
| `skills`     | `category` (L), `items[]` — one entry per category                                               |
| `courses`    | `title`, `issuer`, `date`, `certificateUrl`, `featured` (required)                               |
| `education`  | `institution`, `degree` (L), `start`, `end?`                                                     |
| `languages`  | `name` (L), `proficiency` (L)                                                                    |

Every entry also accepts optional `order` (number, ascending), `featured` (boolean) and `hidden` (boolean; hidden entries are never rendered).

### Profile photo and availability

The hero reads two profile fields from `src/content/profile/profile.yaml`:

```yaml
# src/content/profile/profile.yaml (excerpt)
photo: ./photo.png
availability:
  enabled: true
  label:
    en: open to work
    pt-br: disponível para trabalho
    es: disponible para trabajar
```

- `photo` is a path relative to `profile.yaml`. The image is optimized at build time (AVIF/WebP, responsive sizes). `photo.png` is a neutral placeholder: to use the real photo, drop the file next to `profile.yaml` and update the path (or overwrite `photo.png`). A portrait around 4:5 works best. A missing file fails the build with `photo: image file not found`.
- `availability` drives the `● open to work` badge in the hero. Set `enabled: false` to hide it, or change `label` to reword it. No code changes are needed. The label is translatable and falls back to English.

### Translatable fields

A translatable field is an object with `en` (required), `pt-br` and `es` (optional):

```yaml
# src/content/projects/my-app.yaml
title: My App
description:
  en: An Android app.
  pt-br: Um app Android.
status: live
url: https://example.com
tech:
  - Kotlin
order: 2
```

Missing translations fall back to English and print a build warning such as `[content] missing es translation: projects/my-app.description → using en`. Warnings never fail the build.

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

- **Pull requests to `main`:** the **Check and build** job runs `npm ci`, `npm run check`, `npm run lint`, `npm run format:check` and `npm run build`. Nothing is deployed.
- **Push or merge to `main`** (or a manual **Run workflow**): the same checks and build run, the `dist/` output is uploaded as the Pages artifact, and the **Deploy to GitHub Pages** job publishes it. If any check fails, nothing is deployed and the live site stays as it was.
- **Concurrency:** deployments run one at a time. A newer queued run replaces an older queued one, and an in-progress deployment is never cancelled.
- **Workflow:** work on a feature branch and open a PR; never push directly to `main`. Merging the PR deploys.
- **Rollback:** open a PR that reverts the offending merge and merge it; the workflow redeploys the previous state.
