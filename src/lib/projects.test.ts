/** Project order, terminal actions and the ownership note, verified with fixtures. Run with `npm test`. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { en } from "../i18n/en.ts";
import { es } from "../i18n/es.ts";
import { ptBr } from "../i18n/pt-br.ts";
import {
  ownershipNotes,
  projectActions,
  sortProjects,
  type NoteProject,
} from "./projects.ts";

const PLAY = "https://play.google.com/store/apps/details?id=x";
const APPLE = "https://apps.apple.com/br/app/id1";
const SITE = "https://example.com/";
const REPO = "https://github.com/example/x";

test("featured projects come first, then the incoming order", () => {
  const sorted = sortProjects([
    { id: "a", featured: false },
    { id: "b" },
    { id: "c", featured: true },
    { id: "d", featured: true },
  ]);
  assert.deepEqual(
    sorted.map((p) => p.id),
    ["c", "d", "a", "b"],
  );
});

test("actions follow play-store, app-store, site, repo", () => {
  const actions = projectActions({
    status: "live",
    url: SITE,
    repoUrl: REPO,
    stores: { appStore: APPLE, playStore: PLAY },
  });
  assert.deepEqual(
    actions.map((a) => [a.command, a.href]),
    [
      ["open play-store", PLAY],
      ["open app-store", APPLE],
      ["open site", SITE],
      ["open repo", REPO],
    ],
  );
});

test("no action for an undefined link", () => {
  assert.deepEqual(
    projectActions({ status: "live", stores: { appStore: APPLE } }).map(
      (a) => a.kind,
    ),
    ["appStore"],
  );
  assert.deepEqual(projectActions({ status: "live" }), []);
});

test("building projects drop store actions but keep site and repo", () => {
  const actions = projectActions({
    status: "building",
    url: SITE,
    repoUrl: REPO,
    stores: { playStore: PLAY, appStore: APPLE },
  });
  assert.deepEqual(
    actions.map((a) => a.kind),
    ["site", "repo"],
  );
});

const globo = (title: string): NoteProject => ({
  title,
  ownership: "contributor",
  owner: "Globo",
  via: "act digital",
});
const portfolio: NoteProject = {
  title: "todsdev.github.io",
  ownership: "owner",
};
const current = [
  globo("GloboPop"),
  globo("Premiere"),
  globo("Combate Play"),
  portfolio,
];

test("notes per locale with the current content", () => {
  assert.deepEqual(ownershipNotes(current, "en", en.projects.note), [
    "GloboPop, Premiere and Combate Play are owned by Globo. I contributed to them as an Android developer through act digital.",
  ]);
  assert.deepEqual(ownershipNotes(current, "pt-br", ptBr.projects.note), [
    "GloboPop, Premiere e Combate Play pertencem à empresa Globo. Contribuí com eles como desenvolvedor Android por meio da empresa act digital.",
  ]);
  assert.deepEqual(ownershipNotes(current, "es", es.projects.note), [
    "GloboPop, Premiere y Combate Play son propiedad de Globo. Colaboré en ellas como desarrollador Android a través de act digital.",
  ]);
});

test("single app uses the singular template", () => {
  const one = [globo("GloboPop"), portfolio];
  assert.deepEqual(ownershipNotes(one, "en", en.projects.note), [
    "GloboPop is owned by Globo. I contributed to it as an Android developer through act digital.",
  ]);
  assert.deepEqual(ownershipNotes(one, "pt-br", ptBr.projects.note), [
    "GloboPop pertence à empresa Globo. Contribuí com ele como desenvolvedor Android por meio da empresa act digital.",
  ]);
  assert.deepEqual(ownershipNotes(one, "es", es.projects.note), [
    "GloboPop es propiedad de Globo. Colaboré en ella como desarrollador Android a través de act digital.",
  ]);
});

test("two apps are joined without a comma; no serial comma in English", () => {
  const [note] = ownershipNotes(
    [globo("GloboPop"), globo("Combate Play")],
    "en",
    en.projects.note,
  );
  assert.match(note ?? "", /^GloboPop and Combate Play are owned by Globo\. /);
  assert.doesNotMatch(note ?? "", /, and /);
});

test("two owners give two sentence pairs in card order", () => {
  const notes = ownershipNotes(
    [
      {
        title: "A",
        ownership: "contributor",
        owner: "Acme",
        via: "act digital",
      },
      globo("GloboPop"),
      {
        title: "B",
        ownership: "contributor",
        owner: "Acme",
        via: "act digital",
      },
    ],
    "en",
    en.projects.note,
  );
  assert.deepEqual(notes, [
    "A and B are owned by Acme. I contributed to them as an Android developer through act digital.",
    "GloboPop is owned by Globo. I contributed to it as an Android developer through act digital.",
  ]);
});

test("a group without via ends after 'Android developer'", () => {
  assert.deepEqual(
    ownershipNotes(
      [{ title: "GloboPop", ownership: "contributor", owner: "Globo" }],
      "en",
      en.projects.note,
    ),
    [
      "GloboPop is owned by Globo. I contributed to it as an Android developer.",
    ],
  );
});

test("same owner with and without via are separate groups", () => {
  const notes = ownershipNotes(
    [
      globo("GloboPop"),
      { title: "Premiere", ownership: "contributor", owner: "Globo" },
    ],
    "en",
    en.projects.note,
  );
  assert.equal(notes.length, 2);
});

test("hidden projects are excluded by the caller's list", () => {
  const visible = current.filter((p) => p.title !== "Premiere");
  const [note] = ownershipNotes(visible, "en", en.projects.note);
  assert.match(note ?? "", /^GloboPop and Combate Play are owned by Globo\. /);
});

test("no notes without contributor projects", () => {
  assert.deepEqual(ownershipNotes([portfolio], "en", en.projects.note), []);
  assert.deepEqual(ownershipNotes([], "es", es.projects.note), []);
});
