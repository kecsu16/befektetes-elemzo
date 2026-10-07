import { getToken, setToken, clearToken, fetchData, isLocalMode } from "./api.js";
import { initTheme } from "./theme.js";
import { isStale } from "./freshness.js";
import { fmtAgo } from "./format.js";
import { render as renderOverview } from "./views/overview.js";
import { render as renderTicker } from "./views/ticker.js";
import { render as renderList } from "./views/list.js";
import { render as renderForecast } from "./views/forecast.js";
import { render as renderPortfolio } from "./views/portfolio.js";
import { render as renderSavings } from "./views/savings.js";
import { hideTooltip } from "./tooltips.js";

const view = () => document.getElementById("view");
const TABS = ["attekintes", "papirok", "portfolio", "elorejelzes", "megtakaritas"];
const TAB_NAMES = {
  attekintes: "Áttekintés", papirok: "Papírok", portfolio: "Portfólió",
  elorejelzes: "Előrejelzés", megtakaritas: "Megtakarítás",
};

function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  e.append(...kids);
  return e;
}

let loggingIn = false;

function showLogin(message) {
  document.getElementById("tabs").hidden = true;
  document.getElementById("freshness").hidden = true;
  document.getElementById("logout").hidden = true;
  const input = el("input", { type: "password", id: "token", autocomplete: "off", placeholder: "github_pat_…" });
  const err = el("p", { className: "error", textContent: message || "" });
  const btn = el("button", { type: "button", className: "primary", textContent: "Belépés" });
  const submit = async () => {
    const t = input.value.trim();
    if (!t) return;
    setToken(t);
    btn.disabled = true;
    loggingIn = true;
    try {
      await fetchData("meta.json");
      loggingIn = false;
      start();
    } catch {
      loggingIn = false;
      clearToken();
      err.textContent = "A token nem jó, vagy nincs jogod az adatokhoz. Ellenőrizd a beállításokat.";
      btn.disabled = false;
    }
  };
  btn.addEventListener("click", submit);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
  view().replaceChildren(el("section", { className: "card" },
    el("h2", { textContent: "Belépés" }),
    el("p", { textContent: "Az adataid egy privát GitHub repóban vannak. Az olvasásukhoz egy csak olvasható hozzáférési tokenre van szükség. Ezt csak a böngésződ tárolja, sehova nem küldjük." }),
    el("ol", {},
      el("li", { textContent: "Nyisd meg: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token." }),
      el("li", { textContent: "Adj neki nevet, és válassz lejárati időt." }),
      el("li", { textContent: "Repository access: Only select repositories, és válaszd ki: befektetes-elemzo-adat." }),
      el("li", { textContent: "Permissions → Repository permissions → Contents: Read-only." }),
      el("li", { textContent: "Generate token, majd másold ide a kapott tokent." })),
    input, err, btn));
}

function route() {
  const hash = location.hash.replace(/^#/, "") || "attekintes";
  const [tab, arg] = hash.split("/");
  const known = TABS.includes(tab) || tab === "papir";
  const active = tab === "papir" ? "papirok" : (known ? tab : "attekintes");
  document.querySelectorAll("#tabs a").forEach((a) => a.classList.toggle("active", a.dataset.tab === active));
  const root = view();
  hideTooltip();
  let ticker = null;
  try { ticker = arg ? decodeURIComponent(arg) : null; } catch { ticker = null; }
  if (active === "attekintes") {
    renderOverview(root).then(updateFreshness);
  } else if (tab === "papir" && ticker) {
    renderTicker(root, ticker);
  } else if (active === "papirok") {
    renderList(root);
  } else if (active === "portfolio") {
    renderPortfolio(root);
  } else if (active === "megtakaritas") {
    renderSavings(root);
  } else if (active === "elorejelzes") {
    renderForecast(root);
  } else {
    const name = TAB_NAMES[active];
    root.replaceChildren(el("section", { className: "card" },
      el("h2", { textContent: name }),
      el("p", { className: "muted", textContent: "Hamarosan." })));
  }
}

function updateFreshness(meta) {
  const bar = document.getElementById("freshness");
  if (!meta) { bar.hidden = true; return; }
  const now = new Date();
  if (isStale(meta.prices_updated, now)) {
    bar.textContent = meta.prices_updated
      ? `Az árak utoljára ${fmtAgo(meta.prices_updated, now)} frissültek. Lehet, hogy elavultak.`
      : "Még nincs árfrissítés, az árak nem aktuálisak.";
    bar.hidden = false;
  } else {
    bar.hidden = true;
  }
}

function start() {
  document.getElementById("tabs").hidden = false;
  document.getElementById("logout").hidden = isLocalMode();
  route();
}

function init() {
  initTheme();
  document.getElementById("logout").addEventListener("click", () => { clearToken(); showLogin(); });
  addEventListener("hashchange", () => { if (isLocalMode() || getToken()) route(); });
  addEventListener("be:unauthorized", () => {
    if (loggingIn) return;
    clearToken(); showLogin("A munkamenet lejárt, lépj be újra.");
  });
  if (isLocalMode() || getToken()) start(); else showLogin();
}

init();
