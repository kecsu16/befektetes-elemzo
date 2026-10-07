// A Python elemzo/savings.py pontos megfelelője (közös tesztesetek: tests/savings_cases.json).

function simulate(initial, monthly, rate, years, refundCfg) {
  let v = Number(initial), refunds = 0;
  const months = Math.round(years * 12);
  for (let m = 1; m <= months; m++) {
    v = v * (1 + rate / 12) + monthly;
    if (refundCfg && m % 12 === 0) {
      const rf = pensionRefund(12 * monthly, refundCfg);
      v += rf; refunds += rf;
    }
  }
  return [v, refunds];
}

export function futureValue(initial, monthly, annualRate, years, compounding = 12) {
  if (compounding === 1) {
    let v = Number(initial);
    for (let y = 0; y < years; y++) v = v * (1 + annualRate) + 12 * monthly;
    return v;
  }
  return simulate(initial, monthly, annualRate, years, null)[0];
}

export const realRate = (nominal, inflation) => (1 + nominal) / (1 + inflation) - 1;
export const pensionRefund = (yearly, cfg) => Math.min(cfg.arany * yearly, cfg.plafon_huf);

export function nominalRate(p, inflation) {
  if (p.hozam !== null && p.hozam !== undefined) return Number(p.hozam);
  if (p.inflacio_plusz !== null && p.inflacio_plusz !== undefined) return Number(inflation) + Number(p.inflacio_plusz);
  return null;
}

export function taxRate(p, years) {
  if (p.adomentes_evek !== null && p.adomentes_evek !== undefined && years >= p.adomentes_evek) return 0;
  if (p.kedvezmeny && years >= p.kedvezmeny.evtol) return Number(p.kedvezmeny.adokulcs);
  return Number(p.adokulcs || 0) + Number(p.szocho || 0);
}

function solveRate(initial, monthly, years, target) {
  let lo = -0.99, hi = 1.0;
  const f = (r) => simulate(initial, monthly, r, years, null)[0] - target;
  if (initial + monthly <= 0 || f(lo) * f(hi) > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

export function productResult(p, initial, monthly, years, inflation) {
  const r = nominalRate(p, inflation);
  const base = { id: p.id, nev: p.nev, nominal_rate: r };
  if (r === null) return { ...base, nominal_fv: null, contributed: null, refunds: null, tax: null, net_fv: null, real_fv: null, effective_net_rate: null, real_net_rate: null };
  const [fv, refunds] = simulate(initial, monthly, r, years, p.visszaterites);
  const contributed = initial + monthly * 12 * years;
  const gain = Math.max(fv - contributed - refunds, 0);
  const tax = taxRate(p, years) * gain;
  const net = fv - tax;
  const eff = solveRate(initial, monthly, years, net);
  return { ...base, nominal_fv: fv, contributed, refunds, tax, net_fv: net, real_fv: net / (1 + inflation) ** years,
    effective_net_rate: eff, real_net_rate: eff === null ? null : realRate(eff, inflation) };
}

export function compareProducts(assumptions, initial, monthly, years) {
  const infl = Number(assumptions?.inflacio?.HUF || 0);
  return (assumptions?.megtakaritas?.termekek || []).map((p) => productResult(p, initial, monthly, years, infl));
}
