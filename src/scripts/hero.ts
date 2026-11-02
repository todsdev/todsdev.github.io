/**
 * Hero intro. The real hero text stays in the DOM as the accessible source of
 * truth; this script lays an aria-hidden, per-character overlay exactly over each
 * `[data-type]` element and animates that overlay instead.
 *
 * Runs only when the inline head gate set `html.hero-pending` (JS on, motion
 * allowed, no deep link to another section) and that gate is still pending.
 */

interface Line {
  el: HTMLElement;
  text: string;
  chars: HTMLSpanElement[];
}

const root = document.documentElement;
const hero = document.getElementById("hero");

function buildLine(el: HTMLElement): Line {
  const text = (el.textContent ?? "").trim();
  const overlay = document.createElement("span");
  overlay.className = "hero__overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.dataset.heroOverlay = "";
  const chars = [...text].map((c) => {
    const span = document.createElement("span");
    span.className = "hero__ch is-hidden";
    span.textContent = c;
    overlay.append(span);
    return span;
  });
  el.append(overlay);
  return { el, text, chars };
}

/** Show the first `count` characters of a line, hide the rest. */
export function reveal(line: Line, count: number): void {
  line.chars.forEach((c, i) => c.classList.toggle("is-hidden", i >= count));
}

let caretHost: HTMLSpanElement | undefined;

/** Place the cursor after the first `count` characters of a line. */
export function placeCaret(line: Line, count: number): void {
  caretHost?.classList.remove("is-caret", "is-caret-start");
  const atStart = count === 0;
  caretHost = line.chars[atStart ? 0 : count - 1];
  caretHost?.classList.add("is-caret");
  if (atStart) caretHost?.classList.add("is-caret-start");
}

function setState(state: "typing" | "done"): void {
  if (hero) hero.dataset.heroState = state;
}

function start(): void {
  if (!hero || !root.classList.contains("hero-pending")) return;
  const name = hero.querySelector<HTMLElement>('[data-type="name"]');
  const role = hero.querySelector<HTMLElement>('[data-type="role"]');
  if (!name || !role) return;
  const lines = { name: buildLine(name), role: buildLine(role) };

  // Final state: real text visible again, overlay kept only to anchor the cursor.
  reveal(lines.name, lines.name.chars.length);
  reveal(lines.role, lines.role.chars.length);
  placeCaret(lines.role, lines.role.chars.length);
  setState("done");
  root.classList.remove("hero-pending");
}

start();
