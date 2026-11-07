# Spec Delta

## MODIFIED Requirements

### Requirement: Résumé download
The section SHALL offer `$ wget resume.pdf`, linking to `/resume/resume-<locale>.pdf` for the page's locale. If that file doesn't exist at build time, it links to the English file. The published résumés SHALL carry no document metadata (no Info dictionary entries and no XMP), written as a full rewrite so old metadata can't be recovered. Each SHALL have extractable text and exactly four URI link annotations: `mailto:`, LinkedIn, GitHub and the site with `utm_source=cv`. The phone number in the résumés is a deliberate exception to the protection that applies to the site's pages.

#### Scenario: Locale file
- **WHEN** the Portuguese page is built with all three résumés present
- **THEN** `$ wget resume.pdf` links to `/resume/resume-pt-br.pdf`, which returns 200 as a PDF

#### Scenario: Fallback
- **WHEN** `resume-es.pdf` is missing at build time
- **THEN** the Spanish page's `$ wget resume.pdf` links to `/resume/resume-en.pdf`

#### Scenario: Links survive
- **WHEN** the annotations of any published résumé are read
- **THEN** there are exactly four URI annotations: `mailto:trod.dev@gmail.com`, `https://www.linkedin.com/in/tods/`, `https://github.com/todsdev` and `https://todsdev.github.io/?utm_source=cv`

#### Scenario: Metadata can't be recovered
- **WHEN** the bytes of any published résumé are inspected, with compressed streams expanded
- **THEN** it has no Info dictionary, no XMP and a single cross-reference section, and none of the original file's metadata values appear
