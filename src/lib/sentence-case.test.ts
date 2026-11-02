/** Sentence-case rule for prose content, verified with fixtures. Run with `npm test`. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { startsWithCapital } from "./sentence-case.ts";

test("rejects prose starting with a lowercase letter", () => {
  for (const text of [
    "quality control at 8 Olympic Games with OBS",
    "controle de qualidade em 8 edições",
    "desarrollo Android",
    "  leading spaces then lowercase",
  ]) {
    assert.equal(startsWithCapital(text), false, text);
  }
});

test("accepts capitalized prose in every locale", () => {
  for (const text of [
    "Quality control at 8 Olympic Games with OBS",
    "Controle de qualidade em 8 edições",
    "Énfasis en accesibilidad",
    "Ótimo",
  ]) {
    assert.equal(startsWithCapital(text), true, text);
  }
});

test("skips leading digits and punctuation to find the first letter", () => {
  assert.equal(startsWithCapital("8 Olympic Games"), true);
  assert.equal(startsWithCapital("¿Qué hago?"), true);
  assert.equal(startsWithCapital('"Quoted" start'), true);
  assert.equal(startsWithCapital("8 olympic games"), false);
  assert.equal(startsWithCapital("¿qué hago?"), false);
});

test("accepts a leading word with its own casing", () => {
  assert.equal(startsWithCapital("iOS and Android apps"), true);
  assert.equal(startsWithCapital("gRPC services in Kotlin"), true);
  assert.equal(startsWithCapital("iOS-only feature"), true);
  assert.equal(startsWithCapital("ios lowercase is still wrong"), false);
});

test("accepts text without letters", () => {
  assert.equal(startsWithCapital("2016–2022"), true);
});
