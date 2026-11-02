# Proposal

## Why

The hero is the first thing a visitor sees, but after `setup-base` it is a placeholder with only a `$ whoami` prompt and the owner's name. This change turns it into the portfolio's signature moment: a terminal-style introduction that types the name and role (including a deliberate, self-corrected typo), powers on a professional photo like an old CRT, and shows whether the owner is open to work. All of this keeps the content accessible and avoids layout shift.

## What Changes

- **Typing sequence (VT323):**
  1. A dim prompt line `~/portfolio $ ./hello` appears (translated per locale).
  2. The name from `profile.yaml` is typed at irregular 70–160 ms per character, with a blinking block cursor.
  3. A second line types `> Android developer` faster (45–100 ms).
  4. A pause of about 750 ms.
  5. A quick backspace (about 40 ms per character) erases `developer`.
  6. `Developer` is retyped with a capital D, and the cursor keeps blinking at the end.
- **Skip and repeat:** any click or key press skips straight to the final state, and the sequence runs once per page load.
- **Role language:** the typed role stays in English in all locales (it's a job title, taken from `profile.role.en`). The prompt line and status label are translated.
- **Photo:** a professional photo slot sits next to the title on desktop and above it on mobile. Its path is set in `profile.yaml` and it goes through Astro's image optimization. It's grayscale with a subtle scanline overlay, and a neutral placeholder image stands in until the real photo is added. After typing finishes, it "powers on" like a CRT: a brief brightness flash, then a fade-in.
- **Status:** a `● open to work` badge sits next to the role and appears after the photo powers on. It's driven by a `profile.yaml` field, so it can be turned off or reworded without code changes, and it's translated.
- **Accessibility and fallbacks:**
  - The final text is real HTML (the `h1` holds the name), and the animated layer is `aria-hidden`.
  - Without JavaScript, or with reduced motion, the final state shows immediately with the photo visible.
  - There's no layout shift while typing, because the final line sizes are reserved.
- The setup-base `$ whoami` hero prompt is replaced by the new prompt line.

Assumptions (the requirements didn't specify these; revise before apply if wrong):
- Opening the page with a hash pointing to another section (e.g. `/#skills`) shows the hero in its final state without animating, since it starts off-screen.
- The status badge uses VT323 like the rest of the hero text, so its line reads as one terminal line.
- The photo's alt text comes from the dictionaries and includes the owner's name.
- The out-of-scope list in the request was cut off after `experience-timeline,`. I've completed it with the remaining items from setup-base's out-of-scope list (below).

## Capabilities

### New Capabilities
- `hero`: the hero section's content, typing sequence, skip behavior, photo presentation and power-on, availability status, accessibility, fallbacks and layout stability.

### Modified Capabilities
- `visual-identity`: VT323 now covers the whole hero text block (prompt line, name, role, status), not only the hero title.
- `content-model`: the profile gains a photo field (an optimized image path) and an availability field (on/off plus a translatable label).

## Impact

- **Code:**
  - New `src/components/Hero.astro` and `src/scripts/hero.ts`.
  - `Portfolio.astro` renders the Hero instead of the placeholder hero section.
  - `src/content.config.ts` profile schema gains `image()` and `availability`, and `src/content/profile/profile.yaml` gets the new fields.
  - A placeholder photo is added under `src/content/profile/`.
  - `src/i18n/*.ts` gain hero keys (prompt line, photo alt), and the unused `prompt.hero` is removed.
  - README gets documentation for the new profile fields.
- **Dependencies:** none new. This uses Astro's built-in image service (`sharp` is already installed).
- **Specs:** new `hero`; modified `visual-identity` and `content-model`.
- **Delivery:** same workflow as setup-base: a `feat/hero` branch and draft PR, one Conventional Commit per task, and deployment by merging the PR.
- **Out of scope (separate changes):** about, experience-timeline, projects, skills, courses, contact-footer, terminal easter egg, polish (Open Graph, analytics, SEO, Lighthouse, terminal-style 404, Playwright tests), custom domain. Adding the real photo is a content update, not part of this change.
