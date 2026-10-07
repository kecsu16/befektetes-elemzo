export function priceRows(pricesJson) {
  const prices = (pricesJson && pricesJson.prices) || {};
  return Object.keys(prices).sort().map((ticker) => ({ ticker, ...prices[ticker] }));
}

export function effectiveUpdated(pricesJson, meta) {
  return (pricesJson && pricesJson.updated) || (meta && meta.prices_updated) || null;
}

// A meta.errors kategóriánkénti (prices, daily, …) hibalistáinak összes bejegyzése.
export function errorCount(errors) {
  return Object.values(errors || {}).reduce((n, v) => n + (v && typeof v === "object" ? Object.keys(v).length : v ? 1 : 0), 0);
}
