# Design

## Context

See proposal.md for the motivation. The terminal (archived change `2026-11-06-terminal`) is split in three parts:
- **`src/lib/terminal.ts`** is pure: the command table, `parse`, `complete`, `suggest` and the formatters.
- **`src/scripts/terminal-shell.ts`** is the lazy shell: handlers and the modes `sudo`, `busy` and `matrix`. It exposes `run`, `complete`, `recall`, `cancel` and `intercept`.
- **`src/scripts/terminal.ts`** is the loader and the dialog. The dialog's `cancel` asks `shell.cancel()` before closing.

Analytics reports `terminalCommand(input, KNOWN)` (`src/lib/analytics.ts`). It takes the first token, lowercases it, drops `./` and keeps it only when it's a known slug.

The hero intro (`src/scripts/hero.ts`) runs once, behind the inline head gate (`html.hero-pending`).
- It builds aria-hidden per-character overlays and types into them.
- It ends with `finish()`, which sets `data-hero-poweron` and `data-hero-state="done"`.
- CSS keys everything off `data-hero-state="typing"` (real text transparent, photo and status hidden, prompt fades in) and `data-hero-poweron` (the CRT animation).
- When the gate never fired (reduced motion, deep link), no overlay exists.

## Goals / Non-Goals

**Goals:**
- The pure lib keeps owning every piece of printed text that can be unit-tested, including `.secrets`, ping, brew and obs.
- `./hello` reuses the hero's own sequence; it doesn't keep a second copy of it.
- Vim mode follows the same pattern as `sudo` mode: a shell state with its own `run` branch and `cancel` handling.

**Non-Goals:**
- No new analytics event or field. `terminal_command` values stay slugs.
- No vim emulation beyond the four exit commands.
- No change to the hero's behavior on load.

## Decisions

### Command table and completion
- **New hidden entries:** `hello`, `ping`, `git`, `brew`, `vim` and `obs` join `COMMANDS` with `hidden: true`, so `KNOWN` includes them and `help` (built from `VISIBLE`) doesn't.
- **`parse` is unchanged.** It already drops `./`, which makes `hello` and `./hello` the same command, as with `gradlew`.
- **New arguments:** `cat` gets `args: ["skills.txt", ".secrets"]` and `ls` gets `args: ["-a"]`.
- **No more hidden completion.** `complete()` loses its hidden branch and only ever matches `VISIBLE`. The argument branch already refuses hidden commands.
- **Suggestions are unchanged.** `suggest()` keeps scanning `KNOWN`, as recorded in proposal decision 9.

### Text sources
**English CLI text** lives as constants in the lib, like `ADB` and `GRADLE` do now:
- `PING` (4 lines);
- `BREW` (2 lines; the second has the `error` tone);
- `E492`;
- `BLAME_HASH = "a1b2c3d"`;
- `SECRETS`, the 12 commands in order, each paired with a dictionary key.

**Localized text** goes into the dictionaries' `terminal` group:
- `trailHint` (help's last line);
- `secrets: { header, adb, gradlew, neofetch, sudo, rm, matrix, hello, ping, git, brew, vim, obs }`;
- `pingTip`, `gitBlame`, `brewNote`;
- `vimEnter`, `vimExit`;
- `obs` (a template with `{games}` and `{years}`), `obsTip`.

`pt-br.ts` and `es.ts` are typed as `Dictionary`, so a missing key fails `astro check`.

**Formatters:**
- `formatHelp` appends `{ text: trailHint, tone: "muted" }`.
- `formatLs(sections, all)` puts `.secrets` first when `all` is set.
- `formatSecrets(strings)` reuses `pad()`, with `# comment` as the right-hand column.
- `formatPing`, `formatBrew`, `formatBlame(strings, name)` and `formatObs(strings, counts)` cover the new eggs.

### OBS counts from content
`terminalData()` (`src/lib/terminal-data.ts`) adds `obs: { games, years }`:
- It reads the experience entry `olympic-broadcasting-services`.
- `games` is `events.length`; `years` is the latest event year minus the start year.
- If the entry or its events are missing, the build throws instead of printing a wrong number.

**Alternative considered:** fixed numbers in the dictionaries. Rejected: that writes the facts a second time (the content-commands spec forbids it) and goes stale with the next Games.

### Vim mode
The shell gets a `vim` flag:
- **`run`:**
  - In vim mode, every line is echoed and kept out of `history`.
  - An exit line (`/^:(q!?|wq|x)$/` after trimming) leaves vim mode, prints `vimExit` and tracks `terminal_command {command: "vim"}` directly. `terminalCommand()` would report `unknown` for `:q`.
  - Any other line prints `E492` and tracks nothing.
- **Esc:** `cancel()` leaves vim mode (`vimExit`, nothing tracked) and returns `true`, so the dialog stays open. The second Esc reaches `close()` as today.
- **Mode line:** entering vim sets the prompt element's text to `-- NORMAL --` and adds a `term__mode` class (the `--text-muted` color of the dim output lines, such as the help hint; `--text-dim` is below 3:1 and too faint for text). Leaving restores `PROMPT` and removes the class. The echo uses the current prompt text. The prompt keeps its line box, and the input's block cursor follows via the existing `input` event.
- **Inert keys:** `recall` and `complete` return early in vim mode, as they do for `sudo`.
- **New `Shell.closed()` hook:** `terminal.ts` calls it from `close()`. It drops vim mode silently, so reopening shows the normal shell. Sudo already resets when cancelled, and nothing else needs the hook.

**Alternative considered:** routing vim lines through the normal command parser with a mode check in each handler. Rejected: the `sudo` precedent of one early branch in `run` is simpler and keeps typed text away from `track()`.

### `./hello` and the hero replay
The shell's `hello` handler:
- closes the terminal like `cd` does (no focus restore);
- dispatches `nav:jump` with `hero` (so analytics records only the destination);
- sets `location.hash = "hero"`, as `cd ~` does;
- with motion allowed, also dispatches `hero:replay` on `window`.

`hero.ts` is refactored so the sequence can run again:
- **Lazy overlays:** `buildLine()` runs on first use and the overlays are kept.
- **`replay()`:**
  - waits until the page has stopped scrolling: `scrollY` still for 150 ms, or 2 s at most (polled, because `scrollend` never fires when the page is already at the top);
  - removes `data-hero-poweron`, so the CRT animation can run again (the attribute stays off for the whole typing state, so no forced reflow is needed);
  - resets every overlay character to hidden, sets `data-hero-state="typing"`, and runs the existing `play()` / `finish()` with a new `AbortController` and the same pointer and key skip listeners.
- **No replay with reduced motion:** the shell doesn't send the event, and `replay()` also checks the media query as a guard.
- **One replay at a time:** a second replay while one is running aborts the first.

**Alternative considered:** reloading the page at `/` to replay the intro. Rejected: it drops the terminal's history and fires another page view.

### Analytics
- `terminalCommand()` needs no change: the new names are slugs in `KNOWN`, and arguments were never kept.
- The vim exits are the one place where the shell reports a fixed name itself.
- `./hello`'s `section_view` comes from the existing `nav:jump` path in `nav.ts`.

## Risks / Trade-offs

- **The replay starts while the page is still scrolling** (a long smooth scroll from the contact section) → it waits for `scrollend`, with a cap. The hero stays in its final state until then, so nothing flickers.
- **Restarting the CSS animation** → the attribute is off during the whole typing state, then set again at the end. `tm-eggs` checks that the photo goes dark and comes back.
- **The `obs` count goes stale** → derived from content (see above). A unit test pins 8 Games and 10 years for the current YAML.
- **Discoverability through suggestions** (`gti` → `git`) → this is intended (proposal decision 9). Completion stays clean.
- **A key that ends vim mode also skips something** → the hero's skip listener only exists during a replay, and the terminal is closed then, so the two never overlap.

## Migration Plan

Ships with the next deploy, like any change. There is no stored data or format to migrate. Rolling back means reverting the merge.
