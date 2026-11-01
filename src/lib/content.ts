import {
  getCollection,
  type CollectionEntry,
  type CollectionKey,
} from "astro:content";
import { defaultLocale, locales, type Locale } from "../i18n";

const collectionKeys = [
  "profile",
  "contacts",
  "experience",
  "projects",
  "skills",
  "courses",
  "education",
  "languages",
] as const satisfies readonly CollectionKey[];

type LocalizedValue<T = unknown> = { en: T } & Partial<
  Record<Exclude<Locale, "en">, T>
>;

/** Replaces every `{ en, pt-br?, es? }` object in T with its value type. */
export type Localized<T> =
  T extends LocalizedValue<infer U>
    ? U
    : T extends Date
      ? T
      : T extends readonly (infer E)[]
        ? Localized<E>[]
        : T extends object
          ? { [K in keyof T]: Localized<T[K]> }
          : T;

export type LocalizedEntry<C extends CollectionKey> = {
  id: string;
} & Localized<CollectionEntry<C>["data"]>;

interface FallbackContext {
  collection: string;
  id: string;
  field: string;
}

const reported = new Set<string>();

function isLocalizedValue(value: unknown): value is LocalizedValue {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value) || value instanceof Date) return false;
  const keys = Object.keys(value);
  return (
    keys.includes("en") &&
    keys.every((k) => (locales as readonly string[]).includes(k))
  );
}

/**
 * Picks the requested locale from a translatable field, falling back to English.
 * A fallback emits a build warning (once per collection/entry/field/locale); it never throws.
 */
export function localize<T>(
  value: LocalizedValue<T>,
  locale: Locale,
  ctx: FallbackContext,
): T {
  const translated = value[locale as keyof typeof value] as T | undefined;
  if (translated !== undefined) return translated;
  if (locale !== defaultLocale) {
    const message = `[content] missing ${locale} translation: ${ctx.collection}/${ctx.id}.${ctx.field} → using en`;
    if (!reported.has(message)) {
      reported.add(message);
      console.warn(message);
    }
  }
  return value.en;
}

function localizeDeep(
  value: unknown,
  locale: Locale,
  ctx: FallbackContext,
): unknown {
  if (isLocalizedValue(value)) return localize(value, locale, ctx);
  if (Array.isArray(value)) {
    return value.map((item, i) =>
      localizeDeep(item, locale, { ...ctx, field: `${ctx.field}[${i}]` }),
    );
  }
  if (typeof value === "object" && value !== null && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [
        key,
        localizeDeep(v, locale, {
          ...ctx,
          field: ctx.field ? `${ctx.field}.${key}` : key,
        }),
      ]),
    );
  }
  return value;
}

/**
 * Visible entries of a collection for a locale: `hidden` entries removed,
 * sorted by `order` ascending (entries without `order` last, then by id),
 * with every translatable field resolved to a string.
 */
export async function getEntries<C extends CollectionKey>(
  collection: C,
  locale: Locale,
): Promise<LocalizedEntry<C>[]> {
  const entries = (await getCollection(collection)) as CollectionEntry<C>[];
  return entries
    .filter((entry) => !(entry.data as { hidden?: boolean }).hidden)
    .sort((a, b) => {
      const oa = (a.data as { order?: number }).order ?? Infinity;
      const ob = (b.data as { order?: number }).order ?? Infinity;
      return oa - ob || a.id.localeCompare(b.id);
    })
    .map(
      (entry) =>
        ({
          id: entry.id,
          ...(localizeDeep(entry.data, locale, {
            collection,
            id: entry.id,
            field: "",
          }) as object),
        }) as LocalizedEntry<C>,
    );
}

/**
 * Resolves every visible entry of every collection for `locale`, so missing
 * translations are reported in the build log even before sections render data.
 */
export async function reportMissingTranslations(locale: Locale): Promise<void> {
  await Promise.all(collectionKeys.map((key) => getEntries(key, locale)));
}
