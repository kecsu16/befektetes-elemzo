import test from "node:test";
import assert from "node:assert/strict";
import { isTradingWindow, isStale } from "../js/freshness.js";

test("kereskedési ablak télen", () => {
  assert.equal(isTradingWindow(new Date("2026-01-14T08:00:00Z")), true);
  assert.equal(isTradingWindow(new Date("2026-01-14T07:59:00Z")), false);
  assert.equal(isTradingWindow(new Date("2026-01-14T21:30:00Z")), true);
  assert.equal(isTradingWindow(new Date("2026-01-14T21:31:00Z")), false);
});
test("nyáron és hétvégén", () => {
  assert.equal(isTradingWindow(new Date("2026-07-01T07:00:00Z")), true);
  assert.equal(isTradingWindow(new Date("2026-07-04T10:00:00Z")), false);
});
test("régi adat csak kereskedési időben jelez", () => {
  const now = new Date("2026-01-14T12:00:00Z");
  assert.equal(isStale("2026-01-14T10:59:00Z", now), true);
  assert.equal(isStale("2026-01-14T11:30:00Z", now), false);
  assert.equal(isStale("2026-01-09T21:30:00Z", new Date("2026-01-10T12:00:00Z")), false);
  assert.equal(isStale(null, now), true);
});
