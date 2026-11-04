/** Courses order, verified with fixtures. Run with `npm test`. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sortCourses } from "./courses.ts";

const course = (id: string, date: string, featured = false) => ({
  id,
  featured,
  date: new Date(`${date}T00:00:00Z`),
});

test("featured courses come first, even when older", () => {
  const sorted = sortCourses([
    course("new", "2024-01-01"),
    course("featured-old", "2020-01-01", true),
  ]);
  assert.deepEqual(
    sorted.map((c) => c.id),
    ["featured-old", "new"],
  );
});

test("newest first within each group", () => {
  const sorted = sortCourses([
    course("f-2022-09", "2022-09-13", true),
    course("r-2021", "2021-10-13"),
    course("f-2022-11", "2022-11-22", true),
    course("r-2022", "2022-06-29"),
  ]);
  assert.deepEqual(
    sorted.map((c) => c.id),
    ["f-2022-11", "f-2022-09", "r-2022", "r-2021"],
  );
});

test("equal dates keep the incoming (order) order", () => {
  const sorted = sortCourses([
    course("basico", "2022-06-29"),
    course("poo", "2022-06-29"),
  ]);
  assert.deepEqual(
    sorted.map((c) => c.id),
    ["basico", "poo"],
  );
  const reversed = sortCourses([
    course("poo", "2022-06-29"),
    course("basico", "2022-06-29"),
  ]);
  assert.deepEqual(
    reversed.map((c) => c.id),
    ["poo", "basico"],
  );
});

test("the current content in display order", () => {
  const sorted = sortCourses([
    course("marvel", "2022-11-22", true),
    course("kotlin", "2022-09-13", true),
    course("java-basico", "2022-06-29"),
    course("java-poo", "2022-06-29"),
    course("algoritmo", "2021-10-13"),
  ]);
  assert.deepEqual(
    sorted.map((c) => c.id),
    ["marvel", "kotlin", "java-basico", "java-poo", "algoritmo"],
  );
});
