export function priceRows(pricesJson) {
  const prices = (pricesJson && pricesJson.prices) || {};
  return Object.keys(prices).sort().map((ticker) => ({ ticker, ...prices[ticker] }));
}

export function effectiveUpdated(pricesJson, meta) {
  return (pricesJson && pricesJson.updated) || (meta && meta.prices_updated) || null;
}
