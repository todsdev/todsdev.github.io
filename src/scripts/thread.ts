/**
 * Draws the scroll thread in proportion to page scroll progress and flags
 * timeline markers (`[data-thread-marker]`) with `data-reached` once the drawn
 * line passes them. Under reduced motion the thread stays fully drawn (CSS default).
 */

const thread = document.querySelector<HTMLElement>(".scroll-thread");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function markers(): HTMLElement[] {
  return [
    ...document.querySelectorAll<HTMLElement>("main [data-thread-marker]"),
  ];
}

function scrollProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 1;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

function update(): void {
  if (!thread) return;
  const progress = reduceMotion.matches ? 1 : scrollProgress();
  thread.style.setProperty("--progress", progress.toFixed(4));
  const box = thread.getBoundingClientRect();
  const drawnEnd = box.top + box.height * progress;
  for (const marker of markers()) {
    const m = marker.getBoundingClientRect();
    marker.toggleAttribute("data-reached", m.top + m.height / 2 <= drawnEnd);
  }
}

if (thread) {
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  reduceMotion.addEventListener("change", schedule);
  update();
}

// Treat as an ES module so top-level names stay file-scoped.
export {};
