# Proposal

## Why

The projects section is still an empty placeholder under `$ ls ./projects`. The projects collection already holds four entries: GloboPop, Premiere, Combate and this portfolio. The three Globo apps carry TODOs for their store links, and nothing yet says who owns them. Recruiters should see the apps Thiago shipped, reach their store listings in one click, and understand that he contributed to the Globo apps through act digital rather than owning them.

## What Changes

- **Projects section** (title unchanged, translated as today): a list of data-driven cards. Every visible project in the collection becomes a card, with featured projects first and then by `order`. With the current content that's GloboPop, Premiere, Combate Play, then todsdev.github.io. No project text is hardcoded in the component.
- **Content model:** new and changed project fields:
  - `ownership`, required: `contributor` or `owner`.
  - `via`, optional: the plain name of the company the work was done through, e.g. "act digital". It is not translated. The connector words come from the dictionaries: "via" / "via" / "vía" in the badge, "through" / "por meio da empresa" / "a través de" in the note.
  - `owner`: the plain name of the organization that owns the app, e.g. "Globo". Required for contributor projects, and rejected on owner projects.
  - `stores`, optional: `{ playStore?, appStore? }`, both URLs.
  - `screenshots`, optional: a list of images stored next to the project YAML, each with translatable alt text. Like the profile photo, images are optimized at build time, and a missing file fails the build.
  - `url`, `repoUrl`, `tech` and `status` (`live` | `building`) keep their current meaning.
- **Card:**
  - **Phone frame:** a flat, gray-bordered frame (no device brand details) shows the first screenshot. Projects without screenshots get no frame. Space for the frame is reserved, so loading the image causes no layout shift.
  - **Grayscale to color:** screenshots render in grayscale and turn to color when the card is hovered or anything in it has keyboard focus, as the language flags do. With reduced motion the color still changes, but instantly.
  - **Text:** the title, then an ownership badge as a terminal token ("contributor · via act digital" / "owner"), then the description at the reading measure, then the tech tags. The tags are the same tokens the experience section uses.
  - **Actions:** each link that exists becomes a terminal action, in this order: `$ open play-store`, `$ open app-store`, `$ open site`, `$ open repo`.
    - They open in a new tab with `rel="noopener"`.
    - Each has a localized accessible name that names the destination.
  - **Building projects:** a `building` project shows the status line "[building... ▓▓▓░░░]" in place of its store links.
- **Ownership note (data-driven):** a note under the cards, built from the contributor projects.
  - Projects are grouped by `owner` and `via`.
  - App titles are joined per locale with `Intl.ListFormat`.
  - The sentence comes from a localized template in the dictionaries, with singular and plural forms.
  - When no contributor projects are visible, there is no note.
  - With the current content it reads "GloboPop, Premiere and Combate Play are owned by Globo. I contributed to them as an Android developer through act digital.", with the approved pt-br and es templates (exact output in the projects spec).
- **Content:**
  - Each Globo app gets its verified store links:

    | App | Google Play | App Store |
    |---|---|---|
    | GloboPop | `https://play.google.com/store/apps/details?id=com.globo.globopop` | `https://apps.apple.com/br/app/id6757765539` |
    | Premiere | `https://play.google.com/store/apps/details?id=br.tv.horizonte.android.premierefc` | `https://apps.apple.com/br/app/id468481865` |
    | Combate Play | `https://play.google.com/store/apps/details?id=br.tv.horizonte.combate.vod.android` | `https://apps.apple.com/br/app/id777815939` |

  - Each Globo app gets `ownership: contributor`, `owner: Globo` and `via: act digital`.
  - Each Globo app gets one phone screenshot from its official App Store listing (approved by the owner). The screenshots are 600×1300, which matches the frame's 9:19.5 ratio. Metadata is stripped and files are kept small.
  - Combate is renamed "Combate Play" to match the store.
  - The portfolio gets `ownership: owner` and a screenshot of the live hero at mobile width. It keeps its site and repo links.
  - The stale TODO comments are removed.
- **Terminal text rule** (recorded in `openspec/config.yaml`, which this change already updates):
  - Commands stay in English in every locale: the `$ open …` actions.
  - Labels are translated:
    - badges: "colaborador · via act digital" / "proprietário"; "colaborador · vía act digital" / "propietario";
    - status lines: "[construindo... ▓▓▓░░░]" / "[construyendo... ▓▓▓░░░]".
  - Accessible names are fully localized.
- **Accessibility:**
  - The cards are a list of `article`s, each with a heading.
  - Screenshot alt text describes the screen.
  - All text meets AA contrast.
  - Tags and actions stay readable and reachable by keyboard at 320px.
- **Verification:** browser checks in every locale at 1280px and 320px, covering:
  - card order;
  - badges per ownership;
  - links present only when set;
  - grayscale to color on hover and on focus;
  - the reduced-motion state;
  - no layout shift.

  A live CLS check runs after merge.

Assumptions (recorded here, no input needed):
- **One screenshot per app** (approved): only the first screenshot is shown, so each app ships one. The schema still accepts a list.
- **Where the copy lives:** UI copy lives in the i18n dictionaries, like the section titles: the badge words ("contributor" / "owner"), the building status line, accessible-name templates and the ownership-note templates. Project data (titles, owner, via, descriptions, links, screenshots, alt text) lives in the collection.
- **List format** (approved): `en-GB` conjunction format, with no serial comma.
- **Accessible names** (approved): each action's accessible name starts with its visible command and adds a localized destination, e.g. "open play-store, GloboPop no Google Play (abre em nova aba)". It is not a fully replaced `aria-label`. This keeps WCAG 2.5.3 (label in name), so voice users can say what they see, while still naming the destination in the page's language.
- **Ownership words:** "Owner" and "contributor" describe the visitor-facing relationship. They are not legal claims.

## Capabilities

### New Capabilities
- `projects`: the projects section: card order, card content, the phone frame and grayscale-to-color screenshots, ownership badge, terminal actions and building status, ownership note, accessibility and layout stability.

### Modified Capabilities
- `content-model`: adds the project `ownership`, `owner`, `via`, `stores` and `screenshots` fields.

## Impact

- `src/content.config.ts`: new project fields, and a screenshot file check like the profile photo's.
- `src/content/projects/*.yaml` and new screenshot files next to them.
- New `src/components/Projects.astro`, wired into `Portfolio.astro`.
- A shared tech-tags component, extracted from `Experience.astro` with no visible change.
- New `src/lib/projects.ts` (sorting, action list and ownership-note groups), with node tests.
- `src/i18n/{en,pt-br,es}.ts`: badge, status, action-label and note-template strings.
- `README.md`: the content table and a projects example.
- `openspec/config.yaml`: the terminal-text rule.
- No new dependencies.
