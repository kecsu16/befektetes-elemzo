import { fetchData } from "../api.js";
import { fmtAgo, fmtNum, fmtPct } from "../format.js";
import { priceRows, effectiveUpdated } from "../prices.js";
import { attachTooltip } from "../tooltips.js";

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
    const errs = Object.keys(meta.errors || {}).length;
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
