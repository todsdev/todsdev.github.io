# Proposal

## Why

Some prose content starts with a lowercase letter, e.g. the journey step "quality control at 8 Olympic Games with OBS". It reads as a typo, and fixing it with CSS `text-transform` would leave the underlying text wrong for screen readers, copy-paste and search engines. The rule should be fixed in the data and enforced by the build, so future content follows it too.

## What Changes

- Capitalize the first letter of every prose sentence and list item in the content YAML, in en, pt-br and es. Today that means journey steps 2 and 3.
- Add a sentence-case validation to the content schema for prose fields: profile `summary`, journey step `text`, and experience and project `description`. A value whose first letter is lowercase fails the build with a message naming the file, field and locale.
- Exceptions, which the validation allows:
  - a leading word with its own casing from a short allowlist (`iOS`, `gRPC`, `macOS`, `npm`, `eBay`, `jQuery`)
  - text that starts with a digit or punctuation, e.g. `8 Olympic Games` or Spanish `¿Qué…?`, where the first *letter* is checked
- Terminal commands and prompts (`$ cd ~/about`, `./hello`, `$ neofetch`) and the hero's deliberate "Android developer" typo aren't content fields, so they're unaffected.
- Add fixture-based tests for the validation to `npm test`.
- Record the rule in the `context` of `openspec/config.yaml`, so future changes follow it.
- Confirm that the journey keeps a real space between the year label and the text, both visually and when copied.

Not changed (not sentences, or names with their own casing): enum values (`status`, `kind`), URLs and paths, the company name "act digital", the project title `todsdev.github.io`, short UI labels such as the availability badge (`open to work`, currently disabled), and dictionary keys like the neofetch fact labels.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `content-model`: adds a sentence-case requirement for prose fields, enforced at build time.

## Impact

- `src/content/profile/profile.yaml` (journey text).
- `src/content.config.ts` (a `sentence` text helper used by the prose fields).
- New `src/lib/sentence-case.ts` and `src/lib/sentence-case.test.ts`.
- `openspec/config.yaml` (context) and the README content docs.
- No new dependencies, and no visual change apart from the corrected capitals.
