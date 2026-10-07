// DOM nélküli segédfüggvények a papírlistához és -oldalhoz (node-ban tesztelhetők).
import { fmtPct } from "../format.js";

const isNum = (x) => typeof x === "number" && Number.isFinite(x);

export function filterSort(rows, query, key, dir = 1) {
  const q = (query || "").trim().toLowerCase();
  const hit = (r) => !q || (r.ticker || "").toLowerCase().includes(q) || (r.name || "").toLowerCase().includes(q);
  return rows.filter(hit).slice().sort((a, b) => {
    const x = a[key], y = b[key];
    const xn = x === null || x === undefined, yn = y === null || y === undefined;
    if (xn || yn) return xn === yn ? 0 : xn ? 1 : -1; // hiányzó mindig a végén
    if (isNum(x) && isNum(y)) return (x - y) * dir;
    return String(x).localeCompare(String(y), "hu") * dir;
  });
}

export function reverseDcfSentence(g) {
  if (!isNum(g)) return "Reverse DCF: nincs adat.";
  return `A piac évi ${fmtPct(g)} FCF-növekedést áraz be.`;
}
