/**
 * Language switcher behavior: remember the chosen locale and keep the current
 * section hash when switching. Without JavaScript the links still reach each
 * locale's home page.
 */

import { PREFERRED_LOCALE_KEY } from "../lib/storage-keys";

export { PREFERRED_LOCALE_KEY };

const links = document.querySelectorAll<HTMLAnchorElement>("a[data-locale]");

function withCurrentHash(link: HTMLAnchorElement): void {
  const url = new URL(link.href);
  url.hash = window.location.hash;
  link.href = url.href;
}

for (const link of links) {
  // Pointer down/focus update the href before activation, so modified clicks
  // (new tab) and the status bar preview also carry the hash.
  link.addEventListener("pointerdown", () => withCurrentHash(link));
  link.addEventListener("focus", () => withCurrentHash(link));
  link.addEventListener("click", () => {
    withCurrentHash(link);
    try {
      localStorage.setItem(PREFERRED_LOCALE_KEY, link.dataset.locale ?? "");
    } catch {
      // Storage unavailable (privacy mode): switching still works, just not remembered.
    }
  });
}
