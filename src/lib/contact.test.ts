/** Contact actions, phone encoding, WhatsApp URL and vCard text, verified with fixtures. Run with `npm test`. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { en } from "../i18n/en.ts";
import { es } from "../i18n/es.ts";
import { ptBr } from "../i18n/pt-br.ts";
import {
  actionsFor,
  decode,
  encode,
  isProtected,
  vcard,
  whatsappUrl,
  withTel,
} from "./contact.ts";

const PHONE = "+55 21 97147-0428";
const TEL = "tel:+5521971470428";
const WA = "https://wa.me/5521971470428";

test("actions per kind", () => {
  const cmds = (k: Parameters<typeof actionsFor>[0]) =>
    actionsFor(k).map((a) => `${a.command}:${a.type}:${a.external}`);
  assert.deepEqual(cmds("email"), ["mail:link:false", "copy:copy:false"]);
  assert.deepEqual(cmds("phone"), ["call:link:false", "copy:copy:false"]);
  assert.deepEqual(cmds("whatsapp"), ["chat:link:true"]);
  for (const k of ["linkedin", "github", "instagram"] as const) {
    assert.deepEqual(cmds(k), ["open:link:true"]);
    assert.equal(actionsFor(k)[0]?.destination, k);
  }
});

test("only phone and whatsapp are protected", () => {
  assert.ok(isProtected("phone") && isProtected("whatsapp"));
  assert.ok(!isProtected("email") && !isProtected("instagram"));
});

test("encode round-trips and hides every digit run of the number", () => {
  for (const v of [PHONE, TEL, WA]) {
    const e = encode(v);
    assert.equal(decode(e), v);
    for (const needle of [
      "5521971470428",
      "21971470428",
      "97147",
      "0428",
      "tel:",
      "wa.me",
    ]) {
      assert.ok(!e.includes(needle), `${e} contains ${needle}`);
    }
    assert.doesNotMatch(e, /\d{4,}/);
  }
});

test("WhatsApp URL carries the encoded message per locale", () => {
  assert.equal(
    whatsappUrl(WA, en.contact.whatsappText),
    "https://wa.me/5521971470428?text=Hi%20Thiago!%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20talk.",
  );
  assert.equal(
    whatsappUrl(WA, ptBr.contact.whatsappText),
    "https://wa.me/5521971470428?text=Ol%C3%A1%2C%20Thiago!%20Vi%20o%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20conversar.",
  );
  assert.equal(
    whatsappUrl(WA, es.contact.whatsappText),
    "https://wa.me/5521971470428?text=%C2%A1Hola%2C%20Thiago!%20Vi%20tu%20portafolio%20y%20me%20gustar%C3%ADa%20conversar.",
  );
});

const fields = {
  name: "Thiago Rodrigues",
  role: "Android Developer",
  email: "trod.dev@gmail.com",
  website: "https://todsdev.github.io/es/",
  linkedin: "https://www.linkedin.com/in/tods/",
  github: "https://github.com/todsdev",
};

test("vCard without phone: fields, CRLF endings, no TEL", () => {
  const card = vcard(fields);
  assert.equal(
    card,
    [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Rodrigues;Thiago;;;",
      "FN:Thiago Rodrigues",
      "TITLE:Android Developer",
      "EMAIL;TYPE=INTERNET:trod.dev@gmail.com",
      "URL:https://todsdev.github.io/es/",
      "URL;TYPE=LinkedIn:https://www.linkedin.com/in/tods/",
      "URL;TYPE=GitHub:https://github.com/todsdev",
      "END:VCARD",
      "",
    ].join("\r\n"),
  );
  assert.ok(!card.includes("TEL"));
  assert.ok(!/[^\r]\n/.test(card), "every line ends with CRLF");
});

test("withTel adds the phone after EMAIL, same as vcard({ tel })", () => {
  const added = withTel(vcard(fields), "+5521971470428");
  assert.equal(added, vcard({ ...fields, tel: "+5521971470428" }));
  assert.match(added, /TEL;TYPE=CELL:\+5521971470428\r\nURL:/);
  assert.ok(added.endsWith("END:VCARD\r\n"));
});

test("vCard escapes commas and semicolons in text values", () => {
  assert.match(
    vcard({ ...fields, role: "Dev; Android, Kotlin" }),
    /TITLE:Dev\\; Android\\, Kotlin\r\n/,
  );
});
