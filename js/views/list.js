import { fetchData } from "../api.js";
import { fmtNum, fmtPct } from "../format.js";
import { el, card } from "../dom.js";
import { attachTooltip } from "../tooltips.js";
import { filterSort } from "./listutil.js";

const COLS = [
  ["ticker", "Ticker", null], ["name", "Név", null], ["sector", "Szektor", null],
  ["price", "Ár", "num"], ["pe", "P/E", "num", "pe"], ["forward_pe", "Fwd P/E", "num", "forward_pe"],
  ["ev_ebitda", "EV/EBITDA", "num", "ev_ebitda"], ["fcf_yield", "FCF-hozam", "pct", "fcf_yield"],
  ["piotroski", "Piotroski", "int", "piotroski"], ["altman_z", "Altman Z", "num", "altman_z"],
  ["vol_annual", "Volatilitás", "pct", "vol_annual"], ["mdd", "Max. esés", "pct", "mdd"],
  ["rsi", "RSI", "num1", "rsi"], ["trend_state", "Trend", null, "cross"],
  ["upside", "DCF-potenciál", "pct", "upside"],
];

const fmt = (kind, x) => {
  if (kind === "num") return fmtNum(x);
  if (kind === "num1") return fmtNum(x, 1);
  if (kind === "pct") return fmtPct(x);
  if (kind === "int") return typeof x === "number" ? String(x) : "nincs adat";
  if (x === "golden") return "emelkedő";
  if (x === "death") return "csökkenő";
  return x ?? "nincs adat";
};

export async function render(root) {
  root.replaceChildren(card("Papírok", el("p", { className: "muted", textContent: "Betöltés…" })));
  let uni = null, wl = null;
  try { uni = await fetchData("universe.json"); } catch { /* még nincs */ }
  try { wl = await fetchData("watchlist.json"); } catch { /* nincs jog vagy nincs fájl */ }
  const own = new Set([...(wl?.poziciok || []).map((p) => String(p.ticker).toUpperCase()), ...(wl?.figyelt || []).map((t) => String(t).toUpperCase())]);
  const byTicker = new Map((uni?.rows || []).map((r) => [r.ticker, r]));
  for (const t of own) if (!byTicker.has(t)) byTicker.set(t, { ticker: t });
  const rows = [...byTicker.values()].map((r) => ({ ...r, own: own.has(r.ticker) }));

  const state = { q: "", key: "ticker", dir: 1, onlyOwn: false };
  const search = el("input", { type: "text", placeholder: "Keresés tickerre vagy névre…", ariaLabel: "Keresés" });
  const ownBox = el("input", { type: "checkbox", id: "only-own" });
  const ownLabel = el("label", { htmlFor: "only-own", textContent: " csak a saját és figyelt papírok" });
  const count = el("p", { className: "muted" });
  const holder = el("div");

  const draw = () => {
    const list = filterSort(rows.filter((r) => !state.onlyOwn || r.own), state.q, state.key, state.dir);
    count.textContent = `${list.length} papír · ${uni?.updated ? "univerzum frissítve: " + uni.updated.slice(0, 10) : "univerzum: nincs adat"}`;
    holder.replaceChildren(table(list, state, draw), cards(list));
  };
  search.addEventListener("input", () => { state.q = search.value; draw(); });
  ownBox.addEventListener("change", () => { state.onlyOwn = ownBox.checked; draw(); });
  root.replaceChildren(card("Papírok",
    el("p", { className: "muted", textContent: "S&P 500 és a saját/figyelt papírjaid. Részletes elemzés (grafikon, érzékenység, előrejelzés) a saját és figyelt papírokhoz készül." }),
    search, el("p", {}, ownBox, ownLabel), count, holder));
  draw();
  return null;
}

function table(list, state, redraw) {
  const t = el("table", { className: "grid list-table" });
  const hr = t.createTHead().insertRow();
  for (const [key, label, kind, tip] of COLS) {
    const th = el("th", { className: kind && kind !== null ? "num sortable" : "sortable" });
    const btn = el("button", { type: "button", className: "linklike",
      textContent: label + (state.key === key ? (state.dir > 0 ? " ▲" : " ▼") : "") });
    btn.addEventListener("click", () => { if (state.key === key) state.dir *= -1; else { state.key = key; state.dir = 1; } redraw(); });
    th.append(btn);
    if (tip) attachTooltip(th, tip);
    hr.append(th);
  }
  const body = t.createTBody();
  for (const r of list.slice(0, 600)) {
    const tr = body.insertRow();
    if (r.own) tr.className = "own";
    for (const [key, , kind] of COLS) {
      const td = tr.insertCell();
      if (key === "ticker") td.append(el("a", { href: `#papir/${encodeURIComponent(r.ticker)}`, textContent: r.ticker }));
      else td.textContent = fmt(kind, r[key]);
      if (kind) td.className = "num";
      if (key === "upside" && typeof r.upside === "number") td.classList.add(r.upside > 0 ? "pos" : "neg");
    }
  }
  return el("div", { className: "table-wrap desktop-only" }, t);
}

function cards(list) {
  const wrap = el("div", { className: "mobile-only" });
  for (const r of list.slice(0, 200)) {
    wrap.append(el("a", { className: "mini-card" + (r.own ? " own" : ""), href: `#papir/${encodeURIComponent(r.ticker)}` },
      el("strong", { textContent: r.ticker }), el("span", { className: "muted", textContent: ` ${r.name || ""}` }),
      el("div", { textContent: `Ár ${fmtNum(r.price)} · P/E ${fmtNum(r.pe)} · Piotroski ${fmt("int", r.piotroski)} · DCF ${fmtPct(r.upside)}` })));
  }
  if (list.length > 200) wrap.append(el("p", { className: "muted", textContent: "Szűkítsd a keresést a további papírokhoz." }));
  return wrap;
}
