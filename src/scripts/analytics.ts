/**
 * Markup-driven analytics: one capture-phase click listener sends the event an element
 * declares with `data-event` attributes (built by `eventAttrs`), and the 404 page sends
 * `not_found`. It never cancels or delays the click, so the element's own behavior runs.
 */
import { notFoundPath, readEvent } from "../lib/analytics";
import { track } from "./track";

/** Already checked by eventAttrs at build time; track() checks again before sending. */
const send = track as (name: string, data?: Record<string, string>) => void;

document.addEventListener(
  "click",
  (event) => {
    const el = (event.target as Element | null)?.closest<HTMLElement>(
      "[data-event]",
    );
    const found = el && readEvent(el.dataset);
    if (!found) return;
    // track() sets `locale` from the page, the same value the markup carries.
    send(found.name, found.data);
  },
  { capture: true },
);

if (document.body.dataset.pageEvent === "not_found") {
  track("not_found", { path: notFoundPath(location.pathname) });
}
