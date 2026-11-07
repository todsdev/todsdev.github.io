## MODIFIED Requirements

### Requirement: Page description and canonical URL
Each locale page SHALL have a localized `<meta name="description">` and a canonical link with the absolute URL in the form GitHub Pages serves: `https://todsdev.github.io/`, `/pt-br/` and `/es/`, with the trailing slash. The description SHALL name courses only while the profile's `courses.enabled` is `true`, and `og:description` and `twitter:description` SHALL equal it.

#### Scenario: Portuguese canonical
- **WHEN** `/pt-br/` is opened with `?utm_source=cv`
- **THEN** its canonical is `https://todsdev.github.io/pt-br/` and its description is in Portuguese

#### Scenario: Description with courses off
- **WHEN** courses are off and each locale page is inspected
- **THEN** the description, `og:description` and `twitter:description` read "Portfolio of Thiago Rodrigues, Android Developer: experience, projects and skills." / "Portfólio de Thiago Rodrigues, Desenvolvedor Android: experiência, projetos e habilidades." / "Portafolio de Thiago Rodrigues, Desarrollador Android: experiencia, proyectos y habilidades."

#### Scenario: Description with courses on
- **WHEN** courses are on and the English page is inspected
- **THEN** the description reads "Portfolio of Thiago Rodrigues, Android Developer: experience, projects, skills and courses."

## ADDED Requirements

### Requirement: No course mentions in shared metadata while off
While courses are off, nothing a search engine or link preview reads SHALL mention courses or certificates: the meta and share descriptions, the JSON-LD and the share images.

#### Scenario: Metadata while off
- **WHEN** courses are off and each locale page's meta tags and JSON-LD are read
- **THEN** none contains "course", "curso", "certificate" or "certificado", in any letter case
