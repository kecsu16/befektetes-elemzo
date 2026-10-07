import test from "node:test";
import assert from "node:assert/strict";
import { fmtNum, fmtPct, fmtMoney, fmtAgo } from "../js/format.js";

test("null → nincs adat", () => {
  assert.equal(fmtPct(null), "nincs adat");
  assert.equal(fmtNum(undefined), "nincs adat");
  assert.equal(fmtMoney(null, "USD"), "nincs adat");
  assert.equal(fmtAgo(null, new Date()), "nincs adat");
});
test("százalék magyarul", () => { assert.equal(fmtPct(0.1234), "12,3%"); });
test("szám és pénz", () => {
  assert.equal(fmtNum(12345.678), "12\u00a0345,68");
  assert.match(fmtMoney(12.5, "EUR"), /12,50/);
});
test("fmtAgo", () => {
  const now = new Date("2026-01-14T12:00:00Z");
  assert.equal(fmtAgo("2026-01-14T11:48:00Z", now), "12 perce");
  assert.equal(fmtAgo("2026-01-14T11:59:50Z", now), "épp most");
  assert.equal(fmtAgo("2026-01-14T09:00:00Z", now), "3 órája");
  assert.equal(fmtAgo("2026-01-12T12:00:00Z", now), "2 napja");
});
