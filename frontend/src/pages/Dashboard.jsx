

// frontend/src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import ProductForm from "../components/ProductForm";
import {
  getProducts,
  getExpiringProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api";

// Format prix
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 });

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(""); // "", "MEDICAMENT", "PARAPHARMACIE"
  const [products, setProducts] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal formulaire
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts({ q: query, category });
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(`Impossible de charger les produits (${e.message})`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [query, category]);

  useEffect(() => {
    getExpiringProducts()
      .then((d) => setExpiring(Array.isArray(d) ? d : []))
      .catch((e) => console.warn("Alertes:", e.message));
  }, []);

  const stats = useMemo(() => {
    const totalStock = products.reduce(
      (s, p) => s + (p.quantite_boites || 0),
      0
    );
    const exp = products.filter(
      (p) =>
        (p.jours_restants ?? 99999) >= 0 &&
        (p.jours_restants ?? 99999) <= 183
    ).length;
    return { totalStock, exp };
  }, [products]);

  // Actions CRUD
  async function onCreate(data) {
    await createProduct(data);
    setShowForm(false);
    setEditing(null);
    load();
  }
  async function onUpdate(id, data) {
    await updateProduct(id, data);
    setShowForm(false);
    setEditing(null);
    load();
  }
  async function onDelete(id) {
    if (!confirm("Supprimer ce produit ?")) return;
    await deleteProduct(id);
    load();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Bandeau / titre */}
      <section className="bg-gradient-to-r from-teal-700 to-teal-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          <p className="text-teal-100">
            Stock total : <b>{stats.totalStock}</b> boîtes • Proches d’expiration :{" "}
            <b>{stats.exp}</b>
          </p>
        </div>
      </section>

      {/* Contenu */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Barre outils : recherche + filtres + bouton */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          {/* Recherche (fonctionnelle) */}
          <div className="w-full md:w-80">
            <label className="relative block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">

              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un produit…"
                className="w-full border rounded-xl pl-9 pr-3 py-2 bg-white outline-none focus:ring-2 focus:ring-teal-600"
              />
            </label>
          </div>

          {/* Filtres catégories */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Catégorie :</span>
            {[
              ["", "Toutes"],
              ["MEDICAMENT", "Médicaments"],
              ["PARAPHARMACIE", "Parapharmacie"],
            ].map(([val, label]) => (
              <button
                key={val}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  category === val
                    ? "bg-teal-600 text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => setCategory(val)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Ajouter */}
          <button
            className="px-3 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + Ajouter un produit
          </button>
        </div>

        {/* Alertes d’expiration */}
        {expiring.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="font-semibold mb-2">
              ⚠ Produits à moins de 6 mois de l’expiration
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-yellow-100">
                    {["Nom", "Qté", "Expiration", "Jours restants"].map((h) => (
                      <th key={h} className="text-left px-3 py-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expiring.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2 font-medium">
                        {p.nom_commercial || p.nom}
                      </td>
                      <td className="px-3 py-2">
                        {p.quantite_boites ?? p.quantite}
                      </td>
                      <td className="px-3 py-2">
                        {new Date(p.date_expiration).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        {p.jours_restants}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tableau des produits */}
        <div className="rounded-2xl border bg-white overflow-x-auto">
          {loading ? (
            <div className="p-4">Chargement…</div>
          ) : error ? (
            <div className="p-4 text-red-600">{error}</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Nom commercial",
                    "Catégorie",
                    "DCI",
                    "Dosage",
                    "Forme",
                    "Nb comp.",
                    "PPA",
                    "SHP",
                    "Qté boîtes",
                    "Lot",
                    "Expiration",
                    "Jours",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="text-left px-4 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const rem = p.jours_restants ?? 999999;
                  const dead = rem < 0;
                  const danger = rem <= 183 && rem >= 0;
                  return (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-2 font-medium">
                        {p.nom_commercial}
                      </td>
                      <td className="px-4 py-2">{p.categorie}</td>
                      <td className="px-4 py-2">{p.dci ?? "-"}</td>
                      <td className="px-4 py-2">{p.dosage ?? "-"}</td>
                      <td className="px-4 py-2">{p.forme}</td>
                      <td className="px-4 py-2">{p.nb_comprimes ?? "-"}</td>
                      <td className="px-4 py-2">{fmt(p.ppa)} DA</td>
                      <td className="px-4 py-2">
                        {p.shp == null ? "-" : `${fmt(p.shp)} DA`}
                      </td>
                      <td className="px-4 py-2">{p.quantite_boites}</td>
                      <td className="px-4 py-2">{p.numero_lot}</td>
                      <td className="px-4 py-2">
                        {new Date(p.date_expiration).toLocaleDateString("fr-FR")}
                      </td>
                      <td
                        className={`px-4 py-2 ${
                          dead
                            ? "text-red-700 font-semibold"
                            : danger
                            ? "text-orange-600 font-semibold"
                            : ""
                        }`}
                      >
                        {dead ? "Périmé" : `${rem} j`}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 rounded border text-xs"
                            onClick={() => {
                              setEditing(p);
                              setShowForm(true);
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            className="px-2 py-1 rounded border text-xs text-red-600"
                            onClick={() => onDelete(p.id)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!products.length && (
                  <tr>
                    <td className="px-4 py-4 text-gray-500" colSpan={13}>
                      Aucun produit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modale Formulaire */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-[94vw] p-6">
            <h3 className="text-xl font-bold mb-4">
              {editing ? "Modifier le produit" : "Ajouter un produit"}
            </h3>
            <ProductForm
              initial={editing}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
              onSubmit={(data) =>
                editing ? onUpdate(editing.id, data) : onCreate(data)
              }
            />
          </div>
        </div>
      )}

      <footer className="py-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ParmaStock
      </footer>
    </div>
  );
}
