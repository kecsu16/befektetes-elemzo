const KEY = "be_theme";

function read() { try { return localStorage.getItem(KEY); } catch { return null; } }
function write(v) { try { localStorage.setItem(KEY, v); } catch { /* nincs tároló */ } }

const mq = () => matchMedia("(prefers-color-scheme: dark)");

// Kézi választás nélkül nincs data-theme attribútum: a CSS @media követi a rendszert.
export function effectiveTheme(stored, systemDark) {
  return stored === "dark" || stored === "light" ? stored : (systemDark ? "dark" : "light");
}

function apply(stored) {
  if (stored === "dark" || stored === "light") document.documentElement.setAttribute("data-theme", stored);
  else document.documentElement.removeAttribute("data-theme");
}

export function initTheme() {
  apply(read());
  mq().addEventListener?.("change", () => { if (!read()) globalThis.dispatchEvent(new Event("be:theme")); });
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const next = effectiveTheme(read(), mq().matches) === "dark" ? "light" : "dark";
    write(next);
    apply(next);
    globalThis.dispatchEvent(new Event("be:theme"));
  });
}
