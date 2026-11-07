import { coursesEnabled, localePath, locales, text } from "./support/content";
import { test, expect } from "./support/fixtures";

test.beforeEach(() => {
  test.skip(coursesEnabled(), "courses are on (profile courses.enabled: true)");
});

test("C1: no courses section, nav link, certificate link or stray thread marker", async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    await expect(page.locator("#courses"), locale).toHaveCount(0);
    await expect(page.locator('[href$="#courses"]'), locale).toHaveCount(0);
    await expect(
      page
        .getByRole("navigation", { name: text(locale, "nav.label") })
        .locator('[data-nav-link="courses"]'),
      locale,
    ).toHaveCount(0);
    await expect(
      page.locator('[data-event="certificate"]'),
      locale,
    ).toHaveCount(0);
    await expect(
      page.locator("[data-thread-marker]:not(#experience *)"),
      locale,
    ).toHaveCount(0);
  }
});

test("C2: a deep link to #courses stays at the top without errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const locale of locales) {
    await page.goto(`${localePath(locale)}#courses`);
    await expect(page.locator("#hero"), locale).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY), locale).toBe(0);
    await expect(
      page.locator(".site-nav [aria-current='location']"),
      locale,
    ).toHaveAttribute("data-nav-link", "hero");
  }
  expect(errors).toEqual([]);
});
