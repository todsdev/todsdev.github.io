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
| `profile`    | `name`, `role` (L), `location` (L), `summary` (L), `journey`, `focus` (L), `photo`, `sourceUrl?`, `availability` — single entry                                                  |
| `contacts`   | `kind` (`email` \| `phone` \| `whatsapp` \| `linkedin` \| `github` \| `instagram` \| `other`), `label` (L), `value`, `url`                                                       |
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

### Contact and footer

Each contact is one line in the contact section: `label · value · actions`, in `order`. The actions depend on `kind`:

- email: `$ mail` and `$ copy`;
- phone: `$ call` and `$ copy`;
- whatsapp: `$ chat`, which opens WhatsApp with a message in the page's language (`contact.whatsappText`);
- linkedin, github and instagram: `$ open`.

`value` is the text shown on the line; `url` is where the main action goes.

- **Phone protection:** `phone` and `whatsapp` are protected kinds. Their value and url are never written to the HTML. The page carries only an encoded form, and an inline script fills the lines in before they're painted. Without JavaScript, those lines show "enable JavaScript to see the number". This stops HTML scrapers, not a determined reader: the number is still in this repository's YAML and in the résumés.
- **`$ wget contact.vcf`:** downloads a vCard built from the profile and contacts (`/contact.vcf`, `/pt-br/contact.vcf`, `/es/contact.vcf`). The static files have no phone; with JavaScript, the downloaded card gets the phone added.
- **`$ wget resume.pdf`:** downloads `public/resume/resume-<locale>.pdf`, falling back to `resume-en.pdf` when a locale's file is missing. Strip PDF metadata before committing a new résumé, as for certificates.
- **Footer:** every page ends with a footer showing "built with Astro + OpenSpec", linked to the profile's `sourceUrl`, then © year and name, the last build date, and the analytics line ("cookieless stats by Umami") linked to Umami's privacy policy (see [Analytics](#analytics)). On the locale pages it ends with the terminal hint (see [Terminal](#terminal)); the 404 page has none and shows the footer in its own language (see [404 page](#404-page)).

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

## Terminal

A hidden terminal for curious visitors. The site never depends on it: without JavaScript it doesn't exist, and its code and data load only when it's first opened.

- **Opening:** press `/` (or `` ` ``, not advertised) outside a text field, or tap the `>_` button that replaces the footer hint on touch devices. The footer hint reads "press / to open the terminal" in the page's language.
- **Closing:** `Esc` (in vim mode, the first `Esc` only leaves vim), `exit` or the `[x]` button; focus goes back to where it was. While it's open, focus stays inside (Tab completes, Shift+Tab reaches `[x]`) and the page behind is inert.
- **Shell:** prompt `visitor@todsdev:~$`, ↑/↓ history (this page load only), Tab completion of the commands `help` lists and their arguments (including `.secrets` after `cat ` and `-a` after `ls `), and "did you mean …?" for typos. Commands are English; output follows the page's language.

| Command                                                | Does                                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `help`                                                 | Lists the commands below with a description, then a dim hint to try `ls -a`                  |
| `whoami`, `about`                                      | Name, role · location, summary                                                               |
| `experience`, `projects`, `skills`, `certs`, `contact` | Compact text versions of the sections (`cat skills.txt` is `skills`)                         |
| `ls`, `cd <section>`                                   | Lists the sections (`-a` adds `.secrets`); closes the terminal and scrolls to one (`~`: top) |
| `resume`                                               | Downloads the résumé of the page's language                                                  |
| `open github\|linkedin\|instagram\|repo`               | Opens the link in a new tab (`repo` is this site's source)                                   |
| `lang en\|pt\|es`                                      | Switches language, keeping the active section, and remembers it like the switcher            |
| `theme green\|amber\|gray`                             | Phosphor color theme for the whole site, remembered in the browser; `gray` is the default    |
| `clear`, `history`, `exit`                             | As in a shell                                                                                |

Easter eggs are never listed by `help` or offered by Tab. The way to find them is a hint trail: `help` ends with a hint to try `ls -a`, which shows `.secrets`, and `cat .secrets` lists them all with a comment each.

| Easter egg        | Does                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adb devices`     | The device list                                                                                                                                   |
| `./gradlew build` | A fake build log ending in `BUILD SUCCESSFUL in 3y`                                                                                               |
| `neofetch`        | A system card with an Android logo in characters                                                                                                  |
| `sudo hire-me`    | Asks for a password (never shown, stored or reported), then opens an email                                                                        |
| `rm -rf /`        | `nice try.`                                                                                                                                       |
| `matrix`          | Falling characters inside the panel                                                                                                               |
| `./hello`         | Closes the terminal, scrolls to the top and replays the hero intro; a key or click skips it                                                       |
| `ping thiago`     | A ping report (`time=24h`), then a tip to type `contact`                                                                                          |
| `git blame`       | Who wrote everything on this page                                                                                                                 |
| `brew coffee`     | `Error: 418 I'm a teapot`                                                                                                                         |
| `vim`             | Vim mode: the prompt becomes a dim `-- NORMAL --`, only `:q`, `:q!`, `:wq`, `:x` or `Esc` get out, anything else is `E492: Not an editor command` |
| `obs`             | The Olympic Games worked, as text only, then a tip to type `experience`                                                                           |

How it's built:

- **Data:** `terminal.json` per locale (`src/lib/terminal-data.ts`) comes from the same collections and dictionaries as the page, plus the `terminal` dictionary group. Editing content or a dictionary updates the terminal on the next build; nothing is written twice. That includes `obs`: its numbers are the Games listed under the `olympic-broadcasting-services` experience entry and the years from its start to the latest one, and the build fails if that entry is missing.
- **Phone:** like the contact section, the phone and WhatsApp values are never in the HTML or in `terminal.json`; `contact` decodes them from the contact section at runtime.
- **Code:** `src/lib/terminal.ts` holds the command table, parsing, completion, suggestions and output formats (unit-tested); `src/scripts/terminal.ts` opens and closes the dialog; `src/scripts/terminal-shell.ts` runs the commands.
- **Themes:** `src/styles/tokens.css` overrides only the seven color tokens under `<html data-theme>`, and an inline script in `BaseLayout` applies the stored theme before first paint. Every theme keeps AA contrast.
- **Intro replay:** `./hello` sends a `hero:replay` event to `src/scripts/hero.ts`, which runs the same sequence as on load once the page has stopped scrolling.
- **Motion:** with reduced motion, nothing animates: the `./gradlew build` log prints at once, `matrix` prints a note instead and `./hello` only jumps to the top.
- **Analytics:** see [Analytics](#analytics). `resume` and `sudo hire-me` also send the section's own `resume` and `contact` events.

## Analytics

The site uses [Umami Cloud](https://umami.is), which sets no cookies, so there's no consent banner. `BaseLayout` loads `https://cloud.umami.is/script.js` async on every page. The settings live in `src/lib/analytics.ts`: `WEBSITE_ID` and `TRACKED_HOST` (`todsdev.github.io`).

- **Production only:** the tracker reports only from `TRACKED_HOST`, so `npm run dev` and `npm run preview` never send data.
- **Privacy:** the URL hash isn't sent, and visitors with Do Not Track enabled aren't counted. Event data is limited to the fields below. Each value must be a lowercase slug, so a URL, an email, a phone number or free text never leaves the page.
- **Your own visits:** to stop counting them, run `localStorage.setItem("umami.disabled", 1)` in the browser console on the live site (once per browser).

Page views come from Umami itself, per path (`/`, `/pt-br/`, `/es/`). On top of that, the site sends these events, each with the page `locale` (`en`, `pt-br`, `es`):

| Event              | Fields            | Sent when                                                                                                                                     |
| ------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `nav_click`        | `section`         | A navigation link is clicked                                                                                                                  |
| `section_view`     | `section`         | A section first reaches the area that marks it active in the navigation (once per page load)                                                  |
| `contact`          | `kind`, `action`  | A contact action is used (`mail`, `call`, `chat`, `open`, `copy`), or `sudo hire-me` in the terminal (`email`, `mail`)                        |
| `vcard`            |                   | `$ wget contact.vcf`                                                                                                                          |
| `resume`           | `language`        | `$ wget resume.pdf` or the terminal's `resume` (the language of the file served, after fallback)                                              |
| `project_link`     | `project`, `link` | A project link is opened (`play-store`, `app-store`, `site`, `repo`); `project` is the entry id                                               |
| `certificate`      | `course`          | `$ open cert`; `course` is the entry id                                                                                                       |
| `not_found`        | `path`            | The 404 page loads (path only, no query or hash)                                                                                              |
| `terminal_open`    |                   | The terminal opens (once per opening)                                                                                                         |
| `terminal_command` | `command`         | A terminal command runs: its name (`./gradlew` → `gradlew`, `ls -a` → `ls`, `:q` in vim → `vim`), or `unknown`; never arguments or typed text |

`section_view` is the scroll-depth measure. While the page scrolls to a nav link's target, a deep link's or a terminal `cd`'s or `./hello`'s, only that target is recorded. The sections passed on the way count only if the visitor later scrolls through them.

### Sending events from code

Markup declares click events with `{...eventAttrs(locale, name, data)}` from `src/lib/analytics.ts`; one listener in `src/scripts/analytics.ts` sends them. Scripts call `track()` from `src/scripts/track.ts`, the only code that talks to Umami. It adds `locale`, drops any event that isn't in `EVENTS` or has an invalid value, queues events until the tracker loads, and does nothing when the tracker is blocked.

To add an event, add it to `EVENTS` (with tests) and to the table above. The terminal reports commands like this, and never passes raw input:

```ts
import { terminalCommand } from "../lib/analytics";
import { KNOWN } from "../lib/terminal";
import { track } from "./track";

track("terminal_open");
// "cd ~/about --verbose" → "cd"; anything the terminal doesn't recognize → "unknown".
track("terminal_command", { command: terminalCommand(input, KNOWN) });
```

The browser verification scripts (`~/portfolio-verify-scripts`, versioned in the private repo `todsdev/portfolio-verify-scripts`) replace Umami with a local stub by default, so test runs, including those against the live site, are never counted.

## 404 page

GitHub Pages serves one `404.html` for every unknown path, so the page works out its language in the browser. It shows `bash: <path>: command not found`, one translated line and a `$ cd ~` link to the matching home.

- **Language:** from the first segment of the requested path only: `/pt-br/…` gives Portuguese, `/es/…` Spanish and anything else English (`/espresso` is English). Saved preferences and the browser language are never used. `<html lang>`, the title, the skip link, the line, the link and the footer all follow it. The error line itself stays in English, like the rest of the terminal.
- **Path:** shown as plain text, decoded when possible, cut at 80 characters with `…`, and wrapped instead of overflowing.
- **No visible swap:** a small script in `<head>` sets `lang` before first paint, and the page pre-renders every locale's text and shows the matching one with CSS. Without JavaScript the page is English with the path `/this-page`.
- **Text:** `notFound.title`, `notFound.line` and `notFound.destination` in the dictionaries (see [Languages](#languages)). The destination is only the link's accessible name.
- **Search and analytics:** the page is `noindex`, with no canonical or `hreflang`. The `not_found` event carries the detected locale (see [Analytics](#analytics)).

## Deployment

The site deploys to GitHub Pages through `.github/workflows/deploy.yml` (the repository's Pages source is set to **GitHub Actions**).

- **Pull requests to `main`:** the **Check and build** job runs `npm ci`, `npm run check`, `npm run lint`, `npm run format:check`, `npm test` and `npm run build`. Nothing is deployed.
- **Push or merge to `main`** (or a manual **Run workflow**): the same checks and build run, the `dist/` output is uploaded as the Pages artifact, and the **Deploy to GitHub Pages** job publishes it. If any check fails, nothing is deployed and the live site stays as it was.
- **Concurrency:** deployments run one at a time. A newer queued run replaces an older queued one, and an in-progress deployment is never cancelled.
- **Workflow:** work on a feature branch and open a PR; never push directly to `main`. Merging the PR deploys.
- **Rollback:** open a PR that reverts the offending merge and merge it; the workflow redeploys the previous state.
