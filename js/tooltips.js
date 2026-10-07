// Kulcsok = JSON-mezők nevei. Minden nézetfeladat bővíti a sajátjaival.
export const TOOLTIPS = {
  prices_updated: {
    mit: "Az utolsó sikeres árfrissítés ideje.",
    jo: "Kereskedési időben legfeljebb 1 órás késés a normális.",
  },
  daily_updated: {
    mit: "A napi elemzések (mutatók, előrejelzések) utolsó futásának ideje.",
    jo: "Munkanapokon este frissül; a mai vagy az előző napi dátum rendben van.",
  },
};

let pop = null;
function hide() { pop?.remove(); pop = null; }

export function attachTooltip(el, key) {
  const t = TOOLTIPS[key];
  if (!t) return;
  el.classList.add("tip");
  el.tabIndex = 0;
  const show = () => {
    hide();
    pop = document.createElement("div");
    pop.className = "tooltip-pop";
    pop.setAttribute("role", "tooltip");
    const a = document.createElement("div");
    a.textContent = `Mit jelent: ${t.mit}`;
    const b = document.createElement("div");
    b.textContent = `Mi a jó: ${t.jo}`;
    pop.append(a, b);
    document.body.append(pop);
    const r = el.getBoundingClientRect();
    const left = Math.min(r.left + scrollX, document.documentElement.clientWidth - 276);
    pop.style.left = `${Math.max(8, left)}px`;
    pop.style.top = `${r.bottom + scrollY + 6}px`;
  };
  el.addEventListener("mouseenter", show);
  el.addEventListener("focus", show);
  el.addEventListener("click", show);
  el.addEventListener("mouseleave", hide);
  el.addEventListener("blur", hide);
}
