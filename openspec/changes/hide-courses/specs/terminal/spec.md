## ADDED Requirements

### Requirement: Courses in the terminal only while enabled
While the profile's `courses.enabled` is `false`, the terminal SHALL show nothing about courses: no `certs` command, no `courses` section, and no course data or course strings in the locale's terminal data file. `certs` SHALL behave like any unknown command and `cd courses` like any unknown section. Setting the flag back to `true` SHALL restore both.

#### Scenario: certs while off
- **WHEN** courses are off and a visitor on `/` runs `certs`
- **THEN** the log shows "command not found: certs" and the hint to type `help`, and the `terminal_command` event's `command` is `unknown`

#### Scenario: Near miss while off
- **WHEN** courses are off and a visitor runs `cert`
- **THEN** the hint is the one to type `help`, not "did you mean certs?"

#### Scenario: cd courses while off
- **WHEN** courses are off and a visitor on `/pt-br/` runs `cd courses`
- **THEN** the terminal stays open and shows "cd: no such file or directory: courses" (localized), and the hash doesn't change

#### Scenario: Terminal data while off
- **WHEN** courses are off and each locale's `terminal.json` is read
- **THEN** it has no `certs` field, `sections` has no `courses`, its `help` strings have no `certs` entry, and it contains no course title or issuer

#### Scenario: Hint trail and easter eggs
- **WHEN** courses are off and `help`, `ls -a` and `cat .secrets` are run
- **THEN** their output is the same as with courses on, apart from the `certs` line of `help` and `courses/` in `ls -a`

## MODIFIED Requirements

### Requirement: Tab completion
Tab SHALL complete the command name, or the argument of `cd`, `open`, `lang`, `theme`, `cat` (`skills.txt`, `.secrets`) and `ls` (`-a`), when exactly one candidate matches the text typed so far. Hidden easter eggs SHALL never be completed or listed. When several match, it SHALL complete their common prefix and list the candidates. Tab SHALL never move focus out of the input. On an empty input it SHALL list the commands shown by `help`. Commands and sections that are off SHALL never be offered.

#### Scenario: Unique command
- **WHEN** the visitor types `wh` and presses Tab
- **THEN** the input reads `whoami `

#### Scenario: Easter egg never offered
- **WHEN** the visitor types `neo`, `./h`, `vi` or `ob` and presses Tab
- **THEN** the input is unchanged and nothing is listed

#### Scenario: Several candidates
- **WHEN** courses are on and the visitor types `c` and presses Tab
- **THEN** the input still reads `c`, and the log lists `cat  cd  certs  clear  contact`

#### Scenario: Several candidates with courses off
- **WHEN** courses are off and the visitor types `c` and presses Tab
- **THEN** the input still reads `c`, and the log lists `cat  cd  clear  contact`

#### Scenario: Section argument with courses off
- **WHEN** courses are off and the visitor types `cd c` and presses Tab
- **THEN** the input reads `cd contact`

#### Scenario: Argument
- **WHEN** the visitor types `cd pro` and presses Tab
- **THEN** the input reads `cd projects`

#### Scenario: Hidden file and flag
- **WHEN** the visitor types `cat .` and presses Tab, and later `ls ` and presses Tab
- **THEN** the input reads `cat .secrets`, and then `ls -a`

### Requirement: Help
`help` SHALL list every command a visitor can type, except the hidden easter eggs (`adb`, `./gradlew`, `neofetch`, `sudo`, `rm`, `matrix`, `./hello`, `ping`, `git`, `brew`, `vim`, `obs`), each with a one-line localized description. `theme` SHALL be listed. `certs` SHALL be listed only while courses are on. The list SHALL end with a dim hint line pointing to `ls -a`: "psst… not everything is listed. try ls -a" / "psst… nem tudo está na lista. tente ls -a" / "psst… no todo está en la lista. prueba ls -a".

#### Scenario: English help
- **WHEN** courses are on and `help` is run on `/`
- **THEN** the output lists `help`, `whoami`, `about`, `experience`, `projects`, `skills`, `certs`, `contact`, `ls`, `cd`, `cat`, `resume`, `open`, `lang`, `theme`, `clear`, `history` and `exit`, each with its description, and ends with the dim line "psst… not everything is listed. try ls -a"

#### Scenario: English help with courses off
- **WHEN** courses are off and `help` is run on `/`
- **THEN** the output lists the same commands without `certs`, and no line mentions courses or certificates

#### Scenario: Spanish hint
- **WHEN** `help` is run on `/es/`
- **THEN** the last line is "psst… no todo está en la lista. prueba ls -a", with `ls -a` in English

### Requirement: Content commands
`whoami` and `about` SHALL print the profile's name, role, location and summary. `experience`, `projects`, `skills`, `certs` and `contact` SHALL print compact text versions of those sections; `certs` exists only while courses are on. `cat skills.txt` SHALL print the same text as `skills`, and `cat .secrets` SHALL print the easter egg list. All of it SHALL come from the content collections and dictionaries for the page's locale, in the sections' order, with nothing written twice in the source.

#### Scenario: Experience in Portuguese
- **WHEN** `experience` is run on `/pt-br/`
- **THEN** each entry shows its localized period (for example "jan 2025 – mar 2026"), company and Portuguese role, in the section's order

#### Scenario: Skills file
- **WHEN** `cat skills.txt` is run
- **THEN** the output equals that of `skills`: one line per category with its items separated by " · "

#### Scenario: Content edit
- **WHEN** courses are on, a course title is changed in its YAML and the site is rebuilt
- **THEN** `certs` shows the new title with no other edit

#### Scenario: Unknown file
- **WHEN** `cat notes.txt` is run
- **THEN** the output is "cat: notes.txt: No such file or directory" (localized)

### Requirement: Listing and changing sections
`ls` SHALL list the rendered sections (`about`, `experience`, `projects`, `skills`, `courses`, `contact`, without `courses` while courses are off), and `ls -a` SHALL add the hidden file `.secrets`. `cd <section>` SHALL close the terminal, scroll to that section the way a navigation click does (instantly with reduced motion) and update the hash. `~`, `..` and `/` SHALL go to the top. An unknown section SHALL print "cd: no such file or directory: <name>" (localized) and keep the terminal open.

#### Scenario: Plain listing
- **WHEN** courses are on and `ls` is run
- **THEN** the output is `about/  experience/  projects/  skills/  courses/  contact/`, with no `.secrets`

#### Scenario: All files
- **WHEN** courses are on and `ls -a` is run
- **THEN** the output is `.secrets  about/  experience/  projects/  skills/  courses/  contact/`

#### Scenario: Listing with courses off
- **WHEN** courses are off and `ls` and `ls -a` are run
- **THEN** the outputs are `about/  experience/  projects/  skills/  contact/` and `.secrets  about/  experience/  projects/  skills/  contact/`

#### Scenario: Other listing arguments
- **WHEN** `ls --long` is run
- **THEN** the output is the same as plain `ls`

#### Scenario: Go to projects
- **WHEN** a visitor at the top of `/` runs `cd projects`
- **THEN** the terminal closes, the page scrolls until the projects section is active in the navigation, and the URL ends in `#projects`

#### Scenario: Tilde path
- **WHEN** `cd ~/about/` is run
- **THEN** it behaves like `cd about`

#### Scenario: Unknown section
- **WHEN** `cd blog` is run
- **THEN** the terminal stays open and shows the localized error
