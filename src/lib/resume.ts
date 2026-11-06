/**
 * The résumé served for a locale: `public/resume/resume-<locale>.pdf`, falling back to
 * English when that file is missing. Build-time only (reads the file system); shared by
 * the contact section and the terminal data so both always offer the same file.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "../i18n";

export interface Resume {
  /** Language of the file served, after fallback. */
  locale: Locale;
  href: string;
  file: string;
}

export function resumeFor(locale: Locale): Resume {
  const has = existsSync(
    join(process.cwd(), "public", "resume", `resume-${locale}.pdf`),
  );
  const served: Locale = has ? locale : "en";
  const file = `resume-${served}.pdf`;
  return { locale: served, href: `/resume/${file}`, file };
}
