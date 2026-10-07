import { fetchData } from "../api.js";
import { fmtPct, fmtNum } from "../format.js";
import { el, card, gridTable } from "../dom.js";
import { MODEL_NAMES, summarizeModels, fmtProb } from "../forecastutil.js";

export async function render(root) {
  root.replaceChildren(card("Előrejelzés", el("p", { className: "muted", textContent: "Betöltés…" })));
  let wl = null;
  try { wl = await fetchData("watchlist.json"); } catch { /* nincs */ }
  const tickers = [...new Set([...(wl?.poziciok || []).map((p) => p.ticker), ...(wl?.figyelt || [])].map((t) => String(t).toUpperCase()))];
  const data = (await Promise.all(tickers.map((t) => fetchData(`tickers/${encodeURIComponent(t)}.json`).catch(() => null)))).filter(Boolean);
  if (!data.length) {
    root.replaceChildren(card("Előrejelzés", el("p", { className: "muted", textContent: "Még nincs előrejelzés. A napi elemzés a saját és figyelt papírokra készíti el." })));
    return null;
  }
  const rows = data.map((d) => {
    const h = d.forecast?.horizons || {};
    return [d.ticker, fmtNum(d.price),
      fmtProb(h["21"]?.p_above_now), fmtProb(h["126"]?.p_above_now), fmtProb(h["252"]?.p_above_now),
      fmtProb(h["126"]?.p_below_buy), fmtProb(h["252"]?.p_below_buy)];
  });
  const link = gridTable(["Papír", "Ár", "P(felett) 1 hó", "P(felett) 6 hó", "P(felett) 1 év", "P(vételi szint alatt) 6 hó", "P(vételi szint alatt) 1 év"], rows);
  link.querySelectorAll("tbody tr").forEach((tr, i) => {
    const td = tr.cells[0];
    td.replaceChildren(el("a", { href: `#papir/${encodeURIComponent(data[i].ticker)}`, textContent: data[i].ticker }));
  });
  const sum = summarizeModels(data.map((d) => d.forecast?.backtest?.["21"]).filter(Boolean));
  const sumRows = sum.map((m) => [MODEL_NAMES[m.key] || m.key, `${m.beats}/${m.tested}`, fmtPct(m.avgWeight, 0), fmtPct(m.avgCov90, 0)]);
  root.replaceChildren(
    card("Valószínűségek",
      el("p", { className: "muted", textContent: "P(felett): mekkora eséllyel lesz az ár a mostani felett. P(vételi szint alatt): mekkora eséllyel esik a DCF-alapú vételi szint alá. Valószínűségi becslés, nem jóslat." }),
      link),
    card("Modellek összesített pontossága (1 hónapos horizont)",
      el("p", { className: "muted", textContent: "Hány papírnál verte a modell a naiv becslést (az ár nem változik), az átlagos ensemble-súlya, és hogy az esetek mekkora része esett a 90%-os sávba (jól kalibrált: ~90%)." }),
      gridTable(["Modell", "Verte a naivat", "Átlagos súly", "90%-os sávban"], sumRows)),
  );
  return null;
}
