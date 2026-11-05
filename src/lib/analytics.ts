/**
 * Analytics events: the tracker settings, the event allowlist and the helpers that build
 * and check event data. Pure and runtime-import-free so it runs under `node --test`
 * (analytics.test.ts). Markup gets its attributes from `eventAttrs`; scripts send through
 * `track()` (src/scripts/track.ts), which checks every event with `validEvent`.
 */
import type { Locale } from "../i18n";
import type { ActionKind } from "./projects";

/** Umami Cloud tracker; it only reports from TRACKED_HOST. */
export const UMAMI_SCRIPT = "https://cloud.umami.is/script.js";
export const WEBSITE_ID = "22e09e62-a897-496c-9972-736ca18ac3ce";
export const TRACKED_HOST = "todsdev.github.io";

/** Every event and its fields. `locale` is added to all of them. */
export const EVENTS = {
  contact: ["kind", "action"],
  vcard: [],
  resume: ["language"],
  project_link: ["project", "link"],
  certificate: ["course"],
  nav_click: ["section"],
  not_found: ["path"],
  section_view: ["section"],
  terminal_open: [],
  terminal_command: ["command"],
} as const;

export type EventName = keyof typeof EVENTS;
export type EventData<N extends EventName> = Record<
  (typeof EVENTS)[N][number],
  string
>;

/** Enums, section ids, content ids and command names: lowercase slugs only. */
const SLUG = /^[a-z0-9-]{1,64}$/;
/** `not_found` path: no query, hash or "@", at most 200 characters. */
const PATH = /^\/[^?#@\s]{0,199}$/;

const isEventName = (name: string): name is EventName =>
  Object.hasOwn(EVENTS, name);

/** True when the event is in the allowlist, with exactly its fields plus `locale`, all valid. */
export function validEvent(
  name: string,
  data: Readonly<Record<string, unknown>>,
): boolean {
  if (!isEventName(name)) return false;
  const fields: readonly string[] = [...EVENTS[name], "locale"];
  const keys = Object.keys(data);
  if (keys.length !== fields.length) return false;
  return fields.every((field) => {
    const value = data[field];
    if (typeof value !== "string") return false;
    return field === "path" ? PATH.test(value) : SLUG.test(value);
  });
}

/** `data-event` attributes for a tracked element; throws (failing the build) on invalid data. */
export function eventAttrs<N extends EventName>(
  locale: Locale,
  name: N,
  ...[data]: (typeof EVENTS)[N] extends readonly [] ? [] : [EventData<N>]
): Record<string, string> {
  const all: Record<string, string> = { ...data, locale };
  if (!validEvent(name, all)) {
    throw new Error(`Invalid analytics event ${name}: ${JSON.stringify(all)}`);
  }
  return Object.fromEntries([
    ["data-event", name],
    ...Object.entries(all).map(([key, value]) => [`data-event-${key}`, value]),
  ]);
}

/** Reads back what `eventAttrs` wrote, from an element's `dataset`. */
export function readEvent(
  dataset: Readonly<Record<string, string | undefined>>,
): { name: string; data: Record<string, string> } | undefined {
  const name = dataset.event;
  if (!name) return undefined;
  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(dataset)) {
    const field = /^event([A-Z].*)$/.exec(key)?.[1];
    if (field && value !== undefined) {
      data[field[0]!.toLowerCase() + field.slice(1)] = value;
    }
  }
  return { name, data };
}

/** Project action kind → `project_link` link value. */
export const PROJECT_LINK: Record<ActionKind, string> = {
  playStore: "play-store",
  appStore: "app-store",
  site: "site",
  repo: "repo",
};

/** The 404 event's path: no query or hash, at most 200 characters. */
export function notFoundPath(pathname: string): string {
  return pathname.replace(/[?#].*$/s, "").slice(0, 200);
}

const commandName = (token: string) => token.toLowerCase().replace(/^\.\//, "");

/**
 * `terminal_command` value for what the visitor typed: the command name when the terminal
 * knows it (case-insensitive, "./" dropped), otherwise "unknown". Arguments never leave here.
 */
export function terminalCommand(
  input: string,
  known: readonly string[],
): string {
  const name = commandName(input.trim().split(/\s+/)[0] ?? "");
  return SLUG.test(name) && known.map(commandName).includes(name)
    ? name
    : "unknown";
}
