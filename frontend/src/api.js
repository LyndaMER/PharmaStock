// frontend/src/api.js
// Utilise le proxy Vite (/api). Voir vite.config.js (proxy -> 127.0.0.1:4000)
const API = "/api";

// Helpers
async function http(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }
  return res.json();
}

// Produits
export async function getProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  const s = qs.toString() ? `?${qs}` : "";
  return http(`/products${s}`);
}
export async function createProduct(data) {
  return http(`/products`, { method: "POST", body: JSON.stringify(data) });
}
export async function updateProduct(id, data) {
  return http(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function deleteProduct(id) {
  return http(`/products/${id}`, { method: "DELETE" });
}

// Alertes
export async function getExpiringProducts() {
  return http(`/alerts/expiring`);
}

// Stats (exemple backend)
export async function getOverview() {
  return http(`/stats/overview`);
}
