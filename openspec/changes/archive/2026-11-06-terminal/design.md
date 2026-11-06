# Design

## Context

- **Pages:** the site is static Astro, with three locale pages and a 404 page sharing `BaseLayout`. Every section reads the content collections at build time through `getEntries(collection, locale)`, and all UI text lives in the `src/i18n` dictionaries.
- **Already in place:**
  - **Footer:** the footer reserves a `hint` slot for this change. `BaseLayout` renders the footer, so a locale page can only fill the slot through the layout.
  - **Analytics:** `track()` (`src/scripts/track.ts`) and `terminalCommand(input, known)` (`src/lib/analytics.ts`) already exist. `terminal_open` and `terminal_command {command}` are allowlisted.
  - **Navigation:** `nav.ts` treats nav clicks and deep links as *jumps*, so only the destination records `section_view`. Nav links are plain hash anchors, and CSS `scroll-behavior: smooth` is turned off under reduced motion.
  - **Phone protection:** the phone and WhatsApp values exist only encoded (`data-enc-value` / `data-enc-url` on the contact lines) and are decoded with `decode()` from `src/lib/contact.ts`.
  - **Language choice:** saved under `localStorage["preferred-locale"]`. The key is in `src/scripts/locale.ts`, which has side effects when imported.
- **Constraints:**
  - CLS must stay at 0 on every load (`l-cls`).
  - `src/lib/*` must stay pure for `node --test`.
  - No `@types/node`, and no new dependencies.

## Goals / Non-Goals

**Goals:**
- Zero cost until first use: only a small loader runs on page load. The shell code and its data load on the first opening.
- One pure, unit-tested core (parsing, the command table, completion, suggestions, output formatting). The DOM layer stays thin.
- Output is built from text nodes only, so visitor input can never become markup.

**Non-Goals:**
- No real filesystem, pipes, flags or multi-command lines. Anything after the command name is read as arguments, and only the arguments listed in the spec are used.
- No terminal on the 404 page (its footer hint slot stays empty).
- No persisted history, and no theme control outside the terminal.

## Decisions

### 1. Native `<dialog>` with `showModal()`

**Choice:** the markup is rendered in each locale page:
- a `<dialog aria-labelledby>` whose name is a visually hidden localized "terminal";
- a close button;
- the log (`role="log"`, `aria-live="polite"`);
- a form with the prompt and a labelled `<input autocomplete="off" spellcheck="false" autocapitalize="off">`.

**How it behaves:**
- `showModal()` puts the panel in the top layer and makes the page inert. Being in the top layer means no layout shift, and no body scroll lock is needed. A scroll lock would remove the scrollbar and shift the page.
- **Esc:** the dialog's `cancel` event calls the shell's close. During the `sudo` password prompt, Esc cancels the prompt instead.
- **Focus trap:** Chrome lets Tab leave a modal dialog for the browser UI, so the shell traps focus itself:
  - Tab in the input always runs completion and is prevented;
  - Shift+Tab in the input moves to the close button;
  - Tab or Shift+Tab on the close button goes back to the input.
- **Focus return:** on close, focus goes back to the element saved at opening, with `preventScroll: true`, so the page doesn't jump.

**Alternatives:** a `div` with `role="dialog"` and a hand-rolled `inert`, which means more code and the same result. A non-modal panel, which would break "page inert while open".

### 2. Two-stage loading

**Choice:**
- **`src/scripts/terminal.ts` (loader):** part of the page bundle and only a few hundred bytes. It holds:
  - the `keydown` listener for `` ` `` and `/` (skipped when there's a modifier or focus is in an `input`, `textarea`, `select` or `[contenteditable]`);
  - the `>_` button listener;
  - `track("terminal_open")`;
  - `showModal()`, which runs at once so the input is focusable immediately.
- **The shell:** on the first opening, the loader calls `import("./terminal-shell")` and fetches the locale's `terminal.json` in parallel. Until both resolve, the input works as plain text. An Enter pressed in that window is queued and run once they're ready.
- **Load failure:** if the shell or the data fails to load, the log prints a static localized line from the markup ("terminal unavailable") and the dialog still closes normally.

**Alternative:** shipping everything in the page bundle. That's simpler, but it adds roughly 10–15 KB of script and every locale's output text to each page view for a feature most visitors never open.

### 3. Content data as a static per-locale endpoint

**Choice:**
- **Endpoints:** `src/pages/terminal.json.ts`, `src/pages/pt-br/terminal.json.ts` and `src/pages/es/terminal.json.ts`, the same pattern as `contact.vcf`. Each calls `terminalData(locale)` in a new `src/lib/terminal-data.ts`, which uses Astro like `contact-card.ts` and isn't unit-tested under Node.
- **Contents:**
  - profile name, role, location, summary and `sourceUrl`;
  - experience: localized period from `formatPeriod`, company and role;
  - projects: title, status label, ownership badge with `via`, in `sortProjects` order;
  - skills: categories and items;
  - courses: title, issuer and localized month, in `sortCourses` order;
  - contacts: label, and value and url for unprotected kinds only. Protected kinds carry `{ kind, label }` and nothing else;
  - the résumé href, chosen with the same fallback rule as `Contact.astro`, moved to a shared helper so the two can't diverge;
  - the email address and the localized `sudo` mail subject;
  - the dictionary's `terminal` group, so every output string reaches the shell without bundling all three locales.
- **Phone:** the shell decodes phone and WhatsApp values from `#contact [data-kind][data-enc-value]` with `decode()`, exactly as the contact section does. An `an-markup`-style grep covers `dist/**/terminal.json` as well as the HTML.

**Alternatives:**
- an inline `<script type="application/json">` in each page: it adds bytes to every view;
- reading the rendered DOM of each section: it couples the shell to the markup of six components.

### 4. Pure core in `src/lib/terminal.ts`

**Exports:**
- `COMMANDS`: the table. Each command has its name, a `hidden` flag for the easter eggs, an optional `args` list for completion (sections, `open` targets, `en|pt|es`, `green|amber|gray`, `skills.txt`), and its `help` dictionary key.
- `KNOWN`: every name `terminalCommand()` should recognize, including `adb`, `gradlew`, `sudo`, `rm` and `matrix`.
- `parse(input)` returns `{ name, args }`. It trims, collapses spaces and lowercases the command name, but not the arguments to `sudo`. It maps `./gradlew` to `gradlew`.
- `complete(input)` returns `{ value, candidates }`. Candidates come from visible commands and the current command's `args`. A hidden command completes only when it's the sole match and no visible command matches (so `neo` gives `neofetch`); it's never listed.
- `suggest(name)`: the closest command by edit distance (optimal string alignment, so a swap counts as one), at most 1 for names under 7 characters and 2 from 7 up (so `hello` doesn't suggest `help`); ties go to table order. It also covers hidden commands: someone who typed `neofech` already knows about it.
- `sectionArg(arg)` normalizes `~/about/`, `about` and `./about`. `~`, `..`, `/` and `~/` map to `hero`.
- **Formatters:** one pure function per content command, from the data and the dictionary to an array of lines (`{ text, tone?: "muted" | "accent", ariaHidden?: boolean }`):
  - `formatWhoami`, `formatExperience`, `formatProjects`, `formatSkills`, `formatCerts`, `formatContact`, `formatHelp`, `formatHistory`;
  - plus the fixed easter-egg outputs: `adb`, the `gradlew` log lines, the `neofetch` card with the logo marked `ariaHidden`.

Tests in `src/lib/terminal.test.ts` cover parsing, completion, suggestions, section normalization and each formatter, with fixture data in all three locales.

### 5. Shell DOM layer (`src/scripts/terminal-shell.ts`)

- **Rendering:** each output line is a `div` built with `textContent`, never `innerHTML`, which satisfies the "Markup in input" scenario. The log keeps at most 500 lines.
- **History:** an in-memory array with a cursor, for ↑ and ↓.
- **Analytics:** each submitted line (not the password) sends `track("terminal_command", { command: terminalCommand(raw, KNOWN) })` once, before it runs.
- **`sudo` mode:**
  - the input switches to `type="password"` with a localized label, and the prompt changes to the `[sudo]` line;
  - on Enter, the value is read only to check that the line was submitted, then cleared, then the input goes back to `type="text"`;
  - nothing is logged, tracked or added to history;
  - then it prints "Access granted.", sends `track("contact", { kind: "email", action: "mail" })` and opens `mailto:<email>?subject=<encoded subject>` through a temporary anchor click;
  - Esc cancels the prompt and keeps the dialog open.
- **Typing effect:** only for the `gradlew` log, at about 150 ms per line (10 lines, about 1.5 s). The input is `readOnly` until it ends. The effect is skipped under `prefers-reduced-motion`, read through `matchMedia` at run time.
- **`matrix`:** a `<canvas aria-hidden>` laid over the log inside the panel. It runs for 3 s through `requestAnimationFrame`, draws in the computed `--text` color (so it follows the theme), and stops on any keydown. The canvas is removed and the input refocused afterwards. Under reduced motion it prints the note instead.
- **`cd`:**
  1. The shell closes the dialog without restoring focus.
  2. It dispatches `window.dispatchEvent(new CustomEvent("nav:jump", { detail: id }))`.
  3. It sets `location.hash = id`, so CSS smooth scrolling (or the instant jump under reduced motion) and hash navigation move the sequential focus starting point to the section.
  4. If the hash is already `#id`, it calls `scrollIntoView()` on the section instead.

  `nav.ts` gains a `nav:jump` listener that calls its existing `startJump(id)`, so section-view suppression is shared and `nav_click` isn't sent. Using a custom event rather than `hashchange` means back and forward history navigation doesn't start jumps.
- **`lang`:**
  - It reads the active section from `[data-nav-link].is-active`.
  - It builds `localePath(target, id === "hero" ? "" : "#" + id)` and saves the choice under the shared key.
  - Then `location.assign()`.
- **Shared language key:** `PREFERRED_LOCALE_KEY` moves to a side-effect-free `src/lib/storage-keys.ts`, and `locale.ts` re-exports it. Importing `locale.ts` would re-run its side effects, and importing `src/i18n/index.ts` would bundle every dictionary into the lazy shell chunk.
- **`resume`:** a temporary `<a href download>` click, plus `track("resume", { language })`, with the language from the same fallback helper as the contact section.
- **`open`:** `window.open(url, "_blank", "noopener")`, called synchronously inside the Enter keydown so the user activation counts.

### 6. Themes through tokens only

`tokens.css` gains `:root[data-theme="green"]` and `:root[data-theme="amber"]` blocks that override only the seven color tokens. The candidate values, with contrast computed using the WCAG formula:

| Token | Gray (default) | Green | Amber |
| --- | --- | --- | --- |
| `--bg` | `#0e0e0e` | `#0a0f0b` | `#100c06` |
| `--surface` | `#161616` | `#101812` | `#18120a` |
| `--surface-2` | `#1f1f1f` | `#16211a` | `#21190e` |
| `--text` | `#d6d6d6` | `#4af27a` | `#ffb83d` |
| `--text-muted` | `#8a8a8a` | `#2fae55` | `#c98a1f` |
| `--text-dim` | `#5c5c5c` | `#1d5c30` | `#6b4a12` |
| `--highlight` | `#ffffff` | `#b8ffcc` | `#ffe2a8` |
| Lowest text ratio | 4.77 (muted on surface-2) | 5.77 | 5.90 |
| `--text-dim`, highest | 2.89 | 2.42 | 2.43 |

- **Applying the theme:** an inline script in `BaseLayout`'s `<head>`, next to the `no-js` swap, reads `localStorage["theme"]`. If it's `green` or `amber`, it sets `data-theme` on `<html>` before first paint, on every page including the 404.
- **The command:** `theme` sets or removes the attribute and the key, inside `try/catch` for blocked storage.
- **Exempt from theming:**
  - the language flags (artwork);
  - project screenshots, which keep their grayscale-to-color filter;
  - the hero photo.

### 7. Footer hint through a layout slot

- **Wiring:** `BaseLayout` gains a `footer-hint` slot that it forwards to `<Footer>`'s `hint` slot. `Portfolio.astro` fills it with `<TerminalHint>`, which the locale pages render and the 404 page doesn't.
- **Contents:** both variants are in the HTML:
  - the text hint, with the key in `<kbd>`;
  - the `>_` button.
- **Which one shows:** CSS decides before first paint:
  - `.no-js` hides both;
  - `@media (hover: none) and (pointer: coarse)` shows only the button;
  - otherwise only the text shows.

  So there's no layout shift and no script involved.

### 8. Panel look

- **Position:** fixed to the top (a drop-down console).
- **Size:** `width: min(100% - 2 * var(--space-3), var(--content-max))`, centred; `max-height: min(70dvh, 34rem)`.
- **Colors:** background `--surface`, a 1px `--surface-2` border.
- **Fonts:** the prompt in VT323 (the tilde substitute face applies), input and output in IBM Plex Mono at 0.875rem.
- **Scrolling and wrapping:** the log scrolls with `overscroll-behavior: contain`, and long lines wrap with `overflow-wrap: anywhere`.
- **Backdrop:** `::backdrop` uses `--bg` at 60% opacity.
- **Motion:** opening fades and slides 8px in 120 ms, and nothing moves under reduced motion. The caret is a blinking block, steady under reduced motion. It reuses the hero cursor's styling tokens.

### 9. Output formats (all from data and the dictionary)

| Command | Format |
| --- | --- |
| `whoami`, `about` | name; then "role · location"; a blank line; the summary |
| `experience` | one line per entry, "period  company", then the indented role |
| `projects` | one line per project, "title  [status]  badge" (badge with `via` when set) |
| `skills`, `cat skills.txt` | one line per category, "Category: item · item · …" |
| `certs` | one line per course, "month year  title — issuer" |
| `contact` | label and value columns |
| `ls` | `about/  experience/  projects/  skills/  courses/  contact/` |
| `help` | "command  description", aligned |

The `neofetch` card: a fixed 8-line character logo (an Android head drawn in `/`, `\`, `o`, `-` and `_`), with the labeled lines to its right. At 320px the lines stack below the logo, through a `min-width` media query on the panel's container.

### 10. Verification

- **Unit tests:** `src/lib/terminal.test.ts`.
- **New `tm-*` browser suites** in `portfolio-verify-scripts`, committed and pushed there and classified in `full.sh`:
  - `tm-open`: keys, modifiers, text fields, the button on an emulated touch device, Esc, the close button, focus return, the focus trap, no-JS and lazy loading;
  - `tm-a11y`: role, name, label, log announcements, and the AX tree at 320px;
  - `tm-commands`: every command's output in all three locales against the content YAML, unknown commands, suggestions and markup injection;
  - `tm-shell`: history, completion and clear;
  - `tm-nav`: `cd` (smooth and reduced motion), with events `terminal_command` plus `section_view` and no `nav_click`; and `lang` with the stored choice;
  - `tm-theme`: persistence across pages and locales, the first-paint attribute, the contrast of the computed tokens in each theme, and gray reset;
  - `tm-sudo`: the password is never in the DOM text, the history or the beacons; the mailto with its subject;
  - `tm-layout`: CLS while opening and closing at 1280 and 320, overflow at 320, and the matrix canvas contained in the panel;
  - `tm-an`: the event sequence from the spec.
- **Live:** after the deploy, `tm-open`, `tm-commands` and `tm-theme` join the live run.

## Risks / Trade-offs

- **Dead-key layouts:** on ABNT2 and some Spanish layouts, `` ` `` arrives as `Dead`. → The hint advertises `/`, which always works. `` ` `` stays as an unadvertised shortcut.
- **Swallowed `/`:** `/` is a common key, and Firefox's quick find uses it. → The key opens the terminal only outside text fields and without modifiers. The default action is prevented only when the terminal actually opens.
- **Bigger HTML:** the dialog markup ships in every locale page. → It's a few hundred bytes. The output text stays in the lazy JSON.
- **Theme flash:** a theme applied by a late script would flash gray. → An inline `<head>` script runs before first paint, and `tm-theme` checks the attribute at the first `DOMContentLoaded`.
- **Popup blocking:** `window.open` or `mailto` after an async gap may be blocked. → Commands run synchronously in the Enter handler once the shell is loaded. The only async gap is the first-open load, and a queued command still runs within the activation window (5 s) in practice.
- **Phone in data:** the JSON is a new place the number could leak. → Protected kinds are reduced to `{ kind, label }` in `terminalData()`. A unit test asserts that and a build grep covers it.
- **Dialog focus quirks:** browsers differ in how they move focus to the browser UI. → The manual Tab handling in Decision 1 doesn't rely on browser behavior. The suites run in Chrome only, as all suites do.
