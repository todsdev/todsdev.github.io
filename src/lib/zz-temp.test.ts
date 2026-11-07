import { test } from "node:test";
import assert from "node:assert/strict";

test("temporary failure", () => {
  assert.equal(1, 2);
});
