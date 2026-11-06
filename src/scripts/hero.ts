/**
 * Hero intro. The real hero text stays in the DOM as the accessible source of
 * truth; this script lays an aria-hidden, per-character overlay exactly over each
 * `[data-type]` element and animates that overlay instead.
 *
 * On load it runs only when the inline head gate set `html.hero-pending` (JS on,
 * motion allowed, no deep link to another section) and that gate is still pending.
 * The terminal's `./hello` replays it with a `hero:replay` event, once the page has
 * scrolled back to the hero.
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

/**
 * Final state: real text visible, cursor after the role. `powerOn` plays the CRT
 * power-on (natural end of the sequence); a skip shows the photo already on.
 */
function finish(lines: { name: Line; role: Line }, powerOn: boolean): void {
  if (powerOn && hero) hero.dataset.heroPoweron = "";
  for (const line of [lines.name, lines.role]) {
    line.chars.forEach((c, i) => (c.textContent = line.text[i] ?? ""));
    reveal(line, line.chars.length);
  }
  placeCaret(lines.role, lines.role.chars.length);
  setState("done");
  root.classList.remove("hero-pending");
}

type Lines = { name: Line; role: Line };

/** Built on first use and kept: a replay types into the same overlays. */
let built: Lines | undefined;

function buildLines(): Lines | undefined {
  if (built || !hero) return built;
  const name = hero.querySelector<HTMLElement>('[data-type="name"]');
  const role = hero.querySelector<HTMLElement>('[data-type="role"]');
  if (name && role) built = { name: buildLine(name), role: buildLine(role) };
  return built;
}

/** The running sequence, if any: a new replay aborts it. */
let running: AbortController | undefined;

/** Runs `before`, then the sequence. Any click or key press skips to the final state. */
function run(lines: Lines, before?: (signal: AbortSignal) => Promise<void>) {
  const controller = new AbortController();
  running = controller;

  // No preventDefault: the interaction still does its normal job (follow a link, ...).
  const skip = () => controller.abort();
  const options = { capture: true, passive: true } as const;
  window.addEventListener("pointerdown", skip, options);
  window.addEventListener("keydown", skip, options);

  (before?.(controller.signal) ?? Promise.resolve())
    .then(() => play(lines, controller.signal))
    .then(
      () => true,
      () => false, // aborted by a skip
    )
    .then((completed) => {
      window.removeEventListener("pointerdown", skip, options);
      window.removeEventListener("keydown", skip, options);
      finish(lines, completed);
    });
}

function start(): void {
  if (!hero || !root.classList.contains("hero-pending")) return;
  const lines = buildLines();
  if (lines) run(lines);
}

const SCROLL_STILL = 150;
const SCROLL_CAP = 2000;

/** Resolves once the page has stopped scrolling (a smooth jump back to the top), or at the cap. */
async function scrollSettled(signal: AbortSignal): Promise<void> {
  const started = performance.now();
  let last = window.scrollY;
  let still = 0;
  while (still < SCROLL_STILL && performance.now() - started < SCROLL_CAP) {
    await sleep(50, signal);
    still = window.scrollY === last ? still + 50 : 0;
    last = window.scrollY;
  }
}

/** The whole sequence again, photo power-on included. The hero stays final until it starts. */
function replay(): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const lines = buildLines();
  if (!lines) return;
  running?.abort();
  run(lines, async (signal) => {
    await scrollSettled(signal);
    if (hero) delete hero.dataset.heroPoweron;
    reveal(lines.name, 0);
    reveal(lines.role, 0);
  });
}

window.addEventListener("hero:replay", replay);

start();
