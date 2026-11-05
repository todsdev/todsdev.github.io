# Design

## Context

- **No third-party code yet:** the site is fully static (Astro on GitHub Pages) and has no third-party scripts, no CSP and no cookies. `BaseLayout.astro` owns `<head>`. Every page, including `404.html` (English only, one file for every locale), goes through it.
- **Listeners on tracked elements:** clickable actions already exist with their own listeners:
  - `$ copy` buttons and the vCard link (`src/scripts/contact.ts`). The vCard click calls `preventDefault()` to add the phone number at runtime.
  - Project links (`Projects.astro`), certificate links (`Courses.astro`) and the résumé link (`Contact.astro`, `download` attribute).
- **Phone values:** the protected phone and WhatsApp values exist only at runtime, decoded by the inline script in `Contact.astro`.
- **Umami's attributes stop other listeners:** the Umami docs say that with `data-umami-event` attributes, "other event listeners inside the element will not be triggered".
- **Tracker behavior** was read from the live `script.js`:
  - beacons go to `https://gateway.umami.is/api/send` with `keepalive`;
  - it honors `data-domains`, `data-exclude-hash` and `data-do-not-track`, plus a `localStorage` `umami.disabled` opt-out;
  - it hooks `history.pushState` and `replaceState`, which the site doesn't use.
- **Verification constraints:** the scripts in `~/portfolio-verify-scripts` run against the live site after every deploy. `e2e.mjs` fails on any console error.

## Goals / Non-Goals

**Goals:**
- Events defined in one pure, tested module, so neither markup nor scripts can send ad-hoc data.
- Analytics adds no runtime work before first paint, no layout shift, and no change to any existing listener's behavior.
- Test runs never pollute the production stats.

**Non-Goals:**
- No dashboard embedding or public stats page.
- No time-on-page or dwell-time events. Scroll depth is measured only by `section_view`.
- No terminal UI. This change only defines the terminal events and the interface the terminal change will call.
- No language-switcher event. The page view of the target locale already shows the switch.
- No self-hosted Umami and no proxying of the script through the site's origin.

## Decisions

### 1. Tracker tag in `BaseLayout`, configured from `src/lib/analytics.ts`

One tag in `<head>`, after the font preloads:

```html
<script async src="https://cloud.umami.is/script.js"
  data-website-id="22e09e62-a897-496c-9972-736ca18ac3ce"
  data-domains="todsdev.github.io" data-exclude-hash="true" data-do-not-track="true"></script>
```

- **`is:inline`:** Astro must leave the external script as written.
- **Constants:** the values come from constants in `src/lib/analytics.ts` (`UMAMI_SCRIPT`, `WEBSITE_ID`, `TRACKED_HOST`), so the README has a single place to point to.
- **`async`, not `defer`:** deferred classic scripts and module scripts run in one ordered queue, so a slow `script.js` would hold back every site script, including the hero intro. Measured: a 2 s tracker delay delayed a module script by 2 s with `defer` and not at all with `async`. With `async`, `window.umami` may not exist yet when site scripts run, and the queue in decision 3 covers that.
- **`data-exclude-search` is not set:** the site has no query parameters of its own, and keeping them preserves `utm_*` campaign data, for example a link from a LinkedIn post.

Alternatives considered:
- **Self-host or proxy the script:** this would avoid a third-party request, but GitHub Pages can't proxy the beacon, and Umami Cloud expects its own host.
- **Load only on the production host via a build flag:** `data-domains` already makes the tracker inert elsewhere, and the same HTML across environments keeps the preview faithful.

### 2. Own `data-event` attributes, built only by `eventAttrs()`

Tracked elements get `data-event="<name>"` and one `data-event-<key>="<value>"` per data field.

- **Typed allowlist:** components never write these attributes by hand. They spread `{...eventAttrs(name, data)}` from `src/lib/analytics.ts`, whose types allow per event only:
  - `contact`: `kind`, `action`;
  - `vcard`: no fields;
  - `resume`: `language`;
  - `project_link`: `project`, `link`;
  - `certificate`: `course`;
  - `nav_click`: `section`.

  Events sent from scripts rather than markup are in the same table:
  - `not_found`: `path`;
  - `section_view`: `section`;
  - `terminal_open`: no fields;
  - `terminal_command`: `command`.

  Names are snake_case, matching the owner's `section_view` and `nav_click`.
- **Locale:** every event also carries `locale`.
- **Runtime guard:** a shared `validEvent(name, data)` checks the name and fields against the table and each value against `^[a-z0-9-]{1,64}$` (`path` is the one exception, see decision 3). `eventAttrs` throws on failure, which fails the build. Enum values and content IDs (file slugs) pass; a URL, an email or a value with spaces fails the build. Only enum and slug inputs are wired in, so a contact value can't reach it.
- **Link kinds:** project `ActionKind` (`playStore`) maps to the event kind (`play-store`) in the same module, via a type-only import from `projects.ts`. Contact actions map from `ContactAction.command` (`mail`, `call`, `chat`, `open`, `copy`).

Alternatives considered:
- **Umami's `data-umami-event`:** rejected because it suppresses the element's other listeners, which would break `$ copy` and the vCard phone injection.
- **Calls to `umami.track()` inside each feature script:** this would scatter tracking across scripts and leave untested data shapes. The attribute approach keeps the data visible in the HTML, where checks can verify it.

### 3. One tracking interface: `src/scripts/track.ts`

`track(name, data)` is the only code that calls Umami. Every other script uses it:

```ts
import { track } from "../scripts/track";
track("terminal_open");
track("terminal_command", { command: terminalCommand(input, COMMANDS) });
```

- **Locale and validation:** it adds `locale` (from `<html lang>`, lowercased: `en`, `pt-br`, `es`) and runs `validEvent`. Invalid events are dropped at runtime, never sent, and logged with `console.warn` in development only.
- **Typed signature:** the per-event field types make a wrong call a type error first.
- **When the tracker isn't ready:** if `window.umami` exists, it sends right away. Otherwise, while the tracker script hasn't loaded yet, it queues up to 20 events and flushes them on the script's `load` event. If the script fails, is blocked or never defines `umami` (DNT, wrong host), the queue is dropped.
- **Terminal commands:** the pure helper `terminalCommand(input, known)` in `src/lib/analytics.ts` takes the first whitespace-separated token, lowercases it, strips a leading `./` (so `./hello` reports `hello`), and returns it only if `known` (the terminal's own command list) includes it, otherwise `unknown`. Arguments never leave the function. The terminal change only calls `track` with this helper's result; the README documents that contract.
- **`not_found` path:** the one non-slug value. `notFoundPath(pathname)` drops the query and hash and truncates to 200 characters. Its validator accepts only a `/`-prefixed path with no `@`, `?` or `#`.

### 4. Delegated click listener: `src/scripts/analytics.ts`

- **Click listener:** imported once from `BaseLayout`, it adds a single `click` listener on `document` in the capture phase. It finds `closest("[data-event]")`, reads the event with `readEvent(dataset)`, and passes it to `track`. The nav links get `nav_click` attributes like any other tracked element.
- **Never in the way:** the capture phase runs before `contact.ts` handlers that call `preventDefault()`. The listener never cancels, stops or awaits anything.
- **Keyboard activation:** pressing Enter on a link dispatches `click`, so keyboard use is counted too.
- **404 event:** the 404 page marks `<body data-page-event="not_found">`, and the script sends `track("not_found", { path: notFoundPath(location.pathname) })`. The `track` queue covers a tracker that hasn't loaded yet.
- **Purity:** the pure helpers (`validEvent`, `eventAttrs`, `readEvent`, `notFoundPath`, `terminalCommand`) live in `src/lib/analytics.ts` and have tests. `track.ts` and `analytics.ts` stay thin.

### 5. `section_view` from the navigation's observer

`nav.ts` already has one `IntersectionObserver` that keeps the set of sections in its band (just under the nav, down to 45% of the viewport). Its `update()` also makes the first section active at the top of the page and the last one at the bottom.

- **When it fires:** a `seen` set in `nav.ts` sends `track("section_view", { section })` the first time a section is either in the band or set active. "Set active" covers a short last section that never reaches the band.
- **No new observer:** this adds no observer; the only new listeners are the passive jump-interrupt ones below. Nothing fires on the 404 page, which has no nav.
- **Why not "any pixel visible":** the band is the same "being read" area the navigation already uses. With a plain viewport observer, the next section's top peeking in at the bottom would count it, which inflates scroll depth.
- **Deep links:** a hash load jumps instantly, so skipped sections never enter the band and aren't counted.
- **Nav jumps (owner decision):** a nav link click sets `jumpTarget` to that section in `nav.ts`, which already owns the links. While `jumpTarget` is set, only the target is recorded, at the moment `setActive` makes it active. Passed sections are not marked as seen, so they still count later if the visitor scrolls back to them normally.
- **When a jump ends:** `jumpTarget` clears when any of these happens:
  - the target becomes active;
  - the visitor takes over (`wheel`, `touchstart`, or a scrolling key: arrows, Page Up/Down, Home, End, Space);
  - `scrollend` fires (where supported);
  - a 2 s safety timeout passes.

  Then normal recording resumes. With reduced motion the jump is instant and the same logic applies.

### 6. Footer analytics line

A third `<p class="site-footer__line">` after the © line, with the whole text as the link. It reuses `.site-footer__link`, so the color, focus and `scroll-margin` match the repository link. The hidden destination follows the existing pattern (`, <destination> (<newTab>)`) with no whitespace before the hidden span.

New keys: `footer.analytics` (visible text) and `footer.analyticsPolicy` (destination). The text is lowercase like the other footer strings. The footer is terminal-style metadata, not prose content, so the sentence-case rule doesn't apply. The line is static text, so it causes no layout shift.

### 7. Verification without polluting stats

- **Stub by default:** `lib.mjs` `browser()` makes Chrome resolve both Umami hosts to a local HTTPS server (`--host-resolver-rules`, a self-signed certificate, `--ignore-certificate-errors`). Puppeteer request interception isn't used, because seven existing suites install their own `request` handlers, and mixing legacy and cooperative handlers throws "Request is already handled". In the default mode:
  - `cloud.umami.is/script.js` is answered with a tiny stub that records calls in `window.__umami` and defines `umami.track`;
  - `gateway.umami.is` requests get an empty 204.
  - Pages therefore get no network errors (so `e2e.mjs` stays green), and local suites can assert events.
- **Opt-outs:** `UMAMI=real` loads the real script but still answers the beacons locally and records their JSON bodies. That checks the real integration on live without counting a visit. `UMAMI=block` makes both hosts fail to resolve, for the blocked-tracker check. `an-live` sends its one deliberate real beacon from Node, replaying a captured page-view body to the real gateway.
- **New suites:**
  - `an-markup` checks the attributes, the allowlist and the phone grep;
  - `an-events` checks each click with the stub, in all locales;
  - `an-sections` checks `section_view` order and uniqueness when scrolling down and back up, with a deep link, at 1280px and 320px, and with reduced motion;
  - `an-track` checks the `track()` interface on a built page: the locale is added, invalid events are dropped, and the queue flushes when the stub loads late;
  - `an-blocked` checks that everything works with Umami aborted;
  - `an-live` (live only, `UMAMI=real`) checks the page view and event payloads (website ID, path without hash, event names and data) and that no cookie is set. It also replays exactly one captured page-view beacon to the real gateway from Node and asserts a 2xx response, to confirm the website ID.
- **`localhost` with `UMAMI=real`:** `data-domains` makes the real tracker send nothing. That proves the "production host only" requirement locally.

## Risks / Trade-offs

- **Ad blockers:** they block `cloud.umami.is`, so the stats undercount. That's acceptable: this is directional data, and the site works the same (decision 3).
- **Wrong website ID:** if the owner's ID is wrong or the site's domain in Umami isn't `todsdev.github.io`, the gateway rejects beacons silently. Mitigation: `an-live` checks the gateway's response status for one real beacon after deploy. That one real page view is the only one the checks send on purpose, and the owner's dashboard should show it.
- **Live verify runs counted as visits:** mitigated by the default stub in `lib.mjs`. Scripts that launch Chrome without `browser()` would bypass it; `an-live` greps the suite folder for `puppeteer.launch` outside `lib.mjs`.
- **Third-party availability and privacy:** a third party now receives page and event data. Mitigations:
  - only allowlisted slugs are sent;
  - no hash is sent;
  - Do Not Track is honored;
  - the footer line discloses it.
- **The owner's own visits:** documented opt-out via `localStorage.setItem("umami.disabled", 1)` in the README.
- **Jump never reaches its target:** for example, the visitor interrupts the jump or the target can't become active. The interrupt listeners and the 2 s timeout clear `jumpTarget`, so recording never stays suppressed. The target's `section_view` is then recorded only if the visitor actually reaches it.
- **Event volume:** at most about 10 events per visit. The owner confirmed this fits the plan's 100k events per month.
- **Terminal misuse:** a future terminal could call `track` with raw input. Mitigations: `terminal_command` values must pass the slug guard, so input with spaces, `/`, `~` or `@` is dropped, and the README contract tells the terminal to call `terminalCommand()`.
- **Saved-locale redirect on `/`:** it runs in `head-start`, before the tracker tag is parsed. In 5 local runs with a localhost-tracking build, `/#contact` with a saved Portuguese preference recorded only `/pt-br/`. The spec scenario pins this down. If the redirect moves later, `an-live` catches the double count.

## Migration Plan

Deploying is additive. To roll back, revert the merge commit. Removing the tag stops all collection, and nothing persists on visitors' devices.
