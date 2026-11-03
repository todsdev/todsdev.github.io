/**
 * Minimal types for the Node built-in test APIs used by *.test.ts files, so they
 * type-check without adding @types/node. Tests still run against the real Node
 * runtime, so an incomplete declaration can't hide a failing assertion.
 * Remove this file if @types/node is ever added.
 */
declare module "node:test" {
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
}

declare module "node:assert/strict" {
  interface Assert {
    equal(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    ok(value: unknown, message?: string): asserts value;
    match(actual: string, pattern: RegExp, message?: string): void;
    doesNotMatch(actual: string, pattern: RegExp, message?: string): void;
  }
  const assert: Assert;
  export default assert;
}
