/**
 * Fades sections up the first time they scroll into view. Content is only hidden
 * under `html.js` (set inline in <head>), so it stays visible without JavaScript.
 */

const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  targets.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15 },
  );
  targets.forEach((el) => observer.observe(el));
}

// Treat as an ES module so top-level names stay file-scoped.
export {};
