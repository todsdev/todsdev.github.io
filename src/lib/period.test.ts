/** Experience period formatting, verified with fixtures. Run with `npm test`. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { formatMonth, formatPeriod, isoDate } from "./period.ts";

const EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const PT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
const ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
const utc = (s: string) => new Date(`${s}T00:00:00Z`);

test("formats a closed period in each locale", () => {
  const cases: [readonly string[], string][] = [
    [EN, "Jan 2025 – Mar 2026"],
    [PT, "jan 2025 – mar 2026"],
    [ES, "ene 2025 – mar 2026"],
  ];
  for (const [months, expected] of cases) {
    const p = formatPeriod(
      utc("2025-01-01"),
      utc("2026-03-31"),
      months,
      "present",
    );
    assert.equal(`${p.start.text} – ${p.end.text}`, expected);
  }
});

test("gives machine-readable YYYY-MM datetimes", () => {
  const p = formatPeriod(utc("2025-01-01"), utc("2026-03-31"), EN, "present");
  assert.equal(p.start.datetime, "2025-01");
  assert.equal(p.end.datetime, "2026-03");
});

test("ends an ongoing position with the translated present", () => {
  const cases: [readonly string[], string, string][] = [
    [EN, "present", "Aug 2016 – present"],
    [PT, "atual", "ago 2016 – atual"],
    [ES, "actualidad", "ago 2016 – actualidad"],
  ];
  for (const [months, present, expected] of cases) {
    const p = formatPeriod(utc("2016-08-01"), undefined, months, present);
    assert.equal(`${p.start.text} – ${p.end.text}`, expected);
    assert.equal(p.end.datetime, undefined);
  }
});

test("reads dates in UTC so the month never shifts", () => {
  // A UTC-midnight date is still the previous day in negative-offset time zones.
  const p = formatPeriod(utc("2023-05-01"), utc("2024-11-30"), EN, "present");
  assert.equal(p.start.text, "May 2023");
  assert.equal(p.end.text, "Nov 2024");
});

test("each locale has twelve months", () => {
  for (const months of [EN, PT, ES]) assert.equal(months.length, 12);
});

test("formatMonth gives the short month and year in each locale", () => {
  const nov = new Date("2022-11-22T00:00:00Z");
  const oct = new Date("2021-10-13T00:00:00Z");
  assert.equal(formatMonth(nov, EN), "Nov 2022");
  assert.equal(formatMonth(nov, PT), "nov 2022");
  assert.equal(formatMonth(nov, ES), "nov 2022");
  assert.equal(formatMonth(oct, EN), "Oct 2021");
  assert.equal(formatMonth(oct, PT), "out 2021");
  assert.equal(formatMonth(oct, ES), "oct 2021");
});

test("formatMonth and isoDate read UTC, so the first and last day never shift", () => {
  const first = new Date("2022-06-01T00:00:00Z");
  const last = new Date("2022-06-30T23:59:59Z");
  assert.equal(formatMonth(first, EN), "Jun 2022");
  assert.equal(formatMonth(last, EN), "Jun 2022");
  assert.equal(isoDate(new Date("2022-11-22T00:00:00Z")), "2022-11-22");
  assert.equal(isoDate(new Date("2021-10-13T00:00:00Z")), "2021-10-13");
});
