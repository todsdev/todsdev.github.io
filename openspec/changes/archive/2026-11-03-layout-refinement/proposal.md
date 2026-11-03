# Proposal

## Why

The top of the page has a few rough edges:
- The hero name always wraps onto two lines, even on wide screens.
- The VT323 `~` renders as a small raised mark, so `~/portfolio` and `$ cd ~/about` read oddly.
- The scroll thread's unfilled track is strong enough that the empty left margin looks like a sidebar.

Two known issues recorded in `openspec/config.yaml` are also still open: active nav labels truncate at 320px, and a font-swap layout shift appears intermittently in the nav on the live site. This change polishes these without adding sections or content.

## What Changes

1. **Hero name on one line:**
   - **Wider content:** the site's content width grows from 52rem to **60rem**, the smallest value that fits "Thiago Rodrigues" on one line at its current size (88px at 1280px) beside the unchanged photo.
   - **Reading measure:** prose paragraphs (the about summary now, and experience/project descriptions when they are rendered) are capped at about 65 characters (`39em` in IBM Plex Mono), so long text doesn't get wider.
   - **Fallback sizing:** on narrower viewports, where the full-size name doesn't fit its column, the name shrinks fluidly to fit one line, using a container query unit and the name's length (VT323 advances 0.4em per glyph). It wraps only below a minimum size.
   - **Unchanged:** the photo's size range and the grid gap. The typing overlay keeps mirroring the real text, so it reserves the final width whether the name fits on one line or wraps, and zero layout shift is kept.
   - **Alignment:** every section shares the content column, so all of them align with the new width (verified).
2. **Legible tilde:** a `~`-only `@font-face` (`unicode-range: U+007E`) maps that one character in the VT323 title font to IBM Plex Mono, scaled to match VT323's glyph width and aligned with the line. It applies everywhere VT323 is used (hero prompt and section titles), with no markup changes, and the text itself is unchanged for copy-paste and screen readers.
3. **Subtler scroll-thread track:** the unfilled track becomes `--text-dim` mixed into `--bg` (about 1.5:1 against the background, down from 2.9:1). The filled part (`--text-muted`), the no-JS and reduced-motion behavior (fully drawn) and the marker hook are unchanged.
4. **Known issue, nav at 320px:** on screens narrower than 360px, the nav uses tighter padding, a slightly smaller label size and a more compact language switcher. Every active label (e.g. `> Experience`, `> Habilidades`) then fits fully in the strip. Every link stays keyboard-reachable, and the switcher codes stay visible.
5. **Known issue, font-swap layout shift:**
   - Preload the self-hosted woff2 files used above the fold (VT323 and IBM Plex Mono, regular, latin subset).
   - Add metric-matched fallback faces (`size-adjust`, ascent and descent overrides), so a late font swap no longer changes text dimensions.
   - Target: CLS 0 on the live site across repeated runs.
   - Remove both items from the known issues in `openspec/config.yaml`.
6. **Verification:** extend the browser checks with the name on one line at 1280px+ in all locales, the font used for the tilde, the track contrast, the nav labels at 320px, and repeated live CLS runs.

Decisions:
- **60rem content width:** the hero text column at 1280px is the content width minus the main padding (64px), the photo (256px) and the grid gap (40px). The name needs 563px at 88px, so the width must be at least about 57.7rem. 60rem is the smallest value in the 60–64rem range and leaves about 37px of headroom.
- **Measure in `em`, not `ch`:** CSS `ch` measures 7.5px in IBM Plex Mono while the real glyph advance is 9px (0.6em), so "65ch" would only be about 54 characters. `39em` is a true 65 characters.
- **Fallback on phones:** with the fallback sizing, the name also fits on one line at 375px and 320px, as long as the size stays above a readable minimum (about 2.5rem).

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `hero`: adds "Name on one line when it fits".
- `visual-identity`: adds "Content width and reading measure", "Legible tilde in the title font" and "No layout shift from font loading".
- `scroll-thread`: adds "Subtle unfilled track".
- `navigation`: adds "Active label readable at the narrowest width".

## Impact

- **Code:**
  - `src/styles/tokens.css`: `--content-max` 52rem → 60rem and a new `--measure` token.
  - `src/components/Hero.astro`: container query and fallback fluid name size.
  - `src/components/About.astro`: summary capped at `--measure`.
  - `src/styles/fonts.css`: the tilde face and the metric-matched fallback faces.
  - `src/styles/tokens.css`: font stacks.
  - `src/layouts/BaseLayout.astro`: font preloads.
  - `src/components/ScrollThread.astro`: track color.
  - `src/components/SiteNav.astro` and `src/components/LanguageSwitcher.astro`: narrow-width spacing.
- **Config and docs:** `openspec/config.yaml` (known issues removed) and the README if needed.
- **Dependencies:** none new. The preloads reuse the Fontsource woff2 files, so no extra font downloads.
- **Out of scope:** experience-timeline, projects, skills, courses, contact-footer, terminal easter egg, polish.

## Post-merge correction (2026-11-03)

The "font-swap layout shift" known issue was misdiagnosed. The live CLS check after this change still found small nav shifts (about 0.0004 on 6 of 60 loads). Tracing them showed the cause was the nav's active indicator: the `> ` prefix and cursor were added only to the active link, widening it by about 28px whenever the active section changed (on load and while scrolling). Font loading was not the cause. The font work in this change (loading only the needed subsets, preloading, metric-matched fallbacks) is correct and stays. The nav shift is fixed by the `nav-indicator-stable` change, which reserves the indicator's space on every link.
