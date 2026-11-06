/** Terminal parsing, completion, suggestions and section arguments. Run with `npm test`. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { terminalCommand } from "./analytics.ts";
import {
  COMMANDS,
  KNOWN,
  VISIBLE,
  complete,
  parse,
  sectionArg,
  suggest,
} from "./terminal.ts";

const SECTIONS = [
  "about",
  "experience",
  "projects",
  "skills",
  "courses",
  "contact",
];

test("parse ignores case and surrounding spaces in the command name", () => {
  assert.deepEqual(parse("  WHOAMI "), { name: "whoami", args: [] });
  assert.deepEqual(parse("cd   ~/about  --verbose"), {
    name: "cd",
    args: ["~/about", "--verbose"],
  });
  assert.deepEqual(parse(""), { name: "", args: [] });
});

test("parse drops a leading ./ from the command name", () => {
  assert.deepEqual(parse("./gradlew build"), {
    name: "gradlew",
    args: ["build"],
  });
});

test("parse keeps arguments exactly as typed", () => {
  assert.deepEqual(parse("sudo Hire-Me"), { name: "sudo", args: ["Hire-Me"] });
});

test("help lists the visible commands in order, easter eggs hidden", () => {
  assert.deepEqual(VISIBLE, [
    "help",
    "whoami",
    "about",
    "experience",
    "projects",
    "skills",
    "certs",
    "contact",
    "ls",
    "cd",
    "cat",
    "resume",
    "open",
    "lang",
    "theme",
    "clear",
    "history",
    "exit",
  ]);
  assert.deepEqual(
    COMMANDS.filter((c) => c.hidden).map((c) => c.name),
    ["adb", "gradlew", "neofetch", "sudo", "rm", "matrix"],
  );
});

test("Tab completes a unique command with a trailing space", () => {
  assert.deepEqual(complete("who", SECTIONS), {
    value: "whoami ",
    candidates: [],
  });
});

test("Tab lists several candidates alphabetically and keeps the input", () => {
  assert.deepEqual(complete("c", SECTIONS), {
    value: "c",
    candidates: ["cat", "cd", "certs", "clear", "contact"],
  });
});

test("Tab extends the common prefix of several candidates", () => {
  assert.deepEqual(complete("ce", SECTIONS), {
    value: "certs ",
    candidates: [],
  });
  assert.deepEqual(complete("h", SECTIONS), {
    value: "h",
    candidates: ["help", "history"],
  });
  assert.deepEqual(complete("hi", SECTIONS), {
    value: "history ",
    candidates: [],
  });
});

test("Tab on an empty input lists the help commands", () => {
  const { value, candidates } = complete("", SECTIONS);
  assert.equal(value, "");
  assert.deepEqual(candidates, [...VISIBLE].sort());
});

test("easter eggs complete only as the sole match and are never listed", () => {
  assert.deepEqual(complete("neo", SECTIONS), {
    value: "neofetch ",
    candidates: [],
  });
  assert.deepEqual(complete("ma", SECTIONS), {
    value: "matrix ",
    candidates: [],
  });
  // "s" matches skills (visible) and sudo (hidden): the visible one wins.
  assert.deepEqual(complete("s", SECTIONS), {
    value: "skills ",
    candidates: [],
  });
  // "r" matches resume and rm: rm is never offered.
  assert.deepEqual(complete("r", SECTIONS), {
    value: "resume ",
    candidates: [],
  });
  for (const { name } of COMMANDS.filter((c) => c.hidden)) {
    assert.ok(!complete("", SECTIONS).candidates.includes(name), name);
  }
});

test("Tab completes arguments of cd, open, lang, theme and cat", () => {
  assert.equal(complete("cd pro", SECTIONS).value, "cd projects");
  assert.equal(complete("cd ~/ab", SECTIONS).value, "cd ~/about");
  assert.deepEqual(complete("cd co", SECTIONS), {
    value: "cd co",
    candidates: ["contact", "courses"],
  });
  assert.equal(complete("open li", SECTIONS).value, "open linkedin");
  assert.equal(complete("open r", SECTIONS).value, "open repo");
  assert.equal(complete("lang p", SECTIONS).value, "lang pt");
  assert.equal(complete("theme a", SECTIONS).value, "theme amber");
  assert.equal(complete("cat s", SECTIONS).value, "cat skills.txt");
});

test("Tab leaves other inputs alone", () => {
  for (const input of ["zz", "whoami x", "cd projects x", "sudo h", "cd zz"]) {
    assert.deepEqual(complete(input, SECTIONS), {
      value: input,
      candidates: [],
    });
  }
});

test("suggestions: one edit for short names, two from seven characters", () => {
  assert.equal(suggest("whoamii"), "whoami");
  assert.equal(suggest("neofech"), "neofetch");
  assert.equal(suggest("hepl"), "help");
  assert.equal(suggest("histroy"), "history");
  assert.equal(suggest("hello"), undefined);
  assert.equal(suggest("xyzzy"), undefined);
});

test("section arguments", () => {
  for (const arg of ["about", "~/about/", "./about", "/about", "ABOUT"]) {
    assert.equal(sectionArg(arg, SECTIONS), "about", arg);
  }
  for (const arg of ["~", "..", "/", "~/", undefined]) {
    assert.equal(sectionArg(arg, SECTIONS), "hero", String(arg));
  }
  assert.equal(sectionArg("blog", SECTIONS), undefined);
  assert.equal(sectionArg("hero", SECTIONS), undefined);
});

test("terminal_command reports only recognized command names", () => {
  const cases: [string, string][] = [
    ["help", "help"],
    ["WHOAMI", "whoami"],
    ["cd projects --fast", "cd"],
    ["cat skills.txt", "cat"],
    ["open linkedin", "open"],
    ["lang es", "lang"],
    ["theme amber", "theme"],
    ["adb devices", "adb"],
    ["./gradlew build", "gradlew"],
    ["neofetch", "neofetch"],
    ["sudo hire-me", "sudo"],
    ["rm -rf /", "rm"],
    ["matrix", "matrix"],
    ["xyzzy", "unknown"],
    ["hello my name is Ana", "unknown"],
  ];
  for (const [input, command] of cases) {
    assert.equal(terminalCommand(input, KNOWN), command, input);
  }
  for (const name of KNOWN) assert.equal(terminalCommand(name, KNOWN), name);
});
