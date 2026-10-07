const NA = "nincs adat";
const ok = (x) => typeof x === "number" && Number.isFinite(x);

export function fmtNum(x, digits = 2) {
  if (!ok(x)) return NA;
  return new Intl.NumberFormat("hu-HU", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(x);
}

export function fmtPct(x, digits = 1) {
  if (!ok(x)) return NA;
  return new Intl.NumberFormat("hu-HU", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(x * 100) + "%";
}

export function fmtMoney(x, currency) {
  if (!ok(x)) return NA;
  try {
    return new Intl.NumberFormat("hu-HU", { style: "currency", currency }).format(x);
  } catch {
    return fmtNum(x) + (currency ? " " + currency : "");
  }
}

export function fmtAgo(iso, now = new Date()) {
  if (!iso) return NA;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return NA;
  const s = Math.max(0, Math.floor((now.getTime() - t) / 1000));
  if (s < 60) return "épp most";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} perce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} órája`;
  return `${Math.floor(h / 24)} napja`;
}
