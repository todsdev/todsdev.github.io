import { test, expect } from "@playwright/test";

test("home responds", async ({ page }) => {
  await page.goto("http://localhost:4322/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
