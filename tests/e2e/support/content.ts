import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import {
  langCode,
  localePath,
  locales,
  shortCode,
  t,
  type Locale,
  type TranslationKey,
} from "../../../src/i18n";

export { langCode, localePath, locales, shortCode, type Locale };

/** The production origin, as absolute URLs in the built pages use it. */
export const SITE = "https://todsdev.github.io";

/** A dictionary string, so expectations come from the same source as the page's text. */
export const text = (locale: Locale, key: TranslationKey): string =>
  t(locale, key);

/** A localized field with the English fallback the site uses. */
export const localized = (
  field: Partial<Record<Locale, string>> & { en: string },
  locale: Locale,
): string => field[locale] ?? field.en;

type Entry = Record<string, unknown> & { id: string };

/** Every entry of a content collection, parsed from its YAML, with the file name as `id`. */
export function collection(name: string): Entry[] {
  const dir = join(process.cwd(), "src", "content", name);
  return readdirSync(dir)
    .filter((file) => file.endsWith(".yaml"))
    .sort()
    .map((file) => ({
      id: file.replace(/\.yaml$/, ""),
      ...(parse(readFileSync(join(dir, file), "utf8")) as object),
    }));
}

export interface Contact {
  kind: string;
  label: Partial<Record<Locale, string>> & { en: string };
  order: number;
}

/**
 * The contact lines, in display order. Only the kind, label and order are returned: the
 * protected `value` and `url` are never read out of this loader (see support/phone.ts).
 */
export function contacts(): Contact[] {
  return collection("contacts")
    .map(({ kind, label, order }) => ({ kind, label, order }) as Contact)
    .sort((a, b) => a.order - b.order);
}

/** The profile's name and English role (the hero always shows the role in English). */
export function profile(): { name: string; role: string } {
  const [entry] = collection("profile") as unknown as {
    name: string;
    role: { en: string };
  }[];
  return { name: entry!.name, role: entry!.role.en };
}
