import { test, expect } from "./support/fixtures";

test("A5: with Umami aborted, the page still works", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");

  await page.locator('a[data-nav-link="about"]').click();
  await expect(page).toHaveURL(/#about$/);

  if (isMobile) await page.locator("[data-terminal-open]").tap();
  else await page.keyboard.press("/");
  const dialog = page.locator("dialog[data-terminal]");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox").fill("help");
  await page.keyboard.press("Enter");
  await expect(dialog.getByRole("log")).toContainText("help");

  expect(errors).toEqual([]);
});

test("A6: the tracker script is requested and stopped, with no beacon", async ({
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
