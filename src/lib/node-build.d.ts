/**
 * Minimal types for the Node APIs used at build time by components (the résumé fallback in
 * Contact.astro checks which public/resume files exist), so they type-check without adding
 * @types/node. Remove this file if @types/node is ever added.
 */
declare module "node:fs" {
  export function existsSync(path: string): boolean;
}

declare module "node:path" {
  export function join(...paths: string[]): string;
}

declare const process: { cwd(): string };
