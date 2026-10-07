// Portfólió- és áttekintő segédfüggvények — DOM nélkül, node-ban tesztelhető.
const num = (x) => typeof x === "number" && Number.isFinite(x);
const fmt = (x) => x.toLocaleString("hu-HU", { maximumFractionDigits: 2 });

// Papírok, amelyek riasztási zónában vannak (a watchlist szintjei, DCF vételi szint, RSI).
export function alertZone(wl, pricesJson, tickers) {
  const cfg = new Map();
  for (const p of wl?.poziciok || []) cfg.set(String(p.ticker).toUpperCase(), p.riasztas || {});
  for (const t of wl?.figyelt || []) if (!cfg.has(String(t).toUpperCase())) cfg.set(String(t).toUpperCase(), {});
  const out = [];
  for (const [t, r] of cfg) {
    const price = pricesJson?.prices?.[t]?.price;
    const d = tickers?.[t] || {};
    const reasons = [];
    if (num(price)) {
      if (num(r.ar_alatt) && price <= r.ar_alatt) reasons.push(`ár ${fmt(price)} ≤ riasztási szint ${fmt(r.ar_alatt)}`);
      if (num(r.ar_felett) && price >= r.ar_felett) reasons.push(`ár ${fmt(price)} ≥ riasztási szint ${fmt(r.ar_felett)}`);
      const buy = d.valuation?.dcf?.buy_below;
      if (r.veteli_szint !== false && num(buy) && price <= buy) reasons.push(`ár a DCF vételi szint (${fmt(buy)}) alatt`);
    }
    const rsi = d.technical?.last?.rsi14;
    const lo = num(r.rsi_also) ? r.rsi_also : 30, hi = num(r.rsi_felso) ? r.rsi_felso : 70;
    if (num(rsi) && rsi < lo) reasons.push(`RSI ${Math.round(rsi)} (túladott)`);
    if (num(rsi) && rsi > hi) reasons.push(`RSI ${Math.round(rsi)} (túlvett)`);
    if (reasons.length) out.push({ ticker: t, reasons });
  }
  return out;
}

// Fánkdiagram-adat: csökkenő sorrend, a küszöb alatti tételek „Egyéb” néven összevonva.
export function donutData(alloc, minShare = 0.03) {
  const items = Object.entries(alloc || {}).filter(([, v]) => num(v) && v > 0).sort((a, b) => b[1] - a[1]);
  const big = items.filter(([, v]) => v >= minShare).map(([name, value]) => ({ name, value }));
  const rest = items.filter(([, v]) => v < minShare).reduce((s, [, v]) => s + v, 0);
  if (rest > 0) big.push({ name: "Egyéb", value: rest });
  return big;
}
