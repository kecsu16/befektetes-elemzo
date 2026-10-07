// Előrejelzési legyező és pontossági tábla — DOM nélkül, node-ban tesztelhető.

export const NOT_NAIVE_TEXT = "Ez a modell a múltban nem volt pontosabb annál, hogy az ár nem változik, ezért nem kap súlyt.";

export const MODEL_NAMES = {
  gbm: "Monte Carlo (GBM)", bootstrap: "Monte Carlo (historikus bootstrap)", arima: "ARIMA",
  naive: "Naiv: az ár nem változik", fundamental: "Fundamentum (várható EPS × P/E)",
  consensus: "Elemzői konszenzus", index: "Benchmark: indexhozam",
};

const iso = (d) => d.toISOString().slice(0, 10);

export function futureBizDates(fromIso, n) {
  const out = [];
  const d = new Date(`${fromIso}T12:00:00Z`);
  while (out.length < n) {
    d.setUTCDate(d.getUTCDate() + 1);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) out.push(iso(d));
  }
  return out;
}

// Index 0 = utolsó ismert nap (a legyező innen indul), index h = a h-adik jövőbeli munkanap.
export function fanData(lastIso, lastPrice, horizons, n = 253) {
  const anchors = Object.entries(horizons || {})
    .map(([h, d]) => [Number(h), d?.ensemble])
    .filter(([h, q]) => q && h < n && Number.isFinite(q["50"]));
  if (!anchors.length || !Number.isFinite(lastPrice)) return null;
  const dates = [lastIso, ...futureBizDates(lastIso, n - 1)];
  const blank = () => new Array(n).fill(null);
  const f = { dates, q50: blank(), lo90: blank(), band90: blank(), lo50: blank(), band50: blank() };
  const put = (i, q5, q25, q50, q75, q95) => {
    f.q50[i] = q50; f.lo90[i] = q5; f.band90[i] = q95 - q5; f.lo50[i] = q25; f.band50[i] = q75 - q25;
  };
  // Csak a teljes sávot adó horizontok; köztük lineáris interpoláció, hogy a halmozott sáv folytonos legyen.
  const pts = [[0, [lastPrice, lastPrice, lastPrice, lastPrice, lastPrice]],
    ...anchors.filter(([, q]) => ["5", "25", "75", "95"].every((k) => Number.isFinite(q[k])))
      .sort((a, b) => a[0] - b[0]).map(([h, q]) => [h, [q["5"], q["25"], q["50"], q["75"], q["95"]]])];
  for (let j = 0; j + 1 < pts.length; j++) {
    const [h0, a] = pts[j], [h1, b] = pts[j + 1];
    for (let i = h0; i <= h1; i++) {
      const t = (i - h0) / (h1 - h0);
      put(i, ...a.map((x, k) => x + (b[k] - x) * t));
    }
  }
  if (pts.length === 1) put(0, ...pts[0][1]);
  return f;
}

export function accuracyRows(bt) {
  const order = ["gbm", "bootstrap", "arima", "fundamental", "consensus", "naive", "index"];
  return order.filter((k) => bt && bt[k]).map((k) => {
    const s = bt[k];
    const bad = s.beats_naive === false && s.mae !== null && s.mae !== undefined;
    const untestable = s.mae === null || s.mae === undefined;
    return {
      key: k, name: MODEL_NAMES[k] || k, ...s, bad,
      note: bad ? NOT_NAIVE_TEXT : untestable && k !== "index" ? "Nem visszamérhető (nincs múltbeli előrejelzés), ezért nem kap súlyt." : (s.reason || ""),
    };
  });
}

// Több papír backtestjének összesítése modellenként (az index-benchmark nélkül).
export function summarizeModels(bts) {
  const acc = new Map();
  for (const bt of bts) {
    for (const [k, s] of Object.entries(bt || {})) {
      if (k === "index" || !s) continue;
      const a = acc.get(k) || { key: k, beats: 0, tested: 0, w: [], cov: [] };
      if (s.mae !== null && s.mae !== undefined) a.tested += 1;
      if (s.beats_naive === true) a.beats += 1;
      if (Number.isFinite(s.weight)) a.w.push(s.weight);
      if (Number.isFinite(s.cov90)) a.cov.push(s.cov90);
      acc.set(k, a);
    }
  }
  const mean = (xs) => (xs.length ? xs.reduce((x, y) => x + y, 0) / xs.length : null);
  return [...acc.values()].map((a) => ({ key: a.key, beats: a.beats, tested: a.tested, avgWeight: mean(a.w), avgCov90: mean(a.cov) }));
}

// A kvantilisekből csak az 5–95%-os sávon belül becsülhető megbízhatóan a valószínűség.
export function fmtProb(p) {
  if (typeof p !== "number" || !Number.isFinite(p)) return "nincs adat";
  if (p < 0.05) return "< 5%";
  if (p > 0.95) return "> 95%";
  return `${Math.round(p * 100)}%`;
}
