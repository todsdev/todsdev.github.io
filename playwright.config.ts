import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env.CI);
const PORT = 4322;
const SMOKE_URL = process.env.SMOKE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: SMOKE_URL ?? `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  ...(SMOKE_URL
    ? {
        projects: [
          {
            name: "smoke",
            testMatch: "smoke.spec.ts",
            use: { ...devices["Desktop Chrome"], baseURL: SMOKE_URL },
          },
        ],
      }
    : {
        testIgnore: "smoke.spec.ts",
        projects: [
          {
            name: "desktop",
            use: { ...devices["Desktop Chrome"] },
          },
          {
            name: "mobile",
            testIgnore: ["build-output.spec.ts", "smoke.spec.ts"],
            use: { ...devices["Pixel 7"] },
          },
        ],
        webServer: {
          // In CI the build gate has already run, so only the preview starts.
          command: CI
            ? `npm run preview -- --port ${PORT} --ignore-lock`
            : `npm run build && npm run preview -- --port ${PORT} --ignore-lock`,
          url: `http://localhost:${PORT}`,
          reuseExistingServer: false,
          timeout: 180_000,
        },
      }),
});
