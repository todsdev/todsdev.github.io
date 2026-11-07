import type { Page } from "@playwright/test";
import { localePath } from "../../src/i18n";
import { locales, profile, text } from "./support/content";
import { test, expect } from "./support/fixtures";

const { name, role } = profile();
/** The role as first typed: the last word's initial goes in lowercase (the deliberate typo). */
const typo = role.replace(/ (\w)/, (_, c: string) => ` ${c.toLowerCase()}`);

/** The characters of an overlay line that are currently visible. */
const typed = (page: Page, line: "name" | "role") =>
  page
    .locator(`[data-type="${line}"] .hero__ch:not(.is-hidden)`)
    .evaluateAll((chars) => chars.map((c) => c.textContent).join(""));

/** Loads the home with a controlled clock, stopped at the start of the typing. */
async function startTyping(page: Page) {
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator("#hero")).toHaveAttribute(
    "data-hero-state",
    "typing",
  );
}

test("H1: the typing passes through the typo and ends on name and role", async ({
  page,
}) => {
  await startTyping(page);
  const hero = page.locator("#hero");
  let sawTypo = false;
  let state = "typing";
  for (let i = 0; i < 200 && state !== "done"; i++) {
    await page.clock.runFor(100);
    sawTypo ||= (await typed(page, "role")) === typo;
    state = (await hero.getAttribute("data-hero-state")) ?? "";
  }
  expect(state).toBe("done");
  expect(sawTypo).toBe(true);
  expect(await typed(page, "name")).toBe(name);
  expect(await typed(page, "role")).toBe(role);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("H2: the final state shows at once, with nothing animating", async ({
    page,
  }) => {
    await page.goto("/");
    const hero = page.locator("#hero");
    await expect(hero).toHaveAttribute("data-hero-state", "final");
    await expect(page.locator("html")).not.toHaveClass(/hero-pending/);
    await expect(page.locator(".hero__overlay")).toHaveCount(0);
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(hero.getByText(role, { exact: true })).toBeVisible();
    await expect(hero.locator(".hero__img")).toBeVisible();
    const running = await page.evaluate(
      () =>
        document
          .getElementById("hero")!
          .getAnimations({ subtree: true })
          .filter((a) => a.playState === "running").length,
    );
    expect(running).toBe(0);
  });

  test("H3: the photo loads, with a localized alt, in every locale", async ({
    page,
  }) => {
    for (const locale of locales) {
      await page.goto(localePath(locale));
      const photo = page.locator("#hero .hero__img");
      await expect(photo).toBeVisible();
      await expect(photo).toHaveAttribute(
        "alt",
        text(locale, "hero.photoAlt").replace("{name}", name),
      );
      await expect
        .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
    }
  });
});

for (const how of ["key", "pointer"] as const) {
  test(`H4: a ${how} skips to the final state`, async ({ page }) => {
    await startTyping(page);
    if (how === "key") await page.keyboard.press("Shift");
    else await page.mouse.click(5, 5);
    const hero = page.locator("#hero");
    await expect(hero).toHaveAttribute("data-hero-state", "done");
    expect(await typed(page, "name")).toBe(name);
    expect(await typed(page, "role")).toBe(role);
    // A skip shows the photo already on, without the power-on animation.
    await expect(hero).not.toHaveAttribute("data-hero-poweron", /.*/);
  });
}

test("H5: one h1, the role exactly once and no partial text exposed", async ({
  page,
}) => {
  await startTyping(page);
  await page.clock.runFor(1200); // part-way through the name
  expect(await typed(page, "name")).not.toBe(name);

  await expect(page.locator("h1")).toHaveCount(1);
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveCount(1);
  await expect(heading).toHaveAccessibleName(name);

  const tree = await page.locator("#hero").ariaSnapshot();
  expect(tree.split(role).length - 1).toBe(1);
  expect(tree).not.toContain(typo);
});
