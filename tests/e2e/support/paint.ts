import type { Page } from "@playwright/test";

/** The time of the page's first paint, once the browser has reported it. */
export async function firstPaint(page: Page): Promise<number> {
  await page.waitForFunction(
    () => performance.getEntriesByName("first-paint").length > 0,
  );
  return page.evaluate(
    () => performance.getEntriesByName("first-paint")[0]!.startTime,
  );
}
