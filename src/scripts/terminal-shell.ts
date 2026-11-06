/**
 * Terminal shell, loaded by ./terminal on the first opening with the locale's terminal.json.
 * (Stub: echoes each line after the prompt; the commands arrive in the next tasks.)
 */
import { PROMPT, type TerminalData } from "../lib/terminal";
import type { Host } from "./terminal";

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

export function start(host: Host, data: TerminalData): Shell {
  host.print(data.strings.welcome, "muted");
  return {
    run(line) {
      host.print(`${PROMPT} ${line}`, "echo");
    },
    complete() {},
    recall() {},
    cancel: () => false,
    intercept: () => false,
  };
}
