# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/projects`. Never push directly to `main`. After each task:
- Mark it done here.
- Make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass.
- Commit only that task's changes plus this file, with a Conventional Commit message.
- Push.

New browser checks go in `~/portfolio-verify-scripts` as `p-*.mjs`. Downloaded store images are untrusted: keep them in their own scratch directory and only decode/re-encode them.

## 1. Branch and PR

- [x] 1.1 Commit the change artifacts and the terminal-text rule in `openspec/config.yaml` on `feat/projects`, push and open a draft PR. Verify with `gh pr view --json isDraft,headRefName`

## 2. Content model and content

- [x] 2.1 Add `ownership` (required enum), `owner` (required for contributors, rejected for owners), `via` (plain non-empty text, optional) and `stores` (optional, domain-checked `playStore`/`appStore`) to the projects schema.
  - In the same commit, give all four YAMLs their `ownership`/`owner`/`via` (`via: act digital` for the Globo apps) and add the three Globo apps' verified store links from proposal.md (exact URLs).
  - Rename Combate to "Combate Play" and remove the TODO comments.
  - Verify: `npm run build` passes with no fallback warnings.
  - Verify by temporarily breaking the data, then reverting. Each of these must fail the build, naming the entry and field: a missing `ownership`, `ownership: client`, a contributor without `owner`, an owner project with `owner`, an empty `via`, and an App Store URL placed in `playStore`.
- [x] 2.2 Add the `screenshots` field (`src` checked against a projects image glob and piped into `image()`, localized `alt`).
  - Download one iPhone screenshot (600×1300) per Globo app from its official App Store listing.
  - Re-encode each to WebP with metadata stripped (≤ 60 KB each), view it, and write alt text in en/pt-br/es describing the screen.
  - Capture the live hero at 390×845 (DPR 2) once typing finishes, resize it to 600×1300 and encode it the same way.
  - Store each file as `src/content/projects/<id>.webp`.
  - Verify:
    - `exiftool`/`sips` show no EXIF/GPS;
    - every file is 600×1300;
    - the build passes;
    - a missing `src` and a missing `alt` (temporarily) fail the build, naming the entry and `screenshots`.
- [ ] 2.3 Add the `projects` dictionary keys to en/pt-br/es: ownership words, the badge connector (`via`: "via {name}" / "via {name}" / "vía {name}"), status label, destination templates and the note templates (`note.one`/`note.other`/`note.through`, approved wording per design.md). Verify `npm run check` fails if a locale lacks a key (temporarily), and that no template contains an app, owner or company name (grep)
- [ ] 2.4 Document the new fields in the README content table, update the projects example, and explain how the ownership note is built from contributor projects. Verify that the documented YAML validates

## 3. Cards

- [ ] 3.1 Add `src/lib/projects.ts` (`sortProjects`, `projectActions`, `ownershipNotes`, English command constants) with `projects.test.ts`. Verify `npm test` covers:
  - featured-first ordering, then `order`;
  - action order play-store → app-store → site → repo;
  - no action for an undefined link;
  - `building` dropping store actions but keeping site and repo;
  - the note strings exactly as in the "Notes per locale" and "Single app" scenarios, no serial comma in English, two owners giving two sentence pairs in card order, a group without `via`, hidden projects excluded, and no notes when there are no contributors.
- [ ] 3.2 Extract `TechTags.astro` from `Experience.astro` and use it there. Verify `x-style.mjs` and `x-stable.mjs` still pass locally, with no change in the experience section's tag boxes
- [ ] 3.3 Create `src/components/Projects.astro` and render it in `<Section id="projects">`. The component contains:
  - a list of `article`s, each with an `h3` title and the badge;
  - the description, tags and actions (visually-hidden localized destination, `target="_blank"`, `rel="noopener"`);
  - the building status, with the blocks `aria-hidden`;
  - the phone-framed first screenshot via `<Picture>` with width and height;
  - the ownership note under the list, built with `ownershipNotes` and omitted when it's empty.

  Verify in each built locale:
  - order GloboPop → Premiere → Combate Play → todsdev.github.io;
  - badge strings exactly as in the spec scenarios;
  - actions exactly as in the "Store app" and "Portfolio" scenarios;
  - accessible names per the Portuguese scenario;
  - alt text localized;
  - note text exact in all three locales;
  - no project text hardcoded in the component (grep).
- [ ] 3.4 Style the cards, frame, badge, actions and note per design.md, including grayscale → color on `:hover`/`:focus-within` and the reduced-motion rule. Verify with `p-cards.mjs` at 1280px and 320px in all locales:
  - the frame's screen is 9:19.5 (±1px);
  - description ≤ ~65 characters per line;
  - tags and actions wrap without overflow at 320px;
  - all text ≥ 4.5:1;
  - the screenshot's computed `filter` is grayscale at rest, and `none` on hover and while an action in the card is focused;
  - the transition is 0s with reduced motion;
  - keyboard Tab reaches every action in card order with a visible outline.

## 4. Integration

- [ ] 4.1 Verify no layout shift:
  - CLS 0 on load, while scrolling through the section and after the lazy screenshots load;
  - card boxes unchanged before and after the images load, and on hover and focus (`p-stable.mjs`);
  - `l-cls.mjs`, `l-navstable` and the `x-*` checks still pass locally.
- [ ] 4.2 Verify the edge cases in a real build with temporary content edits, reverting each:
  - **Building:** set one project to `status: building`. Its card shows the translated status line in each locale and has no store actions, and the blocks are `aria-hidden`.
  - **Hidden contributor:** hide Premiere. The note reads "GloboPop and Combate Play are owned by Globo. …".
  - **No contributors:** hide all three Globo apps. No note element is rendered.
- [ ] 4.3 Run all verification suites plus a clean `npm ci && npm run check && npm run lint && npm run format:check && npm test && npm run build`. Verify that everything passes and the PR checks are green

## Workflow follow-up

- Archive the change, merge with a merge commit, and confirm the deploy run starts and succeeds.
- Live checks against `https://todsdev.github.io`: `l-cls.mjs` (10 loads × 3 locales × 2 widths, CLS 0), plus the `p-*` and `x-*` checks.
- Delete `feat/projects` locally and on origin.
