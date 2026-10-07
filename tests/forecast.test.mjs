import { test } from "node:test";
import assert from "node:assert/strict";
import { futureBizDates, fanData, accuracyRows, NOT_NAIVE_TEXT } from "../js/forecastutil.js";

test("jövőbeli munkanapok hétvége nélkül", () => {
  const d = futureBizDates("2026-10-09", 3); // péntek
  assert.deepEqual(d, ["2026-10-12", "2026-10-13", "2026-10-14"]);
});

const H = {
  "21": { ensemble: { "5": 90, "25": 95, "50": 100, "75": 105, "95": 110 } },
  "126": { ensemble: { "5": 80, "25": 92, "50": 102, "75": 112, "95": 125 } },
  "252": { ensemble: null },
};

test("legyező: az utolsó árból indul, a horizontoknál vannak értékek", () => {
  const f = fanData("2026-10-07", 100, H, 130);
  assert.equal(f.dates.length, 130);
  assert.equal(f.q50[0], 100);           // az utolsó ismert napnál indul
  assert.equal(f.q50[21], 100);           // 21. jövőbeli munkanap
  assert.equal(f.q50[126], 102);
  assert.equal(f.lo90[21], 90);
  assert.equal(f.band90[21], 20);          // q95 − q5 (halmozott sáv)
  assert.equal(f.band50[126], 20);
  // köztes napok lineárisan interpolálva (a halmozott sáv nem eshet nullára)
  assert.ok(Math.abs(f.q50[73] - (100 + (102 - 100) * (73 - 21) / (126 - 21))) < 1e-9);
  assert.ok(Math.abs(f.band90[10] - 20 * 10 / 21) < 1e-9);
  assert.equal(f.q50[127], null);          // az utolsó horizont után nincs érték
});

test("legyező üres, ha nincs ensemble", () => {
  const f = fanData("2026-10-07", 100, { "21": { ensemble: null } }, 30);
  assert.equal(f, null);
});

test("pontossági sorok: a naivat nem verő modell kiemelve és kimondva", () => {
  const bt = {
    naive: { n: 40, mae: 5, mape: 0.05, hit_rate: null, cov90: 0.9, cov50: 0.5, weight: 0, beats_naive: null, reason: "viszonyítási alap" },
    gbm: { n: 40, mae: 4, mape: 0.04, hit_rate: 0.6, cov90: 0.88, cov50: 0.47, weight: 1, beats_naive: true, reason: "" },
    arima: { n: 40, mae: 6, mape: 0.06, hit_rate: 0.5, cov90: 0.8, cov50: 0.4, weight: 0, beats_naive: false, reason: "nem veri" },
    index: { n: 40, mae: 5.5, mape: 0.055, hit_rate: 0.55, cov90: null, cov50: null },
  };
  const rows = accuracyRows(bt);
  const ar = rows.find((r) => r.key === "arima");
  assert.equal(ar.bad, true);
  assert.equal(ar.note, NOT_NAIVE_TEXT);
  assert.equal(rows.find((r) => r.key === "gbm").bad, false);
  assert.equal(rows[rows.length - 1].key, "index");
});

test("modellek összesítése több papír backtestjéből", async () => {
  const { summarizeModels } = await import("../js/forecastutil.js");
  const a = { gbm: { mae: 1, weight: 1, beats_naive: true, cov90: 0.9 }, naive: { mae: 2, weight: 0, beats_naive: null, cov90: 0.8 }, index: { mae: 3 } };
  const b = { gbm: { mae: 3, weight: 0, beats_naive: false, cov90: 0.7 }, naive: { mae: 2, weight: 1, beats_naive: null, cov90: 0.85 }, index: { mae: 3 } };
  const s = summarizeModels([a, b]);
  const g = s.find((m) => m.key === "gbm");
  assert.equal(g.beats, 1); assert.equal(g.tested, 2);
  assert.equal(g.avgWeight, 0.5); assert.ok(Math.abs(g.avgCov90 - 0.8) < 1e-12);
  assert.ok(!s.find((m) => m.key === "index"));
});

test("valószínűség kijelzése a sávon kívül: < 5% / > 95%", async () => {
  const { fmtProb } = await import("../js/forecastutil.js");
  assert.equal(fmtProb(0), "< 5%");
  assert.equal(fmtProb(0.97), "> 95%");
  assert.equal(fmtProb(0.5), "50%");
  assert.equal(fmtProb(null), "nincs adat");
});
