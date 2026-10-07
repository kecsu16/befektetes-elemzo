import { test } from "node:test";
import assert from "node:assert/strict";
import { alertZone, donutData } from "../js/portfolioutil.js";

const WL = {
  poziciok: [{ ticker: "AAPL", riasztas: { ar_alatt: 310, ar_felett: null, veteli_szint: true, rsi_also: 30, rsi_felso: 70 } }],
  figyelt: ["OTP.BD", "MSFT"],
};
const PR = { prices: { AAPL: { price: 300 }, "OTP.BD": { price: 40000 }, MSFT: { price: 500 } } };
const T = {
  AAPL: { valuation: { dcf: { buy_below: 320 } }, technical: { last: { rsi14: 25 } } },
  "OTP.BD": { valuation: { dcf: null }, technical: { last: { rsi14: 50 } } },
  MSFT: { valuation: { dcf: { buy_below: 100 } }, technical: { last: { rsi14: 75 } } },
};

test("riasztási zóna: szint alatt, vételi szint alatt, RSI szélső", () => {
  const z = alertZone(WL, PR, T);
  const a = z.find((x) => x.ticker === "AAPL");
  assert.equal(a.reasons.length, 3);
  assert.ok(a.reasons.some((r) => r.includes("vételi szint")));
  const m = z.find((x) => x.ticker === "MSFT");
  assert.deepEqual(m.reasons, ["RSI 75 (túlvett)"]);   // figyelt papír: alap RSI-küszöbök 30/70
  assert.ok(!z.find((x) => x.ticker === "OTP.BD"));
});

test("fánk adatok sorrendben, kis tételek összevonva", () => {
  const d = donutData({ A: 0.5, B: 0.3, C: 0.15, D: 0.03, E: 0.02 }, 0.04);
  assert.deepEqual(d.map((x) => x.name), ["A", "B", "C", "Egyéb"]);
  assert.ok(Math.abs(d[3].value - 0.05) < 1e-12);
});
