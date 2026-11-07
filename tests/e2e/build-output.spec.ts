import { langCode, localePath, locales, SITE } from "./support/content";
import { distDir, readDist } from "./support/dist";
import { findNumber, SCANNED, scanDist } from "./support/phone";
import { test, expect } from "./support/fixtures";

test("B1: the sitemap lists the three homes with four alternates each, and no 404", () => {
  const xml = readDist("sitemap.xml");
  const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]!);
  const locOf = (block: string) => /<loc>([^<]+)<\/loc>/.exec(block)![1];

  expect(urls.map(locOf)).toEqual(
    locales.map((l) => `${SITE}${localePath(l)}`),
  );
  const alternates = [
    ...locales.map((l) => [langCode[l], `${SITE}${localePath(l)}`]),
    ["x-default", `${SITE}${localePath("en")}`],
  ];
  for (const block of urls) {
    const found = [
      ...block.matchAll(
        /<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g,
      ),
    ].map((m) => [m[1], m[2]]);
    expect(found, locOf(block)).toEqual(alternates);
  }
  expect(xml).not.toMatch(/404/);
});

test("B2: robots.txt is plain text that allows everything and names the absolute sitemap", () => {
  const robots = readDist("robots.txt");
  expect(robots).not.toContain("<");
  const lines = robots.split("\n").filter(Boolean);
  expect(lines).toContain("User-agent: *");
  expect(lines).toContain("Allow: /");
  expect(lines.filter((line) => /^Disallow:\s*\S/.test(line))).toEqual([]);
  expect(lines).toContain(`Sitemap: ${SITE}/sitemap.xml`);
});

test("B3: the number from the contact content is absent from the built pages and terminal data", () => {
  const scan = scanDist(distDir());
  // A scan that read nothing, or a number that wasn't read, must not pass.
  expect(
    scan.length,
    "digits in the number read from the content",
  ).toBeGreaterThanOrEqual(11);
  expect(scan.read, "files read").toBe(SCANNED.length);
  expect(scan.findings, "the number or a phone link in the build").toEqual([]);
});

test.describe("B4: the matcher, with a fictional number", () => {
  const digits = "9988977770001";
  const found = (text: string) => findNumber(text, digits)?.form;

  test("matches each form, with the separators a page may use", () => {
    expect(found("+99 88 97777-0001")).toBe("international");
    expect(found("99 (88) 97777.0001")).toBe("international");
    expect(found("+99 88 97777 0001")).toBe("international");
    expect(found("(88) 97777-0001")).toBe("national");
    expect(found("88 97777 0001")).toBe("national");
    expect(found("97777-0001")).toBe("subscriber");
    expect(found("97777_0001")).toBe("subscriber");
    expect(found("tel:+9988977770001")).toBe("international");
  });

  test("masks every digit in the shape it reports", () => {
    expect(findNumber("call +99 88 97777-0001 now", digits)?.shape).toBe(
      "## ## #####-####",
    );
  });

  test("does not match values it must not", () => {
    for (const other of [
      "id468481865", // an App Store id
      "2026-11-07", // a date
      "1200x630", // an image size
      "a1b2c3d", // a hash
      "index.CdXr9877.css", // an asset hash
      "97777-0002", // a different number
      "9777700", // too short
      "88 97777", // part of the number
    ]) {
      expect(found(other), other).toBeUndefined();
    }
  });
});
