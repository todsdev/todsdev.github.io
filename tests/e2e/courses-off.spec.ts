import { fill } from "../../src/lib/terminal";
import {
  coursesEnabled,
  entries,
  localePath,
  locales,
  terminalStrings,
  text,
} from "./support/content";
import { readDist } from "./support/dist";
import { test, expect } from "./support/fixtures";
import { openTerminal, output, run } from "./support/terminal";

test.beforeEach(() => {
  test.skip(coursesEnabled(), "courses are on (profile courses.enabled: true)");
});

test("C1: no courses section, nav link, certificate link or stray thread marker", async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    await expect(page.locator("#courses"), locale).toHaveCount(0);
    await expect(page.locator('[href$="#courses"]'), locale).toHaveCount(0);
    await expect(
      page
        .getByRole("navigation", { name: text(locale, "nav.label") })
        .locator('[data-nav-link="courses"]'),
      locale,
    ).toHaveCount(0);
    await expect(
      page.locator('[data-event="certificate"]'),
      locale,
    ).toHaveCount(0);
    await expect(
      page.locator("[data-thread-marker]:not(#experience *)"),
      locale,
    ).toHaveCount(0);
  }
});

test("C2: a deep link to #courses stays at the top without errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const locale of locales) {
    await page.goto(`${localePath(locale)}#courses`);
    await expect(page.locator("#hero"), locale).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY), locale).toBe(0);
    await expect(
      page.locator(".site-nav [aria-current='location']"),
      locale,
    ).toHaveAttribute("data-nav-link", "hero");
  }
  expect(errors).toEqual([]);
});

test("C3: the terminal has no certs, no courses/ and offers neither on Tab", async ({
  page,
  isMobile,
}) => {
  for (const locale of locales) {
    const strings = terminalStrings(locale);
    await page.goto(localePath(locale));
    const dialog = await openTerminal(page, isMobile);
    const input = dialog.getByRole("textbox");
    const printed = async (command: string) => {
      await run(dialog, command);
      return output(dialog);
    };

    const help = await printed("help");
    expect(
      help.map((line) => line.split(/\s+/)[0]),
      `${locale} help`,
    ).not.toContain("certs");
    for (const command of ["ls", "ls -a"]) {
      const [listing] = await printed(command);
      expect(listing, `${locale} ${command}`).not.toContain("courses/");
    }
    expect(await printed("cd courses"), `${locale} cd`).toEqual([
      fill(strings.cdError, { name: "courses" }),
    ]);
    expect(await printed("certs"), `${locale} certs`).toEqual([
      fill(strings.notFound, { name: "certs" }),
      strings.helpHint,
    ]);
    const near = await printed("cert");
    expect(near.join("\n"), `${locale} cert`).not.toContain("certs");

    await input.fill("c");
    await page.keyboard.press("Tab");
    expect(await output(dialog), `${locale} Tab on c`).toEqual([
      "cat  cd  clear  contact",
    ]);
    await input.fill("cd c");
    await page.keyboard.press("Tab");
    await expect(input, `${locale} Tab on cd c`).toHaveValue("cd contact");
  }
});

test("C4: terminal.json has no certs, no courses section, no help text and no course title", async ({
  isMobile,
}) => {
  test.skip(isMobile, "reads files, so it runs once, in desktop");
  for (const locale of locales) {
    const file = `${localePath(locale)}terminal.json`.slice(1);
    const raw = readDist(file);
    const data = JSON.parse(raw) as {
      sections: string[];
      strings: { help: Record<string, string> };
    };
    expect(data, `${file} keys`).not.toHaveProperty("certs");
    expect(data.sections, `${file} sections`).not.toContain("courses");
    expect(data.strings.help, `${file} help`).not.toHaveProperty("certs");
    for (const course of entries<{ title: string; issuer: string }>(
      "courses",
      locale,
    )) {
      expect(raw, `${file} ${course.title}`).not.toContain(
        JSON.stringify(course.title).slice(1, -1),
      );
      expect(raw, `${file} ${course.issuer}`).not.toContain(
        JSON.stringify(course.issuer).slice(1, -1),
      );
    }
  }
});
