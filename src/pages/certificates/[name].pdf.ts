/**
 * Publishes the hosted certificate PDFs (kept in src/content/courses/certificates/) at
 * /certificates/<name>.pdf, only while the profile's `courses.enabled` is true. With it off
 * there are no paths, so the files never reach `dist/`. The bytes are served unchanged.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getEntries } from "../../lib/content";

const DIR = join(process.cwd(), "src", "content", "courses", "certificates");

export const getStaticPaths = (async () => {
  const [profile] = await getEntries("profile", "en");
  if (!profile) throw new Error("src/content/profile must contain one entry");
  if (!profile.courses.enabled) return [];
  return readdirSync(DIR)
    .filter((file) => file.endsWith(".pdf"))
    .map((file) => ({ params: { name: file.replace(/\.pdf$/, "") } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(new Uint8Array(readFileSync(join(DIR, `${params.name}.pdf`))), {
    headers: { "Content-Type": "application/pdf" },
  });
