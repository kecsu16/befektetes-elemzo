import { test } from "node:test";
import assert from "node:assert/strict";
import { valuationAxisOption, priceChartOption } from "../js/charts.js";
import { filterSort, reverseDcfSentence } from "../js/views/listutil.js";

const COLORS = { text: "#111", muted: "#666", border: "#ccc", accent: "#00f", pos: "#0a0", neg: "#a00", surface: "#fff" };

test("értékelési ábra: hat jelölő", () => {
  const opt = valuationAxisOption({ bear: 80, base: 100, bull: 130, weighted: 102.5, buy_below: 76.9 }, 90, COLORS);
  assert.equal(opt.series[0].data.length, 6);
  assert.deepEqual(opt.series[0].data.map((d) => d.name).sort(),
    ["Bear", "Base", "Bull", "Súlyozott", "Vételi szint", "Jelenlegi ár"].sort());
});

test("értékelési ábra: hiányzó bull → öt jelölő és jelmagyarázat", () => {
  const opt = valuationAxisOption({ bear: 80, base: 100, bull: null, weighted: null, buy_below: null }, 90, COLORS);
  assert.equal(opt.series[0].data.length, 3);
  assert.match(opt.title.subtext, /bull: nincs adat/);
  const opt5 = valuationAxisOption({ bear: 80, base: 100, bull: null, weighted: 95, buy_below: 71 }, 90, COLORS);
  assert.equal(opt5.series[0].data.length, 5);
});

test("értékelési ábra: ár nélkül és teljesen üresen sem dob", () => {
  const opt = valuationAxisOption(null, null, COLORS);
  assert.equal(opt.series[0].data.length, 0);
  assert.match(opt.title.subtext, /jelenlegi ár: nincs adat/);
});

test("árgrafikon: három vonal, null értékek maradnak", () => {
  const s = { dates: ["2026-01-01", "2026-01-02"], close: [1, 2], sma50: [null, 1.5], sma200: [null, null] };
  const opt = priceChartOption(s, null, COLORS);
  assert.equal(opt.series.length, 3);
  assert.deepEqual(opt.series[1].data, [null, 1.5]);
  assert.deepEqual(opt.xAxis.data, s.dates);
});

test("lista: szűrés névre/tickerre és rendezés, null a végére", () => {
  const rows = [
    { ticker: "AAPL", name: "Apple Inc.", pe: 30 },
    { ticker: "MSFT", name: "Microsoft", pe: null },
    { ticker: "OTP.BD", name: "OTP Bank", pe: 8 },
  ];
  assert.deepEqual(filterSort(rows, "app", "ticker", 1).map((r) => r.ticker), ["AAPL"]);
  assert.deepEqual(filterSort(rows, "", "pe", 1).map((r) => r.ticker), ["OTP.BD", "AAPL", "MSFT"]);
  assert.deepEqual(filterSort(rows, "", "pe", -1).map((r) => r.ticker), ["AAPL", "OTP.BD", "MSFT"]);
});

test("reverse DCF mondat", () => {
  assert.equal(reverseDcfSentence(0.0734), "A piac évi 7,3% FCF-növekedést áraz be.");
  assert.equal(reverseDcfSentence(null), "Reverse DCF: nincs adat.");
});

test("tooltip minden kötelező mutatóhoz", async () => {
  const { TOOLTIPS } = await import("../js/tooltips.js");
  const need = ["pe","forward_pe","peg","ev_ebitda","ev_sales","pb","p_fcf","div_yield","fcf_yield","piotroski","altman_z","beneish_m","roic_minus_wacc","net_debt_ebitda","interest_coverage","current_ratio","sharpe","sortino","calmar","information_ratio","mdd","hist_var","param_var","rsi","macd","atr","stochastic","beta","vol_annual"];
  for (const k of need) assert.ok(TOOLTIPS[k]?.mit && TOOLTIPS[k]?.jo, k);
});
