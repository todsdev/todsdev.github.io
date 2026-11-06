/**
 * Minimal types for the Node APIs used at build time by components (the résumé fallback in
 * src/lib/resume.ts checks which public/resume files exist) and by tests that read content
 * files, so they type-check without adding @types/node. Remove this file if @types/node is
 * ever added.
 */
declare module "node:fs" {
  export function existsSync(path: string): boolean;
  export function readFileSync(path: string | URL, encoding: "utf8"): string;
}

declare module "node:path" {
  export function join(...paths: string[]): string;
}

declare const process: { cwd(): string };
