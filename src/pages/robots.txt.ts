/** Allows all crawlers and points to the sitemap (src/lib/seo.ts). */
import type { APIRoute } from "astro";
import { robotsTxt } from "../lib/seo";

export const GET: APIRoute = () =>
  new Response(robotsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
