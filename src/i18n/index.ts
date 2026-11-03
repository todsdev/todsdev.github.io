import { en, type Dictionary } from "./en";
import { es } from "./es";
import { ptBr } from "./pt-br";

export const locales = ["en", "pt-br", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const dictionaries: Record<Locale, Dictionary> = { en, "pt-br": ptBr, es };

/** BCP 47 tags for `<html lang>` and `hreflang`. Owned here, not derived from Astro. */
export const langCode: Record<Locale, string> = {
  en: "en",
  "pt-br": "pt-BR",
  es: "es",
};

/** Short code shown in the language switcher. */
export const shortCode: Record<Locale, string> = {
  en: "EN",
  "pt-br": "PT",
  es: "ES",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}

type Path<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends readonly unknown[]
      ? never // arrays (e.g. time.months) have their own accessors
      : `${K}.${Path<T[K]>}`;
}[keyof T & string];

/** Every valid dot-path key into the dictionaries, e.g. `"nav.about"`. */
export type TranslationKey = Path<Dictionary>;

export function t(locale: Locale, key: TranslationKey): string {
  let node: unknown = dictionaries[locale];
  for (const part of key.split(".")) {
    node = (node as Record<string, unknown>)[part];
  }
  return node as string;
}

type LocalePrefix<L extends Locale> = L extends "en" ? "/" : `/${L}/`;

/** Root URL path for a locale, optionally with a hash: `localePath("pt-br", "#about")` → `/pt-br/#about`. */
export function localePath<L extends Locale, H extends `#${string}` | "" = "">(
  locale: L,
  hash?: H,
): `${LocalePrefix<L>}${H}` {
  const prefix = locale === "en" ? "/" : `/${locale}/`;
  return `${prefix}${hash ?? ""}` as `${LocalePrefix<L>}${H}`;
}

/** Month abbreviations for a locale, January first. */
export function months(locale: Locale): readonly string[] {
  return dictionaries[locale].time.months;
}
