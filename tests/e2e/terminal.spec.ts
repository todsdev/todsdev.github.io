import { localePath, locales, text } from "./support/content";
import { test, expect } from "./support/fixtures";
import { openTerminal, run } from "./support/terminal";

test.describe("keyboard", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, "keyboard shortcuts are for the desktop project");
  });

  test("T1: / and ` open the terminal, Esc and the close button close it, and focus returns", async ({
    page,
  }) => {
    await page.goto("/");
    const dialog = page.locator("dialog[data-terminal]");
    const opener = page.getByRole("link", {
      name: text("en", "nav.about"),
      exact: true,
    });

    for (const key of ["/", "`"]) {
      await opener.focus();
      await page.keyboard.press(key);
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("textbox")).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
    }

    await opener.focus();
    await page.keyboard.press("/");
    await dialog
      .getByRole("button", { name: text("en", "terminal.close") })
      .click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();

    // Typing in a field is typing, not a shortcut.
    await page.evaluate(() => {
      const field = document.createElement("input");
      field.id = "scratch-field";
      document.querySelector("main")!.prepend(field);
      field.focus();
    });
    await page.keyboard.press("/");
    await expect(dialog).toBeHidden();
    await expect(page.locator("#scratch-field")).toHaveValue("/");
  });
});

test("T2: the >_ button opens the terminal with the input focused", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "the >_ button is the touch path");
  await page.goto("/");
  const button = page.getByRole("button", {
    name: text("en", "terminal.open"),
  });
  await expect(button).toBeVisible();
  await button.tap();
  const dialog = page.locator("dialog[data-terminal]");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox")).toBeFocused();
});

test("T3: terminal.json loads on the first opening only, and the log survives a reopen", async ({
  page,
  isMobile,
}) => {
  const loads: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/terminal.json")) loads.push(request.url());
  });
  await page.goto("/");
  await page.waitForLoadState("load");
  expect(loads).toEqual([]);

  const dialog = await openTerminal(page, isMobile);
  await run(dialog, "help");
  await expect.poll(() => loads.length).toBe(1);
  const before = await dialog.locator("[data-terminal-log] .term__out").count();

  await dialog
    .getByRole("button", { name: text("en", "terminal.close") })
    .click();
  await expect(dialog).toBeHidden();
  await openTerminal(page, isMobile);
  await expect(dialog.locator("[data-terminal-log] .term__out")).toHaveCount(
    before,
  );
  await expect(dialog.locator(".term__out--echo")).toHaveText([/ help$/]);
  expect(loads).toHaveLength(1);
});

test("T4: the dialog is named, its input is labelled and the page behind is inert", async ({
  page,
  isMobile,
}) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    await openTerminal(page, isMobile);
    const dialog = page.getByRole("dialog", {
      name: text(locale, "terminal.name"),
    });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("textbox", {
        name: text(locale, "terminal.inputLabel"),
      }),
    ).toBeVisible();

    // The page behind can't take focus while the modal is open.
    const tookFocus = await page.evaluate(() => {
      const link = document.querySelector<HTMLElement>("[data-nav-link]")!;
      link.focus();
      return document.activeElement === link;
    });
    expect(tookFocus).toBe(false);
  }
});
