// ECharts-opciók. A színek a CSS-tokenekből jönnek; node-tesztben paraméterként adhatók át.
const ok = (x) => typeof x === "number" && Number.isFinite(x);

export function themeColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n) => cs.getPropertyValue(`--${n}`).trim();
  return { text: v("text"), muted: v("muted"), border: v("border"), accent: v("accent"),
    pos: v("pos"), neg: v("neg"), surface: v("surface"), warn: v("warn-text") };
}

const MARKERS = [
  ["bear", "Bear", "neg"], ["base", "Base", "text"], ["bull", "Bull", "pos"],
  ["weighted", "Súlyozott", "accent"], ["buy_below", "Vételi szint", "warn"],
];

export function valuationAxisOption(val, price, c = themeColors()) {
  const data = [];
  const missing = [];
  for (const [key, name, color] of MARKERS) {
    const x = val?.[key];
    if (ok(x)) data.push({ name, value: [x, 0], itemStyle: { color: c[color] || c.text } });
    else missing.push(`${key}: nincs adat`);
  }
  if (ok(price)) data.push({ name: "Jelenlegi ár", value: [price, 0], symbol: "diamond", symbolSize: 18, itemStyle: { color: c.accent } });
  else missing.push("jelenlegi ár: nincs adat");
  return {
    animation: false,
    title: { text: "", subtext: missing.join(" · "), left: 0, top: 0, subtextStyle: { color: c.muted } },
    grid: { left: 16, right: 16, top: missing.length ? 40 : 16, bottom: 30 },
    tooltip: { trigger: "item", formatter: (p) => `${p.name}: ${p.value[0].toLocaleString("hu-HU", { maximumFractionDigits: 2 })}` },
    xAxis: { type: "value", scale: true, axisLabel: { color: c.muted }, splitLine: { lineStyle: { color: c.border } } },
    yAxis: { type: "value", show: false, min: -1, max: 1 },
    series: [{
      type: "scatter", data, symbolSize: 14,
      label: { show: true, position: "top", formatter: (p) => p.name, color: c.text, fontSize: 11 },
      labelLayout: { hideOverlap: false, moveOverlap: "shiftX" },
    }],
  };
}

export function priceChartOption(series, bands = null, c = themeColors()) {
  const s = series || { dates: [], close: [], sma50: [], sma200: [] };
  const line = (name, data, color, width = 1.5) => ({
    name, type: "line", data, showSymbol: false, connectNulls: false,
    lineStyle: { color, width }, itemStyle: { color },
  });
  const out = {
    animation: false,
    legend: { top: 0, textStyle: { color: c.text } },
    grid: { left: 48, right: 16, top: 32, bottom: 40 },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: s.dates, axisLabel: { color: c.muted }, axisLine: { lineStyle: { color: c.border } } },
    yAxis: { type: "value", scale: true, axisLabel: { color: c.muted }, splitLine: { lineStyle: { color: c.border } } },
    dataZoom: [{ type: "inside" }],
    series: [
      line("Záróár", s.close, c.accent, 2),
      line("SMA50", s.sma50, c.pos),
      line("SMA200", s.sma200, c.neg),
    ],
  };
  if (bands) out.series.push(...bands);
  return out;
}
