# Design

## Context

- **Placeholder section:** `Portfolio.astro` renders `<Section id="projects">` with no content.
- **Projects schema today:** `title`, `description`, `status`, `url?`, `repoUrl?`, `tech[]` plus the common `order`, `featured` and `hidden`. `getEntries()` returns visible entries sorted by `order` and localized.
- **Reusable patterns:**
  - The profile photo: a path checked against `import.meta.glob`, then piped into `image()`.
  - The experience section's `.xp__tag` tokens.
  - The language flags' grayscale filter.
- **Constraints:**
  - CLS 0 on every load, which the live checks verify.
  - AA contrast for all text.
  - `--highlight` is reserved for the cursor, the active nav link and hover.
  - Commands stay in English in every locale; labels are translated. This is the rule in `openspec/config.yaml`.

## Goals / Non-Goals

**Goals:**
- The card component reads everything from the collection plus the dictionaries.
- Ordering and the link-to-action mapping are pure functions, so they can be unit-tested, including the `building` case that no current content exercises.

**Non-Goals:**
- No carousel or gallery. Only the first screenshot is shown, even if more are listed.
- No change to the scroll thread. Project cards get no thread markers.
- No changes to the experience section's visuals beyond extracting the shared tag component.

## Decisions

1. **Screenshot field mirrors the profile photo.**
   - **How:** a module-level `import.meta.glob("./content/projects/**/*.{png,jpg,jpeg,webp,avif}")` set validates each `src` before it is piped into `image()`. A missing file is then reported against the entry and `screenshots`, not as an opaque Vite error.
   - **Files:** `src/content/projects/<id>.webp`, next to `<id>.yaml`. The glob loader only reads `*.yaml`, so image files don't become entries.
   - **Alternative:** a shared `public/` folder with plain `<img>` tags. Rejected: that loses optimization, and it loses the build-time existence check.

2. **Store URLs are domain-checked.** `z.url()` is refined with `startsWith("https://play.google.com/")` and `startsWith("https://apps.apple.com/")`. This catches a pasted wrong link (for example, putting the App Store URL into `playStore`) at build time. It costs nothing, since these are the only two stores.

3. **Ordering, actions and note groups live in `src/lib/projects.ts`.**
   - **What:**
     - `sortProjects()`: featured first, then the existing `order`/id ordering, using a stable sort on top of `getEntries()`.
     - `projectActions(project)`: returns `[{ command, href, destination }]` in the order play-store, app-store, site, repo, and drops the store actions when `status` is `building`.
     - `ownershipNotes(projects, locale, templates)`: takes the sorted, localized projects. It keeps the contributors and groups them by `owner` plus `via`, in order of first appearance. It returns one string per group.
   - **Where it's used:** `Projects.astro` only maps these to markup.
   - **Tests:** node tests cover order, missing links, the building case and the note: plural vs. singular, two owners, a group without `via`, no contributors, and all three locales.

4. **Phone frame.**
   - **Frame:** a `figure` with a 2px `--surface-2` border, rounded corners and a small, even inner padding (the bezel). There's no notch, no buttons and no logo.
   - **Screen:** `aspect-ratio: 9 / 19.5` with `object-fit: cover`, so space is reserved before the image loads. The `<Picture>` gets explicit `width` and `height` from the image metadata.
   - **Formats and widths:** AVIF and WebP, at about 160 and 320px widths.
   - **Loading:** screenshots are below the fold, so `loading="lazy"` and `decoding="async"`.
   - **Layout:** at ≥ 40rem the frame sits beside the text (frame about 9rem wide, text column flexible). Below 40rem the frame stacks above the text, about 8rem wide, left-aligned with the text.
   - **Alternative:** an SVG device mockup. Rejected: it's heavier, and it would drift toward brand details.

5. **Grayscale to color.**
   - **CSS:** `filter: grayscale(1)` on the screenshot, and `filter: none` under `.card:hover` and `.card:focus-within`. This matches the flags' 150ms ease-out.
   - **Reduced motion:** `@media (prefers-reduced-motion: reduce)` sets `transition: none`.
   - **No layout shift:** `filter` doesn't affect layout, so nothing moves.
   - **Why `focus-within`:** the card itself isn't focusable; its actions are. That gives keyboard users the same color state as hover.

6. **Badge, status and actions as text tokens.**
   - **Badge:**
     - The ownership word comes from `t(locale, "projects.ownership.<value>")`, then ` · ` plus `t(locale, "projects.via", { name })` when `via` is set: "via act digital" / "via act digital" / "vía act digital".
     - It's styled like a tag, but outlined in `--text-muted`, so it reads as metadata and not as a tech item.
   - **Actions:**
     - `<a href target="_blank" rel="noopener">` with the visible text `$ open play-store`; the `$` is `aria-hidden`.
     - A `.visually-hidden` span adds the localized destination from a dictionary template, e.g. `{title} no Google Play (abre em nova aba)`. The accessible name is then "open play-store, GloboPop no Google Play (abre em nova aba)": it contains the visible label (WCAG 2.5.3) and is otherwise localized.
     - Actions use `--text-muted` at rest, with `--highlight` on hover and focus. That is the existing hover rule.
     - Tap targets are at least 24px tall.
   - **Status:** `[building... ▓▓▓░░░]`, with `▓▓▓░░░` wrapped in `aria-hidden`. Screen readers hear "[building...]".

7. **Shared tech tags.**
   - **What:** `TechTags.astro` (a `ul` of tokens) is extracted from `Experience.astro`, and both sections use it. The experience checks (x-style, x-stable) must still pass, which shows the extraction changed nothing visible.
   - **Alternative:** a global `.tag` class. Rejected: the project keeps styles scoped in components.

8. **Copy split.**
   - **Dictionaries:** UI copy goes under a `projects` key: ownership words, the status label, the destination templates (Google Play, App Store, site, repository) and the note templates.
     - The note templates are `note.one` (with `{app}`) and `note.other` (with `{apps}`), plus `{owner}` and a `{through}` slot at the end of the second sentence.
     - `{through}` is filled from `note.through`: " through {via}" / " por meio da empresa {via}" / " a través de {via}". It is empty when the group has no `via`, so the sentence ends "…as an Android developer.".
     - Resulting en `note.other`: "{apps} are owned by {owner}. I contributed to them as an Android developer{through}.". The pt-br and es templates are the approved wording, split the same way.
     - The form is chosen with `Intl.PluralRules` on the group size.
   - **Collection:** project data.
   - **Commands:** they are not dictionary strings. They are constants in `projects.ts`, because they never change per locale.

9. **List formatting.**
   - **Joining titles:** `Intl.ListFormat` with `type: "conjunction"` joins the titles. The locale tags are `en-GB`, `pt-BR` and `es`.
   - **Why `en-GB`:** `en-US` adds a serial comma ("A, B, and C"), and the approved English wording has none. Node 24 and every target browser ship full ICU, so the output is the same at build time.
   - **When it runs:** the note is computed at build time only. Nothing runs on the client.
   - **Alternative:** a hand-written join. Rejected: `Intl.ListFormat` already handles "A and B" vs. "A, B and C" in every locale.

10. **Content and assets.**
   - **Globo apps:** one iPhone screenshot each, taken from the official App Store listing at its 600×1300 size (already 9:19.5).
     - Re-encoded to WebP with metadata stripped (no EXIF or ICC beyond sRGB), aiming for ≤ 60 KB each.
     - Each one is viewed before use, so the alt text describes what the screen actually shows.
   - **Portfolio:** a 390×845 viewport capture of the live hero once typing finishes. It's taken at DPR 2, then resized to 600×1300.
   - **Downloads:** downloaded images are untrusted. They go to their own scratch directory and are only decoded and re-encoded, never executed.

## Risks / Trade-offs

- **[Store screenshots carry marketing captions]** → The alt text describes the screen and its caption. The owner has approved the use, and the source is noted in the commit.
- **[Note grammar is fixed per locale]** → The pt-br template says "à empresa {owner}" and "da empresa {via}", so it reads correctly for any company name without per-owner articles. The pronouns are fixed: "eles" / "ele" in pt-br, "ellas" / "ella" in es. That matches "apps".
- **[Grayscale makes a mostly gray hero screenshot look unchanged on hover]** → Acceptable. The portfolio is mostly monochrome by design. The check verifies the computed `filter`, not the pixels.
- **[Lazy images and CLS]** → Explicit dimensions plus an `aspect-ratio` box reserve the space. x-stable-style checks measure card boxes before and after the images load.
- **[Play Store package names can change]** → They were verified on 2026-11-03 against the listing title and developer. The domain check catches obvious mistakes, not stale listings.

## Migration Plan

Content-only data migration. All four project YAMLs get `ownership` in the same commit that makes it required, so the build never breaks. Rollback is a revert of the merge commit.
