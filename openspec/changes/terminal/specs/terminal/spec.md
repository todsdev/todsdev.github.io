# Spec Delta

## Purpose

Defines the hidden terminal easter egg: a keyboard-first, accessible dialog where visitors explore the portfolio's content with shell-style commands and a few jokes, without the rest of the site ever depending on it.

## ADDED Requirements

### Requirement: Opening by keyboard
On every locale page, pressing `` ` `` or `/` (with no Ctrl, Alt or Meta modifier) SHALL open the terminal, unless focus is in a text field (an `input`, a `textarea` or an editable element). The key SHALL NOT be typed into the terminal's input, and the browser's own action for that key (such as quick find) SHALL be prevented only when the terminal opens.

#### Scenario: Backtick from the page
- **WHEN** a visitor on `/pt-br/` with focus on the page body presses `` ` ``
- **THEN** the terminal opens with an empty input, and the input has focus

#### Scenario: Slash from a link
- **WHEN** focus is on a navigation link and the visitor presses `/`
- **THEN** the terminal opens

#### Scenario: Text field
- **WHEN** focus is in a text field and the visitor presses `/`
- **THEN** the `/` is typed into that field and the terminal doesn't open

#### Scenario: Modifier held
- **WHEN** the visitor presses Ctrl+`/` or Meta+`` ` ``
- **THEN** the terminal doesn't open

### Requirement: Opening on touch devices
On devices whose primary pointer is coarse and can't hover, the footer SHALL show a `>_` button that opens the terminal. Its accessible name SHALL be localized ("open terminal" / "abrir terminal" / "abrir terminal").

#### Scenario: Phone
- **WHEN** a visitor on a touch phone taps the footer's `>_` button
- **THEN** the terminal opens and its input has focus

### Requirement: Closing and focus return
`Esc`, the `exit` command and a close button with a localized name ("close terminal") SHALL close the terminal. Focus SHALL return to the element that had it before opening, or to the button that opened it, and the page's scroll position SHALL be kept, except after `cd`.

#### Scenario: Close button on a phone
- **WHEN** a visitor on a touch phone opened the terminal with the `>_` button and taps the close button
- **THEN** the terminal closes and focus is back on the `>_` button

#### Scenario: Escape
- **WHEN** a visitor opens the terminal with `/` while a navigation link has focus, then presses `Esc`
- **THEN** the terminal closes, focus is back on that navigation link, and the page hasn't scrolled

#### Scenario: Reopening
- **WHEN** the terminal is closed and reopened in the same page load
- **THEN** the previous output and history are still there, and the input has focus

### Requirement: Accessible dialog
The terminal SHALL be a modal dialog with a localized accessible name ("terminal"). While it's open, focus SHALL stay inside it and the page behind SHALL be inert. Command output SHALL be appended to a log region that screen readers announce politely. The input SHALL have a localized accessible label.

#### Scenario: Focus trap
- **WHEN** the terminal is open and the visitor presses Shift+Tab repeatedly, moving between the input and the close button
- **THEN** focus never leaves the dialog; Tab in the input completes instead of moving focus, and Tab on the close button returns to the input

#### Scenario: Screen reader
- **WHEN** a screen reader user runs `whoami`
- **THEN** the dialog's role, name and input label are exposed, and the command's output is announced through the log

### Requirement: Terminal presentation
The terminal SHALL be a panel drawn above the page in the site's color tokens: the prompt in VT323 and input and output in IBM Plex Mono. Opening and closing it SHALL cause no layout shift in the page behind it. At 320px it SHALL fit the viewport, and long output SHALL wrap or scroll inside the panel without horizontal page overflow.

#### Scenario: Opening causes no shift
- **WHEN** the terminal is opened and closed at 1280px and at 320px
- **THEN** the page records no layout shift and its scroll position doesn't change

#### Scenario: Narrow screen
- **WHEN** `experience` is run at 320px
- **THEN** the panel stays within the viewport, and its output wraps with no horizontal scrollbar on the page

### Requirement: Prompt and command language
Each input line SHALL be echoed after the prompt `visitor@todsdev:~$`. Command names and arguments SHALL be English in every locale, and output SHALL be in the page's language. Input SHALL be matched without regard to case or surrounding spaces.

#### Scenario: Portuguese output
- **WHEN** a visitor on `/pt-br/` runs `help`
- **THEN** the log shows `visitor@todsdev:~$ help`, followed by the command list with Portuguese descriptions

#### Scenario: Case and spaces
- **WHEN** the visitor runs `  WHOAMI `
- **THEN** it behaves exactly like `whoami`

### Requirement: Command history
The terminal SHALL remember the commands run during the page load. ↑ SHALL replace the input with the previous command, and ↓ with the next one, ending at an empty input. The `sudo` password line SHALL never enter the history.

#### Scenario: Recall
- **WHEN** the visitor runs `ls`, then `whoami`, then presses ↑ twice
- **THEN** the input reads `ls`; pressing ↓ twice then leaves it empty

### Requirement: Tab completion
Tab SHALL complete the command name, or the argument of `cd`, `open`, `lang`, `theme` and `cat`, when exactly one candidate matches the text typed so far. When several match, it SHALL complete their common prefix and list the candidates. Tab SHALL never move focus out of the input. On an empty input it SHALL list the commands shown by `help`.

#### Scenario: Unique command
- **WHEN** the visitor types `neo` and presses Tab
- **THEN** the input reads `neofetch `

#### Scenario: Several candidates
- **WHEN** the visitor types `c` and presses Tab
- **THEN** the input still reads `c`, and the log lists `cat  cd  certs  clear  contact`

#### Scenario: Argument
- **WHEN** the visitor types `cd pro` and presses Tab
- **THEN** the input reads `cd projects`

### Requirement: Unknown commands and suggestions
An unrecognized command SHALL print "command not found: <name>" (localized), followed by a hint to type `help`. When a known command is within two edits of the name, the hint SHALL instead ask "did you mean <command>?" (localized). The echoed name SHALL be shown as text, never interpreted as markup.

#### Scenario: Typo
- **WHEN** a visitor on `/es/` runs `whoamii`
- **THEN** the log shows "comando no encontrado: whoamii" and "¿quisiste decir whoami?"

#### Scenario: Unknown
- **WHEN** a visitor on `/` runs `hello`
- **THEN** the log shows "command not found: hello" and a hint to type `help`

#### Scenario: Markup in input
- **WHEN** the visitor runs `<img src=x onerror=alert(1)>`
- **THEN** the text is shown literally, and no element is created and no script runs

### Requirement: Help
`help` SHALL list every command a visitor can type, except the hidden easter eggs (`adb`, `./gradlew`, `neofetch`, `sudo`, `rm`, `matrix`), each with a one-line localized description. `theme` SHALL be listed.

#### Scenario: English help
- **WHEN** `help` is run on `/`
- **THEN** the output lists `help`, `whoami`, `about`, `experience`, `projects`, `skills`, `certs`, `contact`, `ls`, `cd`, `cat`, `resume`, `open`, `lang`, `theme`, `clear`, `history` and `exit`, each with its description

### Requirement: Content commands
`whoami` and `about` SHALL print the profile's name, role, location and summary. `experience`, `projects`, `skills`, `certs` and `contact` SHALL print compact text versions of those sections. `cat skills.txt` SHALL print the same text as `skills`. All of it SHALL come from the content collections and dictionaries for the page's locale, in the sections' order, with nothing written twice in the source.

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

### Requirement: Contact output keeps the phone protected
`contact` SHALL list every contact line with its label and value. The phone and WhatsApp values SHALL be decoded in the browser from the contact section, as the section does. The phone number SHALL NOT appear in built HTML or in any file the terminal loads.

#### Scenario: Phone line
- **WHEN** `contact` is run on `/`
- **THEN** the phone line shows the full number

#### Scenario: Built files
- **WHEN** `dist/**/*.html` and the terminal's data files are searched after the build
- **THEN** no phone digits, `tel:` or `wa.me/` appear

### Requirement: Listing and changing sections
`ls` SHALL list the sections (`about`, `experience`, `projects`, `skills`, `courses`, `contact`). `cd <section>` SHALL close the terminal, scroll to that section the way a navigation click does (instantly with reduced motion) and update the hash. `~`, `..` and `/` SHALL go to the top. An unknown section SHALL print "cd: no such file or directory: <name>" (localized) and keep the terminal open.

#### Scenario: Go to projects
- **WHEN** a visitor at the top of `/` runs `cd projects`
- **THEN** the terminal closes, the page scrolls until the projects section is active in the navigation, and the URL ends in `#projects`

#### Scenario: Tilde path
- **WHEN** `cd ~/about/` is run
- **THEN** it behaves like `cd about`

#### Scenario: Unknown section
- **WHEN** `cd blog` is run
- **THEN** the terminal stays open and shows the localized error

### Requirement: Language command
`lang en|pt|es` SHALL open the page in that language, keeping the section that's active in the navigation, and SHALL remember the choice exactly as the language switcher does. Running it for the current language SHALL print a localized note and do nothing else. A missing or unknown argument SHALL print the usage.

#### Scenario: Switch from skills
- **WHEN** a visitor on `/` with the skills section active runs `lang es`
- **THEN** the browser goes to `/es/#skills`, and opening `/` later redirects to `/es/`

#### Scenario: Usage
- **WHEN** `lang fr` is run
- **THEN** the output shows the usage `lang en|pt|es` and the page stays

### Requirement: Résumé command
`resume` SHALL download the same résumé PDF that the contact section offers for the page's language, print a localized confirmation, and record the same `resume` event as the contact section's download.

#### Scenario: Spanish résumé
- **WHEN** `resume` is run on `/es/`
- **THEN** `/resume/resume-es.pdf` is downloaded, and a `resume` event with `language` `es` is recorded along with `terminal_command {command: "resume"}`

### Requirement: Open command
`open github|linkedin|instagram|repo` SHALL open the matching URL in a new tab with no opener: the GitHub, LinkedIn and Instagram contact URLs, and for `repo` the site's source repository (the profile's `sourceUrl`), matching the projects section's `$ open repo`. A missing or unknown target, including `site`, SHALL print the usage.

#### Scenario: LinkedIn
- **WHEN** `open linkedin` is run
- **THEN** a new tab opens `https://www.linkedin.com/in/tods/`, and the output confirms it

#### Scenario: Usage
- **WHEN** `open` is run with no target
- **THEN** the output shows the usage `open github|linkedin|instagram|repo`

#### Scenario: Source repository
- **WHEN** `open repo` is run
- **THEN** a new tab opens `https://github.com/todsdev/todsdev.github.io`

### Requirement: Shell commands
`clear` SHALL empty the log. `history` SHALL list the commands run so far, numbered from 1. `exit` SHALL close the terminal.

#### Scenario: History
- **WHEN** the visitor runs `ls`, `whoami` and then `history`
- **THEN** the output is `1  ls`, `2  whoami`, `3  history`

#### Scenario: Clear
- **WHEN** `clear` is run
- **THEN** the log is empty and the input still has focus

### Requirement: Device easter eggs
`adb devices` SHALL print "List of devices attached" and then "thiago-rodrigues    device". `./gradlew build` SHALL print a short fake Gradle build log ending in "BUILD SUCCESSFUL in 3y". With motion allowed, the build log SHALL appear line by line within about 2 seconds, with the input disabled until it ends.

#### Scenario: adb
- **WHEN** `adb devices` is run
- **THEN** the output is exactly those two lines

#### Scenario: Gradle with reduced motion
- **WHEN** `./gradlew build` is run with reduced motion
- **THEN** the whole log appears at once and its last line is "BUILD SUCCESSFUL in 3y"

### Requirement: Neofetch
`neofetch` SHALL print an ASCII-style card with an Android-like logo drawn in characters, next to the lines OS Android, Kernel Kotlin, Uptime 3 years and Location Rio de Janeiro. The labels and the "years" unit SHALL be localized. The logo SHALL be hidden from screen readers.

#### Scenario: Portuguese neofetch
- **WHEN** `neofetch` is run on `/pt-br/`
- **THEN** the card shows "Android", "Kotlin", "3 anos" and "Rio de Janeiro", and a screen reader reads only the labeled lines

### Requirement: Sudo hire-me
`sudo hire-me` SHALL print "[sudo] password for recruiter:" and take one line of input that is never displayed, echoed, stored in history or reported. After Enter it SHALL print "Access granted." (localized) and open an email to the contact address with a localized subject. Esc SHALL cancel the prompt. Any other `sudo` command SHALL print a localized refusal.

#### Scenario: Hire me
- **WHEN** a visitor on `/pt-br/` runs `sudo hire-me`, types `hunter2` and presses Enter
- **THEN** `hunter2` never appears in the log, the input's value as shown or the history, and a `mailto:trod.dev@gmail.com` link with the Portuguese subject is opened after "Acesso concedido."

#### Scenario: Analytics
- **WHEN** the same sequence runs
- **THEN** exactly one `terminal_command` event with `command` `sudo` and one `contact` event with `kind` `email` and `action` `mail` are recorded, and no event data contains `hunter2`

### Requirement: Rm easter egg
`rm -rf /` (and any `rm` command) SHALL print "nice try." and change nothing.

#### Scenario: Nice try
- **WHEN** `rm -rf /` is run
- **THEN** the output is "nice try." and the page is unchanged

### Requirement: Theme command
`theme green|amber|gray` SHALL switch the whole site to that color theme at once, and the choice SHALL persist in the browser across pages, locales and reloads. `gray` SHALL restore the default and forget the choice. With no argument it SHALL print the current theme and the usage.

#### Scenario: Amber persists
- **WHEN** `theme amber` is run on `/` and the visitor then opens `/es/`
- **THEN** both pages render in the amber theme from the first paint

#### Scenario: Back to gray
- **WHEN** `theme gray` is run
- **THEN** the default palette is restored and no stored theme remains

### Requirement: Matrix easter egg
`matrix` SHALL animate falling characters inside the terminal panel only, for about 3 seconds, then restore the log with the input focused. Any key SHALL end it early. With reduced motion it SHALL print a localized one-line note instead of animating.

#### Scenario: Contained animation
- **WHEN** `matrix` is run with motion allowed
- **THEN** the animation is drawn only within the panel, the page behind doesn't change, and after it ends the input has focus

#### Scenario: Reduced motion
- **WHEN** `matrix` is run with reduced motion
- **THEN** nothing animates and the note is printed

### Requirement: Reduced motion in the terminal
With reduced motion, the terminal SHALL open and close without animation, print every output at once, show the cursor without blinking and run no `matrix` animation. Everything SHALL be operable by keyboard alone.

#### Scenario: Reduced motion session
- **WHEN** a visitor with reduced motion opens the terminal and runs `./gradlew build` and `cd contact`
- **THEN** nothing animates, the log appears at once, and the jump to contact is instant

### Requirement: Terminal analytics
Each opening SHALL record one `terminal_open` event. Each command run SHALL record one `terminal_command` event whose `command` is the recognized command name (`./gradlew` reported as `gradlew`), or `unknown`. Tab completion, history browsing and the `sudo` password line SHALL record nothing of their own.

#### Scenario: Session
- **WHEN** a visitor opens the terminal, runs `cd projects --fast`, reopens it and runs `xyzzy`
- **THEN** the events are `terminal_open`, `terminal_command {command: "cd"}`, `terminal_open`, `terminal_command {command: "unknown"}`, each with the page `locale`

### Requirement: Site works without the terminal
Without JavaScript, the terminal, its hint and its button SHALL NOT be shown, and nothing on the page SHALL depend on it. The terminal's code and data SHALL load only when it's first opened, so they don't delay the page.

#### Scenario: Scripting disabled
- **WHEN** a locale page is loaded without JavaScript
- **THEN** no terminal hint or button is visible, and every section works as before

#### Scenario: Lazy loading
- **WHEN** a locale page loads and the terminal is never opened
- **THEN** neither the shell module nor the terminal data file is requested
