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

/** Resolves after `ms`, or rejects as soon as `signal` aborts. */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

const between = (min: number, max: number) => min + Math.random() * (max - min);

/** Type characters `from`..`to` (exclusive) of a line, one random delay each. */
async function type(
  line: Line,
  from: number,
  to: number,
  [min, max]: [number, number],
  signal: AbortSignal,
): Promise<void> {
  for (let i = from + 1; i <= to; i++) {
    await sleep(between(min, max), signal);
    reveal(line, i);
    placeCaret(line, i);
  }
}

/** Erase characters back down to `to`, a fixed delay each. */
async function erase(
  line: Line,
  from: number,
  to: number,
  ms: number,
  signal: AbortSignal,
): Promise<void> {
  for (let i = from - 1; i >= to; i--) {
    await sleep(ms, signal);
    reveal(line, i);
    placeCaret(line, i);
  }
}

const NAME_DELAY: [number, number] = [70, 160];
const ROLE_DELAY: [number, number] = [45, 100];
const NOTICE_PAUSE = 750;
const ERASE_DELAY = 40;
const FONT_WAIT_CAP = 1000;
const START_DELAY = 300;

async function play(
  lines: { name: Line; role: Line },
  signal: AbortSignal,
): Promise<void> {
  const { name, role } = lines;
  // Match overlay metrics to the real text before typing (capped wait).
  await Promise.race([
    document.fonts.load("1em VT323"),
    sleep(FONT_WAIT_CAP, signal),
  ]);
  setState("typing");
  root.classList.remove("hero-pending");
  placeCaret(name, 0);
  await sleep(START_DELAY, signal); // the prompt line fades in meanwhile

  await type(name, 0, name.chars.length, NAME_DELAY, signal);

  // Deliberate typo: the role's last word first goes in lowercase, then gets fixed.
  const wordStart = role.text.lastIndexOf(" ") + 1;
  const first = role.text[wordStart] ?? "";
  const typo =
    first !== first.toLowerCase() ? role.chars[wordStart] : undefined;
  if (typo) typo.textContent = first.toLowerCase();

  placeCaret(role, 0);
  await type(role, 0, role.chars.length, ROLE_DELAY, signal);
  if (typo) {
    await sleep(NOTICE_PAUSE, signal);
    await erase(role, role.chars.length, wordStart, ERASE_DELAY, signal);
    typo.textContent = first;
    await type(role, wordStart, role.chars.length, ROLE_DELAY, signal);
  }
}

/** Jump to the final state: real text visible, cursor after the role. */
function finish(lines: { name: Line; role: Line }): void {
  for (const line of [lines.name, lines.role]) {
    line.chars.forEach((c, i) => (c.textContent = line.text[i] ?? ""));
    reveal(line, line.chars.length);
  }
  placeCaret(lines.role, lines.role.chars.length);
  setState("done");
  root.classList.remove("hero-pending");
}

function start(): void {
  if (!hero || !root.classList.contains("hero-pending")) return;
  const name = hero.querySelector<HTMLElement>('[data-type="name"]');
  const role = hero.querySelector<HTMLElement>('[data-type="role"]');
  if (!name || !role) return;
  const lines = { name: buildLine(name), role: buildLine(role) };
  const controller = new AbortController();
  play(lines, controller.signal)
    .catch(() => {
      // Aborted: finish() below shows the final state.
    })
    .finally(() => finish(lines));
}

start();
