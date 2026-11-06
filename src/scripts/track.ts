/**
 * The one way client code reports analytics events (README, "Analytics"):
 *
 *   import { track } from "../scripts/track";
 *   track("terminal_open");
 *   track("terminal_command", { command: terminalCommand(input, KNOWN) });
 *
 * Adds the page `locale`, drops anything outside the allowlist in src/lib/analytics.ts,
 * and queues events until the async Umami script has loaded. Never throws, and does
 * nothing when the tracker is blocked, fails, or doesn't report (Do Not Track, other host).
 */
import {
  validEvent,
  type EventData,
  type EventName,
  EVENTS,
} from "../lib/analytics";

interface Umami {
  track(name: string, data: Record<string, string>): unknown;
}

declare global {
  interface Window {
    umami?: Umami;
  }
}

const MAX_QUEUE = 20;
const locale = document.documentElement.lang.toLowerCase();
const tracker = document.querySelector<HTMLScriptElement>(
  "script[data-website-id]",
);
const queue: [string, Record<string, string>][] = [];
let waiting = false;

function send(name: string, data: Record<string, string>): void {
  try {
    window.umami?.track(name, data);
  } catch {
    // Analytics never breaks the page.
  }
}

function flush(): void {
  for (const [name, data] of queue.splice(0)) send(name, data);
}

export function track<N extends EventName>(
  name: N,
  ...[data]: (typeof EVENTS)[N] extends readonly [] ? [] : [EventData<N>]
): void {
  const all: Record<string, string> = { ...data, locale };
  if (!validEvent(name, all)) {
    if (import.meta.env.DEV) console.warn("analytics: dropped", name, all);
    return;
  }
  if (window.umami) return send(name, all);
  if (!tracker || queue.length >= MAX_QUEUE) return;
  queue.push([name, all]);
  if (waiting) return;
  waiting = true;
  tracker.addEventListener("load", flush, { once: true });
  tracker.addEventListener("error", () => queue.splice(0), { once: true });
}
