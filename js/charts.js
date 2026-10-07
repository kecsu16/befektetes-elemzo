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

// Utolsó 1 év ár + előrejelzési legyező (5–95 halvány, 25–75 erősebb sáv, medián).
export function forecastChartOption(series, fan, c = themeColors(), histDays = 252) {
  const s = series || { dates: [], close: [] };
  const k = Math.max(0, s.dates.length - histDays);
  const hDates = s.dates.slice(k);
  const fDates = fan ? fan.dates.slice(1) : [];
  const pad = (n) => new Array(n).fill(null);
  const hist = (arr) => [...(arr || []).slice(k), ...pad(fDates.length)];
  const fut = (arr) => [...pad(hDates.length - 1), ...arr];
  const base = priceChartOption({ dates: [...hDates, ...fDates], close: hist(s.close), sma50: hist(s.sma50), sma200: hist(s.sma200) }, null, c);
  if (!fan) return base;
  const band = (name, lo, width, stack, opacity) => [
    { name: `${name}-alap`, type: "line", data: fut(lo), stack, connectNulls: true, showSymbol: false,
      lineStyle: { opacity: 0 }, itemStyle: { opacity: 0 }, tooltip: { show: false }, legendHoverLink: false },
    { name, type: "line", data: fut(width), stack, connectNulls: true, showSymbol: false,
      lineStyle: { opacity: 0 }, itemStyle: { color: c.accent }, areaStyle: { color: c.accent, opacity } },
  ];
  base.series.push(
    ...band("5–95% sáv", fan.lo90, fan.band90, "b90", 0.15),
    ...band("25–75% sáv", fan.lo50, fan.band50, "b50", 0.3),
    { name: "Medián előrejelzés", type: "line", data: fut(fan.q50), connectNulls: true, showSymbol: true, symbolSize: 5,
      lineStyle: { color: c.accent, type: "dashed", width: 2 }, itemStyle: { color: c.accent } },
  );
  base.legend.data = ["Záróár", "SMA50", "SMA200", "5–95% sáv", "25–75% sáv", "Medián előrejelzés"];
  return base;
}

export function donutOption(items, c = themeColors()) {
  return {
    animation: false,
    tooltip: { trigger: "item", formatter: (p) => `${p.name}: ${(p.value * 100).toFixed(1)}%` },
    series: [{ type: "pie", radius: ["45%", "70%"], data: items, label: { color: c.text, formatter: (p) => `${p.name}\n${(p.value * 100).toFixed(0)}%` } }],
  };
}

export function barOption(labels, values, c = themeColors(), pct = true) {
  return {
    animation: false, grid: { left: 64, right: 16, top: 16, bottom: 40 },
    tooltip: { trigger: "axis", valueFormatter: (v) => (pct ? `${(v * 100).toFixed(1)}%` : v) },
    xAxis: { type: "category", data: labels, axisLabel: { color: c.muted } },
    yAxis: { type: "value", axisLabel: { color: c.muted, formatter: (v) => (pct ? `${(v * 100).toFixed(0)}%` : v) }, splitLine: { lineStyle: { color: c.border } } },
    series: [{ type: "bar", data: values, itemStyle: { color: c.accent } }],
  };
}

export function frontierOption(frontier, points, c = themeColors()) {
  const pct = (v) => `${(v * 100).toFixed(0)}%`;
  return {
    animation: false, grid: { left: 56, right: 16, top: 32, bottom: 48 },
    legend: { top: 0, textStyle: { color: c.text } },
    tooltip: { trigger: "item", formatter: (p) => `${p.seriesName}: hozam ${pct(p.value[1])}, volatilitás ${pct(p.value[0])}` },
    xAxis: { type: "value", name: "volatilitás", nameLocation: "middle", nameGap: 28, scale: true, axisLabel: { color: c.muted, formatter: pct }, splitLine: { lineStyle: { color: c.border } } },
    yAxis: { type: "value", name: "várható hozam", scale: true, axisLabel: { color: c.muted, formatter: pct }, splitLine: { lineStyle: { color: c.border } } },
    series: [
      { name: "Hatékony határ", type: "line", data: (frontier || []).map((p) => [p.vol, p.ret]), showSymbol: false, lineStyle: { color: c.accent } },
      ...points.filter((p) => p.pt).map((p) => ({ name: p.name, type: "scatter", data: [[p.pt.vol, p.pt.ret]], symbolSize: 12, itemStyle: { color: c[p.color] || c.text } })),
    ],
  };
}

export function growthOption(seriesMap, c = themeColors()) {
  const palette = [c.accent, c.pos, c.neg, c.muted];
  const entries = Object.entries(seriesMap).filter(([, s]) => s?.dates?.length);
  const dates = entries.length ? entries[0][1].dates : [];
  return {
    animation: false, grid: { left: 48, right: 16, top: 32, bottom: 40 },
    legend: { top: 0, textStyle: { color: c.text } }, tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: dates, axisLabel: { color: c.muted } },
    yAxis: { type: "value", scale: true, axisLabel: { color: c.muted }, splitLine: { lineStyle: { color: c.border } } },
    series: entries.map(([name, s], i) => {
      const m = new Map(s.dates.map((d, j) => [d, s.values[j]]));
      return { name, type: "line", showSymbol: false, data: dates.map((d) => m.get(d) ?? null), connectNulls: true, lineStyle: { color: palette[i % 4], width: i ? 1.5 : 2.5 }, itemStyle: { color: palette[i % 4] } };
    }),
  };
}
