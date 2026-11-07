import type { Page } from "@playwright/test";
import { locales, text } from "./support/content";
import { sectionIds } from "../../src/lib/sections";
import { test, expect } from "./support/fixtures";

const navLink = (page: Page, id: (typeof sectionIds)[number]) =>
  page
    .getByRole("navigation", { name: text("en", "nav.label") })
    .getByRole("link", { name: text("en", `nav.${id}` as const), exact: true });

/** Exactly one link is active, and it's the one for `id`. */
async function expectActive(page: Page, id: (typeof sectionIds)[number]) {
  await expect(navLink(page, id)).toHaveAttribute("aria-current", "location");
  await expect(page.locator(".site-nav [aria-current='location']")).toHaveCount(
    1,
  );
  await expect(page.locator(".site-nav .is-active")).toHaveCount(1);
}

test("N1: a nav click lands on the section, with one active link", async ({
  page,
}) => {
  await page.goto("/");
  await navLink(page, "projects").click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator("#projects")).toBeInViewport();
  await expectActive(page, "projects");
});

test("N1: a deep link lands on the section, with one active link", async ({
  page,
}) => {
  await page.goto("/#skills");
  await expect(page.locator("#skills")).toBeInViewport();
  await expect(page.locator("#hero")).not.toBeInViewport();
  await expectActive(page, "skills");
});

test("N2: Tab goes through the skip link, the nav, then the switcher", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop only");
  await page.goto("/");
  const focused = () =>
    page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return el.getAttribute("aria-label") ?? el.textContent?.trim();
    });

  const order = [
    text("en", "skipLink"),
    ...sectionIds.map((id) => text("en", `nav.${id}` as const)),
    ...locales.map((l) => text("en", `switcher.names.${l}` as const)),
  ];
  for (const expected of order) {
    await page.keyboard.press("Tab");
    expect(await focused()).toBe(expected);
  }

  const skip = page.getByRole("link", { name: text("en", "skipLink") });
  await expect(skip).toHaveAttribute("href", "#main");
  await expect(page.locator("main#main")).toHaveCount(1);
});
