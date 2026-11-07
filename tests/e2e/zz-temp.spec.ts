import { test, expect } from "./support/fixtures";

test("temporary failure", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "xx");
});
