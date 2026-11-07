import type { Page } from "@playwright/test";
import { UMAMI_PRIVACY } from "../../src/lib/analytics";
import { actionsFor, type ContactKind } from "../../src/lib/contact";
import { OPEN_CERT } from "../../src/lib/courses";
import { sectionIds } from "../../src/lib/sections";
import { projectActions, sortProjects } from "../../src/lib/projects";
import {
  contacts,
  entries,
  localePath,
  locales,
  localized,
  profile,
  text,
  type Locale,
} from "./support/content";
import { test, expect } from "./support/fixtures";

interface Profile {
  location: string;
  focus: string;
  journey: { years: string; text: string }[];
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const present = (locale: Locale) => text(locale, "time.present");
/** "2016–" is an open range: it ends with the translated "present". */
const years = (value: string, locale: Locale) =>
  /[–-]$/.test(value) ? `${value}${present(locale)}` : value;

test("S1: the seven sections render in order with the locale's nav and titles", async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const ids = await page
      .locator("main > section[id]")
      .evaluateAll((sections) => sections.map((s) => s.id));
    expect(ids).toEqual([...sectionIds]);

    const nav = page.getByRole("navigation", {
      name: text(locale, "nav.label"),
    });
    await expect(nav.getByRole("link")).toHaveText(
      sectionIds.map((id) => text(locale, `nav.${id}` as const)),
    );
    for (const id of sectionIds.filter((id) => id !== "hero")) {
      await expect(
        page.locator(`#${id}`).getByRole("heading", { level: 2 }),
      ).toHaveAccessibleName(text(locale, `prompt.${id}` as const));
    }
  }
});

test("S2: About has its headings, four facts and the journey steps", async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const about = page.locator("#about");
    const [profile] = entries<Profile>("profile", locale);
    const languages = entries<{ name: string; proficiency: string }>(
      "languages",
      locale,
    );
    const education = entries<{ degree: string; institution: string }>(
      "education",
      locale,
    );

    const headings = about.getByRole("heading");
    const names = [
      text(locale, "prompt.about"),
      text(locale, "about.journeyCommand"),
      text(locale, "about.factsCommand"),
    ];
    await expect(headings).toHaveCount(names.length);
    for (const [i, name] of names.entries()) {
      await expect(headings.nth(i)).toHaveAccessibleName(name);
    }

    await expect(about.locator(".about__step")).toHaveText(
      profile!.journey.map((s) => `[${years(s.years, locale)}] ${s.text}`),
    );

    await expect(about.locator("dt")).toHaveText([
      text(locale, "about.facts.location"),
      text(locale, "about.facts.languages"),
      text(locale, "about.facts.education"),
      text(locale, "about.facts.focus"),
    ]);
    await expect(about.locator("dd")).toHaveText([
      profile!.location,
      languages.map((l) => `${l.name} (${l.proficiency})`).join(" · "),
      ...education.map((e) => `${e.degree} · ${e.institution}`),
      profile!.focus,
    ]);
  }
});

test("S3: Experience entries, markers and ticks match the content", async ({
  page,
}) => {
  interface Experience {
    company: string;
    start: string;
    events?: { year: number; name: string; role: string }[];
  }
  for (const locale of locales) {
    await page.goto(localePath(locale));
    // Newest first by start date; the sort is stable, so `order` breaks ties.
    const experience = entries<Experience>("experience", locale).sort((a, b) =>
      b.start.localeCompare(a.start),
    );
    const items = page.locator("#experience .xp__entry");
    await expect(items).toHaveCount(experience.length);
    for (const [i, entry] of experience.entries()) {
      const item = items.nth(i);
      await expect(item.locator(".xp__company")).toHaveText(entry.company);
      await expect(item.locator(".xp__marker[data-thread-marker]")).toHaveCount(
        1,
      );
      const events = [...(entry.events ?? [])].sort((a, b) => b.year - a.year);
      await expect(item.locator(".xp__tick[data-thread-marker]")).toHaveCount(
        events.length,
      );
      await expect(item.locator(".xp__event")).toHaveText(
        events.map((e) => `${e.year} ${e.name} · ${e.role}`),
      );
    }
  }
});

test("S4: Projects follow the content order, with badges, actions and alt text", async ({
  page,
}) => {
  interface Project {
    id: string;
    title: string;
    status: "live" | "building";
    ownership: "contributor" | "owner";
    via?: string;
    url?: string;
    repoUrl?: string;
    stores?: { playStore?: string; appStore?: string };
    featured?: boolean;
    screenshots?: { alt: string }[];
  }
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const projects = sortProjects(entries<Project>("projects", locale));
    const cards = page.locator("#projects article");
    await expect(cards).toHaveCount(projects.length);
    for (const [i, project] of projects.entries()) {
      const card = cards.nth(i);
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(
        project.title,
      );
      const badge = text(locale, `projects.ownership.${project.ownership}`);
      await expect(card.locator(".card__badge")).toHaveText(
        project.via
          ? `${badge} · ${text(locale, "projects.via").replace("{name}", project.via)}`
          : badge,
      );
      const shot = project.screenshots?.[0];
      if (shot)
        await expect(card.locator("img")).toHaveAttribute("alt", shot.alt);

      const actions = projectActions(project);
      const links = card.locator(".card__actions a");
      await expect(links).toHaveCount(actions.length);
      for (const [j, action] of actions.entries()) {
        const link = links.nth(j);
        await expect(link).toHaveAttribute("href", action.href);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener");
        // Chrome's accessible name may put a space before the hidden destination's comma.
        const name = `${action.command}, ${text(locale, `projects.destination.${action.kind}`).replace("{title}", project.title)} (${text(locale, "links.newTab")})`;
        await expect(link).toHaveAccessibleName(
          new RegExp(`^${escapeRegExp(name).replace(",", " ?,")}$`),
        );
      }
    }
  }
});

test("S5: Skills are headings with lists, as the accessibility tree reads them", async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const categories = entries<{ category: string; items: string[] }>(
      "skills",
      locale,
    );
    const template = categories
      .map(
        (c) =>
          `- heading ${JSON.stringify(c.category)} [level=3]\n- list:\n${c.items
            .map((item) => `  - listitem: ${JSON.stringify(item)}`)
            .join("\n")}`,
      )
      .join("\n");
    await expect(page.locator("#skills .file")).toMatchAriaSnapshot(template);
  }
});

test("S6: Courses are links that open in a new tab, and the hosted PDFs load", async ({
  page,
}) => {
  interface Course {
    title: string;
    issuer: string;
    date: string;
    certificateUrl: string;
    featured: boolean;
  }
  for (const locale of locales) {
    await page.goto(localePath(locale));
    // Featured first, then newest first; the sort is stable, so `order` breaks ties.
    const courses = entries<Course>("courses", locale).sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date),
    );
    const rows = page.locator("#courses .ls__row");
    await expect(rows).toHaveCount(courses.length);
    for (const [i, course] of courses.entries()) {
      const row = rows.nth(i);
      await expect(row.locator("time")).toHaveAttribute(
        "datetime",
        course.date,
      );
      await expect(row.locator(".ls__issuer")).toContainText(course.issuer);
      await expect(row.locator(".ls__title")).toContainText(course.title);
      const link = row.getByRole("link");
      await expect(link).toHaveAttribute("href", course.certificateUrl);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener");
      const name = `${OPEN_CERT}, ${text(locale, "courses.destination").replace("{title}", course.title)} (${text(locale, "links.newTab")})`;
      await expect(link).toHaveAccessibleName(
        new RegExp(`^${escapeRegExp(name).replace(",", " ?,")}$`),
      );
    }
  }

  // The PDFs hosted by this site are fetched from the local build, never from production.
  for (const course of entries<Course>("courses", "en")) {
    const url = new URL(course.certificateUrl);
    if (url.host !== "todsdev.github.io") continue;
    const response = await page.request.get(url.pathname);
    expect(response.status(), url.pathname).toBe(200);
    expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
  }
});

test("S7: Contact lines come in order and the phone line fills in at runtime", async ({
  page,
}) => {
  // The loader never reads the protected value or url (only support/phone.ts reads the number).
  for (const contact of contacts()) {
    expect(Object.keys(contact).sort()).toEqual(["kind", "label", "order"]);
  }
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const lines = page.locator("#contact .contact");
    await expect(lines).toHaveCount(contacts().length);
    for (const [i, contact] of contacts().entries()) {
      const line = lines.nth(i);
      await expect(line).toHaveAttribute("data-kind", contact.kind);
      await expect(line.locator(".contact__label")).toHaveText(
        localized(contact.label, locale),
      );
      // The hidden destinations hold values (the phone's too), so only the commands are read.
      const actions = actionsFor(contact.kind as ContactKind);
      const controls = line.locator(".contact__action");
      await expect(controls).toHaveCount(actions.length);
      for (const [j, action] of actions.entries()) {
        await expect(controls.nth(j)).toContainText(`$ ${action.command}`);
      }
    }

    // The phone line holds a number once decoded, without asserting which one.
    const value = page.locator('#contact [data-kind="phone"] .contact__value');
    await expect
      .poll(
        async () =>
          ((await value.textContent()) ?? "").replace(/\D/g, "").length,
      )
      .toBeGreaterThanOrEqual(10);
    await expect(page.locator("#contact .contact__nojs").first()).toBeHidden();
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("S7: the phone line shows the note instead of a number", async ({
    page,
  }) => {
    await page.goto("/");
    const phone = page.locator('#contact [data-kind="phone"]');
    await expect(phone.locator(".contact__nojs")).toBeVisible();
    await expect(phone.locator(".contact__nojs")).toContainText(
      text("en", "contact.noJs"),
    );
    const filled = await phone
      .locator("[data-fill=value]")
      .evaluateAll((els) => els.map((el) => el.textContent));
    expect(new Set(filled)).toEqual(new Set([""]));
  });
});

test("S8: the footer has the credit, year, build date, privacy link and terminal hint", async ({
  page,
  isMobile,
}) => {
  const { name } = profile();
  const [{ sourceUrl }] = entries<{ sourceUrl: string }>("profile", "en");
  for (const locale of locales) {
    await page.goto(localePath(locale));
    const footer = page.locator(".site-footer");

    const credit = footer.getByRole("link", {
      name: text(locale, "footer.builtWith"),
    });
    await expect(credit).toHaveAttribute("href", sourceUrl);
    await expect(credit).toHaveAttribute("target", "_blank");

    const built = footer.locator("time");
    const date = await built.getAttribute("datetime");
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const year = date!.slice(0, 4);
    await expect(footer).toContainText(
      text(locale, "footer.copyright")
        .replace("{year}", year)
        .replace("{name}", name),
    );
    await expect(footer).toContainText(text(locale, "footer.lastBuild"));

    const privacy = footer.getByRole("link", {
      name: text(locale, "footer.analytics"),
    });
    await expect(privacy).toHaveAttribute("href", UMAMI_PRIVACY);
    await expect(privacy).toHaveAttribute("target", "_blank");

    if (isMobile) {
      await expect(
        footer.getByRole("button", { name: text(locale, "terminal.open") }),
      ).toBeVisible();
    } else {
      const [before = "", after = ""] = text(locale, "terminal.hint").split(
        "{key}",
      );
      await expect(footer.locator(".term-hint__text")).toContainText(
        before.trim(),
      );
      await expect(footer.locator(".term-hint__text")).toContainText(
        after.trim(),
      );
      await expect(footer.locator(".term-hint__key")).toHaveText("/");
    }
  }
});

/** The fill of the scroll thread, as a fraction of its track. */
const threadDrawn = (page: Page) =>
  page.evaluate(() => {
    const track = document
      .querySelector(".scroll-thread__track")!
      .getBoundingClientRect();
    const fill = document
      .querySelector(".scroll-thread__fill")!
      .getBoundingClientRect();
    return fill.height / track.height;
  });

test("S9: scrolling reveals every section and draws the thread, without overflow or errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  expect(await threadDrawn(page)).toBeLessThan(0.1);

  for (const id of sectionIds) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  }
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );

  const sections = page.locator("[data-reveal]");
  await expect(sections.locator("visible=true")).toHaveCount(
    await sections.count(),
  );
  await expect(page.locator("[data-reveal]:not(.is-visible)")).toHaveCount(0);
  await expect.poll(() => threadDrawn(page)).toBeGreaterThan(0.99);
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test.describe("without JavaScript, everything is visible", () => {
  test.use({ javaScriptEnabled: false });

  test("S10: the sections show and the thread is drawn", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/no-js/);
    const opacities = await page
      .locator("[data-reveal]")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    expect(opacities.length).toBe(sectionIds.length);
    expect(new Set(opacities)).toEqual(new Set(["1"]));
    expect(await threadDrawn(page)).toBeGreaterThan(0.99);
  });
});
