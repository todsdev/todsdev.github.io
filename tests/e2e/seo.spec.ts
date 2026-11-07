import type { Page } from "@playwright/test";
import {
  localePath,
  locales,
  profile,
  SITE,
  text,
  type Locale,
} from "./support/content";
import { test, expect } from "./support/fixtures";

test.beforeEach(({ isMobile }) => {
  test.skip(isMobile, "reads tags and files, so it runs once, in desktop");
});

/** `og:locale` values: fixed by the Open Graph protocol, not by the site's dictionaries. */
const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  "pt-br": "pt_BR",
  es: "es_ES",
};

const meta = (page: Page, attr: "name" | "property", key: string) =>
  page.locator(`meta[${attr}="${key}"]`);

test("E1: description and canonical per locale, ignoring the query", async ({
  page,
}) => {
  for (const locale of locales) {
    for (const suffix of ["", "?utm_source=test"]) {
      await page.goto(`${localePath(locale)}${suffix}`);
      await expect(meta(page, "name", "description")).toHaveAttribute(
        "content",
        text(locale, "meta.description"),
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${SITE}${localePath(locale)}`,
      );
    }
  }
});

test("E2: Open Graph and Twitter tags per locale", async ({ page }) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const expected = {
      "og:title": text(locale, "meta.title"),
      "og:description": text(locale, "meta.description"),
      "og:url": `${SITE}${localePath(locale)}`,
      "og:type": "website",
      "og:locale": OG_LOCALE[locale],
      "og:image": `${SITE}/og/${locale}.png`,
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:alt": text(locale, "meta.ogImageAlt"),
    };
    for (const [key, content] of Object.entries(expected)) {
      await expect(meta(page, "property", key), key).toHaveAttribute(
        "content",
        content,
      );
    }
    const alternates = await meta(
      page,
      "property",
      "og:locale:alternate",
    ).evaluateAll((tags) => tags.map((t) => t.getAttribute("content")));
    expect(alternates).toEqual(
      locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    );

    const twitter = {
      "twitter:card": "summary_large_image",
      "twitter:title": text(locale, "meta.title"),
      "twitter:description": text(locale, "meta.description"),
      "twitter:image": `${SITE}/og/${locale}.png`,
      "twitter:image:alt": text(locale, "meta.ogImageAlt"),
    };
    for (const [key, content] of Object.entries(twitter)) {
      await expect(meta(page, "name", key), key).toHaveAttribute(
        "content",
        content,
      );
    }
  }
});

test("E3: og:image is a 1200×630 PNG for each locale, from the local build", async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const url = await meta(page, "property", "og:image").getAttribute(
      "content",
    );
    // The page names the production host; the test fetches the same path from the local build.
    const response = await page.request.get(new URL(url!).pathname);
    expect(response.status(), locale).toBe(200);
    expect(response.headers()["content-type"], locale).toBe("image/png");
    const png = await response.body();
    expect([...png.subarray(0, 8)], locale).toEqual([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    // IHDR: width and height are the big-endian integers at bytes 16 and 20.
    expect([png.readUInt32BE(16), png.readUInt32BE(20)], locale).toEqual([
      1200, 630,
    ]);
  }
});

test("E4: the 404 page has only noindex", async ({ page }) => {
  await page.goto("/404.html");
  await expect(meta(page, "name", "robots")).toHaveAttribute(
    "content",
    "noindex",
  );
  const counts = await page.evaluate(() => ({
    canonical: document.querySelectorAll('link[rel="canonical"]').length,
    hreflang: document.querySelectorAll("link[hreflang]").length,
    openGraph: document.querySelectorAll('meta[property^="og:"]').length,
    twitter: document.querySelectorAll('meta[name^="twitter:"]').length,
    jsonLd: document.querySelectorAll('script[type="application/ld+json"]')
      .length,
  }));
  expect(counts).toEqual({
    canonical: 0,
    hreflang: 0,
    openGraph: 0,
    twitter: 0,
    jsonLd: 0,
  });
});

test("E5: the JSON-LD Person has its fields per locale and no phone", async ({
  page,
}) => {
  const { name } = profile();
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const scripts = page.locator('script[type="application/ld+json"]');
    await expect(scripts, locale).toHaveCount(1);
    const raw = (await scripts.textContent()) ?? "";
    expect(raw, "no < that could close the element").not.toContain("<");
    const data = JSON.parse(raw);

    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe(name);
    expect(data.jobTitle).toBe(text(locale, "meta.jobTitle"));
    expect(data.url).toBe(`${SITE}${localePath(locale)}`);
    expect(data.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(
      data.sameAs.map((url: string) =>
        new URL(url).hostname.replace(/^www\./, ""),
      ),
    ).toEqual(["linkedin.com", "github.com", "instagram.com"]);

    // No phone: no field for it and no link to it (the number itself is B3's job).
    expect(Object.keys(data)).not.toContain("telephone");
    expect(raw).not.toMatch(/tel:|wa\.me/);
  }
});
