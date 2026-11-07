import { localePath, locales, text } from "./support/content";
import { test, expect, type TrackedEvent } from "./support/fixtures";
import { NOOP, openTerminal, run } from "./support/terminal";

test("A5: with Umami aborted, the page still works", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");

  await page.locator('a[data-nav-link="about"]').click();
  await expect(page).toHaveURL(/#about$/);

  const dialog = await openTerminal(page, isMobile);
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

/** The events with one of these names; others, like section_view, fire as the page is read. */
const only = (events: TrackedEvent[], ...names: string[]) =>
  events.filter((event) => names.includes(event.name));

test("A3: clicks report nav_click and resume, per locale", async ({
  page,
  events,
}) => {
  for (const locale of locales) {
    events.length = 0;
    await page.goto(localePath(locale));
    await page
      .getByRole("navigation", { name: text(locale, "nav.label") })
      .getByRole("link", { name: text(locale, "nav.projects"), exact: true })
      .click();
    await expect
      .poll(() => only(events, "nav_click"))
      .toEqual([{ name: "nav_click", data: { section: "projects", locale } }]);

    events.length = 0;
    const downloaded = page.waitForEvent("download");
    await page.locator("#contact a[download='resume.pdf']").click();
    await downloaded;
    await expect
      .poll(() => only(events, "resume"))
      .toEqual([{ name: "resume", data: { language: locale, locale } }]);
  }
});

test("A4: the terminal reports terminal_open and terminal_command, and an unknown input as unknown", async ({
  page,
  isMobile,
  events,
}) => {
  await page.goto("/");
  const dialog = await openTerminal(page, isMobile);
  await expect
    .poll(() => only(events, "terminal_open"))
    .toEqual([{ name: "terminal_open", data: { locale: "en" } }]);

  await run(dialog, "help");
  await run(dialog, NOOP);
  await expect
    .poll(() => only(events, "terminal_command"))
    .toEqual([
      { name: "terminal_command", data: { command: "help", locale: "en" } },
      { name: "terminal_command", data: { command: "unknown", locale: "en" } },
    ]);
  // The raw input never leaves the page.
  expect(JSON.stringify(events)).not.toContain(NOOP);
});
