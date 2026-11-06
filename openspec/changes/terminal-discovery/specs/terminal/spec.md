## MODIFIED Requirements

### Requirement: Closing and focus return
`Esc`, the `exit` command and a close button with a localized name ("close terminal") SHALL close the terminal. In vim mode, the first `Esc` SHALL leave vim mode instead, and only a second `Esc` closes the terminal. Focus SHALL return to the element that had it before opening, or to the button that opened it, and the page's scroll position SHALL be kept, except after `cd` and `./hello`.

#### Scenario: Close button on a phone
- **WHEN** a visitor on a touch phone opened the terminal with the `>_` button and taps the close button
- **THEN** the terminal closes and focus is back on the `>_` button

#### Scenario: Escape
- **WHEN** a visitor opens the terminal with `/` while a navigation link has focus, then presses `Esc`
- **THEN** the terminal closes, focus is back on that navigation link, and the page hasn't scrolled

#### Scenario: Escape in vim mode
- **WHEN** the visitor runs `vim` and presses `Esc`
- **THEN** vim mode ends and the terminal stays open; pressing `Esc` again closes it

#### Scenario: Reopening
- **WHEN** the terminal is closed and reopened in the same page load
- **THEN** the previous output and history are still there, and the input has focus

### Requirement: Tab completion
Tab SHALL complete the command name, or the argument of `cd`, `open`, `lang`, `theme`, `cat` (`skills.txt`, `.secrets`) and `ls` (`-a`), when exactly one candidate matches the text typed so far. Hidden easter eggs SHALL never be completed or listed. When several match, it SHALL complete their common prefix and list the candidates. Tab SHALL never move focus out of the input. On an empty input it SHALL list the commands shown by `help`.

#### Scenario: Unique command
- **WHEN** the visitor types `wh` and presses Tab
- **THEN** the input reads `whoami `

#### Scenario: Easter egg never offered
- **WHEN** the visitor types `neo`, `./h`, `vi` or `ob` and presses Tab
- **THEN** the input is unchanged and nothing is listed

#### Scenario: Several candidates
- **WHEN** the visitor types `c` and presses Tab
- **THEN** the input still reads `c`, and the log lists `cat  cd  certs  clear  contact`

#### Scenario: Argument
- **WHEN** the visitor types `cd pro` and presses Tab
- **THEN** the input reads `cd projects`

#### Scenario: Hidden file and flag
- **WHEN** the visitor types `cat .` and presses Tab, and later `ls ` and presses Tab
- **THEN** the input reads `cat .secrets`, and then `ls -a`

### Requirement: Unknown commands and suggestions
An unrecognized command SHALL print "command not found: <name>" (localized), followed by a hint to type `help`. When a known command is within one edit of the name (two for names of seven or more characters), the hint SHALL instead ask "did you mean <command>?" (localized). The echoed name SHALL be shown as text, never interpreted as markup.

#### Scenario: Typo
- **WHEN** a visitor on `/es/` runs `whoamii`
- **THEN** the log shows "comando no encontrado: whoamii" and "¿quisiste decir whoami?"

#### Scenario: Unknown
- **WHEN** a visitor on `/` runs `xyzzy`
- **THEN** the log shows "command not found: xyzzy" and a hint to type `help`

#### Scenario: Markup in input
- **WHEN** the visitor runs `<img src=x onerror=alert(1)>`
- **THEN** the text is shown literally, and no element is created and no script runs

### Requirement: Help
`help` SHALL list every command a visitor can type, except the hidden easter eggs (`adb`, `./gradlew`, `neofetch`, `sudo`, `rm`, `matrix`, `./hello`, `ping`, `git`, `brew`, `vim`, `obs`), each with a one-line localized description. `theme` SHALL be listed. The list SHALL end with a dim hint line pointing to `ls -a`: "psst… not everything is listed. try ls -a" / "psst… nem tudo está na lista. tente ls -a" / "psst… no todo está en la lista. prueba ls -a".

#### Scenario: English help
- **WHEN** `help` is run on `/`
- **THEN** the output lists `help`, `whoami`, `about`, `experience`, `projects`, `skills`, `certs`, `contact`, `ls`, `cd`, `cat`, `resume`, `open`, `lang`, `theme`, `clear`, `history` and `exit`, each with its description, and ends with the dim line "psst… not everything is listed. try ls -a"

#### Scenario: Spanish hint
- **WHEN** `help` is run on `/es/`
- **THEN** the last line is "psst… no todo está en la lista. prueba ls -a", with `ls -a` in English

### Requirement: Content commands
`whoami` and `about` SHALL print the profile's name, role, location and summary. `experience`, `projects`, `skills`, `certs` and `contact` SHALL print compact text versions of those sections. `cat skills.txt` SHALL print the same text as `skills`, and `cat .secrets` SHALL print the easter egg list. All of it SHALL come from the content collections and dictionaries for the page's locale, in the sections' order, with nothing written twice in the source.

#### Scenario: Experience in Portuguese
- **WHEN** `experience` is run on `/pt-br/`
- **THEN** each entry shows its localized period (for example "jan 2025 – mar 2026"), company and Portuguese role, in the section's order

#### Scenario: Skills file
- **WHEN** `cat skills.txt` is run
- **THEN** the output equals that of `skills`: one line per category with its items separated by " · "

#### Scenario: Content edit
- **WHEN** a course title is changed in its YAML and the site is rebuilt
- **THEN** `certs` shows the new title with no other edit

#### Scenario: Unknown file
- **WHEN** `cat notes.txt` is run
- **THEN** the output is "cat: notes.txt: No such file or directory" (localized)

### Requirement: Listing and changing sections
`ls` SHALL list the sections (`about`, `experience`, `projects`, `skills`, `courses`, `contact`). `ls -a` SHALL list the hidden file `.secrets` first, then the same sections; any other argument SHALL behave like plain `ls`. `cd <section>` SHALL close the terminal, scroll to that section the way a navigation click does (instantly with reduced motion) and update the hash. `~`, `..` and `/` SHALL go to the top. An unknown section SHALL print "cd: no such file or directory: <name>" (localized) and keep the terminal open.

#### Scenario: Plain listing
- **WHEN** `ls` is run
- **THEN** the output is `about/  experience/  projects/  skills/  courses/  contact/`, with no `.secrets`

#### Scenario: All files
- **WHEN** `ls -a` is run
- **THEN** the output is `.secrets  about/  experience/  projects/  skills/  courses/  contact/`

#### Scenario: Go to projects
- **WHEN** a visitor at the top of `/` runs `cd projects`
- **THEN** the terminal closes, the page scrolls until the projects section is active in the navigation, and the URL ends in `#projects`

#### Scenario: Tilde path
- **WHEN** `cd ~/about/` is run
- **THEN** it behaves like `cd about`

#### Scenario: Unknown section
- **WHEN** `cd blog` is run
- **THEN** the terminal stays open and shows the localized error

### Requirement: Terminal analytics
Each opening SHALL record one `terminal_open` event. Each command run SHALL record one `terminal_command` event whose `command` is the recognized command name, normalized (`./gradlew` → `gradlew`, `./hello` → `hello`, `ls -a` → `ls`, `cat .secrets` → `cat`, `ping thiago` → `ping`, `git blame` → `git`, `brew coffee` → `brew`), or `unknown`. In vim mode, each exit command (`:q`, `:q!`, `:wq`, `:x`) SHALL record `vim`, and any other line SHALL record nothing. Arguments and typed text SHALL never be recorded. Tab completion, history browsing, `Esc` and the `sudo` password line SHALL record nothing of their own.

#### Scenario: Session
- **WHEN** a visitor opens the terminal, runs `cd projects --fast`, reopens it and runs `xyzzy`
- **THEN** the events are `terminal_open`, `terminal_command {command: "cd"}`, `terminal_open`, `terminal_command {command: "unknown"}`, each with the page `locale`

#### Scenario: Hint trail and eggs
- **WHEN** the visitor runs `help`, `ls -a`, `cat .secrets`, `ping thiago`, `git blame`, `brew coffee` and `obs`
- **THEN** the `command` values are `help`, `ls`, `cat`, `ping`, `git`, `brew` and `obs`, and no event data contains `-a`, `.secrets`, `thiago`, `blame` or `coffee`

#### Scenario: Vim session
- **WHEN** the visitor runs `vim`, then types `hello`, `exit` and `:wq`
- **THEN** exactly two `terminal_command {command: "vim"}` events are recorded, and none contains `hello`, `exit` or `:wq`

## ADDED Requirements

### Requirement: Secrets file
`cat .secrets` SHALL print a localized header comment, then one line per easter egg in this order: `adb devices`, `./gradlew build`, `neofetch`, `sudo hire-me`, `rm -rf /`, `matrix`, `./hello`, `ping thiago`, `git blame`, `brew coffee`, `vim`, `obs`. Each line is the English command padded to a shared column, then `# ` and a localized comment.

#### Scenario: English secrets
- **WHEN** `cat .secrets` is run on `/`
- **THEN** the first line is "# .secrets — don't tell anyone", and the next lines include `adb devices      # see who's connected` and `vim              # good luck getting out`, with every `#` in the same column

#### Scenario: Portuguese secrets
- **WHEN** `cat .secrets` is run on `/pt-br/`
- **THEN** the header is "# .secrets — não conte pra ninguém", the commands stay in English, and the comments are Portuguese, such as `# compile 3 anos de experiência`

#### Scenario: Spanish secrets
- **WHEN** `cat .secrets` is run on `/es/`
- **THEN** the header is "# .secrets — no se lo digas a nadie" and the `brew coffee` line ends in `# combustible para el build`

### Requirement: Hello replays the intro
`./hello` (or `hello`) SHALL close the terminal, scroll to the top the way `cd ~` does and, once the hero is in view, replay the hero intro from the start: the prompt line, the typed name, the role with its typo and correction, and the photo's power-on. Any key or click SHALL skip the replay to the final state. With reduced motion it SHALL only jump to the top, with no replay.

#### Scenario: Replay from the contact section
- **WHEN** a visitor scrolled to the contact section runs `./hello`
- **THEN** the terminal closes, the page scrolls to the top, and the hero types the name, then `> Android developer`, corrects it to `> Android Developer` and powers the photo on

#### Scenario: Skipping the replay
- **WHEN** the visitor presses a key while the name is being retyped
- **THEN** the hero shows its final state at once

#### Scenario: Reduced motion
- **WHEN** a visitor with reduced motion runs `./hello`
- **THEN** the page jumps to the top instantly and nothing in the hero animates

#### Scenario: No layout shift
- **WHEN** `./hello` runs at 1280px and at 320px
- **THEN** the replay records no layout shift and the hero's box doesn't change

### Requirement: Ping
`ping thiago` SHALL print, in English like real CLI output, `PING thiago (todsdev.github.io): 56 data bytes`, `64 bytes from thiago: icmp_seq=0 time=24h`, `--- thiago ping statistics ---` and `1 packet transmitted, 1 received, 0% packet loss`, then a dim translated tip to type `contact`. Any other argument, or none, SHALL print the usage `ping thiago`.

#### Scenario: Portuguese ping
- **WHEN** `ping thiago` is run on `/pt-br/`
- **THEN** the four English lines appear, followed by "dica: digite contact para falar comigo"

#### Scenario: Other host
- **WHEN** `ping google` is run
- **THEN** the output shows the usage `ping thiago`

### Requirement: Git blame
`git blame` SHALL print one line: `a1b2c3d (<profile name>) ` followed by a translated sentence: "everything on this page. yes, even the typo in the hero." / "tudo nesta página. sim, até o erro de digitação no hero." / "todo en esta página. sí, incluso la errata del hero.". Any other `git` subcommand, or none, SHALL print the usage `git blame`.

#### Scenario: Spanish blame
- **WHEN** `git blame` is run on `/es/`
- **THEN** the output is "a1b2c3d (Thiago Rodrigues) todo en esta página. sí, incluso la errata del hero."

#### Scenario: Other subcommand
- **WHEN** `git push` is run
- **THEN** the output shows the usage `git blame`

### Requirement: Brew coffee
`brew coffee` SHALL print `==> Brewing coffee...` and `Error: 418 I'm a teapot` in English, then a dim translated line: "(some things are not meant to be)" / "(nem tudo é pra ser)" / "(no todo está destinado a ser)". Any other argument, or none, SHALL print the usage `brew coffee`.

#### Scenario: Teapot
- **WHEN** `brew coffee` is run on `/`
- **THEN** the output is "==> Brewing coffee...", the error line "Error: 418 I'm a teapot" and "(some things are not meant to be)"

### Requirement: Vim mode
`vim` (with or without a file name) SHALL print a translated notice ("you are now in vim. to exit, type :q") and enter vim mode. In vim mode `:q`, `:q!`, `:wq` and `:x` SHALL leave it, and every other line SHALL be echoed and answered with `E492: Not an editor command` (English). Leaving, by one of those commands or by `Esc`, SHALL print the translated "you escaped vim. most people never do.". Vim-mode lines SHALL NOT enter the history; ↑, ↓ and Tab do nothing there.

#### Scenario: Trying to leave
- **WHEN** a visitor on `/pt-br/` runs `vim`, then types `exit`, then `:q`
- **THEN** the log shows "você entrou no vim. para sair, digite :q", then "E492: Not an editor command" after `exit`, then "você escapou do vim. a maioria nunca consegue."

#### Scenario: Every exit command
- **WHEN** vim mode is left with `:q!`, `:wq` or `:x`
- **THEN** each leaves vim mode with the same line

#### Scenario: History
- **WHEN** the visitor runs `vim`, types `exit` and `:q`, then runs `history`
- **THEN** the history lists `vim` and `history`, but not `exit` or `:q`

#### Scenario: Closing the terminal
- **WHEN** the visitor in vim mode closes the terminal with the close button and reopens it
- **THEN** the terminal is back in the normal shell, with the `visitor@todsdev:~$` prompt

### Requirement: Vim mode prompt
While in vim mode, the prompt SHALL read `-- NORMAL --` in the dim text style, like vim's mode line, and each line typed there SHALL be echoed after `-- NORMAL --`. Leaving vim mode in any way SHALL restore the `visitor@todsdev:~$` prompt. The prompt SHALL take the same space either way, so the input doesn't move vertically.

#### Scenario: Mode line
- **WHEN** `vim` is run
- **THEN** the prompt reads `-- NORMAL --` in the dim style, and typing `exit` logs `-- NORMAL -- exit` followed by `E492: Not an editor command`

#### Scenario: Back to the shell
- **WHEN** vim mode is left with `:q` or `Esc`
- **THEN** the prompt reads `visitor@todsdev:~$` again in its normal style

### Requirement: Olympic broadcasting
`obs` SHALL print one translated line: "<n> Olympic Games · <y> years · 0 medals · 100% uptime" / "<n> Jogos Olímpicos · <y> anos · 0 medalhas · 100% de uptime" / "<n> Juegos Olímpicos · <y> años · 0 medallas · 100% de uptime", then a dim translated tip to type `experience`. `<n>` and `<y>` SHALL come from the OBS experience entry: its number of Games and the years from its start to its latest Games. It SHALL be text only, with no Olympic rings or other Olympic symbol.

#### Scenario: English line
- **WHEN** `obs` is run on `/` with the current content (8 Games, 2016 to 2026)
- **THEN** the output is "8 Olympic Games · 10 years · 0 medals · 100% uptime", then "tip: type experience for the full story"

#### Scenario: Content update
- **WHEN** another Games is added to the OBS entry in a later year and the site is rebuilt
- **THEN** `obs` shows the new count and span with no other edit

#### Scenario: No symbols
- **WHEN** `obs` is run in any locale
- **THEN** the output contains only text, with no ring drawing, Olympic symbol or image
