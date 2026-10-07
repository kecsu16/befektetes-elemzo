const KEY = "be_theme";

function read() { try { return localStorage.getItem(KEY); } catch { return null; } }
function write(v) { try { localStorage.setItem(KEY, v); } catch { /* nincs tároló */ } }

function systemDark() { return matchMedia("(prefers-color-scheme: dark)").matches; }

function apply(theme) { document.documentElement.setAttribute("data-theme", theme); }

export function initTheme() {
  apply(read() || (systemDark() ? "dark" : "light"));
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    apply(next);
    write(next);
    globalThis.dispatchEvent(new Event("be:theme"));
  });
}
