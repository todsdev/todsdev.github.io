import { expect, type Locator, type Page } from "@playwright/test";

/** Opens the terminal the way the visitor's device does: the `>_` button on touch, `/` otherwise. */
export async function openTerminal(
  page: Page,
  isMobile: boolean,
): Promise<Locator> {
  const dialog = page.locator("dialog[data-terminal]");
  if (isMobile) await page.locator("[data-terminal-open]").tap();
  else await page.keyboard.press("/");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox")).toBeFocused();
  return dialog;
}

/** The text of the log's lines. */
export const lines = (dialog: Locator): Promise<string[]> =>
  dialog.locator("[data-terminal-log] .term__out").allTextContents();

/** Types a command and waits for its echo line to appear. */
export async function run(dialog: Locator, command: string): Promise<void> {
  const echoes = dialog.locator(".term__out--echo");
  const before = await echoes.count();
  await dialog.getByRole("textbox").fill(command);
  await dialog.page().keyboard.press("Enter");
  await expect(echoes).toHaveCount(before + 1);
}

/** The lines printed after the last echoed command. */
export async function output(dialog: Locator): Promise<string[]> {
  const all = await dialog
    .locator("[data-terminal-log] .term__out")
    .evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent ?? "",
        echo: el.classList.contains("term__out--echo"),
      })),
    );
  const last = all.map((line) => line.echo).lastIndexOf(true);
  return all.slice(last + 1).map((line) => line.text);
}
