/** The locale homes with their hreflang alternates (src/lib/seo.ts). */
import type { APIRoute } from "astro";
import { sitemapXml } from "../lib/seo";

export const GET: APIRoute = () =>
  new Response(sitemapXml(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
