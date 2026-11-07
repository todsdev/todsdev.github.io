/**
 * What search engines and link previews read: absolute URLs, Open Graph and Twitter tags,
 * the sitemap, robots.txt and the JSON-LD `Person`. Pure and runtime-import-free so it runs
 * under `node --test` (seo.test.ts); BaseLayout renders the tags and the static endpoints
 * serve the files. The phone number can't reach any of it: the JSON-LD is built from named
 * fields only and `sameAs` is selected by contact kind.
 */
import type { Locale } from "../i18n";

export const SITE_URL = "https://todsdev.github.io";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** `og:locale` values, and the order of locales in the sitemap and the alternates. */
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  "pt-br": "pt_BR",
  es: "es_ES",
};
const LOCALES = Object.keys(OG_LOCALE) as Locale[];

/** `hreflang` value per locale; `x-default` is the English page. */
const HREFLANG: Record<Locale, string> = {
  en: "en",
  "pt-br": "pt-BR",
  es: "es",
};

/** Canonical URL of a locale's home, as GitHub Pages serves it (trailing slash). */
export const pageUrl = (locale: Locale) =>
  `${SITE_URL}${locale === "en" ? "/" : `/${locale}/`}`;

export const imageUrl = (locale: Locale) => `${SITE_URL}/og/${locale}.png`;

export interface Meta {
  /** Attribute name: Open Graph tags use `property`, Twitter tags and the rest use `name`. */
  attr: "property" | "name";
  key: string;
  content: string;
}

export interface ShareInput {
  title: string;
  description: string;
  imageAlt: string;
}

/** Open Graph and Twitter tags of a locale page. */
export function shareTags(locale: Locale, input: ShareInput): Meta[] {
  const { title, description, imageAlt } = input;
  const og = (key: string, content: string): Meta => ({
    attr: "property",
    key,
    content,
  });
  const tw = (key: string, content: string): Meta => ({
    attr: "name",
    key,
    content,
  });
  return [
    og("og:title", title),
    og("og:description", description),
    og("og:url", pageUrl(locale)),
    og("og:type", "website"),
    og("og:locale", OG_LOCALE[locale]),
    ...LOCALES.filter((l) => l !== locale).map((l) =>
      og("og:locale:alternate", OG_LOCALE[l]),
    ),
    og("og:image", imageUrl(locale)),
    og("og:image:width", String(OG_IMAGE_WIDTH)),
    og("og:image:height", String(OG_IMAGE_HEIGHT)),
    og("og:image:alt", imageAlt),
    tw("twitter:card", "summary_large_image"),
    tw("twitter:title", title),
    tw("twitter:description", description),
    tw("twitter:image", imageUrl(locale)),
    tw("twitter:image:alt", imageAlt),
  ];
}

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** `/sitemap.xml`: the locale homes, each with the `xhtml:link` alternates. The 404 page is not listed. */
export function sitemapXml(): string {
  const alternates = [
    ...LOCALES.map((l) => ({ hreflang: HREFLANG[l], href: pageUrl(l) })),
    { hreflang: "x-default", href: pageUrl("en") },
  ]
    .map(
      (a) =>
        `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${escapeXml(a.href)}"/>`,
    )
    .join("\n");
  const urls = LOCALES.map(
    (l) =>
      `  <url>\n    <loc>${escapeXml(pageUrl(l))}</loc>\n${alternates}\n  </url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

/** `/robots.txt`: everything allowed, pointing to the absolute sitemap URL. */
export const robotsTxt = () =>
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

export interface ContactLink {
  kind: string;
  url: string;
}

/** Kinds that belong in the JSON-LD `sameAs`, in this order. Never phone or WhatsApp. */
const SAME_AS_KINDS = ["linkedin", "github", "instagram"];

export interface PersonInput {
  locale: Locale;
  name: string;
  jobTitle: string;
  contacts: readonly ContactLink[];
}

/** The JSON-LD `Person`, built from named fields only (no `telephone`). */
export function personJsonLd(input: PersonInput) {
  const { locale, name, jobTitle, contacts } = input;
  const email = contacts.find((c) => c.kind === "email")?.url;
  if (!email) throw new Error("contacts must include an email entry");
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle,
    url: pageUrl(locale),
    email: email.replace(/^mailto:/, ""),
    sameAs: SAME_AS_KINDS.flatMap((kind) =>
      contacts.filter((c) => c.kind === kind).map((c) => c.url),
    ),
  };
}

/** JSON for a `<script type="application/ld+json">`: `<` is escaped so content can't close the element. */
export const jsonLdScript = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
