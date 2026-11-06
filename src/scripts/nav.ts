/**
 * Navigation behavior:
 * - marks the link of the section in view (IntersectionObserver) with `is-active`
 *   and `aria-current="location"`; exactly one link is active at a time;
 * - keeps focused/active links fully visible inside the horizontally scrolling list;
 * - reports `section_view` (scroll depth) once per section per page load, the first time it
 *   is in the band or active. During a jump (nav click or deep link) only its target counts.
 */
import { track } from "./track";

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
const seen = new Set<string>();
/** Section a nav click or deep link is jumping to; sections passed on the way don't count. */
let jumpTarget: string | undefined;
let jumpTimer: number | undefined;
/**
 * A jump ended and the visitor hasn't scrolled since. Sections left in the band by the jump
 * (and reported late by the observer) only count once the visitor scrolls.
 */
let settled = false;

function view(id: string): void {
  if (seen.has(id)) return;
  seen.add(id);
  track("section_view", { section: id });
}

function record(active: string | undefined): void {
  if (jumpTarget) {
    if (active === jumpTarget) view(active);
    return;
  }
  if (!settled) for (const s of sections) if (inBand.has(s.id)) view(s.id);
  if (active) view(active);
}

/** No jump scroll for 2s: a safety net when `scrollend` never comes (or isn't supported). */
function armJumpTimer(): void {
  window.clearTimeout(jumpTimer);
  jumpTimer = window.setTimeout(endJump, 2000);
}

function startJump(id: string): void {
  jumpTarget = id;
  armJumpTimer();
}

function endJump(): void {
  if (!jumpTarget) return;
  jumpTarget = undefined;
  settled = true;
  window.clearTimeout(jumpTimer);
}

function update(): void {
  const first = sections[0];
  const last = sections.at(-1);
  if (!first || !last) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  // Edges: the top always shows the hero; the bottom always shows the last
  // section, even when it is too short to reach the detection band.
  // Otherwise the topmost section intersecting the band just under the nav wins.
  const active =
    window.scrollY <= 0
      ? first.id
      : window.scrollY >= maxScroll - 2
        ? last.id
        : sections.find((s) => inBand.has(s.id))?.id;
  if (active) setActive(active);
  record(active);
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

  for (const [id, link] of links) {
    link.addEventListener("click", () => startJump(id));
  }
  // The terminal's `cd` is a jump too (src/scripts/terminal-shell.ts), with no nav_click.
  window.addEventListener("nav:jump", (event) => {
    const id = (event as CustomEvent<string>).detail;
    if (links.has(id)) startJump(id);
  });
  // A deep link is a jump too: the sections above its target were never shown.
  const target = decodeURIComponent(location.hash.slice(1));
  if (links.has(target) && target !== sections[0]?.id) startJump(target);
  // The jump ends when its scroll settles or the visitor takes over.
  window.addEventListener("scrollend", endJump);
  for (const type of ["wheel", "touchstart"] as const) {
    window.addEventListener(type, endJump, { passive: true });
  }
  const SCROLL_KEYS = /^(Arrow(Up|Down)|Page(Up|Down)|Home|End| )$/;
  window.addEventListener("keydown", (event) => {
    if (SCROLL_KEYS.test(event.key)) endJump();
  });

  let queued = false;
  window.addEventListener(
    "scroll",
    () => {
      // Scrolling during a jump is the jump; scrolling after it is the visitor's.
      if (jumpTarget) armJumpTimer();
      else settled = false;
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

// Treat as an ES module so top-level names stay file-scoped.
export {};
