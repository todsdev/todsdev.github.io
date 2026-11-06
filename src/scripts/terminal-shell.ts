/**
 * Terminal shell, loaded by ./terminal on the first opening with the locale's terminal.json.
 * Runs commands (src/lib/terminal.ts formats their output), keeps the history, completes
 * with Tab and reports each command through track(). Output is always plain text.
 */
import { terminalCommand } from "../lib/analytics";
import { decode } from "../lib/contact";
import {
  KNOWN,
  PROMPT,
  complete,
  fill,
  formatCerts,
  formatContact,
  formatExperience,
  formatHelp,
  formatHistory,
  formatLs,
  formatProjects,
  formatSkills,
  formatWhoami,
  parse,
  sectionArg,
  suggest,
  type Line,
  type TerminalData,
} from "../lib/terminal";
import { PREFERRED_LOCALE_KEY } from "../lib/storage-keys";
import type { Host } from "./terminal";
import { track } from "./track";

export interface Shell {
  /** Runs one submitted line. */
  run(line: string): void;
  /** Tab in the input. */
  complete(): void;
  /** ↑ (-1) and ↓ (1) in the input. */
  recall(step: -1 | 1): void;
  /** Esc: true when the shell used it (so the dialog stays open). */
  cancel(): boolean;
  /** Any keydown in the dialog: true when the shell used it. */
  intercept(event: KeyboardEvent): boolean;
}

/** `lang` arguments → locale. */
const LANGS: Record<string, string> = { en: "en", pt: "pt-br", es: "es" };

/** Oldest lines are dropped beyond this, so a long session stays light. */
const MAX_LINES = 500;

type Handler = (args: string[]) => void;

export function start(host: Host, data: TerminalData): Shell {
  const s = data.strings;
  const { input, log } = host;
  const history: string[] = [];
  let recallAt = 0;

  function print(lines: readonly Line[]): void {
    for (const line of lines) host.print(line.text, line.tone);
    while (log.childElementCount > MAX_LINES) log.firstElementChild?.remove();
  }
  const say = (text: string, tone?: Line["tone"]) => print([{ text, tone }]);
  const usage = (syntax: string) =>
    say(fill(s.usage, { usage: syntax }), "muted");

  /** Input value set by the shell (Tab, history): caret to the end, block cursor follows. */
  function setInput(value: string): void {
    input.value = value;
    input.setSelectionRange(value.length, value.length);
    input.dispatchEvent(new Event("input"));
  }

  /** Phone and WhatsApp values, decoded from the contact section like the section does. */
  function decoded(): Record<string, string> {
    const lines = document.querySelectorAll<HTMLElement>(
      "#contact [data-kind][data-enc-value]",
    );
    return Object.fromEntries(
      [...lines].map((el) => [el.dataset.kind, decode(el.dataset.encValue!)]),
    );
  }

  const commands: Record<string, Handler> = {
    help: () => print(formatHelp(s)),
    whoami: () => print(formatWhoami(data)),
    about: () => print(formatWhoami(data)),
    experience: () => print(formatExperience(data)),
    projects: () => print(formatProjects(data)),
    skills: () => print(formatSkills(data)),
    certs: () => print(formatCerts(data)),
    contact: () => print(formatContact(data, decoded())),
    ls: () => print(formatLs(data.sections)),
    cat: ([file]) => {
      if (!file) usage("cat skills.txt");
      else if (file.toLowerCase() === "skills.txt") print(formatSkills(data));
      else say(fill(s.catError, { name: file }), "error");
    },
    cd: ([arg]) => {
      const id = sectionArg(arg, data.sections);
      if (!id) {
        say(fill(s.cdError, { name: arg ?? "" }), "error");
        return;
      }
      host.close({ restoreFocus: false });
      // A jump for nav.ts (only the destination records section_view), then the same
      // hash navigation a nav link does: smooth, or instant with reduced motion.
      window.dispatchEvent(new CustomEvent("nav:jump", { detail: id }));
      if (location.hash === `#${id}`)
        document.getElementById(id)?.scrollIntoView();
      else location.hash = id;
    },
    lang: ([arg]) => {
      const target = LANGS[arg?.toLowerCase() ?? ""];
      if (!target) {
        usage("lang en|pt|es");
        return;
      }
      const language = data.languages[target] ?? target;
      if (target === document.documentElement.lang.toLowerCase()) {
        say(fill(s.langCurrent, { language }), "muted");
        return;
      }
      const active = document.querySelector<HTMLElement>(
        "[data-nav-link].is-active",
      )?.dataset.navLink;
      const hash = active && active !== "hero" ? `#${active}` : "";
      try {
        localStorage.setItem(PREFERRED_LOCALE_KEY, target);
      } catch {
        // Storage unavailable: switching still works, just not remembered.
      }
      say(fill(s.langSwitch, { language }), "muted");
      location.assign(`${target === "en" ? "/" : `/${target}/`}${hash}`);
    },
    resume: () => {
      // Same file as the contact section's download, and the same `resume` event.
      const link = document.createElement("a");
      link.href = data.resume.href;
      link.download = "resume.pdf";
      host.dialog.append(link); // the page behind is inert while the dialog is open
      link.click();
      link.remove();
      track("resume", { language: data.resume.language });
      say(fill(s.resume, { file: data.resume.file }), "muted");
    },
    open: ([target]) => {
      const url = openTarget(target?.toLowerCase() ?? "");
      if (!url) {
        usage("open github|linkedin|instagram|repo");
        return;
      }
      window.open(url, "_blank", "noopener");
      say(fill(s.opened, { url }), "muted");
    },
    clear: () => log.replaceChildren(),
    history: () => print(formatHistory(history)),
    exit: () => host.close(),
  };

  /** `open` targets: the contact profiles, and `repo` for the site's source repository. */
  function openTarget(target: string): string | undefined {
    if (target === "repo") return data.profile.sourceUrl;
    if (!["github", "linkedin", "instagram"].includes(target)) return undefined;
    return data.contacts.find((c) => c.kind === target)?.url;
  }

  function notFound(name: string): void {
    say(fill(s.notFound, { name }), "error");
    const close = suggest(name);
    say(close ? fill(s.didYouMean, { command: close }) : s.helpHint, "muted");
  }

  say(s.welcome, "muted");

  return {
    run(line) {
      const command = line.trim();
      say(`${PROMPT} ${command}`, "echo");
      if (!command) return;
      history.push(command);
      recallAt = history.length;
      track("terminal_command", { command: terminalCommand(command, KNOWN) });
      const { name, args } = parse(command);
      const handler = Object.hasOwn(commands, name)
        ? commands[name]
        : undefined;
      if (handler) handler(args);
      else notFound(name);
    },

    complete() {
      const { value, candidates } = complete(input.value, data.sections);
      if (candidates.length > 0) {
        say(`${PROMPT} ${input.value}`, "echo");
        say(candidates.join("  "));
      }
      if (value !== input.value) setInput(value);
    },

    recall(step) {
      recallAt = Math.min(Math.max(recallAt + step, 0), history.length);
      setInput(history[recallAt] ?? "");
    },

    cancel: () => false,
    intercept: () => false,
  };
}
