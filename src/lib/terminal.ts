/**
 * Terminal core: the command table, input parsing, Tab completion, "did you mean"
 * suggestions and section arguments. Pure and runtime-import-free so it runs under
 * `node --test` (terminal.test.ts). The DOM side is src/scripts/terminal-shell.ts.
 * Commands and their arguments stay English in every locale.
 */

export interface Command {
  name: string;
  /** Easter eggs: left out of `help` and never listed by completion. */
  hidden?: boolean;
  /** Arguments offered by Tab completion. Sections come from the caller. */
  args?: readonly string[] | "sections";
}

/** Every command, in `help` order; hidden easter eggs last. */
export const COMMANDS: readonly Command[] = [
  { name: "help" },
  { name: "whoami" },
  { name: "about" },
  { name: "experience" },
  { name: "projects" },
  { name: "skills" },
  { name: "certs" },
  { name: "contact" },
  { name: "ls" },
  { name: "cd", args: "sections" },
  { name: "cat", args: ["skills.txt"] },
  { name: "resume" },
  { name: "open", args: ["github", "linkedin", "instagram", "repo"] },
  { name: "lang", args: ["en", "pt", "es"] },
  { name: "theme", args: ["green", "amber", "gray"] },
  { name: "clear" },
  { name: "history" },
  { name: "exit" },
  { name: "adb", hidden: true },
  { name: "gradlew", hidden: true },
  { name: "neofetch", hidden: true },
  { name: "sudo", hidden: true },
  { name: "rm", hidden: true },
  { name: "matrix", hidden: true },
];

/** Names `terminalCommand()` (src/lib/analytics.ts) reports; anything else is "unknown". */
export const KNOWN: readonly string[] = COMMANDS.map((c) => c.name);

export const VISIBLE: readonly string[] = COMMANDS.filter((c) => !c.hidden).map(
  (c) => c.name,
);

const byName = (name: string) => COMMANDS.find((c) => c.name === name);

export interface Parsed {
  /** Lowercased, with a leading "./" dropped ("./gradlew" → "gradlew"). */
  name: string;
  /** The remaining tokens exactly as typed. */
  args: string[];
}

export function parse(input: string): Parsed {
  const [first = "", ...args] = input.trim().split(/\s+/).filter(Boolean);
  return { name: first.toLowerCase().replace(/^\.\//, ""), args };
}

/** "~/about/", "./about", "/about" and "about" → "about"; "~", "..", "/" and "" → "hero". */
export function sectionArg(
  arg: string | undefined,
  sections: readonly string[],
): string | undefined {
  const raw = (arg ?? "").trim().toLowerCase();
  if (["", "~", "~/", "..", "../", "/"].includes(raw)) return "hero";
  const id = raw.replace(/^(~\/|\.\/|\/)/, "").replace(/\/+$/, "");
  return sections.includes(id) ? id : undefined;
}

const commonPrefix = (words: readonly string[]): string =>
  words.reduce((prefix, word) => {
    let i = 0;
    while (i < prefix.length && prefix[i] === word[i]) i++;
    return prefix.slice(0, i);
  }, words[0] ?? "");

export interface Completion {
  /** The new input value (unchanged when nothing can be added). */
  value: string;
  /** Candidates to list (alphabetically) when more than one matches; empty otherwise. */
  candidates: string[];
}

/**
 * Tab completion of the command name, or of the single argument of a command with `args`.
 * `sections` are the `cd` targets (without "hero").
 */
export function complete(
  input: string,
  sections: readonly string[],
): Completion {
  const none = { value: input, candidates: [] };
  const tokens = input.trimStart().split(/\s+/);
  if (tokens.length === 1) {
    const prefix = (tokens[0] ?? "").toLowerCase();
    const visible = VISIBLE.filter((n) => n.startsWith(prefix));
    const hidden = prefix
      ? COMMANDS.filter((c) => c.hidden && c.name.startsWith(prefix))
      : [];
    if (visible.length === 0 && hidden.length === 1) {
      return { value: `${hidden[0]!.name} `, candidates: [] };
    }
    if (visible.length === 1)
      return { value: `${visible[0]} `, candidates: [] };
    if (visible.length === 0) return none;
    const value = commonPrefix(visible);
    return {
      value: value.length > prefix.length ? value : input.trimStart(),
      candidates: [...visible].sort(),
    };
  }
  if (tokens.length !== 2) return none;
  const [name = "", partial = ""] = tokens;
  const spec = byName(name.toLowerCase());
  if (!spec?.args || spec.hidden) return none;
  const options = spec.args === "sections" ? sections : spec.args;
  // Keep a typed "~/" or "./" in front of a section.
  const lead =
    spec.args === "sections" ? (/^(~\/|\.\/)/.exec(partial)?.[0] ?? "") : "";
  const prefix = partial.slice(lead.length).toLowerCase();
  const matches = options.filter((o) => o.startsWith(prefix));
  if (matches.length === 0) return none;
  const head = `${name} ${lead}`;
  if (matches.length === 1)
    return { value: `${head}${matches[0]}`, candidates: [] };
  const value = commonPrefix(matches);
  return {
    value: value.length > prefix.length ? `${head}${value}` : input,
    candidates: [...matches].sort(),
  };
}

/** Optimal string alignment distance: insertions, deletions, substitutions and swaps. */
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0,
    ),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(
        d[i - 1]![j]! + 1,
        d[i]![j - 1]! + 1,
        d[i - 1]![j - 1]! + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, d[i - 2]![j - 2]! + 1);
      }
      d[i]![j] = best;
    }
  }
  return d[a.length]![b.length]!;
}

/**
 * The known command closest to an unknown name: at most one edit away, or two for names
 * of seven or more characters (so "hello" doesn't suggest "help"). Ties keep table order.
 */
export function suggest(name: string): string | undefined {
  const max = name.length >= 7 ? 2 : 1;
  let best: { name: string; d: number } | undefined;
  for (const known of KNOWN) {
    const d = distance(name, known);
    if (d > 0 && d <= max && (!best || d < best.d)) best = { name: known, d };
  }
  return best?.name;
}
