# Proposal: polish

## Why

The portfolio is feature-complete, but it isn't ready to call v1.0. The résumés are outdated and have no working links, the 404 page is a placeholder in English only, shared links have no preview, search engines have no canonical URLs, sitemap or structured data, and the README doesn't speak to visitors or state a license.

Prerequisite checked: `terminal-discovery` is merged (PR #23, `f84df15`) and `main` is level with `origin/main`.

## What Changes

- **Résumés:** replace the three PDFs with the new files from `~/portfolio-inbox/`. The content stays as it is: each file is rewritten in full so no old metadata can be recovered, keeping exactly the four URI link annotations.
- **404 page (BREAKING for the placeholder):** terminal-style `bash: <path>: command not found`, then one translated line and a `$ cd ~` link to the matching locale home. Language and path come from `location.pathname`. Without JavaScript the page is English with a generic path. It is `noindex`.
- **Sharing and SEO:** per-locale description, canonical, hreflang, Open Graph and Twitter tags. Generated 1200×630 images, one per locale. `sitemap.xml`, `robots.txt` and JSON-LD `Person` with no phone.
- **Language switcher:** accessible names start with the visible text (`EN — English`, `PT — Português`, `ES — Español`), which fixes the WCAG 2.5.3 mismatch.
- **Dim token:** the `visual-identity` spec now allows `--text-dim` on purely decorative text hidden from assistive technology, which resolves its conflict with the Skills line numbers. No code change.
- **Lighthouse:** mobile and desktop on `/`, `/pt-br/` and `/es/`, 3 runs each, median, saved in this change folder, plus a list of every color below 4.5:1 with its measured ratio. Palette, font or animation changes are proposed and wait for the owner's approval.
- **README and license:** visitor introduction with hero screenshot and "how it was built", hidden commands in a collapsed spoilers block, MIT `LICENSE`, `NOTICE.md` for personal content.
- **Verification:** new suites for all of the above, written to be ported to Playwright in `e2e-ci`.

Out of scope: `e2e-ci`, custom domain.

## Capabilities

### New Capabilities

- `not-found-page`: the terminal-style 404 page, how it resolves language and path, and how it behaves without JavaScript.
- `search-and-sharing`: what search engines and link previews read: per-locale metadata, share images, sitemap, robots and structured data.
- `repository-docs`: what the repository tells visitors: README introduction, spoilers block, license and notice.

### Modified Capabilities

- `contact`: published résumés keep exactly their four link annotations, and old metadata can't be recovered.
- `i18n`: `hreflang` alternates apply to locale pages, not the 404 page, whose `<html lang>` follows the requested path. Switcher accessible names start with the visible code.
- `analytics`: the `not_found` event's `locale` follows the requested path.
- `visual-identity`: `--text-dim` may color purely decorative text hidden from assistive technology, and that text is the only exception to the contrast requirement.
- `site-build`: the placeholder not-found requirement is removed (moved to `not-found-page`), and Lighthouse targets are added.

## Impact

- **Code:** `src/layouts/BaseLayout.astro`, `src/components/LanguageSwitcher.astro`, `src/pages/404.astro`, new `src/pages/og/[locale].png.ts`, `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`, new `src/lib/seo.ts` and `src/lib/og-image.ts`, the three dictionaries.
- **Content:** `public/resume/*.pdf`, new `docs/assets/`, `LICENSE`, `NOTICE.md`, `README.md`.
- **Dependencies:** `sharp` becomes a direct dependency (today it comes through Astro) and `opentype.js` is new, both build-time only. See design.md.
- **Existing suites:** `t91` checks the placeholder (`h1` contains "404", `lang` is `en` on `/pt-br/nope/`), and `t71` checks that the switcher's names are the bare language names. Both have to change because the behavior changes on purpose.
- **Verification repo:** new `nf-*`, `seo-*`, `pdf-links`, a Lighthouse tool and a screenshot tool, all classified in `full.sh`. `CLAUDE.md` gets the new suite names and live-run list.

## Résumé inspection

The new files in `~/portfolio-inbox/` were inspected on scratch copies during review. All three have the same structure.

| File | Four links | Info / XMP |
| ---- | ---------- | ---------- |
| `resume-en.pdf` | Yes, correct URLs | Info present, no XMP |
| `resume-pt-br.pdf` | Yes, correct URLs | Info present, no XMP |
| `resume-es.pdf` | Yes, correct URLs | Info present, no XMP |

The four links are `mailto:trod.dev@gmail.com`, `https://www.linkedin.com/in/tods/`, `https://github.com/todsdev` and `https://todsdev.github.io/?utm_source=cv`, and they match the contacts data. The Info dictionaries hold the title, Chromium and Skia as generators, and creation dates.

## Deliberate exception: the phone number in the résumés

The résumés contain the phone number on purpose. All three new files have it once, in the page 1 contact line, and it stays. The site's protection exists so bots can't scrape the number from the pages, so it applies to the built HTML and `terminal.json` only, and the no-phone check covers exactly those. No PDF is checked for the number.

## Decided in review

- **Skills line numbers:** they keep `--text-dim`, through a `visual-identity` delta. They have no `aria-hidden` attribute, because they are generated content with no element to carry it. Empty alternative text hides them instead, and the delta allows both forms. `s-a11y` already asserts they are absent from the accessibility tree, and Chrome's full accessibility tree on the live site confirmed it.
- **Localized job title:** `profile.role` is "Android Developer" in every locale on purpose (the hero's typo animation needs it), so it stays as it is in the hero. The images, `og:image:alt` and JSON-LD `jobTitle` use the wording already in `meta.title`: "Desenvolvedor Android" and "Desarrollador Android".
- **`not_found` event:** name and `path` are unchanged. Its `locale` field follows the page, as for every event, so `/pt-br/nope` now reports `pt-br` instead of `en`.
- **Language switcher:** fixed in this change, and verified.
- **404 title and skip link** are translated too, though the request names only `lang`, the line and the footer. Otherwise the page would mix languages.
- **"Black background"** is the site's `--bg` (`#0e0e0e`), so the image matches the page.
- **`og:locale`:** `en_US`, `pt_BR`, `es_ES`. `og:type` is `website`.
- **README spoilers** also take the bullets that name easter eggs ("Intro replay", "Motion", and the `obs` sentence under "Data"). The Analytics section keeps its passing mentions of `sudo hire-me` and `vim`, since it documents events.

## Post-merge checklist (not part of the apply tasks)

Runs only after the merge and a successful deploy. `<merge-sha>` is the merge commit.

1. **Manual, by the owner:** run LinkedIn Post Inspector on `https://todsdev.github.io/`, `/pt-br/` and `/es/`.
2. **License detected:** `gh api repos/todsdev/todsdev.github.io/license --jq .license.spdx_id` prints `MIT`.
3. **Release:** write `release-notes.md` as a short changelog with one line per entry in `openspec/changes/archive/`, including this change, then:

   ```sh
   gh release create v1.0.0 --target <merge-sha> --title "v1.0.0" --notes-file release-notes.md
   ```

4. **Repository settings:**

   ```sh
   gh repo edit todsdev/todsdev.github.io \
     --description "Personal portfolio of Thiago Rodrigues, Android Developer. Built with Astro in three languages, using Spec-Driven Development with OpenSpec." \
     --homepage "https://todsdev.github.io" \
     --add-topic android --add-topic portfolio --add-topic astro \
     --add-topic openspec --add-topic spec-driven-development --add-topic typescript
   ```

The description wording is a suggestion. Creating the tag doesn't trigger a deploy, because `deploy.yml` runs on pushes to `main` only.
