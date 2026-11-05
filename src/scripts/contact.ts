/**
 * Contact interactions: "$ copy" (clipboard + 2s inline feedback + aria-live) and the
 * vCard download with the phone added (the static .vcf has none).
 */
import { decode, withTel } from "../lib/contact";

const FEEDBACK_MS = 2000;
const section = document.getElementById("contact");
const status = section?.querySelector<HTMLElement>("[data-copy-status]");

async function writeClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Older browsers / denied permission: hidden textarea + execCommand.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

section
  ?.querySelectorAll<HTMLButtonElement>(".contact__copy")
  .forEach((btn) => {
    let timer: number | undefined;
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      if (!value) return;
      await writeClipboard(value);
      const message =
        btn
          .querySelector(".contact__copy-done")
          ?.textContent?.replace(/^>\s*/, "") ?? "";
      btn.dataset.copied = "";
      if (status) {
        status.textContent = "";
        requestAnimationFrame(() => (status.textContent = message));
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        delete btn.dataset.copied;
      }, FEEDBACK_MS);
    });
  });

section
  ?.querySelector<HTMLAnchorElement>("a[data-vcard]")
  ?.addEventListener("click", async (event) => {
    const phone = section.querySelector<HTMLElement>(
      '[data-kind="phone"][data-enc-url]',
    );
    if (!phone) return; // no phone contact: the static card is complete
    event.preventDefault();
    const link = event.currentTarget as HTMLAnchorElement;
    const card = await (await fetch(link.href)).text();
    // Drop the URL scheme generically, so no "tel" literal ends up in the inlined HTML.
    const tel = decode(phone.dataset.encUrl ?? "").replace(/^[a-z]+:/, "");
    const blob = new Blob([withTel(card, tel)], {
      type: "text/vcard;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contact.vcf";
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
