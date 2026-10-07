import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { futureValue, realRate, pensionRefund, productResult, compareProducts } from "../js/calc/savings.js";

const CASES = JSON.parse(readFileSync(new URL("./savings_cases.json", import.meta.url)));
const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

test("kamatos kamat és havi befizetés (ugyanazok az értékek, mint Pythonban)", () => {
  near(futureValue(1_000_000, 0, 0.05, 10, 1), 1628894.63, 0.01);
  near(futureValue(0, 10_000, 0.06, 10), 1638793.47, 0.01);
  near(realRate(0.05, 0.04), 0.009615, 1e-6);
});

test("nyugdíjpénztári visszatérítés plafonnal", () => {
  assert.equal(pensionRefund(600_000, { arany: 0.2, plafon_huf: 150_000 }), 120_000);
  assert.equal(pensionRefund(1_000_000, { arany: 0.2, plafon_huf: 150_000 }), 150_000);
});

test("TBSZ 5 év után adómentes", () => {
  const p = { id: "t", hozam: 0.06, adokulcs: 0.15, szocho: 0.13, adomentes_evek: 5, tbsz: true, visszaterites: null, kedvezmeny: null };
  const r = productResult(p, 1_000_000, 0, 5, 0.04);
  near(r.net_fv, r.nominal_fv, 1e-9);
});

for (const c of CASES) {
  test(`közös eset: ${c.name} (1 Ft-on belül egyezik a Pythonnal)`, () => {
    const r = productResult(c.product, c.initial, c.monthly, c.years, c.inflation);
    for (const [k, v] of Object.entries(c.expected)) near(r[k], v, 1.0);
  });
}

test("compareProducts az inflációval", () => {
  const a = { inflacio: { HUF: 0.04 }, megtakaritas: { termekek: CASES.map((c) => c.product) } };
  const out = compareProducts(a, 100000, 10000, 5);
  assert.equal(out.length, 3);
  assert.ok(out.every((r) => r.net_fv > 0 && Number.isFinite(r.effective_net_rate)));
});
