/** Analytics event allowlist and helpers, verified with fixtures. Run with `npm test`. */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EVENTS,
  PROJECT_LINK,
  eventAttrs,
  notFoundPath,
  readEvent,
  terminalCommand,
  validEvent,
} from "./analytics.ts";
import { COMMANDS } from "./projects.ts";

/** What the browser exposes as `dataset` for the given `data-*` attributes. */
const dataset = (attrs: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(attrs).map(([attr, value]) => [
      attr
        .replace(/^data-/, "")
        .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
      value,
    ]),
  );

test("attributes for each event carry the name, fields and locale", () => {
  assert.deepEqual(
    eventAttrs("en", "contact", { kind: "email", action: "copy" }),
    {
      "data-event": "contact",
      "data-event-kind": "email",
      "data-event-action": "copy",
      "data-event-locale": "en",
    },
  );
  assert.deepEqual(eventAttrs("es", "vcard"), {
    "data-event": "vcard",
    "data-event-locale": "es",
  });
  assert.deepEqual(eventAttrs("es", "resume", { language: "es" }), {
    "data-event": "resume",
    "data-event-language": "es",
    "data-event-locale": "es",
  });
  assert.deepEqual(
    eventAttrs("pt-br", "project_link", {
      project: "globopop",
      link: "play-store",
    }),
    {
      "data-event": "project_link",
      "data-event-project": "globopop",
      "data-event-link": "play-store",
      "data-event-locale": "pt-br",
    },
  );
  assert.deepEqual(
    eventAttrs("en", "certificate", { course: "cursoemvideo-java-poo" }),
    {
      "data-event": "certificate",
      "data-event-course": "cursoemvideo-java-poo",
      "data-event-locale": "en",
    },
  );
  assert.deepEqual(eventAttrs("pt-br", "nav_click", { section: "projects" }), {
    "data-event": "nav_click",
    "data-event-section": "projects",
    "data-event-locale": "pt-br",
  });
});

test("the slug guard rejects URLs, emails, phone-like and empty values", () => {
  for (const value of [
    "https://example.com/x",
    "me@example.com",
    "+55 11 99999-0000",
    "55 11",
    "",
  ]) {
    assert.equal(
      validEvent("certificate", { course: value, locale: "en" }),
      false,
      value,
    );
    assert.throws(
      () => eventAttrs("en", "certificate", { course: value }),
      /Invalid analytics event/,
    );
  }
});

test("validEvent rejects unknown names, unknown or missing fields and uppercase", () => {
  assert.equal(
    validEvent("nav_click", { section: "about", locale: "en" }),
    true,
  );
  assert.equal(validEvent("click", { locale: "en" }), false);
  assert.equal(validEvent("toString", { locale: "en" }), false);
  assert.equal(
    validEvent("nav_click", { section: "about", extra: "x", locale: "en" }),
    false,
  );
  assert.equal(validEvent("nav_click", { locale: "en" }), false);
  assert.equal(validEvent("nav_click", { section: "about" }), false);
  assert.equal(
    validEvent("nav_click", { section: "About", locale: "en" }),
    false,
  );
  assert.equal(validEvent("nav_click", { section: 3, locale: "en" }), false);
  assert.equal(validEvent("terminal_open", { locale: "es" }), true);
});

test("not_found accepts only a clean path", () => {
  assert.equal(
    validEvent("not_found", { path: "/old-page", locale: "en" }),
    true,
  );
  assert.equal(
    validEvent("not_found", { path: "/a?x=1", locale: "en" }),
    false,
  );
  assert.equal(validEvent("not_found", { path: "/a#b", locale: "en" }), false);
  assert.equal(validEvent("not_found", { path: "/@me", locale: "en" }), false);
  assert.equal(validEvent("not_found", { path: "old", locale: "en" }), false);
});

test("every project action kind maps to its link value", () => {
  assert.deepEqual(
    Object.keys(PROJECT_LINK).sort(),
    Object.keys(COMMANDS).sort(),
  );
  assert.deepEqual(PROJECT_LINK, {
    playStore: "play-store",
    appStore: "app-store",
    site: "site",
    repo: "repo",
  });
});

test("readEvent reads back what eventAttrs wrote", () => {
  const attrs = eventAttrs("pt-br", "contact", {
    kind: "phone",
    action: "call",
  });
  assert.deepEqual(readEvent(dataset(attrs)), {
    name: "contact",
    data: { kind: "phone", action: "call", locale: "pt-br" },
  });
  assert.equal(readEvent(dataset({ "data-nav-link": "about" })), undefined);
});

test("notFoundPath drops the query and hash and keeps 200 characters", () => {
  assert.equal(notFoundPath("/old-page?x=1#y"), "/old-page");
  assert.equal(notFoundPath("/old#y"), "/old");
  assert.equal(notFoundPath("/" + "a".repeat(300)).length, 200);
  assert.ok(
    validEvent("not_found", {
      path: notFoundPath("/" + "a".repeat(300)),
      locale: "en",
    }),
  );
});

test("terminalCommand keeps only a known command name", () => {
  const known = ["cd", "ls", "./hello", "neofetch"];
  assert.equal(terminalCommand("cd ~/about --verbose", known), "cd");
  assert.equal(terminalCommand("./hello", known), "hello");
  assert.equal(terminalCommand("CD", known), "cd");
  assert.equal(terminalCommand("  ls   -la ", known), "ls");
  // Free text whose first word isn't a command the terminal knows.
  assert.equal(
    terminalCommand("hello my name is Ana", ["cd", "ls", "neofetch"]),
    "unknown",
  );
  assert.equal(terminalCommand("rm -rf /", known), "unknown");
  assert.equal(terminalCommand("", known), "unknown");
  assert.equal(terminalCommand("   ", known), "unknown");
  for (const input of ["cd ~/about --verbose", "ls secret-file"]) {
    assert.doesNotMatch(terminalCommand(input, known), /about|verbose|secret/);
  }
});

test("every event's fields are slugs the guard accepts", () => {
  for (const fields of Object.values(EVENTS)) {
    for (const field of fields) assert.match(field, /^[a-z]+$/);
  }
});
