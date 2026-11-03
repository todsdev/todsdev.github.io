# Proposal

## Why

Experience locations are plain strings, so the Portuguese and Spanish timelines show "Rio de Janeiro, Brazil" and "Worldwide" in English. This was flagged during experience-timeline. The profile location already solved the same problem by becoming translatable.

## What Changes

- `experience.location` becomes a translatable field (only `en` required, English fallback with a build warning), the same pattern as `profile.location`.
- **Content:**
  - act digital and Horus: en "Rio de Janeiro, Brazil", pt-br and es "Rio de Janeiro, Brasil".
  - OBS: en "Worldwide", pt-br "Vários países", es "Varios países".
- **Experience timeline:** each entry's location is shown in the page's language. No markup or styling changes are needed, because localized fields resolve automatically.
- **README:** the content table marks experience `location` as translatable.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `content-model`: adds "Experience location is translatable".
- `experience`: "Entry content" shows the location in the page's language instead of as written.

## Impact

- `src/content.config.ts` (experience `location` → `localizedText`), the three `src/content/experience/*.yaml` files, and the README.
- No dependency, markup or style changes.
