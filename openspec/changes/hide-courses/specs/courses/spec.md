## ADDED Requirements

### Requirement: Courses only while enabled
The courses section SHALL render only while the profile's `courses.enabled` is `true`. While it is `false`, no locale page SHALL contain the section, a course line, an `$ open cert` action, a `certificate` analytics attribute, or any link or anchor to `#courses`.

#### Scenario: Flag off
- **WHEN** `courses.enabled` is `false` and any locale page is built
- **THEN** it has no element with id `courses`, no `href` ending in `#courses`, no course title or issuer, and no `data-event="certificate"`

#### Scenario: Flag on
- **WHEN** `courses.enabled` is `true`
- **THEN** the section renders as the other requirements of this capability describe

#### Scenario: Deep link while off
- **WHEN** `courses.enabled` is `false` and a visitor opens `/#courses`
- **THEN** the page stays at the top, the hero is the active nav item, and no error is thrown

### Requirement: Hosted certificates only while enabled
Certificate files under the site's `/certificates/` path SHALL be published only while `courses.enabled` is `true`, at the same URLs as before. While it is `false`, the build output SHALL contain no `/certificates/` files and requesting one SHALL return 404.

#### Scenario: Flag off
- **WHEN** `courses.enabled` is `false` and `/certificates/cursoemvideo-algoritmo.pdf` is requested
- **THEN** the response is 404, and the build output has no `certificates` directory

#### Scenario: Flag on
- **WHEN** `courses.enabled` is `true` and the same URL is requested
- **THEN** it returns 200 with the same metadata-free PDF as before

## MODIFIED Requirements

### Requirement: Certificate links resolve
While courses are enabled, every `certificateUrl` SHALL point to the certificate.
- **Hosted:** files under the site's `/certificates/` path SHALL be served with status 200 as PDFs.
- **Udemy:** links SHALL be `https://www.udemy.com/certificate/<id>/` URLs whose certificate exists, shown by Udemy's certificate image for the same id returning 200.

#### Scenario: Hosted PDF
- **WHEN** courses are enabled and `https://todsdev.github.io/certificates/cursoemvideo-algoritmo.pdf` is requested after deploy
- **THEN** it returns 200 with a PDF body

#### Scenario: Udemy certificate
- **WHEN** the Marvel App course's link is checked
- **THEN** it is `https://www.udemy.com/certificate/UC-2ec0adb8-eaf1-475b-9481-ef6d7106aef8/`, and Udemy's certificate image for that id returns 200
