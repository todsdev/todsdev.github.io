import type { Page } from "@playwright/test";
import {
  langCode,
  localePath,
  locales,
  text,
  type Locale,
} from "./support/content";
import { test, expect } from "./support/fixtures";

/** Paths to the 404 page, the locale it should detect and the path it shows. */
const PATHS: [path: string, locale: Locale, shown: string][] = [
  ["/old-page", "en", "/old-page"],
  ["/does/not/exist/", "en", "/does/not/exist/"],
  ["/pt-br/projetos/velho", "pt-br", "/pt-br/projetos/velho"],
  ["/pt-br/velho?x=1#h", "pt-br", "/pt-br/velho"],
  ["/es/viejo", "es", "/es/viejo"],
  ["/es/nope/", "es", "/es/nope/"],
  ["/espresso", "en", "/espresso"],
  ["/pt-bradley/x", "en", "/pt-bradley/x"],
  ["/ação", "en", "/ação"],
];

test("F1: the 404 page detects the locale from the path, in three locales", async ({
  page,
}) => {
  for (const [path, locale, shown] of PATHS) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    await expect(page.locator("html"), path).toHaveAttribute(
      "lang",
      langCode[locale],
    );
    await expect(page, path).toHaveTitle(
      new RegExp(`^${text(locale, "notFound.title")}`),
    );
    await expect(page.locator("h1"), path).toHaveText(
      `bash: ${shown}: command not found`,
    );
    await expect(page.locator("meta[name=robots]")).toHaveAttribute(
      "content",
      "noindex",
    );

    // Only this locale's line is visible, and the `cd` link goes to its home.
    for (const other of locales) {
      const line = page.getByText(text(other, "notFound.line"), {
        exact: true,
      });
      if (other === locale) await expect(line, path).toBeVisible();
      else await expect(line, path).toBeHidden();
    }
    const cd = page.locator("main a.not-found__cd:visible");
    await expect(cd, path).toHaveCount(1);
    await expect(cd).toHaveAttribute("href", localePath(locale));
    // The hidden destination follows the command with no space; Chrome may show one before the comma.
    await expect(cd).toHaveAccessibleName(
      new RegExp(`^cd ~ ?, ${text(locale, "notFound.destination")}$`),
    );
    await expect(
      page.getByRole("link", { name: text(locale, "skipLink"), exact: true }),
    ).toHaveCount(1);

    // One footer, in this locale.
    const footers = page.locator("footer:visible");
    await expect(footers, path).toHaveCount(1);
    await expect(footers).toContainText(text(locale, "footer.lastBuild"));
    await expect(page.locator(".site-footer__hint")).toHaveCount(0);
  }
});

/** Serves the built 404.html as the navigation response, for paths `astro preview` rejects. */
async function serve404(page: Page) {
  const html = await (await page.request.get("/404.html")).text();
  await page.route("**/*", (route) =>
    route.request().isNavigationRequest()
      ? route.fulfill({
          status: 404,
          contentType: "text/html; charset=utf-8",
          body: html,
        })
      : route.fallback(),
  );
}

const MARKUP = "<img src=x onerror=window.__pwn=1>";
const CASES: {
  name: string;
  path: string;
  serve?: boolean;
  shown: (path: string) => boolean;
}[] = [
  {
    name: "markup",
    path: `/${encodeURIComponent(MARKUP)}`,
    shown: (path) => path === `/${MARKUP}`,
  },
  {
    name: "script tag",
    path: `/${encodeURIComponent("<script>window.__pwn=1</script>")}`,
    serve: true,
    shown: (path) => path === "/<script>window.__pwn=1</script>",
  },
  {
    name: "quotes",
    path: `/${encodeURIComponent("\"'><svg onload=window.__pwn=1>")}`,
    shown: (path) => path === "/\"'><svg onload=window.__pwn=1>",
  },
  {
    name: "long",
    path: `/${"a".repeat(5000)}`,
    shown: (path) => path.endsWith("…") && [...path].length === 81,
  },
  {
    name: "cut in an emoji",
    path: `/${"a".repeat(79)}${"😀".repeat(20)}`,
    shown: (path) =>
      path.endsWith("…") &&
      [...path].length <= 81 &&
      !/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/.test(
        path,
      ),
  },
  {
    name: "malformed encoding",
    path: "/%E0%A4%A",
    serve: true,
    shown: (path) => path === "/%E0%A4%A",
  },
  {
    name: "accented",
    path: `/${encodeURIComponent("ação")}`,
    shown: (path) => path === "/ação",
  },
];

for (const { name, path, serve, shown } of CASES) {
  test(`F2: the ${name} path stays plain text at 320px`, async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "desktop project, at a 320px viewport");
    await page.setViewportSize({ width: 320, height: 700 });
    const errors: string[] = [];
    let dialogs = 0;
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", (dialog) => {
      dialogs++;
      void dialog.dismiss();
    });
    if (serve) await serve404(page);

    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    const shownPath =
      (await page.locator("[data-nf-path]").textContent()) ?? "";
    expect(shown(shownPath), shownPath.slice(0, 100)).toBe(true);
    await expect(page.locator("h1")).toContainText(": command not found");

    const result = await page.evaluate(() => ({
      pwn: (window as unknown as { __pwn?: number }).__pwn,
      created: document.querySelectorAll(
        "main img, main svg, h1 *:not([data-nf-path])",
      ).length,
      overflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    }));
    expect(result.pwn).toBeUndefined();
    expect(dialogs).toBe(0);
    expect(result.created).toBe(0);
    expect(result.overflow).toBe(false);
    expect(errors).toEqual([]);
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("F3: the 404 page is English with the generic path", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "desktop only");
    await page.goto("/pt-br/velho");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveText(
      "bash: /this-page: command not found",
    );
    await expect(
      page.getByText(text("en", "notFound.line"), { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(text("pt-br", "notFound.line"), { exact: true }),
    ).toBeHidden();
  });
});

test("F3: with JavaScript no other locale's text is visible at first paint", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop only");
  await page.addInitScript(() => {
    const w = window as unknown as { __langSetAt: number | null };
    w.__langSetAt = null;
    new MutationObserver(() => {
      if (w.__langSetAt === null && document.documentElement.lang !== "en") {
        w.__langSetAt = performance.now();
      }
    }).observe(document, {
      attributes: true,
      subtree: true,
      attributeFilter: ["lang"],
    });
  });
  await page.goto("/pt-br/velho");
  await expect(page.locator("html")).toHaveAttribute("lang", langCode["pt-br"]);
  const timing = await page.evaluate(() => ({
    langSetAt: (window as unknown as { __langSetAt: number | null })
      .__langSetAt,
    firstPaint: performance.getEntriesByName("first-paint")[0]?.startTime,
  }));
  expect(timing.langSetAt).not.toBeNull();
  expect(timing.firstPaint).toBeDefined();
  expect(timing.langSetAt!).toBeLessThan(timing.firstPaint!);
  await expect(
    page.getByText(text("en", "notFound.line"), { exact: true }),
  ).toBeHidden();
});
