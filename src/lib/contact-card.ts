/**
 * The locale's static vCard (no phone), built from the profile and contacts collections.
 * Served by the contact.vcf endpoints; the page adds the phone at download time.
 */
import type { APIRoute } from "astro";
import { localePath, type Locale } from "../i18n";
import { vcard } from "./contact";
import { getEntries } from "./content";

export async function contactCard(locale: Locale, site: URL): Promise<string> {
  const [profile] = await getEntries("profile", locale);
  if (!profile) throw new Error("src/content/profile must contain one entry");
  const contacts = await getEntries("contacts", locale);
  const url = (kind: string) => contacts.find((c) => c.kind === kind)?.url;
  const email = contacts.find((c) => c.kind === "email")?.value;
  if (!email)
    throw new Error("contacts must include an email entry for the vCard");
  return vcard({
    name: profile.name,
    role: profile.role,
    email,
    website: new URL(localePath(locale), site).href,
    linkedin: url("linkedin"),
    github: url("github"),
  });
}

/** Endpoint handler for a locale's contact.vcf. */
export const cardRoute =
  (locale: Locale): APIRoute =>
  async ({ site }) =>
    new Response(
      await contactCard(locale, site ?? new URL("https://todsdev.github.io")),
      {
        headers: { "Content-Type": "text/vcard; charset=utf-8" },
      },
    );
