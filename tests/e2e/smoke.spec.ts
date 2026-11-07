import {
  langCode,
  localePath,
  locales,
  profile,
  text,
} from "./support/content";
import { test, expect } from "./support/fixtures";

// The post-deploy subset: it runs against `SMOKE_URL` (the live site) through the "smoke"
// project, and the same fixture blocks Umami, so a run never counts as a visit.

test("M1: the home loads in three locales, with the right lang and name", async ({
  page,
}) => {
  const { name } = profile();
  for (const locale of locales) {
    const response = await page.goto(localePath(locale));
    expect(response?.status(), locale).toBe(200);
    await expect(page.locator("html"), locale).toHaveAttribute(
      "lang",
      langCode[locale],
    );
    await expect(
      page.getByRole("heading", { level: 1 }),
      locale,
    ).toHaveAccessibleName(name);
  }
});

test("M2: a 404 path shows the terminal error", async ({ page }) => {
  const response = await page.goto("/pt-br/smoke-check-missing");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText(
    "bash: /pt-br/smoke-check-missing: command not found",
  );
  await expect(
    page.getByText(text("pt-br", "notFound.line"), { exact: true }),
  ).toBeVisible();
});

test("M3: og:image returns a PNG in each locale", async ({ page }) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const url = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    // The tag names the production host; the same path is fetched from the site under test.
    const response = await page.request.get(new URL(url!).pathname);
    expect(response.status(), locale).toBe(200);
    expect(response.headers()["content-type"], locale).toBe("image/png");
    expect([...(await response.body()).subarray(0, 4)], locale).toEqual([
      0x89, 0x50, 0x4e, 0x47,
    ]);
  }
});

test("M4: the tracker is requested and stopped, with no beacon", async ({
  page,
}) => {
  const requested: string[] = [];
  const failed: string[] = [];
  page.on("request", (request) => {
    if (/umami\.(is|dev)/.test(request.url())) requested.push(request.url());
  });
  page.on("requestfailed", (request) => failed.push(request.url()));
  await page.goto("/");
  await page.waitForLoadState("load");

  expect(requested).toEqual(["https://cloud.umami.is/script.js"]);
  expect(failed).toContain("https://cloud.umami.is/script.js");
});
