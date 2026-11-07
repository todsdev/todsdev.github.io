import { localePath, locales, text } from "./support/content";
import { test, expect } from "./support/fixtures";
import { openTerminal, output, run } from "./support/terminal";

const pdf = (locale: string) => `/resume/resume-${locale}.pdf`;

test("R1: each locale's résumé link points to that locale's PDF", async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const link = page.locator("#contact a[download='resume.pdf']");
    await expect(link).toHaveAttribute("href", pdf(locale));

    const response = await page.request.get(pdf(locale));
    expect(response.status()).toBe(200);
    expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
  }
});

test("R2: the terminal's resume command downloads the same PDF", async ({
  page,
  isMobile,
}) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const dialog = await openTerminal(page, isMobile);
    const download = page.waitForEvent("download");
    await run(dialog, "resume");
    const file = await download;
    expect(new URL(file.url()).pathname).toBe(pdf(locale));
    expect(file.suggestedFilename()).toBe("resume.pdf");
    await expect
      .poll(() => output(dialog))
      .toEqual([
        text(locale, "terminal.resume").replace(
          "{file}",
          `resume-${locale}.pdf`,
        ),
      ]);
  }
});
