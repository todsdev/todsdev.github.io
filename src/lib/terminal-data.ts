/**
 * The terminal's per-locale data file (`terminal.json`): what the content commands print,
 * built from the same collections and dictionaries as the page, plus the locale's
 * `terminal` strings. Protected contact kinds (phone, WhatsApp) carry only their kind and
 * label: the shell decodes their values from the contact section, so the number never
 * appears in this file.
 */
import type { APIRoute } from "astro";
import { locales, months, t, type Locale } from "../i18n";
import { en } from "../i18n/en";
import { es } from "../i18n/es";
import { ptBr } from "../i18n/pt-br";
import { isProtected, type ContactKind } from "./contact";
import { getEntries } from "./content";
import { sortCourses } from "./courses";
import { formatMonth, formatPeriod } from "./period";
import { sortProjects } from "./projects";
import { resumeFor } from "./resume";
import { sectionIds } from "./sections";
import { terminalContacts, type TerminalData } from "./terminal";

const strings = { en: en.terminal, "pt-br": ptBr.terminal, es: es.terminal };

export async function terminalData(locale: Locale): Promise<TerminalData> {
  const [profile] = await getEntries("profile", locale);
  if (!profile) throw new Error("src/content/profile must contain one entry");
  const monthNames = months(locale);
  const present = t(locale, "time.present");
  const contacts = await getEntries("contacts", locale);
  const email = contacts.find((c) => c.kind === "email")?.value;
  if (!email) throw new Error("contacts must include an email entry");
  const resume = resumeFor(locale);

  return {
    strings: strings[locale],
    sections: sectionIds.filter((id) => id !== "hero"),
    profile: {
      name: profile.name,
      role: profile.role,
      location: profile.location,
      summary: profile.summary,
      sourceUrl: profile.sourceUrl,
    },
    experience: (await getEntries("experience", locale)).map((e) => {
      const { start, end } = formatPeriod(e.start, e.end, monthNames, present);
      return {
        period: `${start.text} – ${end.text}`,
        company: e.company,
        role: e.role,
      };
    }),
    projects: sortProjects(await getEntries("projects", locale)).map((p) => ({
      title: p.title,
      status:
        p.status === "live"
          ? t(locale, "terminal.live")
          : t(locale, "projects.building"),
      badge:
        t(locale, `projects.ownership.${p.ownership}`) +
        (p.via
          ? ` · ${t(locale, "projects.via").replace("{name}", p.via)}`
          : ""),
    })),
    skills: (await getEntries("skills", locale)).map((s) => ({
      category: s.category,
      items: s.items,
    })),
    certs: sortCourses(await getEntries("courses", locale)).map((c) => ({
      date: formatMonth(c.date, monthNames),
      title: c.title,
      issuer: c.issuer,
    })),
    contacts: terminalContacts(contacts, (kind) =>
      isProtected(kind as ContactKind),
    ),
    resume: { href: resume.href, file: resume.file, language: resume.locale },
    email,
    languages: Object.fromEntries(
      locales.map((l) => [l, t(locale, `language.${l}`)]),
    ),
  };
}

/** Endpoint handler for a locale's terminal.json. */
export const terminalRoute =
  (locale: Locale): APIRoute =>
  async () =>
    new Response(JSON.stringify(await terminalData(locale)), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
