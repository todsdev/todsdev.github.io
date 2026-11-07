import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

/**
 * The phone number check. This is the only file that reads `2-phone.yaml`, at test time, so
 * no test, fixture or workflow holds a copy of the number. Everything that leaves this file
 * (findings, messages) is masked: a file, the form found and its shape with every digit
 * replaced by `#`. Never pass a regex or file text to `expect`, because Playwright prints both
 * when an assertion fails, and CI logs and reports are public.
 */

/** The separators the live check (`seo-phone`) tolerates between digits. */
const SEP = "[\\s\\u00a0\\-.()+_]*";

/** The digits of the number in the contact content. */
export function phoneDigits(): string {
  const file = join(
    process.cwd(),
    "src",
    "content",
    "contacts",
    "2-phone.yaml",
  );
  const { value } = parse(readFileSync(file, "utf8")) as { value: string };
  return value.replace(/\D/g, "");
}

/** The ways the number can appear: with the country code, with the area code, without both. */
export const forms = (digits: string) => ({
  international: digits,
  national: digits.slice(2),
  subscriber: digits.slice(4),
});

export type Form = keyof ReturnType<typeof forms>;

const spaced = (digits: string) => new RegExp([...digits].join(SEP));
const mask = (shown: string) => shown.replace(/\d/g, "#");

/** The first form of `digits` found in `text`, as its name and masked shape. */
export function findNumber(
  text: string,
  digits: string,
): { form: Form; shape: string } | undefined {
  for (const [form, value] of Object.entries(forms(digits)) as [
    Form,
    string,
  ][]) {
    const found = spaced(value).exec(text);
    if (found) return { form, shape: mask(found[0]) };
  }
  return undefined;
}

/** The built pages and `terminal.json` files that must hold no number. */
export const SCANNED = [
  "index.html",
  "pt-br/index.html",
  "es/index.html",
  "404.html",
  "terminal.json",
  "pt-br/terminal.json",
  "es/terminal.json",
];

export interface Scan {
  /** Digits in the number read from the content; a real number has at least 11. */
  length: number;
  /** How many of the expected files were read. */
  read: number;
  /** One masked line per problem: the file, what was found and its shape. */
  findings: string[];
}

export function scanDist(dist: string): Scan {
  const digits = phoneDigits();
  const findings: string[] = [];
  let read = 0;
  for (const file of SCANNED) {
    const path = join(dist, file);
    if (!existsSync(path)) {
      findings.push(`${file}: missing from the scan`);
      continue;
    }
    read++;
    const text = readFileSync(path, "utf8");
    const found = findNumber(text, digits);
    if (found) {
      findings.push(`${file}: ${found.form} form, shape ${found.shape}`);
    }
    for (const link of ["tel:", "wa.me/"]) {
      if (text.includes(link)) findings.push(`${file}: ${link} link`);
    }
  }
  return { length: digits.length, read, findings };
}
