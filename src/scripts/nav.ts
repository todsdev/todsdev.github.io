/**
 * Navigation behavior:
 * - marks the link of the section in view (IntersectionObserver) with `is-active`
 *   and `aria-current="location"`; exactly one link is active at a time;
 * - keeps focused/active links fully visible inside the horizontally scrolling list.
 */

const strip = document.querySelector<HTMLElement>(".site-nav__sections");
const nav = document.querySelector<HTMLElement>(".site-nav");
const links = new Map(
  [...document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]")].map(
    (a) => [a.dataset.navLink!, a] as const,
  ),
);
const sections = [
  ...document.querySelectorAll<HTMLElement>("main section[id]"),
].filter((s) => links.has(s.id));

/** Browsers only scroll a focused element into view when it is fully hidden. */
function revealInStrip(link: HTMLElement): void {
  if (!strip) return;
  const view = strip.getBoundingClientRect();
  const box = link.getBoundingClientRect();
  if (box.left < view.left) strip.scrollLeft -= view.left - box.left;
  else if (box.right > view.right) strip.scrollLeft += box.right - view.right;
}

strip?.addEventListener("focusin", (event) =>
  revealInStrip(event.target as HTMLElement),
);

let current: string | undefined;

function setActive(id: string): void {
  if (id === current) return;
  current = id;
  for (const [sectionId, link] of links) {
    const active = sectionId === id;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "location");
      revealInStrip(link);
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

const inBand = new Set<string>();

function update(): void {
  const first = sections[0];
  const last = sections.at(-1);
  if (!first || !last) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  // Edges: the top always shows the hero; the bottom always shows the last
  // section, even when it is too short to reach the detection band.
  if (window.scrollY <= 0) return setActive(first.id);
  if (window.scrollY >= maxScroll - 2) return setActive(last.id);
  // Topmost section intersecting the band just under the nav wins.
  const topmost = sections.find((s) => inBand.has(s.id));
  if (topmost) setActive(topmost.id);
}

if (sections.length > 0) {
  // The band starts slightly below the nav so the previous section, whose bottom
  // edge touches the nav right after an anchor jump, does not count as in view.
  const navHeight = nav?.offsetHeight ?? 0;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inBand.add(entry.target.id);
        else inBand.delete(entry.target.id);
      }
      update();
    },
    { rootMargin: `-${navHeight + 8}px 0px -55% 0px` },
  );
  sections.forEach((s) => observer.observe(s));

  let queued = false;
  window.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    },
    { passive: true },
  );
  update();
}
