import { readFileSync } from "node:fs";
import { join } from "node:path";

/** The built site to inspect: `DIST` points the build-output tests at a copy (see B3). */
export const distDir = (): string =>
  process.env.DIST ?? join(process.cwd(), "dist");

export const readDist = (file: string): string =>
  readFileSync(join(distDir(), file), "utf8");
