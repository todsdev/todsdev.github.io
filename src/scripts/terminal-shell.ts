/**
 * Terminal shell, loaded by ./terminal on the first opening with the locale's terminal.json.
 * Runs commands (src/lib/terminal.ts formats their output), keeps the history, completes
 * with Tab and reports each command through track(). Output is always plain text.
 */
import { terminalCommand } from "../lib/analytics";
import { decode } from "../lib/contact";
import {
  ADB,
  GRADLE,
  KNOWN,
  NEOFETCH_LOGO,
  PROMPT,
  SUDO_PROMPT,
  complete,
  fill,
  formatCerts,
  formatContact,
  formatExperience,
  formatHelp,
  formatHistory,
  formatLs,
  formatNeofetch,
  formatProjects,
  formatSkills,
  formatWhoami,
  parse,
  sectionArg,
  THEME_KEY,
  THEMES,
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

  const prompt = host.dialog.querySelector<HTMLElement>(
    "[data-terminal-prompt]",
  );
  const label = host.dialog.querySelector<HTMLElement>("[data-terminal-label]");
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  /** Waiting for the `sudo hire-me` password line. */
  let sudo = false;
  /** A timed output (gradlew log) is printing: input is read-only. */
  let busy = false;
  /** Stops the running `matrix` animation, if any. */
  let stopMatrix: (() => void) | undefined;

  function setReadOnly(on: boolean): void {
    input.readOnly = on;
    input.dispatchEvent(new Event("input"));
  }

  /** Password mode for `sudo hire-me`: masked input, own label and prompt, nothing kept. */
  function setSudo(on: boolean): void {
    sudo = on;
    input.value = "";
    input.type = on ? "password" : "text";
    if (prompt) prompt.textContent = on ? "[sudo]" : PROMPT;
    if (label) {
      label.textContent = on
        ? (host.dialog.dataset.passwordLabel ?? "")
        : (host.dialog.dataset.label ?? "");
    }
    input.dispatchEvent(new Event("input"));
  }

  function hireMe(): void {
    setSudo(false);
    say(s.accessGranted, "accent");
    track("contact", { kind: "email", action: "mail" });
    const link = document.createElement("a");
    link.href = `mailto:${data.email}?subject=${encodeURIComponent(s.mailSubject)}`;
    host.dialog.append(link); // the page behind is inert while the dialog is open
    link.click();
    link.remove();
  }

  function gradle(): void {
    if (reduced()) {
      print(GRADLE.map((text) => ({ text })));
      return;
    }
    busy = true;
    setReadOnly(true);
    GRADLE.forEach((text, i) => {
      window.setTimeout(
        () => {
          say(text, i === GRADLE.length - 1 ? "accent" : undefined);
          if (i < GRADLE.length - 1) return;
          busy = false;
          setReadOnly(false);
        },
        (i + 1) * 150,
      );
    });
  }

  function neofetch(): void {
    const card = document.createElement("div");
    card.className = "term__card";
    const logo = document.createElement("p");
    logo.className = "term__out term__out--muted";
    logo.setAttribute("aria-hidden", "true");
    logo.textContent = NEOFETCH_LOGO.join("\n");
    const info = document.createElement("div");
    for (const line of formatNeofetch(s)) {
      const p = document.createElement("p");
      p.className = line.tone
        ? `term__out term__out--${line.tone}`
        : "term__out";
      p.textContent = line.text;
      info.append(p);
    }
    card.append(logo, info);
    log.append(card);
    log.scrollTop = log.scrollHeight;
  }

  /** Falling characters over the log, inside the panel only, for 3 s or until a key. */
  function matrix(): void {
    if (reduced()) {
      say(s.matrixNote, "muted");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.className = "term__matrix";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      top: `${log.offsetTop}px`,
      left: `${log.offsetLeft}px`,
      width: `${log.clientWidth}px`,
      height: `${log.clientHeight}px`,
    });
    canvas.width = log.clientWidth;
    canvas.height = log.clientHeight;
    host.dialog.append(canvas);
    const ctx = canvas.getContext("2d");
    const css = getComputedStyle(document.documentElement);
    const color = css.getPropertyValue("--text").trim();
    const fade = css.getPropertyValue("--surface").trim();
    const size = 14;
    const glyphs = "アカサタナハマヤラワ0123456789kotlin<>{}";
    const drops = Array.from(
      { length: Math.ceil(canvas.width / (size * 0.6)) },
      () => Math.floor(Math.random() * -20),
    );
    setReadOnly(true);
    let frame = 0;
    const started = performance.now();
    const step = (now: number) => {
      if (!ctx || now - started > 3000) return stop();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.font = `${size}px "IBM Plex Mono", monospace`;
      drops.forEach((y, x) => {
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)] ?? "0";
        ctx.fillText(glyph, x * size * 0.6, y * size);
        drops[x] = y * size > canvas.height && Math.random() > 0.95 ? 0 : y + 1;
      });
      frame = requestAnimationFrame(step);
    };
    function stop(): void {
      cancelAnimationFrame(frame);
      canvas.remove();
      stopMatrix = undefined;
      setReadOnly(false);
      input.focus({ preventScroll: true });
    }
    stopMatrix = stop;
    frame = requestAnimationFrame(step);
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
    theme: ([arg]) => {
      const root = document.documentElement;
      if (!arg) {
        say(
          fill(s.themeCurrent, { theme: root.dataset.theme ?? "gray" }),
          "muted",
        );
        usage("theme green|amber|gray");
        return;
      }
      const theme = THEMES.find((name) => name === arg.toLowerCase());
      if (!theme) {
        usage("theme green|amber|gray");
        return;
      }
      // Tokens only (src/styles/tokens.css); BaseLayout re-applies the stored theme before
      // first paint on every page. Gray is the default, so it stores nothing.
      if (theme === "gray") delete root.dataset.theme;
      else root.dataset.theme = theme;
      try {
        if (theme === "gray") localStorage.removeItem(THEME_KEY);
        else localStorage.setItem(THEME_KEY, theme);
      } catch {
        // Storage unavailable: the theme applies to this page only.
      }
      say(fill(s.themeSet, { theme }), "muted");
    },
    adb: ([sub]) => {
      if (sub?.toLowerCase() === "devices")
        print(ADB.map((text) => ({ text })));
      else usage("adb devices");
    },
    gradlew: ([task]) => {
      if (task?.toLowerCase() === "build") gradle();
      else usage("./gradlew build");
    },
    neofetch: () => neofetch(),
    sudo: ([what]) => {
      if (what?.toLowerCase() !== "hire-me") {
        say(s.sudoDenied, "error");
        return;
      }
      say(SUDO_PROMPT);
      setSudo(true);
    },
    rm: () => say(s.rm),
    matrix: () => matrix(),
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
      // The password line is never echoed, kept or reported: any input grants access.
      if (sudo) return hireMe();
      if (busy || stopMatrix) return;
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
      if (sudo || busy) return;
      const { value, candidates } = complete(input.value, data.sections);
      if (candidates.length > 0) {
        say(`${PROMPT} ${input.value}`, "echo");
        say(candidates.join("  "));
      }
      if (value !== input.value) setInput(value);
    },

    recall(step) {
      if (sudo || busy) return;
      recallAt = Math.min(Math.max(recallAt + step, 0), history.length);
      setInput(history[recallAt] ?? "");
    },

    cancel() {
      if (!sudo) return false;
      setSudo(false); // Esc cancels the password prompt; the terminal stays open
      say("^C", "muted");
      return true;
    },

    intercept(event) {
      if (!stopMatrix) return false;
      event.preventDefault(); // any key ends matrix (Esc too, without closing)
      stopMatrix();
      return true;
    },
  };
}
