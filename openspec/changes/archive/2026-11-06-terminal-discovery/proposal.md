# Proposal

## Why

The terminal's easter eggs are hidden so well that almost nobody will find them: `help` leaves them out and nothing points to them. A short hint trail (`help` → `ls -a` → `cat .secrets`) makes them discoverable for curious visitors while keeping `help` clean, and six new eggs give the trail more to reward.

## What Changes

- **Hint trail:**
  - `help` ends with a dim line: "psst… not everything is listed. try ls -a" (pt-br "psst… nem tudo está na lista. tente ls -a", es "psst… no todo está en la lista. prueba ls -a").
  - `ls -a` lists the sections plus a hidden file `.secrets`. Plain `ls` is unchanged.
  - `cat .secrets` prints a localized header comment ("# .secrets — don't tell anyone") and one line per easter egg: the command, padded to a column, then a localized `# comment`. That covers the 6 existing eggs and the 6 new ones, 12 lines in all.
- **New easter eggs** (output follows the page's language; CLI-like lines stay in English):
  - `./hello`: closes the terminal, scrolls to the top and replays the hero intro. With reduced motion it only scrolls to the top.
  - `ping thiago`: a 4-line ping report (`time=24h`), then a translated tip to type `contact`.
  - `git blame`: "a1b2c3d (Thiago Rodrigues) everything on this page. yes, even the typo in the hero." (translated).
  - `brew coffee`: "==> Brewing coffee..." and "Error: 418 I'm a teapot" in English, then a translated "(some things are not meant to be)".
  - `vim`: enters a vim mode.
    - Only `:q`, `:q!`, `:wq` and `:x` leave it; anything else prints "E492: Not an editor command".
    - Leaving prints "you escaped vim. most people never do." (translated).
    - Esc leaves vim mode first; a second Esc closes the terminal.
  - `obs`: "8 Olympic Games · 10 years · 0 medals · 100% uptime" (translated), then a tip to type `experience`. Text only, with no Olympic rings or symbols.
- **Tab completion** never offers easter eggs (today an egg completes when it's the only match: `neo` → `neofetch`). It completes `.secrets` after `cat ` and `-a` after `ls `.
- **Analytics:** every recognized command records `terminal_command` with its normalized name only:
  - `ls -a` → `ls`
  - `cat .secrets` → `cat`
  - `./hello` → `hello`
  - `ping thiago` → `ping`
  - `git blame` → `git`
  - `brew coffee` → `brew`
  - `vim` and its `:q`-style exits → `vim`

  No arguments or typed text are ever recorded.

## Decisions for review

These are choices the request left open. Each is reflected in the specs and easy to change.

1. **`hello` without `./` also replays the intro**, like `gradlew build` already works without `./`. The current spec uses `hello` as its "command not found" example, so that example becomes `xyzzy`.
2. **`ls -a` order:** `.secrets` comes first, as a real `ls -a` sorts dotfiles first, without `.` and `..`: `.secrets  about/  experience/  projects/  skills/  courses/  contact/`.
3. **`obs` numbers come from the content:** the number of Games listed under the OBS experience entry (8) and the span from its start year to its latest Games (2016 → 2026 = 10 years). A future Games entry updates the line with no code change.
4. **`obs` tip wording** (not given in the request): en "tip: type experience for the full story" / pt-br "dica: digite experience para ver a história completa" / es "consejo: escribe experience para ver la historia completa".
5. **Vim mode details:**
   - The prompt becomes a dim `-- NORMAL --`, like vim's mode line, and `visitor@todsdev:~$` comes back on exit (owner's addition). Lines typed in vim mode are echoed after `-- NORMAL --`.
   - Lines typed in vim mode are echoed but kept out of `history`. ↑/↓ and Tab do nothing.
   - `exit` and `help` are just more "E492" lines.
   - Leaving with Esc prints the same "you escaped vim" line.
   - Closing the terminal another way (close button) also leaves vim mode, so reopening shows the normal shell.
6. **Vim analytics:** `vim` and each `:q`-style exit record `terminal_command {command: "vim"}`. "E492" lines and Esc record nothing, since they're typed text or a key, not commands.
7. **Other arguments:**
   - `ping`, `git` and `brew` with any other argument (or none) print their usage: `ping thiago`, `git blame`, `brew coffee`.
   - `vim <file>` behaves like `vim`.
   - `ls` with any argument other than `-a` behaves like plain `ls`, as it does today.
8. **`./hello` analytics and timing:**
   - The scroll counts as a terminal jump, like `cd ~`, so `section_view {hero}` is recorded if the hero wasn't recorded yet.
   - The replay starts once the hero is back in view.
   - Any key or click skips it to the final state, as on load.
9. **"Did you mean" suggestions stay as they are.** They can name an egg (`gti` → "did you mean git?"), since that's part of discovering them; completion still never offers one.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `terminal`:
  - Help gains the trail hint, and the hidden eggs listed in it grow to 12.
  - Tab completion never offers eggs, and completes `.secrets` and `-a`.
  - The unknown-command example becomes `xyzzy`.
  - Listing gains `ls -a`; the content commands gain `cat .secrets`.
  - Closing gains Esc in vim mode.
  - Terminal analytics normalizes the new names.
  - New requirements for `./hello`, `ping`, `git blame`, `brew coffee`, `vim` and `obs`.
- `hero`: "Runs once per page load" makes an exception for a replay requested from the terminal.
- `analytics`: "Terminal jumps" also covers the scroll of `./hello`.

## Impact

- **Code:**
  - `src/lib/terminal.ts`: command table, completion, `.secrets` and the egg formatters, with tests in `terminal.test.ts`.
  - `src/scripts/terminal-shell.ts`: vim mode and the new commands.
  - `src/scripts/terminal.ts`: Esc routing.
  - `src/scripts/hero.ts`: a replayable intro, triggered by an event.
  - `src/lib/terminal-data.ts`: OBS counts.
  - `src/i18n/{en,pt-br,es}.ts`: new `terminal` strings.
- **Data:** `terminal.json` gains the OBS counts. The phone number is still never included.
- **Docs:** README's Terminal section.
- **Verification** (`~/portfolio-verify-scripts`, versioned):
  - A new `tm-eggs` suite.
  - Updates to `tm-commands` (help hint, `xyzzy`), `tm-shell` (completion), `tm-an` (names). `tm-eggs` also covers the replay's layout shift.
  - `full.sh` and CLAUDE.md's live list.
- **No new dependencies.** The hero's normal load behavior is unchanged.
