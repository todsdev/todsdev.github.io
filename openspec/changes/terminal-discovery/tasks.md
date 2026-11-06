# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/terminal-discovery`. Never push directly to `main`. After each task:
- Mark it done here.
- Make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass.
- Commit only that task's repo files plus this file, with a Conventional Commit message, then push.

New and changed browser checks go in `~/portfolio-verify-scripts`. Add any new script to `SUITES` in `full.sh`, and commit and push it to `todsdev/portfolio-verify-scripts` in the same step as the repo commit. Make each new check fail at least once against the old behavior (the current `main` build or the live site) before trusting it.

## 1. Branch and PR

- [x] 1.1 Commit the change artifacts on `feat/terminal-discovery`, push and open a draft PR. Verify with `gh pr view --json isDraft,headRefName`

## 2. Pure core and strings

- [x] 2.1 In `src/lib/terminal.ts` (design "Command table and completion"):
  - add the hidden `hello`, `ping`, `git`, `brew`, `vim` and `obs` entries, `cat` → `skills.txt`/`.secrets` and `ls` → `-a`;
  - remove hidden completion from `complete()`.

  Update `terminal.test.ts`:
  - `neo`, `./h`, `vi`, `ob` and `ad` complete nothing and list nothing;
  - `wh` → `whoami `, `cat .` → `cat .secrets`, `cat ` lists `.secrets  skills.txt`, `ls ` → `ls -a`;
  - `./hello` and `hello` parse to `hello`;
  - `terminalCommand()` gives `ls`, `cat`, `hello`, `ping`, `git`, `brew`, `vim` and `obs` for the spec's inputs, and `unknown` for `:q` and `xyzzy`;
  - `gti` suggests `git`.

  Verify with `npm test`.
- [x] 2.2 Add the new `terminal` strings to `en`, `pt-br` and `es` (design "Text sources"): `trailHint`, `secrets.*`, `pingTip`, `gitBlame`, `brewNote`, `vimEnter`, `vimExit`, `obs`, `obsTip`. Use the request's wording verbatim, and proposal decision 4 for `obsTip`. Verify with `npm run check` (all three dictionaries have the same keys) and a diff read against the proposal.
- [x] 2.3 Add the formatters and constants (design "Text sources"):
  - `formatHelp` ends in the dim hint;
  - `formatLs(sections, all)`, `formatSecrets`, `formatPing`, `formatBrew`, `formatBlame`, `formatObs`;
  - `PING`, `BREW`, `E492`, `BLAME_HASH`, `SECRETS`.

  Test in all three locales:
  - the help hint is the last, muted line;
  - `ls -a` puts `.secrets` first and `ls` is unchanged;
  - `.secrets` has its header, 12 lines in spec order, English commands and every `#` in one column;
  - ping, brew (the teapot line has the error tone), blame with the profile name, and obs with `{games: 8, years: 10}`;
  - no `.secrets` comment or egg output contains "ring" or an Olympic symbol character.

  Verify with `npm test`.

## 3. Data

- [ ] 3.1 Add `obs: { games, years }` to `terminalData()`, derived from the `olympic-broadcasting-services` experience entry; the build fails if it's missing (design "OBS counts from content"). Verify:
  - a unit test of the derivation (8 Games and 10 years for the current events; a fixture with a 2028 event gives 9 and 12);
  - `npm run build`, and the three `terminal.json` files hold `"obs":{"games":8,"years":10}`;
  - a grep of `dist/**/*.html` and `dist/**/terminal.json` still finds no phone digits, `tel:` or `wa.me/`.

## 4. Shell

- [ ] 4.1 Wire the trail and the text eggs in `terminal-shell.ts`: `ls -a`, `cat .secrets`, `ping`, `git`, `brew` and `obs`, with their usages. Update `tm-commands.mjs`:
  - the help hint in all three locales;
  - `ls` versus `ls -a`;
  - `cat .secrets` in all three locales against the dictionaries;
  - each new egg's output in all three locales;
  - the usages (`ping google`, `git push`, `brew`);
  - the unknown example becomes `xyzzy`.

  It must fail against the live site before this change.
- [ ] 4.2 Add vim mode (design "Vim mode"), including `Shell.closed()` called from `terminal.ts`'s `close()`. Verify with a new `tm-eggs.mjs`, in all three locales:
  - `vim` prints the localized notice, and the prompt reads `-- NORMAL --` in `--text-dim` (computed color), with the input's top unchanged;
  - lines typed in vim are echoed as `-- NORMAL -- <line>`;
  - every way out (`:q`, `:q!`, `:wq`, `:x`, Esc, close button) restores `visitor@todsdev:~$` in its normal color;
  - `exit`, `help` and `ls` each print `E492: Not an editor command`;
  - each of `:q`, `:q!`, `:wq` and `:x` leaves with the localized line;
  - Esc leaves vim mode and keeps the dialog open, and a second Esc closes it with focus restored;
  - ↑ and Tab do nothing in vim mode, and `history` omits the vim lines;
  - closing with the button and reopening shows the normal shell;
  - the analytics are exactly two `terminal_command {vim}` events for `vim` … `:wq`, with no typed text.

  Update `tm-shell.mjs` for the completion rules (eggs never offered, `cat .`, `ls `).
- [ ] 4.3 Add `./hello` in the shell and the replay in `hero.ts` (design "`./hello` and the hero replay"). Extend `tm-eggs.mjs` at 1280px and 320px:
  - from the contact section, `./hello` closes the terminal, scrolls to the top and replays: the state goes to `typing`, the name is retyped, the role passes through `Android developer` and ends `Android Developer`, and the photo is hidden and then powers on;
  - the same after opening `/#skills`, where no intro ever ran;
  - a key press mid-replay shows the final state at once;
  - reduced motion gives an instant jump to the top and no `typing` state;
  - CLS stays 0 during the replay;
  - `hello` without `./` behaves the same.

  Extend `tm-an.mjs`: from `/#contact`, `./hello` records only `terminal_command {hello}` and `section_view {hero}`; the trail and egg names come from the terminal-analytics scenario. Make sure the hero suites (`h*`), `hoff` and `l-cls` still pass.

## 5. Documentation and full run

- [ ] 5.1 Update `README.md`'s Terminal section:
  - the hint trail (`help` → `ls -a` → `cat .secrets`);
  - the new eggs;
  - vim mode;
  - `./hello`;
  - OBS counts from content;
  - completion never offering eggs.

  Update the verify README with `tm-eggs`, and CLAUDE.md's live list with `tm-eggs`. Verify with `npm run format:check` and a read-through against the specs.
- [ ] 5.2 Run `./full.sh` (in the background). Every suite must pass or skip; investigate any failure with the control method in `CLAUDE.md`. Record the totals in this task's commit message.

## Workflow follow-up

- Archive on the branch: sync the delta specs (`terminal`, `hero`, `analytics`), run `openspec validate --all --strict`, and move the change to `archive/`.
- Merge with a merge commit once the checks are green and no deploy is running, and watch the deploy succeed.
- Live checks against `https://todsdev.github.io`: the standard live set, now including `tm-eggs`, and `an-live` (no replay). Also confirm the live `terminal.json` files hold no phone digits.
- Delete `feat/terminal-discovery` locally and on origin.
