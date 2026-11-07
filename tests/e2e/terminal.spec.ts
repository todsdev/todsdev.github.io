import {
  ADB,
  E492,
  PROMPT,
  VIM_PROMPT,
  formatBlame,
  formatBrew,
  formatHelp,
  formatLs,
  formatPing,
  formatSecrets,
  SUDO_PROMPT,
  THEME_KEY,
  type Line,
} from "../../src/lib/terminal";
import { sectionIds } from "../../src/lib/sections";
import {
  localePath,
  locales,
  profile,
  terminalStrings,
  text,
} from "./support/content";
import { test, expect } from "./support/fixtures";
import { firstPaint } from "./support/paint";
import { NOOP, openTerminal, output, run } from "./support/terminal";

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

const texts = (lines: Line[]) => lines.map((line) => line.text);

/** Runs a command in each locale and checks its output against the expected lines. */
async function expectOutput(
  page: import("@playwright/test").Page,
  isMobile: boolean,
  commands: (locale: (typeof locales)[number]) => [string, string[]][],
) {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const dialog = await openTerminal(page, isMobile);
    for (const [command, expected] of commands(locale)) {
      await run(dialog, command);
      await expect.poll(() => output(dialog), command).toEqual(expected);
    }
  }
}

const sections = sectionIds.filter((id) => id !== "hero");

test("T5: help lists the commands in the page's language", async ({
  page,
  isMobile,
}) => {
  await expectOutput(page, isMobile, (locale) => [
    ["help", texts(formatHelp(terminalStrings(locale), sections))],
  ]);
});

test("T6: ls hides .secrets and ls -a lists it first", async ({
  page,
  isMobile,
}) => {
  await expectOutput(page, isMobile, () => [
    ["ls", texts(formatLs(sections))],
    ["ls -a", texts(formatLs(sections, true))],
  ]);
  expect(texts(formatLs(sections))[0]).not.toContain(".secrets");
  expect(texts(formatLs(sections, true))[0]).toMatch(/^\.secrets {2}/);
});

test("T7: cat .secrets prints the header and every easter egg", async ({
  page,
  isMobile,
}) => {
  await expectOutput(page, isMobile, (locale) => [
    ["cat .secrets", texts(formatSecrets(terminalStrings(locale)))],
  ]);
});

test("T8: sampled easter eggs print their output", async ({
  page,
  isMobile,
}) => {
  const { name } = profile();
  await expectOutput(page, isMobile, (locale) => {
    const strings = terminalStrings(locale);
    return [
      ["ping thiago", texts(formatPing(strings))],
      ["git blame", texts(formatBlame(strings, name))],
      ["brew coffee", texts(formatBrew(strings))],
      ["adb devices", [...ADB]],
    ];
  });
});

test("T9: vim enters a mode that only :q leaves", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  const dialog = await openTerminal(page, isMobile);
  const prompt = dialog.locator("[data-terminal-prompt]");
  await expect(prompt).toHaveText(PROMPT);

  await run(dialog, "vim");
  await expect(prompt).toHaveText(VIM_PROMPT);
  await run(dialog, "ls");
  await expect.poll(() => output(dialog)).toEqual([E492]);
  await expect(prompt).toHaveText(VIM_PROMPT);

  await run(dialog, ":q");
  await expect(prompt).toHaveText(PROMPT);
  await expect
    .poll(() => output(dialog))
    .toEqual([terminalStrings("en").vimExit]);
});

test("T10: sudo hire-me never lets the password reach the log or the history", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  const dialog = await openTerminal(page, isMobile);
  const input = dialog.getByRole("textbox", {
    name: text("en", "terminal.inputLabel"),
  });
  await run(dialog, "sudo hire-me");
  await expect.poll(() => output(dialog)).toEqual([SUDO_PROMPT]);

  // The password line is masked, labelled as such, and any input grants access.
  const password = dialog.locator("input[type=password]");
  await expect(password).toBeFocused();
  await expect(
    dialog.getByLabel(text("en", "terminal.passwordLabel")),
  ).toBeVisible();
  await password.fill(NOOP);
  await page.keyboard.press("Enter");
  await expect
    .poll(() => output(dialog))
    .toContain(terminalStrings("en").accessGranted);
  await expect(input).toHaveAttribute("type", "text");

  await run(dialog, "history");
  await expect
    .poll(() => output(dialog))
    .toEqual(["1  sudo hire-me", "2  history"]);
  expect(
    (await dialog.locator("[data-terminal-log]").innerText()).includes(NOOP),
  ).toBe(false);
});

test("T11: theme recolors, persists, resets, and is applied before first paint", async ({
  page,
  isMobile,
}) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __themeSetAt: number | null };
    w.__themeSetAt = null;
    new MutationObserver(() => {
      if (w.__themeSetAt === null && document.documentElement.dataset.theme) {
        w.__themeSetAt = performance.now();
      }
    }).observe(document, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-theme"],
    });
  });
  await page.goto("/");
  const root = page.locator("html");
  const stored = () =>
    page.evaluate((key) => localStorage.getItem(key), THEME_KEY);
  const color = () =>
    page.evaluate(() => getComputedStyle(document.body).color);
  const gray = await color();
  await expect(root).not.toHaveAttribute("data-theme", /.+/);

  const dialog = await openTerminal(page, isMobile);
  await run(dialog, "theme amber");
  await expect(root).toHaveAttribute("data-theme", "amber");
  expect(await color()).not.toBe(gray);
  expect(await stored()).toBe("amber");
  await expect
    .poll(() => output(dialog))
    .toEqual([terminalStrings("en").themeSet.replace("{theme}", "amber")]);

  // A reload keeps the theme, and it was applied before the first paint.
  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "amber");
  const themeSetAt = await page.evaluate(
    () => (window as unknown as { __themeSetAt: number | null }).__themeSetAt,
  );
  expect(themeSetAt).not.toBeNull();
  expect(themeSetAt!).toBeLessThan(await firstPaint(page));

  const again = await openTerminal(page, isMobile);
  await run(again, "theme gray");
  await expect(root).not.toHaveAttribute("data-theme", /.+/);
  expect(await color()).toBe(gray);
  expect(await stored()).toBeNull();
  await page.reload();
  await expect(root).not.toHaveAttribute("data-theme", /.+/);
});

test("T12: an unknown command gets the error and help hint, and typed markup stays text", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  const dialog = await openTerminal(page, isMobile);
  const strings = terminalStrings("en");

  await run(dialog, NOOP);
  await expect
    .poll(() => output(dialog))
    .toEqual([strings.notFound.replace("{name}", NOOP), strings.helpHint]);

  const markup = '<b id="injected">x</b>';
  await run(dialog, markup);
  await expect(dialog.locator(".term__out--echo").last()).toHaveText(
    `${PROMPT} ${markup}`,
  );
  await expect(page.locator("#injected")).toHaveCount(0);
  await expect(dialog.locator("[data-terminal-log] b")).toHaveCount(0);
});

test("T13: cd projects closes the terminal and lands on the section", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  const dialog = await openTerminal(page, isMobile);
  await run(dialog, "cd projects");
  await expect(dialog).toBeHidden();
  await expect(page.locator("#projects")).toBeInViewport();
  await expect(page).toHaveURL(/#projects$/);
});
