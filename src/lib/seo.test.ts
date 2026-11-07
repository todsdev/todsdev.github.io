/** Share tags, sitemap, robots and JSON-LD, verified with fixtures. Run with `npm test`. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { en } from "../i18n/en.ts";
import { es } from "../i18n/es.ts";
import { ptBr } from "../i18n/pt-br.ts";
import {
  imageUrl,
  jsonLdScript,
  pageUrl,
  personJsonLd,
  robotsTxt,
  shareTags,
  sitemapXml,
} from "./seo.ts";

const input = { title: "T", description: "D", imageAlt: "A" };
const value = (tags: { key: string; content: string }[], key: string) =>
  tags.filter((t) => t.key === key).map((t) => t.content);
const contacts = [
  { kind: "email", url: "mailto:a@b.co" },
  { kind: "phone", url: "tel:+5500000000000" },
  { kind: "whatsapp", url: "https://wa.me/5500000000000" },
  { kind: "linkedin", url: "https://www.linkedin.com/in/x/" },
  { kind: "github", url: "https://github.com/x" },
  { kind: "instagram", url: "https://www.instagram.com/x/" },
];

test("canonical URLs keep the trailing slash GitHub Pages serves", () => {
  assert.equal(pageUrl("en"), "https://todsdev.github.io/");
  assert.equal(pageUrl("pt-br"), "https://todsdev.github.io/pt-br/");
  assert.equal(pageUrl("es"), "https://todsdev.github.io/es/");
  assert.equal(imageUrl("pt-br"), "https://todsdev.github.io/og/pt-br.png");
});

test("Open Graph tags: url, locale, alternates and a 1200x630 absolute image", () => {
  const tags = shareTags("es", input);
  assert.deepEqual(value(tags, "og:url"), ["https://todsdev.github.io/es/"]);
  assert.deepEqual(value(tags, "og:locale"), ["es_ES"]);
  assert.deepEqual(value(tags, "og:locale:alternate"), ["en_US", "pt_BR"]);
  assert.deepEqual(value(tags, "og:image"), [
    "https://todsdev.github.io/og/es.png",
  ]);
  assert.deepEqual(value(tags, "og:image:width"), ["1200"]);
  assert.deepEqual(value(tags, "og:image:height"), ["630"]);
  assert.deepEqual(value(tags, "og:type"), ["website"]);
  for (const key of ["og:title", "og:image", "og:description", "og:url"]) {
    assert.ok(value(tags, key)[0], `${key} is non-empty`);
  }
});

test("Twitter tags match the Open Graph values", () => {
  const tags = shareTags("en", input);
  assert.deepEqual(value(tags, "twitter:card"), ["summary_large_image"]);
  for (const k of ["title", "description", "image", "image:alt"]) {
    assert.deepEqual(value(tags, `twitter:${k}`), value(tags, `og:${k}`));
  }
  assert.ok(
    tags
      .filter((t) => t.key.startsWith("og:"))
      .every((t) => t.attr === "property"),
  );
  assert.ok(
    tags
      .filter((t) => t.key.startsWith("twitter:"))
      .every((t) => t.attr === "name"),
  );
});

test("sitemap lists the three homes with four alternates each and no 404", () => {
  const xml = sitemapXml();
  assert.deepEqual(
    [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]),
    [
      "https://todsdev.github.io/",
      "https://todsdev.github.io/pt-br/",
      "https://todsdev.github.io/es/",
    ],
  );
  assert.equal((xml.match(/<url>/g) ?? []).length, 3);
  assert.equal((xml.match(/xhtml:link rel="alternate"/g) ?? []).length, 12);
  for (const lang of ["en", "pt-BR", "es", "x-default"]) {
    assert.equal(
      (xml.match(new RegExp(`hreflang="${lang}"`, "g")) ?? []).length,
      3,
    );
  }
  assert.doesNotMatch(xml, /404/);
});

test("robots allows everything and points to the absolute sitemap", () => {
  const txt = robotsTxt();
  assert.match(txt, /^User-agent: \*\nAllow: \/\n/);
  assert.match(txt, /Sitemap: https:\/\/todsdev\.github\.io\/sitemap\.xml\n$/);
});

test("JSON-LD Person has the named fields and sameAs by kind, never a phone", () => {
  const data = personJsonLd({
    locale: "pt-br",
    name: "N",
    jobTitle: "J",
    contacts,
  });
  assert.equal(data["@type"], "Person");
  assert.equal(data.url, "https://todsdev.github.io/pt-br/");
  assert.equal(data.email, "a@b.co");
  assert.deepEqual(data.sameAs, [
    "https://www.linkedin.com/in/x/",
    "https://github.com/x",
    "https://www.instagram.com/x/",
  ]);
  const json = jsonLdScript(data);
  assert.doesNotMatch(json, /telephone|tel:|wa\.me|5500000000000/);
  assert.throws(
    () =>
      personJsonLd({ locale: "en", name: "N", jobTitle: "J", contacts: [] }),
    /email/,
  );
});

test("JSON-LD can't close its script element", () => {
  const json = jsonLdScript({ name: "</script><script>alert(1)</script>" });
  assert.doesNotMatch(json, /</);
  assert.equal(JSON.parse(json).name, "</script><script>alert(1)</script>");
});

test("each meta.title ends with its meta.jobTitle and the image alt is set", () => {
  for (const d of [en, ptBr, es]) {
    assert.ok(d.meta.title.endsWith(d.meta.jobTitle), d.meta.title);
    assert.ok(d.meta.ogImageAlt.length > 0);
  }
  assert.deepEqual(
    [en, ptBr, es].map((d) => d.meta.jobTitle),
    ["Android Developer", "Desenvolvedor Android", "Desarrollador Android"],
  );
});
