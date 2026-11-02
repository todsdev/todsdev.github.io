import {
  getCollection,
  type CollectionEntry,
  type CollectionKey,
} from "astro:content";
import type { Locale } from "../i18n";
import { localizeDeep, type Localized } from "./localize";

export type { Localized } from "./localize";

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

export type LocalizedEntry<C extends CollectionKey> = {
  id: string;
} & Localized<CollectionEntry<C>["data"]>;

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
