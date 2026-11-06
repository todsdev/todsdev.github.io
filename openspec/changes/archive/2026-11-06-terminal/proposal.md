# Proposal

## Why

The portfolio already looks and reads like a terminal: prompts in the section titles, `$ open` actions, a reserved hint slot in the footer. A real, hidden terminal rewards curious visitors (recruiters and developers alike) with a playful, keyboard-first way to explore the same content. It also shows Android/Kotlin personality through a few easter eggs. The page must stay fully usable without it: it's an extra, never a requirement.

## What Changes

- **New hidden terminal**, an accessible modal dialog over the page:
  - **Opening:** the `` ` `` or `/` key (when focus isn't in a text field), or a small `>_` button in the footer on touch devices. The footer's terminal hint slot shows a translated "press / to open the terminal" on devices with a keyboard and pointer (`` ` `` also works but isn't advertised), and only the button on touch devices.
  - **Closing:** `Esc` or `exit` closes it and returns focus to where it was. Focus is trapped inside while it's open. Output goes to an `aria-live` log, and the dialog has a localized accessible name.
  - **Look:** a panel in the site's palette and fonts (VT323 prompt, IBM Plex Mono output), drawn on top of the page with no layout shift behind it.
  - **Shell behavior:**
    - The prompt is `visitor@todsdev:~$`, with ↑/↓ history, Tab completion of commands and their arguments, and "did you mean …?" for typos.
    - An unknown command prints "command not found: <name>" plus a hint to type `help`.
    - Commands are English in every locale (project rule), and output follows the page's language.
- **Commands.** Content comes from the same content collections and dictionaries as the page; no text is duplicated.
  - **Content:**
    - `help`;
    - `whoami` / `about`: profile summary;
    - `experience`, `projects`, `skills`, `certs`, `contact`: compact text versions of the sections;
    - `cat skills.txt`: the skills section's text.
  - **Navigation:**
    - `ls`: the sections;
    - `cd <section>`: closes the terminal and scrolls to the section;
    - `lang en|pt|es`: switches language, keeping the current section.
  - **Actions:**
    - `resume`: downloads the current language's résumé;
    - `open github|linkedin|instagram|repo`: opens the link in a new tab (`repo` is the site's source repository, as in the projects section).
  - **Shell:** `clear`, `history`, `exit`.
  - **Easter eggs:**
    - `adb devices`;
    - `./gradlew build` (ends "BUILD SUCCESSFUL in 3y");
    - `neofetch`;
    - `sudo hire-me` (silent password prompt, then "Access granted." and an email with a localized subject);
    - `rm -rf /` ("nice try.");
    - `matrix` (a few seconds of falling characters inside the panel only, skipped with reduced motion);
    - `theme green|amber|gray`: a phosphor color mode for the whole site through the color tokens only, remembered in the browser and applied before first paint. `gray` restores the default, and every theme keeps AA contrast.
- **Analytics:** through the existing `track()` helper:
  - `terminal_open` once per opening;
  - `terminal_command {command}` with the recognized command name only (or `unknown`), never arguments and never the `sudo` input;
  - terminal actions also record the page's own event: `resume` records `resume {language}`, and `sudo hire-me` records `contact {kind: email, action: mail}`.
- **Phone protection kept:** `contact` shows the phone and WhatsApp lines by decoding them at runtime from the contact section, as the section does. The number never appears in built HTML or in the terminal's data file.
- **Visual identity:** the "Single dark theme" rule becomes "dark themes only": the default gray theme plus two opt-in phosphor themes. The design tokens gain per-theme values; there's still no light theme.

### Assumptions (minor, recorded for review)

- **Keyboard layouts:** on layouts where `` ` `` is a dead key (Brazilian ABNT2, for example) the browser reports `Dead`, not `` ` ``. The dead key is ignored rather than guessed, which is why the hint advertises `/`.
- **History** is kept in memory for the page load. It isn't stored, so it's lost after `lang` or a reload. The `sudo` password line is never added to it.
- **`lang pt`** maps to `pt-br`. Like the switcher, it saves the choice for the root redirect. The section kept is the one the navigation marks active, not only the URL hash.
- **`cd`** accepts the section IDs (`about`, `experience`, `projects`, `skills`, `courses`, `contact`), with or without `~/` or a trailing `/`, plus `~`, `..` and `/` for the top (hero). It counts as a navigation jump for `section_view`: only the destination is recorded. It doesn't send `nav_click`.
- **Event names:** the owner's "resume_download" and "contact_action" are the existing `resume {language}` and `contact {kind, action}` events, so terminal and section actions add up in the same dashboard counts. `open` sends only `terminal_command`.
- **`neofetch`, `adb devices` and `./gradlew build`** are fixed jokes, with the values the owner gave ("3 years", "3y", "Rio de Janeiro"), not computed from content. Their labels are translated where they're prose ("Uptime" → "Tempo ativo"), and keys that are command output stay English (`BUILD SUCCESSFUL`, `List of devices attached`).
- **Typing effects:** with motion allowed, the `./gradlew build` log appears line by line (about 1.5 s in all). Everything else prints at once. With reduced motion everything prints at once, and `matrix` prints a one-line note instead of animating.
- **Without JavaScript** the hint and the button aren't rendered visibly, because the terminal can't work.

## Capabilities

### New Capabilities

- `terminal`: the hidden terminal dialog. It covers opening and closing, focus, the accessible log, the prompt, history, completion and suggestions, every command and its output, the easter eggs, motion, localization, and the data it reads.

### Modified Capabilities

- `footer`: the "Terminal hint slot" requirement becomes the terminal hint on the locale pages (the key hint, or the `>_` button on touch devices). The 404 page has no terminal.
- `visual-identity`:
  - "Single dark theme" is replaced by "Dark themes only", with opt-in phosphor themes;
  - "Design tokens" gains per-theme token values;
  - "Contrast" applies to every theme.
- `analytics`: two new requirements.
  - "Terminal jumps": a terminal `cd` counts like a navigation jump for `section_view` (only the destination counts, with no `nav_click`).
  - "Terminal actions record the section events": `resume` and `sudo hire-me` also send `resume` and `contact`.

  The existing event interface already defines `terminal_open` and `terminal_command`.

## Impact

- **New source:**
  - `src/components/Terminal.astro` (dialog markup, styles, the footer hint and button);
  - `src/scripts/terminal.ts` (a small loader for keys and the button that imports the shell on first open);
  - `src/scripts/terminal-shell.ts` (the dialog, prompt, history and output);
  - `src/lib/terminal.ts` and `terminal.test.ts` (pure: parsing, the command table, completion, suggestions and output formatting);
  - per-locale `terminal.json` endpoints with the content the commands print (no phone).
- **Changed source:**
  - `BaseLayout.astro`: an inline theme script in `<head>`, and the terminal on every locale page;
  - `Footer.astro`: the hint slot filled by the locale pages;
  - `src/styles/tokens.css`: theme overrides;
  - `src/scripts/nav.ts`: a jump on `hashchange` to a section;
  - the dictionaries, with a new `terminal` group in en, pt-br and es;
  - `README.md`: a Terminal section.
- **Specs:** a new `terminal` spec, plus deltas to `footer`, `visual-identity` and `analytics`.
- **Dependencies:** none added.
- **Verification:** new `tm-*` suites in `portfolio-verify-scripts` (versioned there), classified in `full.sh`, plus live checks after the deploy.
