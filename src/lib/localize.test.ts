/**
 * Translation fallback, verified with fixture data (production content is fully
 * translated, so it can't exercise this path). Run with `npm test`.
 */
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { localize, localizeDeep, resetFallbackWarnings } from "./localize.ts";

/** A fake experience entry whose fields only exist in English. */
const fixture = {
  collection: "experience",
  id: "fixture-role",
  data: {
    role: { en: "Android Developer" },
    company: "Fixture Corp",
    journey: [
      { years: "2020–", text: { en: "fixture step", "pt-br": "passo" } },
    ],
    photo: { src: "/_astro/photo.png", width: 720, height: 900, format: "png" },
  },
};

const ctx = (field: string) => ({
  collection: fixture.collection,
  id: fixture.id,
  field,
});

function capture() {
  const messages: string[] = [];
  return { messages, warn: (message: string) => messages.push(message) };
}

beforeEach(() => resetFallbackWarnings());

test("falls back to English when the locale is missing", () => {
  const { warn } = capture();
  assert.equal(
    localize(fixture.data.role, "es", ctx("role"), warn),
    "Android Developer",
  );
});

test("warns once, naming collection, entry, field and locale", () => {
  const { messages, warn } = capture();
  localize(fixture.data.role, "es", ctx("role"), warn);
  assert.equal(messages.length, 1);
  assert.equal(
    messages[0],
    "[content] missing es translation: experience/fixture-role.role → using en",
  );
});

test("deduplicates repeated fallbacks", () => {
  const { messages, warn } = capture();
  localize(fixture.data.role, "es", ctx("role"), warn);
  localize(fixture.data.role, "es", ctx("role"), warn);
  assert.equal(messages.length, 1);
});

test("does not warn for English or when the translation exists", () => {
  const { messages, warn } = capture();
  assert.equal(
    localize(fixture.data.role, "en", ctx("role"), warn),
    "Android Developer",
  );
  const translated = { en: "Developer", es: "Desarrollador" };
  assert.equal(localize(translated, "es", ctx("role"), warn), "Desarrollador");
  assert.equal(messages.length, 0);
});

test("localizes nested arrays and reports their field path", () => {
  const { messages, warn } = capture();
  const out = localizeDeep(fixture.data, "es", ctx(""), warn) as {
    journey: { years: string; text: string }[];
  };
  assert.deepEqual(out.journey, [{ years: "2020–", text: "fixture step" }]);
  assert.ok(
    messages.includes(
      "[content] missing es translation: experience/fixture-role.journey[0].text → using en",
    ),
  );
  const pt = localizeDeep(fixture.data, "pt-br", ctx(""), warn) as {
    journey: { text: string }[];
  };
  assert.equal(pt.journey[0]?.text, "passo");
});

test("leaves non-localized objects untouched", () => {
  const { warn } = capture();
  const out = localizeDeep(fixture.data, "es", ctx(""), warn) as {
    company: string;
    photo: unknown;
  };
  assert.equal(out.company, "Fixture Corp");
  assert.deepEqual(out.photo, fixture.data.photo);
});
