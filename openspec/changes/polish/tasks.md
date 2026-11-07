# Tasks

Every commit is gated on `npm run lint`, `npm run check`, `npm run format:check` and `npm test`. New suites must fail at least once against the old behavior. Script changes are committed and pushed in `todsdev/portfolio-verify-scripts`, with the evidence recorded there too.

## 1. Setup and résumés

- [x] 1.1 Create branch `feat/polish`, commit the artifacts and open a draft PR; verify the PR is draft and `openspec validate polish --strict` passes
- [x] 1.2 Copy `resume-en.pdf`, `resume-pt-br.pdf` and `resume-es.pdf` from `~/portfolio-inbox/` to a fresh scratch directory, stopping to ask if any is missing or named differently; verify they still match the inspection in `proposal.md`: the four URIs, Info present and no XMP (no repo change, so no commit)
- [x] 1.3 Write `pdf-links.mjs` with the four-link and metadata checks, and classify it in `full.sh`; verify it fails against the current `public/resume/` files (0 annotations), and that its metadata check fails against the inbox files (Info present)
- [x] 1.4 Rewrite the PDFs in scratch per design decision 1; verify `pdf-links` passes on the output, each file has one `startxref` and `%%EOF`, original metadata values are absent with streams expanded, and pages render pixel-identical to the originals (no repo change, so no commit)
- [x] 1.5 Install the rewritten files in `public/resume/`; verify `pdf-links` passes on the built `dist/resume/` files

## 2. 404 page

- [x] 2.1 Write `nf-locale`, `nf-escape` and `nf-nojs` and classify them; verify they fail against the placeholder page
- [x] 2.2 Replace the `notFound` dictionary keys in all three locales (translated line, destination); verify `npm run check` passes with no missing key and each line starts with a capital
- [x] 2.3 Add the `footer` slot and `noindex` mode to `BaseLayout`, with no change to locale pages; verify `k-footer` and `tm-theme` pass and the built locale HTML is otherwise unchanged
- [x] 2.4 Rewrite `404.astro` per design decisions 2 and 3; verify `nf-*`, `an-events`, `an-markup`, `an-sections`, `an-track`, `an-host` and `tm-open` pass
- [x] 2.5 Update `t91` for the intended behavior (terminal text instead of `404`, `lang` following the path), explaining it in the commit; verify it fails against the old build and passes on the new one
- [x] 2.6 Update the README's Footer and 404 text; verify `npm run format:check` passes

## 3. Sharing and SEO

- [ ] 3.1 Add `meta.jobTitle` and `meta.ogImageAlt` to the three dictionaries, and `src/lib/seo.ts` with unit tests (tags, sitemap, robots, JSON-LD, `<` escaping, `meta.title` ending with the job title); verify `npm test` passes
- [ ] 3.2 Write `seo-meta`, `seo-sitemap`, `seo-jsonld` and `seo-phone` and classify them; verify `seo-meta`, `seo-sitemap` and `seo-jsonld` fail on the current build, and that `seo-phone` fails on a temporary copy of a built page, and of a `terminal.json`, with the number added
- [ ] 3.3 Render the tags and JSON-LD in `BaseLayout` for locale pages; verify `seo-meta`, `seo-jsonld` and `seo-phone` pass except the image checks, and no tag appears on the 404 page
- [ ] 3.4 Add `sitemap.xml` and `robots.txt` endpoints; verify `seo-sitemap` passes
- [ ] 3.5 Write `seo-image`, add `sharp` and `opentype.js`, and add `src/lib/og-image.ts` and `src/pages/og/[locale].png.ts`; verify `seo-image` fails first and then passes, `seo-meta` passes in full, and the images are inspected by eye and carry no metadata
- [ ] 3.6 Document SEO, share images and the `meta.jobTitle` key in the README; verify `npm run format:check` passes

## 4. README and license

- [ ] 4.1 Add `LICENSE` (plain MIT text, `Copyright (c) 2026 Thiago Rodrigues`) and `NOTICE.md`; verify `LICENSE` matches the standard MIT text word for word except the copyright line
- [ ] 4.2 Write `readme-shot`, classify it as a tool and save the settled hero to `docs/assets/hero.png`; verify the image by eye and that nothing was added under `dist/` or `public/`
- [ ] 4.3 Add the visitor introduction and license section to the README, using current counts, with no GIF; verify the links resolve and the existing technical documentation is intact below it
- [ ] 4.4 Move the hidden commands into a collapsed `<details>` spoilers block, as listed in the proposal; verify every command from `cat .secrets` is in it and the block renders collapsed on the PR

## 5. Language switcher

- [ ] 5.1 Update `t71` so each accessible name must start with the visible code and equal the expected string on `/`, `/pt-br/` and `/es/`, explaining it in the commit; verify it fails against the current build
- [ ] 5.2 Add the `switcher.names` dictionary key and use it in `LanguageSwitcher.astro` per design decision 8; verify `t71`, `kbd`, `tm-theme` and `tm-open` pass, the `language.*` values are unchanged, and the switcher's layout doesn't change

## 6. Lighthouse and contrast

- [ ] 6.1 Write `lh-table`, classify it as a tool and run it (3 runs × 3 pages × 2 form factors, median); save `openspec/changes/polish/lighthouse.md`; verify the table has 6 rows, each a median of 3, and `label-content-name-mismatch` passes on every page
- [ ] 6.2 Measure every color below 4.5:1, in all themes, including pseudo-elements and the 404 page, and save it as `openspec/changes/polish/contrast.md` with ratios and whether each element is decorative, `aria-hidden` or has empty alternative text; verify the Skills line numbers and all `--text-dim` uses are listed, `s-a11y` passes, and every text entry is absent from the accessibility tree
- [ ] 6.3 Fix in-scope gaps; if a target needs a palette, font or animation change, or a below-4.5:1 element isn't decorative, **stop, propose the change and wait for the owner's approval**; verify by rerunning `lh-table` and that `lighthouse.md` meets the targets or lists each approved exception

## 7. Project docs and full run

- [ ] 7.1 Update `CLAUDE.md` (suite names, real-suite list, live-run list with `nf-*`, `seo-*` and `pdf-links`) and the verification repo's README; verify `full.sh` reports no unclassified scripts
- [ ] 7.2 Run `./full.sh` in the background; verify it reports 0 failed, and record the counts in the commit

## Workflow follow-up

- Archive on the branch: sync the delta specs and verify them, set the README counts to the final numbers (expected 20 specs and 18 archived changes, recounted then), run `openspec validate --all --strict`, then move the change and push.
- Merge with a merge commit once PR checks are green and no deploy is running, then wait for the deploy.
- Live run per `CLAUDE.md`, plus targeted checks: `nf-*`, `seo-*`, `t71` and `pdf-links` against the downloaded live PDFs, the `/pt-br/nope` and `/es/nope` 404s, images and PDFs returning 200, and `/sitemap.xml` and `/robots.txt`.
- Cleanup: back to `main`, pull, delete the branch locally and on origin.
- Post-merge checklist in `proposal.md`: Post Inspector (owner), license detection, release v1.0.0, repository settings.
