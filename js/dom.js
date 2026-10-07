// Kis DOM-segédek. Adatot csak textContent-tel írunk ki (innerHTML soha).
import { attachTooltip } from "./tooltips.js";

export function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  e.append(...kids.filter((k) => k !== null && k !== undefined));
  return e;
}

export function card(title, ...kids) {
  return el("section", { className: "card" }, el("h2", { textContent: title }), ...kids);
}

// Kulcs–érték tábla: rows = [[címke, érték-szöveg, tooltipKulcs?, osztály?], ...]
export function kvTable(rows) {
  const t = el("table", { className: "kv" });
  const body = t.createTBody();
  for (const [label, value, tip, cls] of rows) {
    const tr = body.insertRow();
    const th = el("th", { textContent: label });
    if (tip) attachTooltip(th, tip);
    tr.append(th);
    const td = tr.insertCell();
    td.textContent = value;
    td.className = "num" + (cls ? ` ${cls}` : "");
  }
  return el("div", { className: "table-wrap" }, t);
}

// Egyszerű rács-tábla (fejléc + sorok szövegként)
export function gridTable(head, rows, className = "grid") {
  const t = el("table", { className });
  const hr = t.createTHead().insertRow();
  for (const h of head) hr.append(el("th", { textContent: h }));
  const body = t.createTBody();
  for (const r of rows) {
    const tr = body.insertRow();
    r.forEach((v, i) => { const td = tr.insertCell(); td.textContent = v; if (i > 0) td.className = "num"; });
  }
  return el("div", { className: "table-wrap" }, t);
}

export function chartBox(optionFn, height = 280) {
  const box = el("div", { className: "chart" });
  box.style.height = `${height}px`;
  const draw = () => {
    if (!window.echarts) { box.textContent = "A grafikonkönyvtár nem töltődött be."; return; }
    const inst = window.echarts.getInstanceByDom(box) || window.echarts.init(box);
    inst.setOption(optionFn(), true);
    inst.resize();
  };
  // A figyelők leiratkoznak, ha a doboz már nincs a DOM-ban (nézetváltás után).
  const onTheme = () => { if (!box.isConnected) return cleanup(); draw(); };
  const onResize = () => { if (!box.isConnected) return cleanup(); window.echarts?.getInstanceByDom(box)?.resize(); };
  const cleanup = () => {
    removeEventListener("be:theme", onTheme);
    removeEventListener("resize", onResize);
    window.echarts?.getInstanceByDom(box)?.dispose();
  };
  requestAnimationFrame(draw);
  addEventListener("be:theme", onTheme);
  addEventListener("resize", onResize);
  return box;
}
