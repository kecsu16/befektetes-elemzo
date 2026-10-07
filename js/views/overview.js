import { fetchData } from "../api.js";
import { fmtAgo } from "../format.js";
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
    const dl = document.createElement("dl");
    for (const key of ["prices_updated", "daily_updated"]) {
      const dt = document.createElement("dt");
      dt.textContent = key === "prices_updated" ? "Árak frissítve" : "Napi elemzés frissítve";
      attachTooltip(dt, key);
      const dd = document.createElement("dd");
      dd.textContent = meta[key] ? `${meta[key]} (${fmtAgo(meta[key], new Date())})` : "nincs adat";
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
    return meta;
  } catch (e) {
    const p = document.createElement("p");
    p.className = "error";
    p.textContent = "Nem sikerült betölteni az adatokat.";
    card.append(p);
    return null;
  }
}
