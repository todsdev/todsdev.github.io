# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/terminal`. Never push directly to `main`. After each task:
- Mark it done here.
- Make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass.
- Commit only that task's repo files plus this file, with a Conventional Commit message, then push.

New browser checks go in `~/portfolio-verify-scripts` as `tm-*.mjs`. Add each one to `SUITES` in `full.sh`, and commit and push it to `todsdev/portfolio-verify-scripts` in the same step as the repo commit. Make each check fail at least once against the old behavior (or a deliberately broken build) before trusting it.

## 1. Branch and PR

- [x] 1.1 Commit the change artifacts on `feat/terminal`, push and open a draft PR. Verify with `gh pr view --json isDraft,headRefName`

## 2. Pure core

- [x] 2.1 Add `src/lib/terminal.ts` with `COMMANDS`, `KNOWN`, `parse`, `complete`, `suggest` and `sectionArg` (design decision 4), plus `src/lib/terminal.test.ts`. Cover:
  - case and spaces;
  - `./gradlew` → `gradlew`;
  - `sudo` arguments kept as typed;
  - completion: unique, common prefix with candidates, arguments for `cd`, `open`, `lang`, `theme` and `cat`, an empty input listing the `help` commands, and easter eggs never listed (completed only as the sole match, like `neo` → `neofetch`);
  - suggestions: `whoamii` → `whoami`, `neofech` → `neofetch`, `hello` → none;
  - `sectionArg` for `~/about/`, `./about`, `~`, `..` and `/`;
  - `terminalCommand(input, KNOWN)` for every command in the spec, including `cd projects --fast` → `cd` and `xyzzy` → `unknown`.

  Verify with `npm test`.
- [x] 2.2 Add the `terminal` dictionary group in `en`, `pt-br` and `es`:
  - the dialog name, input label, close label, unavailable line, hint text and button name;
  - help descriptions;
  - errors and usages (`command not found`, `did you mean`, the help hint, `cd`, `cat`, `lang`, `open`, `theme`, other `sudo` commands);
  - confirmations (résumé, open, language already active, theme set);
  - the `neofetch` labels and "years" unit, the `sudo` lines and mail subject, the `matrix` note.

  Following the content conventions, commands and their arguments stay English and only the text around them is translated. Verify with `npm run check` (all three dictionaries have the same keys).
- [x] 2.3 Add the formatters to `src/lib/terminal.ts` (design decision 9): `whoami`, `experience`, `projects`, `skills` (also used by `cat skills.txt`), `certs`, `contact` (protected kinds filled from a value passed in), `ls`, `help`, `history`, and the `adb`, `gradlew` and `neofetch` outputs, with the `neofetch` logo lines marked `ariaHidden`. Test them with fixture data in all three locales, including:
  - `help` lists exactly the visible commands;
  - the `gradlew` log ends in "BUILD SUCCESSFUL in 3y";
  - the `neofetch` card has "3 anos" in Portuguese.

  Verify with `npm test`.

## 3. Data endpoint

- [x] 3.1 Move the résumé locale fallback from `Contact.astro` into a shared helper. Add `src/lib/terminal-data.ts` and the three `terminal.json` endpoints (design decision 3), with protected contacts reduced to `{ kind, label }`. Verify:
  - `npm run build`;
  - the three JSON files parse and hold each section's entries in the page's order;
  - the contact section's résumé link is unchanged;
  - a grep of `dist/**/*.html` and `dist/**/terminal.json` finds no phone digits, `tel:` or `wa.me/`;
  - `an-markup` passes with its phone grep extended to `terminal.json` (commit that change to the scripts repo).

## 4. Themes

- [x] 4.1 Add the green and amber token overrides to `tokens.css` and the inline theme script to `BaseLayout`'s `<head>` (design decision 6). Verify with a new `tm-theme.mjs`:
  - with `localStorage.theme` set before load, `data-theme` is on `<html>` at `DOMContentLoaded` on `/`, `/es/` and `/404.html`;
  - computed `--text`, `--text-muted` and `--highlight` reach at least 4.5:1 on `--bg`, `--surface` and `--surface-2` in each theme, and `--text-dim` stays below 3:1;
  - an unknown stored value and blocked storage both give gray;
  - `l-cls` is still 0 with a theme stored.

  The theme command steps are added in 6.3.

## 5. Dialog, loader and hint

- [x] 5.1 Add `src/components/Terminal.astro` (dialog markup and styles, design decisions 1 and 8) and `src/scripts/terminal.ts` (loader, decision 2), rendered only by `Portfolio.astro`, and a `nav:jump` listener in `nav.ts`. The shell module can be a stub that echoes input. Verify with a new `tm-open.mjs`:
  - `` ` `` and `/` open the dialog from the body and from a link, but not from a text field (use a temporary `evaluate`-injected input) or with Ctrl or Meta;
  - Esc and the close button close it, focus returns with no scroll, the focus trap holds, and reopening keeps the log;
  - the shell chunk and `terminal.json` aren't requested before the first opening;
  - opening and closing give CLS 0 at 1280 and 320;
  - `terminal_open` is recorded once per opening.

  Make sure `kbd`, `l-cls`, `t64` and `t65` still pass.
- [x] 5.2 Add the footer hint: a `footer-hint` slot through `BaseLayout` to `Footer`, and `TerminalHint` (design decision 7) filled by `Portfolio.astro`. Verify:
  - extend `tm-open.mjs`: the desktop text appears in each locale, an emulated touch device (`hasTouch`, coarse pointer, no hover) shows only the button, the button opens the terminal and focus returns to it, the no-JS page shows neither, and the 404 footer has no hint element;
  - `k-footer` and `l-cls` still pass;
  - nothing overflows at 320px (`l-width`).

## 6. Shell and commands

- [x] 6.1 Implement `src/scripts/terminal-shell.ts`:
  - the core: rendering with `textContent`, the queued Enter, history, Tab and Shift+Tab, the unavailable line, and `track("terminal_command")` per submitted line;
  - the commands `help`, `whoami`, `about`, `experience`, `projects`, `skills`, `certs`, `contact` (with runtime phone decoding), `ls`, `cat`, `clear`, `history` and `exit`;
  - unknown commands with suggestions.

  Verify with new suites:
  - `tm-commands.mjs`: each command's output in all three locales, compared against values read from the content YAML and dictionaries; `contact` shows the decoded phone; `cat notes.txt`; the unknown-command and suggestion lines; the markup-injection input stays text;
  - `tm-shell.mjs`: history ↑↓, completion cases, `clear`, `history`, `exit`, `  WHOAMI `;
  - `tm-a11y.mjs`: dialog role and name, input label, a log announcement after `whoami` (AX tree with `interestingOnly: false`), and no overflow at 320px.
- [x] 6.2 Add `cd`, `lang`, `resume` and `open`. Verify with a new `tm-nav.mjs`:
  - `cd projects` from the top: the dialog closes, `#projects` is set, projects becomes active, and the recorded events are exactly `terminal_command {cd}` and `section_view {projects}`, with no `nav_click`;
  - `cd ~/about/`, `cd ~` and `cd blog`;
  - the same `cd` under reduced motion is instant;
  - `lang es` with skills active goes to `/es/#skills` and stores `es`; `lang en` on `/` prints the note; `lang fr` prints the usage;
  - `resume` downloads `resume-<locale>.pdf` in each locale, and records `terminal_command {resume}` plus `resume {language}`;
  - `open linkedin` opens a new tab at that URL with no opener and records only `terminal_command`; `open repo` opens `sourceUrl`; `open site` and `open` print the usage.

  Make sure `an-sections` still passes.
- [x] 6.3 Add `theme`. Verify by extending `tm-theme.mjs`:
  - `theme amber` recolors the page at once, and a reload of `/pt-br/` stays amber from the first paint;
  - `theme gray` removes the attribute and the stored key;
  - `theme` alone prints the current theme and the usage;
  - only the seven tokens differ between themes (compare computed layout boxes and fonts of a sample of elements).
- [x] 6.4 Add the easter eggs `adb devices`, `./gradlew build` (line by line, input read-only meanwhile), `neofetch`, `sudo hire-me`, other `sudo`, `rm` and `matrix`. Verify:
  - a new `tm-sudo.mjs`: the password is never in the log text, the input's displayed value, the history, the `history` output or any recorded event; `mailto:` with the localized subject per locale; `contact {email, mail}` recorded once, after Enter; Esc cancels the prompt and records no `contact`;
  - extend `tm-commands.mjs` with the easter-egg outputs in all three locales;
  - extend `tm-layout.mjs` (new): the `matrix` canvas stays inside the panel's box, the page's pixels outside the panel don't change, any key stops it, and focus returns to the input; under reduced motion there's no canvas and the note is printed, and `gradlew` prints at once.
- [x] 6.5 Add a new `tm-an.mjs` for the analytics sequences from the terminal and analytics specs (`cd projects --fast`, reopen, `xyzzy`; `resume`; `sudo hire-me`; `open linkedin`). Confirm that no event value contains visitor text. Make sure `an-events`, `an-track` and `an-blocked` still pass, the last also with the terminal used while Umami is blocked.

## 7. Documentation and full run

- [x] 7.1 Update `README.md` with a Terminal section: how to open it, the commands, the easter eggs, themes, data sources, the phone protection and the analytics. Update the verify README with the `tm-*` suites. Verify with `npm run format:check` and a read-through against the specs.
- [x] 7.2 Run `./full.sh` (in the background). Every suite must pass or skip; investigate any failure with the control method in `CLAUDE.md`. Record the totals in this task's commit message.

## Workflow follow-up

- Archive on the branch: sync the delta specs (`terminal`, `footer`, `visual-identity`, `analytics`), run `openspec validate --all --strict`, move the change to `archive/`.
- Merge with a merge commit once the checks are green and no deploy is running, and watch the deploy succeed.
- Live checks against `https://todsdev.github.io`: the standard live set plus `tm-open`, `tm-commands`, `tm-theme` and `an-live` (no replay). Also confirm the live `terminal.json` files hold no phone digits.
- Delete `feat/terminal` locally and on origin.
