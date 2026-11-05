# Proposal

## Why

The site is live in three locales, but there is no way to know whether anyone visits it, which locale they read, or whether they act on it: contact a recruiter, download the résumé, open a store listing. Cookieless analytics answers that without a consent banner, and stays consistent with the site's privacy care (the phone number is already kept out of the HTML).

## What Changes

- Load the Umami Cloud tracker (`https://cloud.umami.is/script.js`, website ID `22e09e62-a897-496c-9972-736ca18ac3ce`, given by the owner) on every page, deferred and outside the critical path. It only reports from `todsdev.github.io`, so local dev and preview never send data. The URL hash is excluded and Do Not Track is honored.
- Page views come from Umami's automatic tracking, per path (`/`, `/pt-br/`, `/es/`). The 404 page also sends a `not_found` event with the requested path, because a page view alone can't tell it apart from a real page.
- Click events, all tagged with the page locale:
  - `contact`: contact kind plus action (`mail`, `call`, `chat`, `open`, `copy`);
  - `vcard`;
  - `resume`: the language of the file served, after fallback;
  - `project_link`: project ID plus link kind (`play-store`, `app-store`, `site`, `repo`);
  - `certificate`: course ID;
  - `nav_click`: the target section ID.
- Scroll depth: a `section_view` event with the `section` ID, sent once per page load when each section first reaches the area that makes it active in the navigation. It reuses the navigation's section observer.
- A small documented tracking interface (`track()` in `src/scripts/track.ts`) for client features. The terminal change will use it to send `terminal_open` and `terminal_command` (the recognized command name, or `unknown`; never arguments or visitor text). This change defines and tests both events but adds no terminal.
- Event data comes from a fixed allowlist (enums, section IDs, content IDs, recognized command names). It never includes a contact value, a URL or anything typed by the visitor. The protected phone and WhatsApp values never reach Umami.
- The site's own markup and a small script carry the events (`data-event`, `data-event-*`). We don't use Umami's `data-umami-event` attributes: Umami's docs say other listeners on those elements don't fire, which would break `$ copy` and the vCard download.
- The footer gets a short localized privacy line: "cookieless stats by Umami" / "estatísticas sem cookies pelo Umami" / "estadísticas sin cookies con Umami". It links to Umami's privacy policy (`https://umami.is/privacy`) in a new tab.
- The verification scripts stub Umami by default, so test runs (live ones especially) never count as visits. The live analytics check loads the real tracker but intercepts its beacons, except one deliberate page view that confirms the website ID.
- The README documents what is measured, where to change the website ID, and how the owner excludes their own visits (`localStorage.setItem("umami.disabled", 1)`).

## Capabilities

### New Capabilities

- `analytics`: loading the cookieless tracker, page views, the click, section-view and terminal events and their allowed data, the tracking interface for client features, privacy guarantees (no contact values, no hash, Do Not Track, production host only), and the fact that tracking never affects layout or interactions.

### Modified Capabilities

- `footer`: "Footer content" gains the localized analytics privacy line, linking to Umami's privacy policy.

## Impact

- **Code:**
  - `src/layouts/BaseLayout.astro` loads the tracker;
  - new `src/lib/analytics.ts` with tests holds the constants and the event attributes and data;
  - new `src/scripts/track.ts` holds the tracking interface;
  - new `src/scripts/analytics.ts` holds the delegated click listener and the 404 event;
  - `src/scripts/nav.ts` reports `section_view` from its existing observer;
  - the event attributes are added in `SiteNav.astro`, `Contact.astro`, `Projects.astro`, `Courses.astro` and `404.astro`;
  - `Footer.astro` gets the privacy line;
  - dictionaries `en`/`pt-br`/`es` get the `footer.*` keys.
- **Dependencies:** no npm packages. One third-party runtime request each to `cloud.umami.is` (the script, about 9 KB) and `gateway.umami.is` (the beacons).
- **Verification scripts** (`~/portfolio-verify-scripts`, not versioned): `lib.mjs` stubs Umami by default, and new `an-*` suites check the events.
- **Unverified facts:**
  - I took the website ID from the owner's message. I can't check it against the Umami dashboard: only the live check after deploy (a beacon accepted, a visit visible in the dashboard) confirms it.
  - The script URL `https://cloud.umami.is/script.js` was checked (HTTP 200, JavaScript). The beacon host `gateway.umami.is` was read from that script's source.
