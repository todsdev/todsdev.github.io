/**
 * Contact line logic: actions per kind, the phone encoding, the WhatsApp URL and the
 * vCard text. Pure and runtime-import-free so it runs under `node --test` (contact.test.ts).
 */

export type ContactKind =
  | "email"
  | "phone"
  | "whatsapp"
  | "linkedin"
  | "github"
  | "instagram"
  | "other";

/** Kinds whose value and url never appear readable in the HTML (assembled at runtime). */
export const PROTECTED_KINDS: readonly ContactKind[] = ["phone", "whatsapp"];

export const isProtected = (kind: ContactKind) =>
  PROTECTED_KINDS.includes(kind);

/** Terminal commands, shown after "$ ". Commands stay in English in every locale. */
export const COMMANDS = {
  mail: "mail",
  call: "call",
  copy: "copy",
  chat: "chat",
  open: "open",
  vcard: "wget contact.vcf",
  resume: "wget resume.pdf",
} as const;

/** Key of `contact.destination.*` naming where an action goes. */
export type Destination =
  "mail" | "call" | "copy" | "chat" | "linkedin" | "github" | "instagram";

export interface ContactAction {
  command: string;
  /** "link" opens the contact's url; "copy" copies its value. */
  type: "link" | "copy";
  destination: Destination;
  /** External links open in a new tab. */
  external: boolean;
}

const link = (
  command: string,
  destination: Destination,
  external: boolean,
): ContactAction => ({ command, type: "link", destination, external });
const copy: ContactAction = {
  command: COMMANDS.copy,
  type: "copy",
  destination: "copy",
  external: false,
};

/** Actions per kind, in display order. */
export function actionsFor(kind: ContactKind): ContactAction[] {
  switch (kind) {
    case "email":
      return [link(COMMANDS.mail, "mail", false), copy];
    case "phone":
      return [link(COMMANDS.call, "call", false), copy];
    case "whatsapp":
      return [link(COMMANDS.chat, "chat", true)];
    case "linkedin":
    case "github":
    case "instagram":
      return [link(COMMANDS.open, kind, true)];
    case "other":
      return [];
  }
}

/**
 * Reversible encoding for protected values: base64 of the reversed string, so no digit
 * run of the number appears in the HTML. Not secrecy — it only defeats pattern scrapers.
 * The page's inline decoder (Contact.astro) mirrors `decode`: atob, then reverse.
 */
export function encode(value: string): string {
  return btoa([...value].reverse().join(""));
}

export function decode(encoded: string): string {
  return [...atob(encoded)].reverse().join("");
}

/** WhatsApp link with a prefilled message. */
export function whatsappUrl(url: string, text: string): string {
  return `${url}?text=${encodeURIComponent(text)}`;
}

export interface VCardFields {
  name: string;
  role: string;
  email: string;
  website: string;
  linkedin?: string;
  github?: string;
  /** E.164 phone, added at runtime only (never in the static file). */
  tel?: string;
}

/** Escapes text values per vCard 3.0 (RFC 2426). */
const esc = (v: string) =>
  v.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");

/** vCard 3.0 text with CRLF line endings. */
export function vcard(f: VCardFields): string {
  const parts = f.name.trim().split(/\s+/);
  const family = parts.length > 1 ? parts.at(-1) : "";
  const given = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0];
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(family ?? "")};${esc(given ?? "")};;;`,
    `FN:${esc(f.name)}`,
    `TITLE:${esc(f.role)}`,
    `EMAIL;TYPE=INTERNET:${f.email}`,
    ...(f.tel ? [`TEL;TYPE=CELL:${f.tel}`] : []),
    `URL:${f.website}`,
    ...(f.linkedin ? [`URL;TYPE=LinkedIn:${f.linkedin}`] : []),
    ...(f.github ? [`URL;TYPE=GitHub:${f.github}`] : []),
    "END:VCARD",
  ];
  return lines.join("\r\n") + "\r\n";
}

/**
 * Adds the phone to a static vCard, right after EMAIL (where `vcard({ tel })` puts it).
 * Used by the page's download handler.
 */
export function withTel(card: string, tel: string): string {
  return card.replace(/(EMAIL[^\r\n]*\r\n)/, `$1TEL;TYPE=CELL:${tel}\r\n`);
}
