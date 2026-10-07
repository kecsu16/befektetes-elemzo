import { fetchData } from "../api.js";
import { fmtMoney, fmtPct } from "../format.js";
import { el, card, chartBox } from "../dom.js";
import { compareProducts } from "../calc/savings.js";
import { themeColors } from "../charts.js";

const HUF = (x) => fmtMoney(x, "HUF");

export async function render(root) {
  root.replaceChildren(card("Megtakarítás", el("p", { className: "muted", textContent: "Betöltés…" })));
  let a = null, ref = null;
  try { a = await fetchData("assumptions.json"); } catch { /* nincs */ }
  try { ref = await fetchData("savings.json"); } catch { /* még nincs napi futás */ }
  const products = a?.megtakaritas?.termekek || [];
  if (!products.length) {
    root.replaceChildren(card("Megtakarítás", el("p", { className: "muted", textContent: "nincs adat (az assumptions.json megtakaritas részében nincsenek termékek)" })));
    return null;
  }
  const base = a.megtakaritas_alap || { osszeg_huf: 1000000, havi_befizetes_huf: 50000, evek: 10 };
  const state = { initial: base.osszeg_huf, monthly: base.havi_befizetes_huf, years: base.evek,
    inflation: a.inflacio?.HUF ?? 0, rates: Object.fromEntries(products.map((p) => [p.id, p.hozam ?? p.inflacio_plusz])) };

  const banner = a.megtakaritas.ellenorizve ? null : el("div", { className: "warn-banner",
    textContent: "Ellenőrizendő feltevések: a kamatok, adókulcsok és a visszatérítés szabályai nincsenek megerősítve. Írd át őket a privát repó data/assumptions.json fájljában, majd állítsd az „ellenorizve” mezőt true-ra." });
  const numInput = (label, key, step, scale = 1) => {
    const i = el("input", { type: "number", step: String(step), value: String(state[key] * scale) });
    i.addEventListener("input", () => { const v = Number(i.value); if (Number.isFinite(v)) { state[key] = v / scale; draw(); } });
    return el("label", { className: "field" }, el("span", { textContent: label }), i);
  };
  const form = el("div", { className: "form-grid" },
    numInput("Egyszeri összeg (Ft)", "initial", 10000), numInput("Havi befizetés (Ft)", "monthly", 1000),
    numInput("Futamidő (év)", "years", 1), numInput("Infláció (%/év)", "inflation", 0.1, 100));
  const tableBox = el("div");
  const chart = chartBox(() => chartOption(), 300);
  let results = [];

  function draw() {
    const assumptions = { ...a, inflacio: { HUF: state.inflation }, megtakaritas: { ...a.megtakaritas,
      termekek: products.map((p) => (p.hozam !== null && p.hozam !== undefined ? { ...p, hozam: state.rates[p.id] } : { ...p, inflacio_plusz: state.rates[p.id] })) } };
    results = compareProducts(assumptions, state.initial, state.monthly, Math.round(state.years));
    tableBox.replaceChildren(resultTable(products, results, state, draw));
    window.echarts?.getInstanceByDom(chart)?.setOption(chartOption(), true);
  }
  function chartOption() {
    const c = themeColors();
    return {
      animation: false, grid: { left: 80, right: 16, top: 32, bottom: 80 }, legend: { top: 0, textStyle: { color: c.text } },
      tooltip: { trigger: "axis", valueFormatter: (v) => HUF(v) },
      xAxis: { type: "category", data: results.map((r) => r.nev), axisLabel: { color: c.muted, interval: 0, rotate: 20 } },
      yAxis: { type: "value", axisLabel: { color: c.muted, formatter: (v) => `${(v / 1e6).toFixed(1)} M` }, splitLine: { lineStyle: { color: c.border } } },
      series: [
        { name: "Befizetve", type: "bar", data: results.map((r) => r.contributed), itemStyle: { color: c.muted } },
        { name: "Nettó (adó után)", type: "bar", data: results.map((r) => r.net_fv), itemStyle: { color: c.accent } },
        { name: "Reálérték (mai forintban)", type: "bar", data: results.map((r) => r.real_fv), itemStyle: { color: c.pos } },
      ],
    };
  }
  draw();
  root.replaceChildren(
    card("Megtakarítási termékek összevetése", banner,
      el("p", { className: "muted", textContent: "Kamatos kamat havi befizetéssel, adózás és infláció után. A hozamokat a táblában helyben is átírhatod (csak a böngésződben, nem menti)." }),
      form, tableBox, chart, selfCheck(ref, a)),
    sourcesCard(a.megtakaritas, products));
  return null;
}

function resultTable(products, results, state, redraw) {
  const t = el("table", { className: "grid savings" });
  const hr = t.createTHead().insertRow();
  for (const h of ["Termék", "Hozam (%/év)", "Nettó érték", "Adó", "Visszatérítés", "Reálérték", "Nettó éves hozam", "Reálhozam"]) hr.append(el("th", { textContent: h }));
  const body = t.createTBody();
  const best = Math.max(...results.map((r) => r.real_fv ?? -Infinity));
  results.forEach((r, i) => {
    const p = products[i];
    const tr = body.insertRow();
    if (r.real_fv === best) tr.className = "best";
    tr.insertCell().textContent = r.nev;
    const rate = el("input", { type: "number", step: "0.1", value: String(Math.round(state.rates[p.id] * 1000) / 10), className: "rate" });
    rate.addEventListener("change", () => { const v = Number(rate.value); if (Number.isFinite(v)) { state.rates[p.id] = v / 100; redraw(); } });
    const rc = tr.insertCell();
    rc.append(rate, p.inflacio_plusz !== undefined && (p.hozam === null || p.hozam === undefined) ? el("span", { className: "muted", textContent: " + infláció" }) : "");
    for (const [v, f] of [[r.net_fv, HUF], [r.tax, HUF], [r.refunds, HUF], [r.real_fv, HUF], [r.effective_net_rate, fmtPct], [r.real_net_rate, fmtPct]]) {
      const td = tr.insertCell(); td.textContent = f(v); td.className = "num";
    }
  });
  return el("div", { className: "table-wrap" }, t);
}

function selfCheck(ref, a) {
  if (!ref?.results?.length) return el("p", { className: "muted", textContent: "Referencia-számítás (Python): még nincs napi futás." });
  const i = ref.inputs;
  const js = compareProducts({ ...a, inflacio: { HUF: ref.inflation } }, i.osszeg_huf, i.havi_befizetes_huf, i.evek);
  const diff = Math.max(...ref.results.map((r, k) => Math.abs((r.net_fv ?? 0) - (js[k]?.net_fv ?? 0))));
  return el("p", { className: diff <= 1 ? "muted" : "error",
    textContent: diff <= 1 ? "Ellenőrzés: a böngészős számítás 1 Ft-on belül egyezik a napi (Python) referenciával."
      : `Figyelem: a böngészős és a Python-számítás ${HUF(diff)}-tal eltér.` });
}

function sourcesCard(m, products) {
  return card("Feltevések és források",
    el("ul", {}, ...products.map((p) => el("li", { textContent: `${p.nev}: ${p.megjegyzes || ""}` }))),
    el("h3", { textContent: "Ellenőrizd itt" }),
    el("ul", {}, ...(m.forrasok || []).map((s) => el("li", { textContent: s }))));
}
