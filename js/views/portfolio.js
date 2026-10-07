import { fetchData } from "../api.js";
import { fmtMoney, fmtPct, fmtNum } from "../format.js";
import { el, card, kvTable, gridTable, chartBox } from "../dom.js";
import { donutOption, barOption, frontierOption, growthOption } from "../charts.js";
import { donutData } from "../portfolioutil.js";

const HUF = (x) => fmtMoney(x, "HUF");
const ALLOC = { kategoria: "Kategória", sector: "Szektor", country: "Ország", currency: "Deviza" };

export async function render(root) {
  root.replaceChildren(card("Portfólió", el("p", { className: "muted", textContent: "Betöltés…" })));
  let p = null;
  try { p = await fetchData("portfolio.json"); } catch { /* még nincs */ }
  const snap = p?.snapshot;
  if (!snap || !snap.positions?.length) {
    root.replaceChildren(card("Portfólió",
      el("p", { textContent: "Még nincs pozíciód." }),
      el("p", { className: "muted", textContent: "Vidd be a pozícióidat a privát repó data/watchlist.json fájljába (poziciok: ticker, darab, átlagos vételár, opcionálisan tranzakciók). A következő árfrissítéskor megjelenik itt az összesítés." })));
    return null;
  }
  const kids = [summary(snap), positions(snap)];
  kids.push(card("Allokáció (forintban számolva)", el("div", { className: "donuts" },
    ...Object.entries(ALLOC).map(([k, label]) => el("div", {}, el("h3", { textContent: label }),
      chartBox(() => donutOption(donutData(p.allocation?.[k] || {})), 220))))));
  if (p.warnings?.length) kids.push(card("Koncentráció", el("ul", { className: "warn-list" }, ...p.warnings.map((w) => el("li", { textContent: w })))));
  if (p.risk_contribution?.length) {
    kids.push(card("Kockázati hozzájárulás",
      el("p", { className: "muted", textContent: "Mekkora részben felel egy pozíció a portfólió teljes ingadozásáért. Ha jóval nagyobb a súlyánál, aránytalanul sok kockázatot hoz." }),
      chartBox(() => barOption(p.risk_contribution.map((r) => r.ticker), p.risk_contribution.map((r) => r.share)), 220),
      gridTable(["Papír", "Súly", "Kockázati részarány"], p.risk_contribution.map((r) => [r.ticker, fmtPct(r.weight), fmtPct(r.share)]))));
  }
  if (p.frontier?.length) {
    const pts = [{ name: "Jelenlegi", pt: p.current, color: "accent" }, { name: "Minimum variancia", pt: p.min_var, color: "pos" }, { name: "Max. Sharpe", pt: p.max_sharpe, color: "warn" }];
    kids.push(card("Hatékony határ (Markowitz)",
      el("p", { className: "muted", textContent: "A múltbeli 5 év hozamaiból becsült lehetséges portfóliók. A várható hozam becslése zajos, ezért a javaslat tájékoztató jellegű, nem tanács." }),
      chartBox(() => frontierOption(p.frontier, pts), 300),
      p.rebalance?.length ? el("h3", { textContent: "Javasolt újrasúlyozás a max. Sharpe-portfólió felé" }) : null,
      p.rebalance?.length ? gridTable(["Papír", "Darab változás", "Összeg (Ft)"], p.rebalance.map((r) => [r.ticker, (r.delta_shares > 0 ? "+" : "") + r.delta_shares, HUF(r.delta_huf)])) : null));
  }
  if (p.portfolio_growth) {
    const series = { "Portfólió (mai súlyokkal)": p.portfolio_growth };
    for (const [n, b] of Object.entries(p.benchmark || {})) series[n] = b.series;
    kids.push(card("Teljesítmény vs. benchmark (5 év, 100-ról indítva)",
      chartBox(() => growthOption(series), 280),
      gridTable(["Benchmark", "Alfa (évesített)", "Béta"], Object.entries(p.benchmark || {}).map(([n, b]) => [n, fmtPct(b.alpha_annual), fmtNum(b.beta)]))));
  }
  if (p.mc) {
    kids.push(card("Várható vagyonsáv (Monte Carlo)",
      el("p", { className: "muted", textContent: "A mai portfólió múltbeli hozama és ingadozása alapján szimulált sávok. Nem előrejelzés: a múlt nem garancia." }),
      gridTable(["Év", "5%", "25%", "Medián", "75%", "95%"], Object.entries(p.mc).map(([y, q]) => [`${y} év`, HUF(q["5"]), HUF(q["25"]), HUF(q["50"]), HUF(q["75"]), HUF(q["95"])]))));
  }
  if (p.missing?.length) {
    const box = card("Hiányzó adatok és feltevések", el("ul", {}, ...p.missing.map((m) => el("li", { textContent: m }))));
    box.classList.add("missing-box");
    kids.push(box);
  }
  root.replaceChildren(...kids.filter(Boolean));
  return null;
}

function summary(s) {
  return card("Összesítés", kvTable([
    ["Portfólió értéke", HUF(s.total_huf), "total_huf"],
    ["Napi változás", `${HUF(s.day_change_huf)} (${fmtPct(s.day_change_pct, 2)})`, "day_change", s.day_change_huf > 0 ? "pos" : s.day_change_huf < 0 ? "neg" : ""],
    ["Realizált eredmény", HUF(s.realized_huf), "realized"],
    ["XIRR (pénzsúlyozott hozam)", fmtPct(s.xirr), "xirr"],
  ]));
}

function positions(s) {
  const rows = s.positions.map((r) => [r.ticker, fmtNum(r.shares, 0), fmtNum(r.price), HUF(r.value_huf), fmtPct(r.weight), HUF(r.unrealized_huf), fmtPct(r.unrealized_pct), HUF(r.day_change_huf)]);
  const t = gridTable(["Papír", "Darab", "Ár", "Érték", "Súly", "Nem realizált", "%", "Napi"], rows);
  t.querySelectorAll("tbody tr").forEach((tr, i) => {
    tr.cells[0].replaceChildren(el("a", { href: `#papir/${encodeURIComponent(s.positions[i].ticker)}`, textContent: s.positions[i].ticker }));
    const u = s.positions[i].unrealized_huf;
    if (typeof u === "number") [5, 6].forEach((k) => tr.cells[k].classList.add(u >= 0 ? "pos" : "neg"));
  });
  return card("Pozíciók", t);
}
