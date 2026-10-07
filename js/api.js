const KEY = "be_token";
const REPO = "kecsu16/befektetes-elemzo-adat";

export class ApiError extends Error {
  constructor(status) {
    super(`API hiba: ${status}`);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
export function setToken(t) {
  try { localStorage.setItem(KEY, t); } catch { /* nincs tároló */ }
}
export function clearToken() {
  try { localStorage.removeItem(KEY); } catch { /* nincs tároló */ }
}

// Helyi fejlesztői mód: localhost + ?local=1 → ./data/<path>, token nélkül.
export function isLocalMode() {
  try {
    const h = globalThis.location?.hostname;
    return (h === "localhost" || h === "127.0.0.1") &&
      new URLSearchParams(globalThis.location.search).get("local") === "1";
  } catch { return false; }
}

export async function fetchData(path) {
  if (isLocalMode()) {
    const r = await fetch(`./data/${path}`, { cache: "no-store" });
    if (!r.ok) throw new ApiError(r.status);
    return r.json();
  }
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/data/${path}`, {
    headers: {
      Authorization: `Bearer ${getToken() ?? ""}`,
      Accept: "application/vnd.github.raw+json",
    },
    cache: "no-store",
  });
  if (r.status === 401 || r.status === 403 || r.status === 404) {
    if (r.status === 401) globalThis.dispatchEvent?.(new Event("be:unauthorized"));
    throw new ApiError(r.status);
  }
  if (!r.ok) throw new ApiError(r.status);
  return r.json();
}
