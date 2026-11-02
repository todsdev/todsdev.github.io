/**
 * Pure translation-fallback logic for translatable content fields.
 *
 * Deliberately free of runtime imports (type-only imports are erased), so it can
 * run under Node's built-in test runner without Astro. See localize.test.ts.
 */
import type { Locale } from "../i18n";

const DEFAULT_LOCALE = "en" satisfies Locale;

/** Locale keys a translatable field may carry. */
const LOCALE_KEYS = ["en", "pt-br", "es"] as const satisfies readonly Locale[];

// Compile-time guard: LOCALE_KEYS must list every Locale.
type MissingLocales = Exclude<Locale, (typeof LOCALE_KEYS)[number]>;
const _allLocalesListed: [MissingLocales] extends [never] ? true : never = true;
void _allLocalesListed;

export type LocalizedValue<T = unknown> = { en: T } & Partial<
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

export interface FallbackContext {
  collection: string;
  id: string;
  field: string;
}

export type WarnSink = (message: string) => void;

const reported = new Set<string>();

/** Forget which fallbacks were already reported (for tests). */
export function resetFallbackWarnings(): void {
  reported.clear();
}

function isLocalizedValue(value: unknown): value is LocalizedValue {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value) || value instanceof Date) return false;
  const keys = Object.keys(value);
  return (
    keys.includes("en") &&
    keys.every((k) => (LOCALE_KEYS as readonly string[]).includes(k))
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
  warn: WarnSink = console.warn,
): T {
  const translated = value[locale as keyof typeof value] as T | undefined;
  if (translated !== undefined) return translated;
  if (locale !== DEFAULT_LOCALE) {
    const message = `[content] missing ${locale} translation: ${ctx.collection}/${ctx.id}.${ctx.field} → using en`;
    if (!reported.has(message)) {
      reported.add(message);
      warn(message);
    }
  }
  return value.en;
}

/** Recursively localizes every translatable field inside `value`. */
export function localizeDeep(
  value: unknown,
  locale: Locale,
  ctx: FallbackContext,
  warn: WarnSink = console.warn,
): unknown {
  if (isLocalizedValue(value)) return localize(value, locale, ctx, warn);
  if (Array.isArray(value)) {
    return value.map((item, i) =>
      localizeDeep(item, locale, { ...ctx, field: `${ctx.field}[${i}]` }, warn),
    );
  }
  if (typeof value === "object" && value !== null && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [
        key,
        localizeDeep(
          v,
          locale,
          { ...ctx, field: ctx.field ? `${ctx.field}.${key}` : key },
          warn,
        ),
      ]),
    );
  }
  return value;
}
