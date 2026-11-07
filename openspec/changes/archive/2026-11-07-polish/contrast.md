# Contrast

Every text color below 4.5:1 found by `lh-contrast.mjs` on 2026-11-07, against http://localhost:4321: 6474 text samples (real text nodes and pseudo-element text) in the gray, green and amber themes, at 1280 and 390 px, on `/`, `/pt-br/`, `/es/`, the 404 page in the three languages, and the open terminal after `help`, `whoami`, `brew coffee` and `cat .secrets`. Reduced motion is emulated, because the hero's intro animates its text from transparent (a first scan read the name and role as ratio 1.09). Ratios are WCAG 2.1 contrast of the effective text color over the composited background, one value per theme (gray / green / amber, the lowest seen).

## Text below 4.5:1

| Element | Kind | Content | Ratio (gray / green / amber) | Hidden from assistive technology | Seen on |
| ------- | ---- | ------- | ----------------------------- | -------------------------------- | ------- |
| `div.file > div.file__group::after` | generated content | `counter(line)` | 2.89 / 2.42 / 2.43 | empty alt | / 1280px, / 390px and 5 more |
| `div.file__group > h3.file__line.file__header::before` | generated content | `counter(line)` | 2.89 / 2.42 / 2.43 | empty alt | / 1280px, / 390px and 5 more |
| `div.file__group > ul.file__line.file__items::before` | generated content | `counter(line)` | 2.89 / 2.42 / 2.43 | empty alt | / 1280px, / 390px and 5 more |

Every entry is generated content with empty alternative text (`content: <value> / ""`) or inside an `aria-hidden` element, and none of the text appears in the accessibility tree (checked on every scanned page). No readable text is below 4.5:1 in any theme.

## All `--text-dim` uses

5 uses in the source (src/components/Experience.astro:163, src/components/Experience.astro:168, src/components/ScrollThread.astro:42, src/components/Skills.astro:116, src/components/Skills.astro:126):

Text rows are measured on their real background (the lowest seen); decoration rows against `--bg`.

| Where | What | Kind | Ratio (gray / green / amber) |
| ----- | ---- | ---- | ---------------------------- |
| `src/components/Skills.astro` | `.file__line::before` line numbers | text, generated content with empty alternative text | 2.89 / 2.42 / 2.43 |
| `src/components/Skills.astro` | `.file__group:not(:last-child)::after` blank-line numbers | text, generated content with empty alternative text | 2.89 / 2.42 / 2.43 |
| `src/components/Experience.astro` | `.xp__marker:not([data-reached])` border | decoration: scroll-thread marker not yet reached | 2.89 / 2.42 / 2.43 |
| `src/components/Experience.astro` | `.xp__tick:not([data-reached])` background | decoration: scroll-thread tick not yet reached | 2.89 / 2.42 / 2.43 |
| `src/components/ScrollThread.astro` | `.scroll-thread__track` background (45% mix with `--bg`) | decoration: unfilled scroll-thread track, `aria-hidden` | 1.49 / 1.38 / 1.37 |

The two Skills entries are text, and are the only text that uses the token; the other three are non-text decoration (the scroll thread), which the `visual-identity` delta allows. `s-a11y` asserts the line numbers are absent from the accessibility tree.
