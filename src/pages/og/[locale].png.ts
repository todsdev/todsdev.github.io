/** One share image per locale: /og/en.png, /og/pt-br.png, /og/es.png (src/lib/og-image.ts). */
import type { APIRoute, GetStaticPaths } from "astro";
import { locales, type Locale } from "../../i18n";
import { getEntries } from "../../lib/content";
import { ogImage } from "../../lib/og-image";

export const getStaticPaths = (() =>
  locales.map((locale) => ({ params: { locale } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const locale = params.locale as Locale;
  const [profile] = await getEntries("profile", locale);
  if (!profile) throw new Error("src/content/profile must contain one entry");
  return new Response(await ogImage(locale, profile.name), {
    headers: { "Content-Type": "image/png" },
  });
};
