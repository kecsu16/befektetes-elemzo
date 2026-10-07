import { fetchData } from "../api.js";
import { fmtNum, fmtPct, fmtMoney, fmtAgo } from "../format.js";
import { el, card, kvTable, gridTable, chartBox } from "../dom.js";
import { valuationAxisOption, priceChartOption } from "../charts.js";
import { reverseDcfSentence } from "./listutil.js";
import { attachTooltip } from "../tooltips.js";

const isNum = (x) => typeof x === "number" && Number.isFinite(x);
const g = (o, ...path) => path.reduce((a, k) => (a == null ? undefined : a[k]), o);
const sign = (x) => (isNum(x) ? (x > 0 ? "pos" : x < 0 ? "neg" : "") : "");

export async function render(root, ticker) {
  root.replaceChildren(card(ticker, el("p", { className: "muted", textContent: "Betöltés…" })));
  let d;
  try {
    d = await fetchData(`tickers/${encodeURIComponent(ticker)}.json`);
  } catch (e) {
    root.replaceChildren(card(ticker, el("p", { className: "error",
      textContent: e?.status === 404 ? "Ehhez a papírhoz nincs részletes elemzés (csak a saját és figyelt papírokhoz készül)." : "Nem sikerült betölteni az elemzést." })));
    return null;
  }
  const ccy = d.currency;
  const val = d.valuation || {};
  const dcf = val.dcf || {};
  root.replaceChildren(
    header(d),
    priceSection(d),
    valuationSection(d, val, dcf, ccy),
    sensitivitySection(val),
    qualitySection(d.fundamentals || {}),
    riskSection(d.risk || {}),
    technicalSection(d.technical || {}),
    analystSection(d.analyst, ccy),
    missingSection(d.missing),
  );
  return null;
}

function header(d) {
  const sub = [d.sector, d.country, d.currency].filter(Boolean).join(" · ") || "nincs adat";
  return card(`${d.name || d.ticker} (${d.ticker})`,
    el("p", { className: "big", textContent: fmtMoney(d.price, d.currency || "USD") }),
    el("p", { className: "muted", textContent: `${sub} · elemzés: ${d.updated ? fmtAgo(d.updated) : "nincs adat"}` }),
    el("p", {}, el("a", { href: "#papirok", textContent: "← vissza a listához" })));
}

function priceSection(d) {
  const s = g(d, "technical", "series");
  if (!s || !s.dates?.length) return card("Árfolyam", el("p", { className: "muted", textContent: "nincs adat" }));
  return card("Árfolyam (2 év, SMA50/SMA200)", chartBox(() => priceChartOption(s), 300));
}

function valuationSection(d, val, dcf, ccy) {
  const m = val.multiples || {};
  const peers = val.peers || {};
  const money = (x) => fmtMoney(x, ccy || "USD");
  const kids = [
    chartBox(() => valuationAxisOption(dcf, d.price), 140),
    kvTable([
      ["DCF bear / base / bull", `${money(dcf.bear)} / ${money(dcf.base)} / ${money(dcf.bull)}`, "dcf"],
      ["Súlyozott belső érték", money(dcf.weighted), "dcf_weighted"],
      ["Vételi szint (biztonsági sávval)", money(dcf.buy_below), "buy_below"],
      ["Biztonsági sáv a mai árhoz", fmtPct(dcf.margin_of_safety_pct), "margin_of_safety_pct", sign(dcf.margin_of_safety_pct)],
      ["WACC", fmtPct(g(val, "wacc", "value")), "wacc"],
      ["Graham-szám", money(val.graham), "graham"],
      ["Lynch fair value", money(val.lynch), "lynch"],
      ["DDM (Gordon / kétlépcsős)", `${money(g(val, "ddm", "gordon"))} / ${money(g(val, "ddm", "two_stage"))}`, "ddm"],
      ["Residual income", money(g(val, "residual_income", "value")), "residual_income"],
    ]),
    el("p", { textContent: reverseDcfSentence(val.reverse_dcf_growth) }),
  ];
  const keys = [["pe", "P/E"], ["forward_pe", "Forward P/E"], ["peg", "PEG"], ["ev_ebitda", "EV/EBITDA"], ["ev_sales", "EV/Sales"],
    ["pb", "P/B"], ["p_fcf", "P/FCF"], ["div_yield", "Osztalékhozam"], ["fcf_yield", "FCF-hozam"]];
  const pct = new Set(["div_yield", "fcf_yield"]);
  const f = (k, x) => (pct.has(k) ? fmtPct(x) : fmtNum(x));
  const t = el("table", { className: "kv" });
  const hr = t.createTHead().insertRow();
  for (const h of ["Szorzó", "Papír", `Szektormedián (${peers.sector || "?"}, n=${peers.n ?? "?"})`]) hr.append(el("th", { textContent: h }));
  const body = t.createTBody();
  for (const [k, label] of keys) {
    const tr = body.insertRow();
    const th = el("th", { textContent: label });
    attachTooltip(th, k);
    tr.append(th);
    for (const x of [m[k], peers[k]]) { const td = tr.insertCell(); td.textContent = f(k, x); td.className = "num"; }
  }
  kids.push(el("h3", { textContent: "Szorzók" }), el("div", { className: "table-wrap" }, t));
  return card("Értékelés", ...kids);
}

function sensitivitySection(val) {
  const s = val.sensitivity;
  if (!s) return card("Érzékenység", el("p", { className: "muted", textContent: "nincs adat (nincs DCF)" }));
  const blocks = [];
  const lab = { wacc: "WACC", terminal_growth: "örök növ.", growth: "növekedés", fcf_margin: "FCF-marzs" };
  for (const tbl of Object.values(s)) {
    if (!tbl?.grid) continue;
    const head = [`${lab[tbl.row] || tbl.row} ↓ / ${lab[tbl.col] || tbl.col} →`, ...tbl.cols.map((c) => fmtPct(c))];
    const rows = tbl.rows.map((r, i) => [fmtPct(r), ...tbl.grid[i].map((x) => fmtNum(x))]);
    blocks.push(gridTable(head, rows));
  }
  return card("Érzékenység (belső érték / részvény)", ...blocks);
}

function qualitySection(f) {
  const mg = f.margins || {}, tr = f.margin_trend || {}, rt = f.returns || {}, gr = f.growth || {}, bl = f.balance || {};
  const cq = f.cash_quality || {}, dp = f.dupont || {};
  const trend = (k) => (isNum(tr[k]) ? ` (trend ${tr[k] > 0 ? "+" : ""}${fmtPct(tr[k])}/év)` : "");
  const gRow = (k, label) => [label, ["1y", "3y", "5y"].map((h) => `${h}: ${fmtPct(g(gr, k, h))}`).join(" · "), "cagr"];
  return card(`Fundamentumok és minőség (${f.years_available ?? 0} év adat)`, kvTable([
    ["Piotroski F-score", isNum(g(f, "piotroski", "score")) ? `${f.piotroski.score} / 9` : "nincs adat", "piotroski"],
    ["Altman Z-score", fmtNum(f.altman_z), "altman_z"],
    ["Beneish M-score", fmtNum(f.beneish_m), "beneish_m"],
    ["Bruttó marzs", fmtPct(mg.gross) + trend("gross"), "gross_margin"],
    ["EBITDA-marzs", fmtPct(mg.ebitda) + trend("ebitda"), "ebitda_margin"],
    ["Működési marzs", fmtPct(mg.operating) + trend("operating"), "operating_margin"],
    ["Nettó marzs", fmtPct(mg.net) + trend("net"), "net_margin"],
    ["ROE / ROA", `${fmtPct(rt.roe)} / ${fmtPct(rt.roa)}`, "roe"],
    ["ROIC − WACC", fmtPct(rt.roic_minus_wacc), "roic_minus_wacc", sign(rt.roic_minus_wacc)],
    gRow("revenue", "Árbevétel CAGR"), gRow("eps", "EPS CAGR"), gRow("fcf", "FCF CAGR"),
    ["Nettó adósság / EBITDA", fmtNum(bl.net_debt_ebitda), "net_debt_ebitda"],
    ["Kamatfedezet", fmtNum(bl.interest_coverage), "interest_coverage"],
    ["Current / quick ráta", `${fmtNum(bl.current_ratio)} / ${fmtNum(bl.quick_ratio)}`, "current_ratio"],
    ["D/E", fmtNum(bl.de), "de"],
    ["Cash conversion (FCF/nettó eredmény)", fmtNum(cq.cash_conversion), "cash_conversion"],
    ["Capex / árbevétel", fmtPct(cq.capex_ratio), "capex_ratio"],
    ["Részvényszám változása", fmtPct(cq.share_change), "share_change"],
    ["DuPont: marzs × forgási seb. × tőkeáttétel", `${fmtPct(dp.net_margin)} × ${fmtNum(dp.asset_turnover)} × ${fmtNum(dp.equity_multiplier)} = ${fmtPct(dp.roe)}`, "dupont"],
  ]));
}

function riskSection(r) {
  const v95 = g(r, "var", "95") || {}, v99 = g(r, "var", "99") || {}, dd = r.drawdown || {}, st = r.stress || {};
  return card("Kockázat", kvTable([
    ["Éves volatilitás", fmtPct(g(r, "volatility", "annual")), "vol_annual"],
    ["Béta / korreláció az indexszel", `${fmtNum(r.beta)} / ${fmtNum(r.corr_index)}`, "beta"],
    ["Sharpe / Sortino", `${fmtNum(r.sharpe)} / ${fmtNum(r.sortino)}`, "sharpe"],
    ["Calmar", fmtNum(r.calmar), "calmar"],
    ["Információs ráta", fmtNum(r.information_ratio), "information_ratio"],
    ["Max. visszaesés", fmtPct(dd.mdd), "mdd", "neg"],
    ["Helyreállás", isNum(dd.recovery_days) ? `${dd.recovery_days} kereskedési nap` : "még nem állt helyre / nincs adat", "recovery"],
    ["VaR 95% (hist / param)", `${fmtPct(v95.hist_var)} / ${fmtPct(v95.param_var)}`, "hist_var"],
    ["CVaR 95% (hist / param)", `${fmtPct(v95.hist_cvar)} / ${fmtPct(v95.param_cvar)}`, "cvar"],
    ["VaR 99% (hist / param)", `${fmtPct(v99.hist_var)} / ${fmtPct(v99.param_var)}`, "param_var"],
    ["Stressz: 2008 / 2020 / 2022", `${fmtPct(st["2008"])} / ${fmtPct(st["2020"])} / ${fmtPct(st["2022"])}`, "stress"],
  ]));
}

function technicalSection(t) {
  const l = t.last || {}, mo = t.momentum || {}, rg = t.range_52w || {}, sr = t.support_resistance || {}, cr = t.crosses || {};
  const sig = (t.signals || []).map((s) => el("li", { textContent: s.text }));
  return card("Technikai jelek",
    sig.length ? el("ul", { className: "signals" }, ...sig) : null,
    kvTable([
      ["RSI(14)", fmtNum(l.rsi14, 1), "rsi"],
      ["MACD / jel / hisztogram", `${fmtNum(l.macd)} / ${fmtNum(l.macd_signal)} / ${fmtNum(l.macd_hist)}`, "macd"],
      ["Bollinger (alsó / közép / felső)", `${fmtNum(l.bb_lower)} / ${fmtNum(l.bb_mid)} / ${fmtNum(l.bb_upper)}`, "bollinger"],
      ["ATR(14)", fmtNum(l.atr14), "atr"],
      ["Sztochasztikus %K / %D", `${fmtNum(l.stoch_k, 1)} / ${fmtNum(l.stoch_d, 1)}`, "stochastic"],
      ["SMA20 / 50 / 200", `${fmtNum(l.sma20)} / ${fmtNum(l.sma50)} / ${fmtNum(l.sma200)}`, "sma"],
      ["Trend (SMA50 vs SMA200)", cr.state === "golden" ? `golden cross (${cr.golden_cross_date || "?"})` : cr.state === "death" ? `death cross (${cr.death_cross_date || "?"})` : "nincs adat", "cross"],
      ["Momentum 1/3/6/12 hó", ["1m", "3m", "6m", "12m"].map((k) => fmtPct(mo[k])).join(" / "), "momentum"],
      ["52 hetes csúcstól / mélyponttól", `${fmtPct(rg.from_high)} / ${fmtPct(rg.from_low)}`, "range_52w"],
      ["Támaszok", (sr.support || []).map((x) => fmtNum(x)).join(", ") || "nincs adat", "support"],
      ["Ellenállások", (sr.resistance || []).map((x) => fmtNum(x)).join(", ") || "nincs adat", "resistance"],
      ["Relatív forgalom (20 nap)", fmtNum(g(t, "volume", "rel_volume_20d")), "rel_volume"],
    ]));
}

function analystSection(a, ccy) {
  if (!a) return card("Elemzői konszenzus", el("p", { className: "muted", textContent: "nincs adat" }));
  return card("Elemzői konszenzus", kvTable([
    ["Átlagos célár", fmtMoney(a.target_mean, ccy || "USD"), "target_mean"],
    ["Célár-sáv (min–max)", `${fmtMoney(a.target_low, ccy || "USD")} – ${fmtMoney(a.target_high, ccy || "USD")}`, "target_range"],
    ["Elemzők száma", isNum(a.n) ? String(a.n) : "nincs adat"],
    ["Ajánlás", a.recommendation || "nincs adat"],
  ]));
}

function missingSection(missing) {
  if (!missing?.length) return el("span");
  const box = card("Hiányzó adatok és feltevések",
    el("p", { className: "muted", textContent: "Ahol nincs megbízható adat, ott nem találunk ki számot. Ezek a hiányok és a számításban használt feltevések:" }),
    el("ul", {}, ...missing.map((m) => el("li", { textContent: m }))));
  box.classList.add("missing-box");
  return box;
}
