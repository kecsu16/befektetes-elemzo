import { test } from "node:test";
import assert from "node:assert/strict";
import { effectiveTheme } from "../js/theme.js";

test("kézi választás elsőbbséget élvez, különben a rendszer dönt", () => {
  assert.equal(effectiveTheme(null, true), "dark");
  assert.equal(effectiveTheme(null, false), "light");
  assert.equal(effectiveTheme("light", true), "light");
  assert.equal(effectiveTheme("dark", false), "dark");
  assert.equal(effectiveTheme("szemét", true), "dark");
});
