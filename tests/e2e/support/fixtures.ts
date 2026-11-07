import { test as base, expect } from "@playwright/test";

/** Every Umami host. Aborting them means a test can never count as a visit. */
const UMAMI = /^https:\/\/([a-z0-9-]+\.)*umami\.(is|dev)\//;
const TRACKER_SCRIPT = "https://cloud.umami.is/script.js";
/** Where the stand-in sends events. The request is recorded and aborted, so nothing leaves. */
const ENDPOINT = "https://events.example.invalid/collect";

/** Test-only tracker, served by interception. It never reaches the built site. */
const STAND_IN = `window.umami = {
  track(name, data) {
    fetch(${JSON.stringify(ENDPOINT)}, {
      method: "POST",
      body: JSON.stringify({ name, data }),
    }).catch(() => {});
  },
};`;

export interface TrackedEvent {
  name: string;
  data: Record<string, string>;
}

interface Fixtures {
  /** Auto: stops every request to an Umami host in every test. */
  umamiBlock: void;
  /** Serves the stand-in tracker and records the events it sends, as intercepted requests. */
  events: TrackedEvent[];
}

export const test = base.extend<Fixtures>({
  umamiBlock: [
    async ({ context }, use) => {
      await context.route(UMAMI, (route) => route.abort());
      await use();
    },
    { auto: true },
  ],

  events: async ({ context, umamiBlock }, use) => {
    void umamiBlock; // registered first, so the routes below take priority over the block
    const events: TrackedEvent[] = [];
    await context.route(TRACKER_SCRIPT, (route) =>
      route.fulfill({ contentType: "text/javascript", body: STAND_IN }),
    );
    await context.route(ENDPOINT, (route) => {
      events.push(JSON.parse(route.request().postData() ?? "{}"));
      return route.abort();
    });
    await use(events);
  },
});

export { expect };
