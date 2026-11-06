/** Terminal parsing, completion, suggestions and section arguments. Run with `npm test`. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { en } from "../i18n/en.ts";
import { es } from "../i18n/es.ts";
import { ptBr } from "../i18n/pt-br.ts";
import { terminalCommand } from "./analytics.ts";
import {
  ADB,
  COMMANDS,
  GRADLE,
  KNOWN,
  NEOFETCH_LOGO,
  VISIBLE,
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
  suggest,
  terminalContacts,
  type Line,
  type Strings,
  type TerminalData,
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
  assert.deepEqual(parse("./hello"), { name: "hello", args: [] });
  assert.deepEqual(parse("hello"), { name: "hello", args: [] });
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
    [
      "adb",
      "gradlew",
      "neofetch",
      "sudo",
      "rm",
      "matrix",
      "hello",
      "ping",
      "git",
      "brew",
      "vim",
      "obs",
    ],
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

test("easter eggs are never completed or listed", () => {
  for (const input of [
    "neo",
    "ma",
    "./h",
    "vi",
    "ob",
    "ad",
    "pi",
    "gi",
    "br",
  ]) {
    assert.deepEqual(complete(input, SECTIONS), {
      value: input,
      candidates: [],
    });
  }
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

test("Tab completes arguments of cd, open, lang, theme, cat and ls", () => {
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
  assert.equal(complete("cat .", SECTIONS).value, "cat .secrets");
  assert.deepEqual(complete("cat ", SECTIONS), {
    value: "cat ",
    candidates: [".secrets", "skills.txt"],
  });
  assert.equal(complete("ls ", SECTIONS).value, "ls -a");
  assert.equal(complete("ls -", SECTIONS).value, "ls -a");
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
  // Suggestions may name an easter egg: part of discovering them.
  assert.equal(suggest("gti"), "git");
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
    ["ls -a", "ls"],
    ["cat .secrets", "cat"],
    ["./hello", "hello"],
    ["hello", "hello"],
    ["ping thiago", "ping"],
    ["git blame", "git"],
    ["brew coffee", "brew"],
    ["vim", "vim"],
    ["vim notes.txt", "vim"],
    ["obs", "obs"],
    ["xyzzy", "unknown"],
    [":q", "unknown"],
    [":wq", "unknown"],
    ["hello my name is Ana", "hello"],
  ];
  for (const [input, command] of cases) {
    assert.equal(terminalCommand(input, KNOWN), command, input);
  }
  for (const name of KNOWN) assert.equal(terminalCommand(name, KNOWN), name);
});

const LOCALES: [string, Strings][] = [
  ["en", en.terminal],
  ["pt-br", ptBr.terminal],
  ["es", es.terminal],
];

const texts = (lines: Line[]) => lines.map((l) => l.text);

/** Fixture data shaped like terminal.json, with the given strings. */
const data = (strings: Strings): TerminalData => ({
  strings,
  sections: SECTIONS,
  profile: {
    name: "Ana Lima",
    role: "Mobile Developer",
    location: "Recife, Brasil",
    summary: "Builds apps.",
    sourceUrl: "https://github.com/ana/site",
  },
  experience: [
    { period: "jan 2025 – mar 2026", company: "Acme", role: "Dev Android" },
    { period: "ago 2016 – atual", company: "OBS", role: "QC" },
  ],
  projects: [
    { title: "App One", status: "live", badge: "contributor · via Acme" },
  ],
  skills: [
    { category: "Mobile", items: ["Kotlin", "Compose"] },
    { category: "Backend", items: ["Java"] },
  ],
  certs: [{ date: "jun 2022", title: "JAVA POO", issuer: "Curso em Vídeo" }],
  contacts: [
    { kind: "email", label: "email", value: "a@b.c", url: "mailto:a@b.c" },
    { kind: "phone", label: "telefone" },
  ],
  resume: {
    href: "/resume/resume-en.pdf",
    file: "resume-en.pdf",
    language: "en",
  },
  email: "a@b.c",
  languages: { en: "English", "pt-br": "Português (Brasil)", es: "Español" },
});

test("every visible command has a help description in every locale", () => {
  for (const [locale, strings] of LOCALES) {
    for (const name of VISIBLE) {
      const text = strings.help[name as keyof Strings["help"]];
      assert.ok(text, `${locale} help.${name}`);
    }
    assert.deepEqual(
      Object.keys(strings.help).sort(),
      [...VISIBLE].sort(),
      locale,
    );
  }
});

test("help lists exactly the visible commands, aligned, in the page's language", () => {
  const lines = texts(formatHelp(ptBr.terminal));
  assert.deepEqual(
    lines.map((l) => l.split(/\s+/)[0]),
    [...VISIBLE],
  );
  assert.equal(lines[0], "help        lista os comandos");
  const column = lines.map((l) => l.search(/ {2}\S/) + 2);
  assert.ok(column.every((c) => c === column[0]));
});

test("content formatters in every locale", () => {
  for (const [locale, strings] of LOCALES) {
    const d = data(strings);
    assert.deepEqual(
      texts(formatWhoami(d)),
      ["Ana Lima", "Mobile Developer · Recife, Brasil", "", "Builds apps."],
      locale,
    );
    assert.deepEqual(texts(formatExperience(d)), [
      "jan 2025 – mar 2026  Acme",
      "  Dev Android",
      "ago 2016 – atual  OBS",
      "  QC",
    ]);
    assert.deepEqual(texts(formatProjects(d)), [
      "App One  [live]  contributor · via Acme",
    ]);
    assert.deepEqual(texts(formatSkills(d)), [
      "Mobile: Kotlin · Compose",
      "Backend: Java",
    ]);
    assert.deepEqual(texts(formatCerts(d)), [
      "jun 2022  JAVA POO — Curso em Vídeo",
    ]);
  }
});

test("contact fills protected kinds only from the decoded page values", () => {
  const d = data(en.terminal);
  assert.deepEqual(texts(formatContact(d, { phone: "+55 81 0000-0000" })), [
    "email     a@b.c",
    "telefone  +55 81 0000-0000",
  ]);
  assert.deepEqual(texts(formatContact(d, {})), [
    "email     a@b.c",
    "telefone  ",
  ]);
});

test("ls, history", () => {
  assert.deepEqual(texts(formatLs(SECTIONS)), [
    "about/  experience/  projects/  skills/  courses/  contact/",
  ]);
  assert.deepEqual(texts(formatHistory(["ls", "whoami", "history"])), [
    "1  ls",
    "2  whoami",
    "3  history",
  ]);
  const ten = Array.from({ length: 10 }, (_, i) => `c${i}`);
  assert.equal(texts(formatHistory(ten))[0], " 1  c0");
  assert.equal(texts(formatHistory(ten))[9], "10  c9");
});

test("adb and gradlew outputs", () => {
  assert.deepEqual(ADB, [
    "List of devices attached",
    "thiago-rodrigues    device",
  ]);
  assert.equal(GRADLE.at(-1), "BUILD SUCCESSFUL in 3y");
  assert.ok(GRADLE.length >= 5 && GRADLE.length <= 12);
});

test("neofetch card in every locale", () => {
  assert.deepEqual(texts(formatNeofetch(ptBr.terminal)).slice(2), [
    "SO: Android",
    "Kernel: Kotlin",
    "Tempo ativo: 3 anos",
    "Local: Rio de Janeiro",
  ]);
  assert.equal(texts(formatNeofetch(en.terminal))[4], "Uptime: 3 years");
  assert.equal(texts(formatNeofetch(es.terminal))[4], "Tiempo activo: 3 años");
  const width = NEOFETCH_LOGO[0]!.length;
  assert.ok(NEOFETCH_LOGO.every((l) => l.length === width));
});

test("fill replaces every placeholder", () => {
  assert.equal(fill("{a} and {a} {b}", { a: "x", b: "y" }), "x and x y");
  assert.equal(
    fill(es.terminal.didYouMean, { command: "whoami" }),
    "¿quisiste decir whoami?",
  );
});

test("terminal.json contacts drop the value and url of protected kinds", () => {
  const contacts = [
    { kind: "email", label: "email", value: "a@b.c", url: "mailto:a@b.c" },
    { kind: "phone", label: "phone", value: "+55 21 9", url: "tel:+55219" },
    {
      kind: "whatsapp",
      label: "whatsapp",
      value: "+55 21 9",
      url: "https://wa.me/55219",
    },
  ];
  const out = terminalContacts(
    contacts,
    (k) => k === "phone" || k === "whatsapp",
  );
  assert.deepEqual(out, [
    { kind: "email", label: "email", value: "a@b.c", url: "mailto:a@b.c" },
    { kind: "phone", label: "phone" },
    { kind: "whatsapp", label: "whatsapp" },
  ]);
  assert.doesNotMatch(JSON.stringify(out), /55 ?21|tel:|wa\.me/);
});
