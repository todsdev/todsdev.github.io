/** Which sections render for each value of the courses flag. Run with `npm test`. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { renderedSections, sectionIds } from "./sections.ts";

test("courses on renders every section in order", () => {
  assert.deepEqual(renderedSections(true), sectionIds);
});

test("courses off drops only courses and keeps the order", () => {
  assert.deepEqual(renderedSections(false), [
    "hero",
    "about",
    "experience",
    "projects",
    "skills",
    "contact",
  ]);
});
