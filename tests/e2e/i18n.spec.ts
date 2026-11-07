import { PREFERRED_LOCALE_KEY } from "../../src/lib/storage-keys";
import {
  langCode,
  localePath,
  locales,
  shortCode,
  SITE,
  text,
} from "./support/content";
import { test, expect } from "./support/fixtures";

/** The accessible names are fixed by the spec: the visible code first, the same in every locale. */
const NATIVE_NAME = { en: "English", "pt-br": "Português", es: "Español" };

test("I1: every locale route has its lang and the hreflang alternates", async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    await expect(page.locator("html")).toHaveAttribute(
      "lang",
      langCode[locale],
    );
    const alternates = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((links) =>
        links.map((l) => [l.getAttribute("hreflang"), l.getAttribute("href")]),
      );
    expect(alternates).toEqual([
      ...locales.map((l) => [langCode[l], `${SITE}${localePath(l)}`]),
      ["x-default", `${SITE}${localePath("en")}`],
    ]);
  }
});

test("I2: the switcher names, codes, links and current marker", async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const switcher = page.getByRole("list", {
      name: text(locale, "switcher.label"),
    });
    await expect(switcher.getByRole("link")).toHaveCount(locales.length);
    for (const target of locales) {
      const link = switcher.getByRole("link", {
        name: `${shortCode[target]} — ${NATIVE_NAME[target]}`,
        exact: true,
      });
      await expect(link).toHaveAttribute("href", localePath(target));
      await expect(link).toHaveAttribute("hreflang", langCode[target]);
      await expect(link).toContainText(shortCode[target]);
      if (target === locale) {
        await expect(link).toHaveAttribute("aria-current", "true");
      } else {
        await expect(link).not.toHaveAttribute("aria-current");
      }
    }
  }
});

test("I3: switching keeps the hash and stores the choice", async ({ page }) => {
  await page.goto("/#projects");
  await page
    .getByRole("link", {
      name: text("en", "switcher.names.pt-br"),
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/pt-br\/#projects$/);
  const saved = await page.evaluate(
    (key) => localStorage.getItem(key),
    PREFERRED_LOCALE_KEY,
  );
  expect(saved).toBe("pt-br");
});

test.describe("saved choice", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript((key) => {
      localStorage.setItem(key, "pt-br");
    }, PREFERRED_LOCALE_KEY);
  });

  test("I4: a saved choice redirects the root only", async ({ page }) => {
    await page.goto("/#about");
    await expect(page).toHaveURL(/\/pt-br\/#about$/);
    await page.goto("/es/");
    await expect(page).toHaveURL(/\/es\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", langCode.es);
  });
});

test.describe("browser language", () => {
  test.use({ locale: "pt-BR" });

  test("I4: the browser language never redirects", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", langCode.en);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("I5: the switcher is a plain link", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await page.goto("/pt-br/");
    const link = page.getByRole("link", {
      name: text("pt-br", "switcher.names.en"),
      exact: true,
    });
    await expect(link).toHaveAttribute("href", "/");
    await link.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", langCode.en);
  });
});
