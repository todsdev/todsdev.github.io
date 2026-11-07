/** Terminal parsing, completion, suggestions and section arguments. Run with `npm test`. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { en } from "../i18n/en.ts";
import { es } from "../i18n/es.ts";
import { ptBr } from "../i18n/pt-br.ts";
import { terminalCommand } from "./analytics.ts";
import {
  ADB,
  BREW,
  COMMANDS,
  E492,
  GRADLE,
  KNOWN,
  NEOFETCH_LOGO,
  OBS_ENTRY,
  PING,
  SECRETS,
  VIM_EXITS,
  VIM_PROMPT,
  VISIBLE,
  available,
  complete,
  fill,
  formatCerts,
  formatContact,
  formatExperience,
  formatBlame,
  formatBrew,
  formatHelp,
  formatHistory,
  formatLs,
  formatNeofetch,
  formatObs,
  formatPing,
  formatSecrets,
  knownNames,
  formatProjects,
  formatSkills,
  formatWhoami,
  obsCounts,
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
  assert.equal(suggest("whoamii", SECTIONS), "whoami");
  assert.equal(suggest("neofech", SECTIONS), "neofetch");
  assert.equal(suggest("hepl", SECTIONS), "help");
  assert.equal(suggest("histroy", SECTIONS), "history");
  assert.equal(suggest("hello", SECTIONS), undefined);
  assert.equal(suggest("xyzzy", SECTIONS), undefined);
  // Suggestions may name an easter egg: part of discovering them.
  assert.equal(suggest("gti", SECTIONS), "git");
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
  obs: { games: 8, years: 10 },
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
  const lines = texts(formatHelp(ptBr.terminal, SECTIONS)).slice(0, -1);
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

test("help ends with the dim hint to ls -a in every locale", () => {
  const hints: Record<string, string> = {
    en: "psst… not everything is listed. try ls -a",
    "pt-br": "psst… nem tudo está na lista. tente ls -a",
    es: "psst… no todo está en la lista. prueba ls -a",
  };
  for (const [locale, strings] of LOCALES) {
    const lines = formatHelp(strings, SECTIONS);
    assert.deepEqual(lines.at(-1), { text: hints[locale], tone: "muted" });
    assert.equal(lines.length, VISIBLE.length + 1, locale);
  }
});

test("ls -a lists .secrets first; plain ls is unchanged", () => {
  assert.deepEqual(texts(formatLs(SECTIONS, true)), [
    ".secrets  about/  experience/  projects/  skills/  courses/  contact/",
  ]);
  assert.ok(!texts(formatLs(SECTIONS))[0]!.includes(".secrets"));
});

test("cat .secrets: header, every egg in order, one comment column", () => {
  assert.deepEqual(
    SECRETS.map(([command]) => command),
    [
      "adb devices",
      "./gradlew build",
      "neofetch",
      "sudo hire-me",
      "rm -rf /",
      "matrix",
      "./hello",
      "ping thiago",
      "git blame",
      "brew coffee",
      "vim",
      "obs",
    ],
  );
  const headers: Record<string, string> = {
    en: "# .secrets — don't tell anyone",
    "pt-br": "# .secrets — não conte pra ninguém",
    es: "# .secrets — no se lo digas a nadie",
  };
  for (const [locale, strings] of LOCALES) {
    const lines = formatSecrets(strings);
    assert.deepEqual(lines[0], { text: headers[locale], tone: "muted" });
    const body = texts(lines).slice(1);
    assert.equal(body.length, 12, locale);
    // Commands stay English; every "#" sits in the same column.
    body.forEach((line, i) => assert.ok(line.startsWith(SECRETS[i]![0])));
    assert.ok(
      body.every((line) => line.indexOf("# ") === 17),
      locale,
    );
  }
  const en0 = texts(formatSecrets(en.terminal));
  assert.equal(en0[1], "adb devices      # see who's connected");
  assert.equal(en0[11], "vim              # good luck getting out");
  assert.equal(
    texts(formatSecrets(ptBr.terminal))[2],
    "./gradlew build  # compile 3 anos de experiência",
  );
  assert.equal(
    texts(formatSecrets(es.terminal))[10],
    "brew coffee      # combustible para el build",
  );
});

test("ping, brew and git blame: CLI lines in English, asides translated", () => {
  assert.deepEqual(texts(formatPing(ptBr.terminal)), [
    "PING thiago (todsdev.github.io): 56 data bytes",
    "64 bytes from thiago: icmp_seq=0 time=24h",
    "--- thiago ping statistics ---",
    "1 packet transmitted, 1 received, 0% packet loss",
    "dica: digite contact para falar comigo",
  ]);
  assert.equal(formatPing(en.terminal).at(-1)?.tone, "muted");
  assert.equal(PING.length, 4);
  assert.deepEqual(formatBrew(en.terminal), [
    { text: "==> Brewing coffee..." },
    { text: "Error: 418 I'm a teapot", tone: "error" },
    { text: "(some things are not meant to be)", tone: "muted" },
  ]);
  assert.deepEqual(BREW, ["==> Brewing coffee...", "Error: 418 I'm a teapot"]);
  assert.equal(
    texts(formatBrew(es.terminal))[2],
    "(no todo está destinado a ser)",
  );
  assert.deepEqual(texts(formatBlame(es.terminal, "Thiago Rodrigues")), [
    "a1b2c3d (Thiago Rodrigues) todo en esta página. sí, incluso la errata del hero.",
  ]);
  assert.equal(
    texts(formatBlame(en.terminal, "Thiago Rodrigues"))[0],
    "a1b2c3d (Thiago Rodrigues) everything on this page. yes, even the typo in the hero.",
  );
});

test("obs: counts filled in, then the tip; text only", () => {
  const counts = { games: 8, years: 10 };
  assert.deepEqual(texts(formatObs(en.terminal, counts)), [
    "8 Olympic Games · 10 years · 0 medals · 100% uptime",
    "tip: type experience for the full story",
  ]);
  assert.equal(
    texts(formatObs(ptBr.terminal, counts))[0],
    "8 Jogos Olímpicos · 10 anos · 0 medalhas · 100% de uptime",
  );
  assert.equal(
    texts(formatObs(es.terminal, counts))[0],
    "8 Juegos Olímpicos · 10 años · 0 medallas · 100% de uptime",
  );
  // No ring drawing or Olympic symbol anywhere in the eggs' text.
  for (const [, strings] of LOCALES) {
    const all = [
      ...texts(formatObs(strings, counts)),
      ...texts(formatSecrets(strings)),
    ].join("\n");
    assert.ok(!/ring|[○◯⭕⚪●◎⊙]|\p{Extended_Pictographic}/iu.test(all), all);
  }
});

test("vim constants", () => {
  assert.equal(E492, "E492: Not an editor command");
  assert.deepEqual(VIM_EXITS, [":q", ":q!", ":wq", ":x"]);
  assert.equal(VIM_PROMPT, "-- NORMAL --");
});

test("obs counts the OBS entry's Games and years from the content", async () => {
  const { readFileSync } = await import("node:fs");
  const yaml = readFileSync(
    new URL(`../content/experience/${OBS_ENTRY}.yaml`, import.meta.url),
    "utf8",
  );
  // The current entry: started 2016-08-01, Games from 2016 to 2026.
  const start = new Date(`${/^start: (\S+)/m.exec(yaml)![1]}T00:00:00Z`);
  const events = [...yaml.matchAll(/^ {2}- year: (\d+)/gm)].map((m) => ({
    year: Number(m[1]),
  }));
  assert.deepEqual(obsCounts({ start, events }), { games: 8, years: 10 });
  // Another Games in 2028 updates both numbers.
  assert.deepEqual(obsCounts({ start, events: [{ year: 2028 }, ...events] }), {
    games: 9,
    years: 12,
  });
  assert.throws(() => obsCounts(undefined), /olympic-broadcasting-services/);
  assert.throws(() => obsCounts({ start, events: [] }));
});

const NO_COURSES = SECTIONS.filter((id) => id !== "courses");

test("certs is tied to the courses section: only available while it is rendered", () => {
  assert.ok(available(SECTIONS).some((c) => c.name === "certs"));
  assert.ok(!available(NO_COURSES).some((c) => c.name === "certs"));
  assert.deepEqual(
    available(NO_COURSES).map((c) => c.name),
    COMMANDS.map((c) => c.name).filter((name) => name !== "certs"),
  );
  assert.deepEqual(knownNames(SECTIONS), [...KNOWN]);
  assert.deepEqual(
    knownNames(NO_COURSES),
    KNOWN.filter((name) => name !== "certs"),
  );
});

test("with courses off, help has no certs line in any locale", () => {
  for (const [locale, strings] of LOCALES) {
    const names = (sections: string[]) =>
      texts(formatHelp(strings, sections))
        .slice(0, -1)
        .map((l) => l.split(/\s+/)[0]);
    assert.ok(names(SECTIONS).includes("certs"), locale);
    assert.deepEqual(
      names(NO_COURSES),
      VISIBLE.filter((name) => name !== "certs"),
      locale,
    );
  }
});

test("with courses off, Tab on c and on cd c never offers certs or courses", () => {
  assert.deepEqual(complete("c", NO_COURSES), {
    value: "c",
    candidates: ["cat", "cd", "clear", "contact"],
  });
  assert.deepEqual(complete("cd c", NO_COURSES), {
    value: "cd contact",
    candidates: [],
  });
  assert.deepEqual(complete("ce", NO_COURSES), {
    value: "ce",
    candidates: [],
  });
  // Typing certs by hand still gets no argument completion.
  assert.deepEqual(complete("certs ", NO_COURSES), {
    value: "certs ",
    candidates: [],
  });
});

test("with courses off, certs is no suggestion and is reported as unknown", () => {
  assert.equal(suggest("cert", SECTIONS), "certs");
  assert.equal(suggest("cert", NO_COURSES), undefined);
  assert.equal(suggest("certs", NO_COURSES), undefined);
  assert.equal(terminalCommand("certs", knownNames(SECTIONS)), "certs");
  assert.equal(terminalCommand("certs", knownNames(NO_COURSES)), "unknown");
});

test("ls follows the sections it is given", () => {
  assert.deepEqual(texts(formatLs(NO_COURSES)), [
    "about/  experience/  projects/  skills/  contact/",
  ]);
  assert.deepEqual(texts(formatLs(NO_COURSES, true)), [
    ".secrets  about/  experience/  projects/  skills/  contact/",
  ]);
});
