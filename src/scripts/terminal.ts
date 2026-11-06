/**
 * Terminal loader, part of every locale page: opens the dialog with "/" or "`" (outside text
 * fields, no modifiers) or the footer's ">_" button, keeps focus inside it, closes it with
 * Esc or the close button and gives focus back. The shell (./terminal-shell) and the
 * locale's terminal.json load on the first opening only; an Enter pressed meanwhile runs
 * once they arrive.
 */
import type { TerminalData } from "../lib/terminal";
import type { Shell } from "./terminal-shell";
import { track } from "./track";

export interface Host {
  dialog: HTMLDialogElement;
  log: HTMLElement;
  input: HTMLInputElement;
  /** Closes the dialog; focus goes back to where it was unless `restoreFocus` is false. */
  close(options?: { restoreFocus?: boolean }): void;
  /** Appends one line of plain text to the log. */
  print(text: string, tone?: string): HTMLElement;
}

const dialog = document.querySelector<HTMLDialogElement>(
  "dialog[data-terminal]",
);
if (dialog) setup(dialog);

/** Fields where "/" and "`" are typed, not shortcuts. */
function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLSelectElement) return true;
  return (
    target instanceof HTMLInputElement &&
    ![
      "button",
      "checkbox",
      "radio",
      "range",
      "reset",
      "submit",
      "color",
      "file",
      "image",
    ].includes(target.type)
  );
}

function setup(dialog: HTMLDialogElement): void {
  const log = dialog.querySelector<HTMLElement>("[data-terminal-log]")!;
  const form = dialog.querySelector<HTMLFormElement>("[data-terminal-form]")!;
  const input = dialog.querySelector<HTMLInputElement>(
    "[data-terminal-input]",
  )!;
  const closeButton = dialog.querySelector<HTMLButtonElement>(
    "[data-terminal-close]",
  )!;
  const cursor = dialog.querySelector<HTMLElement>("[data-terminal-cursor]");

  let opener: HTMLElement | null = null;
  /** Set once the shell and its data have loaded. */
  let shell: Shell | undefined;
  let loading: Promise<Shell | undefined> | undefined;

  const host: Host = {
    dialog,
    log,
    input,
    close,
    print(text, tone) {
      const line = document.createElement("p");
      line.className = tone ? `term__out term__out--${tone}` : "term__out";
      line.textContent = text;
      log.append(line);
      log.scrollTop = log.scrollHeight;
      return line;
    },
  };

  async function load(): Promise<Shell | undefined> {
    try {
      const [module, response] = await Promise.all([
        import("./terminal-shell"),
        fetch(dialog.dataset.src ?? ""),
      ]);
      if (!response.ok) throw new Error(`terminal.json ${response.status}`);
      const data = (await response.json()) as TerminalData;
      return (shell = module.start(host, data));
    } catch {
      host.print(dialog.dataset.unavailable ?? "", "muted");
      loading = undefined; // try again on the next opening
      return undefined;
    }
  }

  function open(from?: HTMLElement): void {
    if (dialog.open) return;
    opener =
      from ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    dialog.showModal();
    input.focus({ preventScroll: true });
    track("terminal_open");
    loading ??= load();
  }

  function close({ restoreFocus = true } = {}): void {
    if (!dialog.open) return;
    dialog.close();
    shell?.closed();
    if (restoreFocus) opener?.focus({ preventScroll: true });
    else (document.activeElement as HTMLElement | null)?.blur();
    opener = null;
  }

  /** Keeps the block cursor on the caret (monospace: one `ch` per character). */
  function moveCursor(): void {
    cursor?.style.setProperty("--caret", String(input.selectionEnd ?? 0));
    cursor?.style.setProperty("--scroll", String(input.scrollLeft));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" && event.key !== "`") return;
    if (event.defaultPrevented || event.isComposing) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (dialog.open || isTextField(event.target)) return;
    event.preventDefault();
    open();
  });

  document.addEventListener("click", (event) => {
    const button = (event.target as Element | null)?.closest<HTMLElement>(
      "[data-terminal-open]",
    );
    if (button) open(button);
  });

  closeButton.addEventListener("click", () => close());

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    if (shell?.cancel()) return;
    close();
  });

  // Focus stays inside: Tab completes in the input; Shift+Tab reaches the close button,
  // and Tab or Shift+Tab there comes back to the input.
  dialog.addEventListener("keydown", (event) => {
    if (shell?.intercept(event)) return;
    if (event.key === "Tab") {
      event.preventDefault();
      if (event.target === input && !event.shiftKey) shell?.complete();
      else if (event.target === input) closeButton.focus();
      else input.focus();
    } else if (
      event.target === input &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      event.preventDefault();
      shell?.recall(event.key === "ArrowUp" ? -1 : 1);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const line = input.value;
    input.value = "";
    moveCursor();
    if (shell) shell.run(line);
    else if (loading) void loading.then((ready) => ready?.run(line));
    else host.print(dialog.dataset.unavailable ?? "", "muted");
  });

  for (const type of ["input", "keyup", "select", "click", "focus"]) {
    input.addEventListener(type, moveCursor);
  }
  input.addEventListener("scroll", moveCursor);
}
