# Tasks

## Commit workflow (applies to every task)

All work happens on `feat/analytics`. Never push directly to `main`. After each task:
- Mark it done here.
- Make sure `npm run check`, `npm run lint`, `npm run format:check` and `npm test` pass.
- Commit only that task's changes plus this file, with a Conventional Commit message.
- Push.

New browser checks go in `~/portfolio-verify-scripts` as `an-*.mjs`. That folder isn't versioned, so its changes aren't part of the commits.

## 1. Branch and PR

- [x] 1.1 Commit the change artifacts on `feat/analytics`, push and open a draft PR. Verify with `gh pr view --json isDraft,headRefName`

## 2. Verification harness

- [x] 2.1 In `~/portfolio-verify-scripts/lib.mjs`, make `browser()` stub Umami on every page (design decision 5):
  - by default, the stub script records `umami.track` calls in `window.__umami`, and gateway requests get a 204;
  - `UMAMI=real` loads the real script and answers the beacons locally, recording their bodies;
  - `UMAMI=block` makes both hosts fail to resolve.

  Verify that a throwaway page loading `https://cloud.umami.is/script.js` gets the stub in default mode, records a beacon body with `UMAMI=real` and no request reaches the network, and logs no console errors. Verify that `e2e.mjs` and `kbd.mjs` still pass on `main`'s build.

## 3. Event module

- [x] 3.1 Add `src/lib/analytics.ts`:
  - the constants `UMAMI_SCRIPT`, `WEBSITE_ID` and `TRACKED_HOST`;
  - the event table from design decision 2, with every event: `contact`, `vcard`, `resume`, `project_link`, `certificate`, `nav_click`, `not_found`, `section_view`, `terminal_open`, `terminal_command`;
  - `validEvent(name, data)`;
  - `eventAttrs(name, data)`, typed per event, which adds `locale` and throws on invalid data;
  - the project link-kind mapping;
  - `readEvent(dataset)`, `notFoundPath(pathname)` and `terminalCommand(input, known)`.

  Add `src/lib/analytics.test.ts`. Verify that `npm test` covers:
  - the attributes for each event;
  - the slug guard rejecting a URL, an email, a phone-like value with a `+` or spaces, and an empty string;
  - the `playStore` → `play-store` mapping for every `ActionKind`;
  - `validEvent` rejecting an unknown event name, an unknown field, a missing field and an uppercase value;
  - the `readEvent` round-trip of `eventAttrs`;
  - `notFoundPath` dropping the query and hash and truncating to 200 characters;
  - `terminalCommand`: `cd ~/about --verbose` → `cd`, `./hello` → `hello`, `CD` → `cd`, `hello my name is Ana` → `unknown`, an empty or whitespace input → `unknown`, and arguments never appearing in the result.

## 4. Tracker and events

- [x] 4.1 Load the tracker in `BaseLayout.astro` (`is:inline`, `async`, attributes from the constants). Add `src/scripts/track.ts` (`track()` with locale, validation and the load queue) and `src/scripts/analytics.ts` (the delegated capture listener and the 404 `not_found` event), imported once from `BaseLayout`. Verify in `dist`:
  - each of the four pages has exactly one tracker tag with the website ID, `data-domains="todsdev.github.io"`, `data-exclude-hash="true"` and `data-do-not-track="true"`;
  - with `UMAMI=real` on localhost (`an-host.mjs`), no beacon is sent on load or on click.

  Verify with `an-track.mjs` (stub mode, in all locales). It exercises `track()` through the click listener with injected probe elements, so the site needs no test hook:
  - `locale` is added from `<html lang>`;
  - an unknown name, an unknown field and a non-slug value send nothing;
  - with the stub served after a 1 s delay, events called before it loads are flushed once it does, in order;
  - with `UMAMI=block`, calls are no-ops with no `pageerror`.
- [x] 4.2 Add the event attributes:
  - `nav_click` on the section links in `SiteNav.astro`;
  - contact actions, the vCard and the résumé in `Contact.astro`;
  - project links in `Projects.astro`;
  - certificates in `Courses.astro`;
  - `data-page-event="not_found"` on the 404 page.

  Verify with `an-markup.mjs` in all locales:
  - every action has the expected `data-event` and `data-event-*` values, including `resume` `language` after fallback (with `resume-es.pdf` temporarily removed);
  - no `data-event-*` value contains `/`, `:`, `@` or a digit run of 4 or more;
  - the phone grep is clean: no phone digits, `tel:` or `wa.me/` in `dist/**/*.html`.
- [x] 4.3 Verify the events with `an-events.mjs` (stub mode) in all locales at 1280px and 320px:
  - each click, by mouse and by keyboard (Enter), records the event, name and data from the spec;
  - nav link clicks record `nav_click` with the section;
  - the 404 page records `not_found` with the path and no query.

  Verify that the actions still behave as before:
  - copy writes to the clipboard and shows feedback;
  - the vCard includes `TEL`;
  - the résumé downloads;
  - external links open in a new tab.

  Make one check fail against the build from task 4.1 (no attributes) to prove it isn't vacuous.
- [x] 4.4 Report `section_view` from `src/scripts/nav.ts` (a `seen` set fed by the existing observer's band and by `setActive`; no new observer), with nav-jump suppression (`jumpTarget`, cleared per design decision 5). Verify with `an-sections.mjs` (stub mode), in all locales at 1280px and 320px:
  - a slow scroll to the bottom records exactly seven events in page order, including `contact` when it is set active only at the page end;
  - scrolling back up records nothing more;
  - `/#contact` records `contact` and not the skipped sections;
  - nav jump: at the top of `/`, clicking "Contact" (smooth scroll) records exactly `nav_click` {section: `contact`} and one `section_view` for `contact`, and none for the five sections passed;
  - the same jump with reduced motion gives the same result;
  - after the jump, scrolling back up normally records `section_view` for `courses`;
  - a jump interrupted by a wheel scroll resumes normal recording;
  - the 404 page records no `section_view`.

  Also verify that `l-navstable.mjs` and `kbd.mjs` still pass, and make one check fail against the build from task 4.3 to prove it isn't vacuous.
- [x] 4.5 Verify the blocked tracker with `an-blocked.mjs` (`UMAMI=block`): scrolling, nav clicks and the same actions work, there is no `pageerror`, and copy, vCard and keyboard focus behave the same. Also run `k-stable.mjs` and `l-cls.mjs` (`RUNS=10`) in default mode and with `UMAMI=real`, and verify CLS 0 in both
- [ ] 4.6 Document analytics in the README:
  - what is measured, with the event table (including `section_view`, `nav_click` and the terminal events);
  - the `track()` interface for client features, with the terminal contract (send only `terminalCommand(input, COMMANDS)`, never raw input);
  - where the website ID lives;
  - the `umami.disabled` opt-out for the owner;
  - that the verify scripts stub Umami.

  Verify that the README event table matches `src/lib/analytics.ts` and the spec.

## 5. Footer line

- [ ] 5.1 Add `footer.analytics` and `footer.analyticsPolicy` to en, pt-br and es with the exact strings from the footer spec, and render the line in `Footer.astro`. Verify with `k-footer.mjs`, extended with these checks, in all locales and on the 404 page:
  - the text, the href, `target` and `rel`;
  - the accessible name ends with the localized destination and new-tab note;
  - Tab reaches it with a visible outline;
  - contrast is at least 4.5:1;
  - no overflow at 320px.

  Also verify that `npm run check` fails when a locale lacks a key (temporarily).

## 6. Integration

- [ ] 6.1 Run the full local suite in the background with the guard (a suite with no `PASS` counts as failed), plus a clean `npm ci && npm run check && npm run lint && npm run format:check && npm test && npm run build`. Verify that everything passes and the PR checks are green

## Workflow follow-up

- Archive the change on the branch (sync the specs, run `openspec validate --all --strict`), merge with a merge commit once the checks are green and no deploy is running, and watch the deploy succeed.
- Live checks against `https://todsdev.github.io`:
  - the standard live set: `l-cls` (`RUNS=10`), the `x-*`, `p-*`, `s-*`, `c-*` and `k-*` suites, `kbd`, `h42` and `l-navstable`;
  - `an-live.mjs` (`UMAMI=real`): the page view payload has the website ID and a path without hash for `/pt-br/#contact`; event payloads match the spec; no cookies are set; the saved-locale redirect records only `/pt-br/`; one real beacon returns 2xx;
  - `curl -sI https://cloud.umami.is/script.js` returns 200.
- Ask the owner to confirm that the one test page view from `an-live` appears in the Umami dashboard. That confirms the website ID.
- Delete `feat/analytics` locally and on origin.
