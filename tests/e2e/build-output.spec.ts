import { langCode, localePath, locales, SITE } from "./support/content";
import { readDist } from "./support/dist";
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
