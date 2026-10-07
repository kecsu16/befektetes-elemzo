import { fetchData } from "../api.js";
import { fmtAgo, fmtNum, fmtPct } from "../format.js";
import { priceRows, effectiveUpdated, errorCount } from "../prices.js";
import { attachTooltip } from "../tooltips.js";
import { alertZone } from "../portfolioutil.js";
import { fmtMoney } from "../format.js";

export async function render(root) {
  root.replaceChildren();
  const card = document.createElement("section");
  card.className = "card";
  const h = document.createElement("h2");
  h.textContent = "Adatok állapota";
  card.append(h);
  root.append(card);
  try {
    const meta = await fetchData("meta.json");
    let pricesJson = null;
    try { pricesJson = await fetchData("prices.json"); } catch { /* még nincs árfájl */ }
    const updated = effectiveUpdated(pricesJson, meta);
    root.prepend(priceTable(pricesJson, updated));
    root.prepend(await alertsCard(pricesJson));
    root.prepend(await portfolioCard());
    const dl = document.createElement("dl");
    for (const key of ["prices_updated", "daily_updated"]) {
      const dt = document.createElement("dt");
      dt.textContent = key === "prices_updated" ? "Árak frissítve" : "Napi elemzés frissítve";
      attachTooltip(dt, key);
      const dd = document.createElement("dd");
      const val = key === "prices_updated" ? updated : meta[key];
      dd.textContent = val ? `${val} (${fmtAgo(val, new Date())})` : "nincs adat";
      dl.append(dt, dd);
    }
    card.append(dl);
    const errs = errorCount(meta.errors);
    const p = document.createElement("p");
    p.className = errs ? "error" : "muted";
    p.textContent = errs ? `${errs} hiba az utolsó futásban.` : "Nincs jelentett hiba.";
    card.append(p);
    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(meta, null, 2);
    card.append(pre);
    return { ...meta, prices_updated: updated };
  } catch (e) {
    const p = document.createElement("p");
    p.className = "error";
    p.textContent = "Nem sikerült betölteni az adatokat.";
    card.append(p);
    return null;
  }
}

function priceTable(pricesJson, updated) {
  const card = document.createElement("section");
  card.className = "card";
  const h = document.createElement("h2");
  h.textContent = "Árak";
  card.append(h);
  const rows = priceRows(pricesJson);
  if (!rows.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "nincs adat";
    card.append(p);
    return card;
  }
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";
  const table = document.createElement("table");
  table.className = "prices";
  const head = table.createTHead().insertRow();
  for (const label of ["Ticker", "Ár", "Napi változás", "Deviza", "Idő"]) {
    const th = document.createElement("th");
    th.textContent = label;
    head.append(th);
  }
  const body = table.createTBody();
  for (const r of rows) {
    const tr = body.insertRow();
    const cells = [r.ticker, fmtNum(r.price), fmtPct(r.change_pct, 2), r.currency || "nincs adat", r.time ? fmtAgo(r.time, new Date()) : "nincs adat"];
    cells.forEach((text, i) => {
      const td = tr.insertCell();
      td.textContent = text;
      if (i === 1 || i === 2) td.className = "num";
      if (i === 2 && typeof r.change_pct === "number") {
        td.classList.add(r.change_pct > 0 ? "pos" : r.change_pct < 0 ? "neg" : "flat");
      }
    });
    if (r.time) tr.cells[4].title = r.time;
  }
  wrap.append(table);
  card.append(wrap);
  const note = document.createElement("p");
  note.className = "muted";
  note.textContent = `Frissítve: ${updated ? fmtAgo(updated, new Date()) : "nincs adat"}. A 30 perces adat késhet.`;
  card.append(note);
  return card;
}

async function portfolioCard() {
  const card = document.createElement("section");
  card.className = "card";
  const h = document.createElement("h2");
  h.textContent = "Portfólió";
  card.append(h);
  let p = null;
  try { p = await fetchData("portfolio.json"); } catch { /* még nincs */ }
  const s = p?.snapshot;
  const line = (text, cls) => { const e = document.createElement("p"); e.textContent = text; if (cls) e.className = cls; card.append(e); };
  if (!s || !s.positions?.length) {
    line("Még nincs pozíciód. Vidd be őket a privát repó data/watchlist.json fájljába.", "muted");
    return card;
  }
  line(fmtMoney(s.total_huf, "HUF"), "big");
  const dc = s.day_change_huf;
  line(`Napi változás: ${fmtMoney(dc, "HUF")} (${fmtPct(s.day_change_pct, 2)})`, typeof dc === "number" ? (dc >= 0 ? "pos" : "neg") : "muted");
  const a = document.createElement("a");
  a.href = "#portfolio";
  a.textContent = "Részletek →";
  card.append(a);
  return card;
}

async function alertsCard(pricesJson) {
  const card = document.createElement("section");
  card.className = "card";
  const h = document.createElement("h2");
  h.textContent = "Riasztási zónában";
  card.append(h);
  let wl = null;
  try { wl = await fetchData("watchlist.json"); } catch { /* nincs */ }
  const tickers = [...new Set([...(wl?.poziciok || []).map((p) => p.ticker), ...(wl?.figyelt || [])].map((t) => String(t).toUpperCase()))];
  const data = {};
  await Promise.all(tickers.map(async (t) => { try { data[t] = await fetchData(`tickers/${encodeURIComponent(t)}.json`); } catch { /* nincs */ } }));
  const z = alertZone(wl, pricesJson, data);
  if (!z.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Egyik papír sincs riasztási zónában.";
    card.append(p);
    return card;
  }
  const ul = document.createElement("ul");
  for (const x of z) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#papir/${encodeURIComponent(x.ticker)}`;
    a.textContent = x.ticker;
    li.append(a, document.createTextNode(`: ${x.reasons.join("; ")}`));
    ul.append(li);
  }
  card.append(ul);
  return card;
}
