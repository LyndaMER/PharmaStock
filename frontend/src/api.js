// frontend/src/api.js

// URL de l’API (configurable via frontend/.env)
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api";

// Petit helper pour remonter des erreurs lisibles
async function fetchJson(url, opts) {
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} – ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    // Réponse pas en JSON
    return text;
  }
}

/** Récupérer la liste des produits (optionnel: q et category) */
export async function getProducts({ q = "", category = "" } = {}) {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (category) qs.set("category", category);
  const suffix = qs.toString() ? `?${qs}` : "";
  return fetchJson(`${API}/products${suffix}`);
}

/** Récupérer les produits qui expirent dans <= 6 mois */
export async function getExpiringProducts() {
  return fetchJson(`${API}/alerts/expiring`);
}

/** Créer un produit */
export async function createProduct(product) {
  return fetchJson(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
}

/** Mettre à jour un produit */
export async function updateProduct(id, product) {
  return fetchJson(`${API}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
}

/** Supprimer un produit */
export async function deleteProduct(id) {
  return fetchJson(`${API}/products/${id}`, { method: "DELETE" });
}
