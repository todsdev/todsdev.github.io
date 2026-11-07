import { sectionIds } from "../../src/lib/sections";
import { projectActions, sortProjects } from "../../src/lib/projects";
import {
  entries,
  localePath,
  locales,
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
