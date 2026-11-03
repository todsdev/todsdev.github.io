/**
 * Project card logic: order, terminal actions and the ownership note. Pure and
 * runtime-import-free so it runs under `node --test` (projects.test.ts).
 */
import type { Locale } from "../i18n";

export type ActionKind = "playStore" | "appStore" | "site" | "repo";

/** Terminal commands, shown after "$ ". Commands stay in English in every locale. */
export const COMMANDS: Record<ActionKind, string> = {
  playStore: "open play-store",
  appStore: "open app-store",
  site: "open site",
  repo: "open repo",
};

export interface ProjectLinks {
  status: "live" | "building";
  url?: string;
  repoUrl?: string;
  stores?: { playStore?: string; appStore?: string };
}

export interface Action {
  kind: ActionKind;
  command: string;
  href: string;
}

/** Featured projects first; otherwise keeps the incoming (`order`) order. */
export function sortProjects<T extends { featured?: boolean }>(
  projects: readonly T[],
): T[] {
  return [...projects].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  );
}

/**
 * One action per defined link: play-store, app-store, site, repo. Building
 * projects drop their store actions (they show a status line instead).
 */
export function projectActions(project: ProjectLinks): Action[] {
  const building = project.status === "building";
  const hrefs: Record<ActionKind, string | undefined> = {
    playStore: building ? undefined : project.stores?.playStore,
    appStore: building ? undefined : project.stores?.appStore,
    site: project.url,
    repo: project.repoUrl,
  };
  return (Object.keys(COMMANDS) as ActionKind[]).flatMap((kind) => {
    const href = hrefs[kind];
    return href ? [{ kind, command: COMMANDS[kind], href }] : [];
  });
}

export interface NoteProject {
  title: string;
  ownership: "contributor" | "owner";
  owner?: string;
  via?: string;
}

export interface NoteTemplates {
  /** `{app}`, `{owner}`, `{through}`. */
  one: string;
  /** `{apps}`, `{owner}`, `{through}`. */
  other: string;
  /** `{via}`; replaces `{through}` when the group has a `via` company. */
  through: string;
}

/** List-format locales: en-GB has no serial comma ("A, B and C"). */
const LIST_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  "pt-br": "pt-BR",
  es: "es",
};

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);

/**
 * Ownership note sentences, one per owner/via group of contributor projects,
 * groups and titles in the given (card) order. Empty when there are no contributors.
 */
export function ownershipNotes(
  projects: readonly NoteProject[],
  locale: Locale,
  templates: NoteTemplates,
): string[] {
  const groups = new Map<
    string,
    { owner: string; via?: string; titles: string[] }
  >();
  for (const project of projects) {
    if (project.ownership !== "contributor" || !project.owner) continue;
    const key = JSON.stringify([project.owner, project.via ?? null]);
    const group = groups.get(key) ?? {
      owner: project.owner,
      via: project.via,
      titles: [],
    };
    group.titles.push(project.title);
    groups.set(key, group);
  }
  const list = new Intl.ListFormat(LIST_LOCALE[locale], {
    type: "conjunction",
  });
  const plural = new Intl.PluralRules(LIST_LOCALE[locale]);
  return [...groups.values()].map(({ owner, via, titles }) => {
    const apps = list.format(titles);
    const one = plural.select(titles.length) === "one";
    return fill(one ? templates.one : templates.other, {
      app: apps,
      apps,
      owner,
      through: via ? fill(templates.through, { via }) : "",
    });
  });
}
