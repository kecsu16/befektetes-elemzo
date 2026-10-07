import test from "node:test";
import assert from "node:assert/strict";
import { priceRows, effectiveUpdated } from "../js/prices.js";

test("priceRows rendez tickerre és megtartja a hiányt", () => {
  const rows = priceRows({
    prices: {
      "OTP.BD": { price: 1, change_pct: 0.1, currency: "HUF", time: "t" },
      AAPL: { price: 2, change_pct: null, currency: "USD", time: null },
    },
  });
  assert.deepEqual(rows.map((r) => r.ticker), ["AAPL", "OTP.BD"]);
  assert.equal(rows[0].change_pct, null);
});

test("priceRows hiányzó prices esetén üres", () => {
  assert.deepEqual(priceRows(null), []);
  assert.deepEqual(priceRows({}), []);
});

test("effectiveUpdated: prices.json az elsődleges, meta a tartalék", () => {
  assert.equal(effectiveUpdated({ updated: "a" }, { prices_updated: "b" }), "a");
  assert.equal(effectiveUpdated(null, { prices_updated: "b" }), "b");
  assert.equal(effectiveUpdated(null, null), null);
});

test("hibaszám: csak a tényleges hibákat számolja kategóriánként", async () => {
  const { errorCount } = await import("../js/prices.js");
  assert.equal(errorCount({ prices: {}, daily: {} }), 0);
  assert.equal(errorCount({ prices: { BAD: "x" }, daily: { A: "y", B: "z" } }), 3);
  assert.equal(errorCount(null), 0);
});
