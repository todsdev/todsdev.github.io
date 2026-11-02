# Proposal

## Why

`todsdev.github.io` will host a one-page personal portfolio for Thiago Rodrigues, an Android Developer. The repository currently holds only OpenSpec scaffolding and an `.nvmrc` pinning Node 24. Every content section planned for later changes (hero, about, experience, projects, skills, courses, contact) needs a shared foundation first: the project and its tooling, a design system, the layout shell, navigation, the scroll thread, multilingual routing, a validated content model and an automated path to production. This change establishes that foundation without any real section content.

## What Changes

- **Project and tooling:** Astro with strict TypeScript on Node 24 (from `.nvmrc`). Fully static output, with no backend, endpoints or database. ESLint, Prettier and `astro check`, with `dev`, `build`, `preview`, `check`, `lint`, `format` and `format:check` npm scripts.
- **Visual identity:** a single dark black/gray theme from fixed CSS custom-property tokens, written in plain CSS with no UI or CSS framework. Self-hosted VT323 (titles) and IBM Plex Mono (body). Terminal-prompt section titles, subtle fade-up section entrance, WCAG AA contrast, visible focus and full keyboard support.
- **Navigation:** a one-page layout with placeholder sections in this order: hero, about, experience, projects, skills, courses, contact. A fixed top nav marks the section in view with `> ` and a blinking block cursor. Scrolling to anchors is smooth, and every section has a URL hash.
- **Scroll thread:** a thin left-side line that draws itself with scroll progress, connecting the sections. It has a marker slot for the future experience timeline.
- **i18n:** English at `/`, Brazilian Portuguese at `/pt-br/` and Spanish at `/es/`, using Astro's i18n routing. All UI text comes from typed dictionaries. A pixel-art flag language switcher (grayscale when inactive, color when active, color preview on hover) keeps the current hash when switching. The choice is persisted, with no browser-language redirect. Pages get correct `<html lang>` and `hreflang` links.
- **Content model:** Astro Content Collections in YAML with Zod schemas for profile, contacts, experience, projects, skills, courses, education and languages. Text fields hold `{ en, pt-br, es }` with English fallback and build warnings. Common `order`, `featured` and `hidden` fields. Invalid data fails the build. Placeholder entries exercise every schema.
- **Reduced motion:** with `prefers-reduced-motion`, nothing animates, all content is visible and the thread is fully drawn.
- **Placeholder 404** page.
- **Deployment:** a GitHub Actions workflow runs checks and the build on pull requests without deploying. On push or merge to `main` it builds and deploys to GitHub Pages, with no concurrent deploys.
- **Delivery:** work happens on `feat/setup-base` through a draft PR, with one Conventional Commit per task. The first deploy happens when that PR is merged; nothing is pushed directly to `main`.

## Capabilities

### New Capabilities
- `site-build`: static build output, Node runtime, home page, shared page shell, placeholder 404 and quality checks.
- `site-deployment`: CI checks on PRs, deploy to GitHub Pages from `main`, gating, user-site URL and non-overlapping deploys.
- `visual-identity`: design tokens, dark theme, typography, terminal-prompt titles, entrance motion, reduced motion, contrast and keyboard/focus accessibility.
- `navigation`: section order and ids, placeholder sections, fixed nav, active-section indicator, smooth scrolling and hash addressing.
- `scroll-thread`: the scroll-progress line, its decorative and accessibility behavior, its static fallback and the timeline marker slot.
- `i18n`: locale routes, dictionaries, language switcher and flag states, hash-preserving switching, persistence without browser-language redirects, and `lang`/`hreflang` metadata.
- `content-model`: collections and fields, translatable fields with fallback warnings, common fields, build-failing validation and placeholder data.

### Modified Capabilities
<!-- None: no existing specs in this repository. -->

## Impact

- **New files:** `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, ESLint/Prettier configs, `src/` (layouts, components, pages for three locales, `i18n/`, `content/`, `content.config.ts`, `styles/`, `scripts/`), `public/` (favicon), `.github/workflows/deploy.yml`, `.gitignore`, `README.md`.
- **Dependencies:** `astro`, `@astrojs/check`, `typescript`, `@fontsource/vt323`, `@fontsource/ibm-plex-mono`, `eslint`, `typescript-eslint`, `eslint-plugin-astro`, `prettier` and `prettier-plugin-astro`. All font files are bundled and served from the site's own origin.
- **Systems:** the GitHub Pages source is already set to "GitHub Actions" (configured manually; verified read-only). The first deployment happens when the `feat/setup-base` PR is merged into `main`. The workflow needs `pages: write` and `id-token: write`.
- **Out of scope (separate changes):** hero (typing animation and photo), about, experience-timeline, projects, skills, courses, contact-footer, terminal easter egg, polish (Open Graph, analytics, SEO, Lighthouse, terminal-style 404) and custom domain.
