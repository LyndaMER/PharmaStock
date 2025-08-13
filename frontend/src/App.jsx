import { useEffect, useMemo, useState } from "react";
import {
  getProducts,
  getExpiringProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./api";

// Petit utilitaire d’affichage prix
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 });

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(""); // "", "MEDICAMENT", "PARAPHARMACIE"
  const [products, setProducts] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Charger la liste (avec recherche/filtre)
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

  // Charger les alertes une fois
  useEffect(() => {
    getExpiringProducts()
      .then((d) => setExpiring(Array.isArray(d) ? d : []))
      .catch((e) => console.warn("Alertes:", e.message));
  }, []);

  // Stats rapides
  const stats = useMemo(() => {
    const totalStock = products.reduce((s, p) => s + (p.quantite_boites || 0), 0);
    const exp = products.filter(
      (p) => (p.jours_restants ?? 99999) >= 0 && (p.jours_restants ?? 99999) <= 183
    ).length;
    return { totalStock, exp };
  }, [products]);

  // CRUD minimal (tu peux brancher sur un vrai formulaire ensuite)
  async function handleDelete(id) {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await deleteProduct(id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto p-4 flex gap-4 items-center">
          <div className="text-2xl font-extrabold text-teal-700">ParmaStock</div>
          <nav className="hidden md:flex gap-6 text-sm">
            {["Accueil", "Produits", "Fournisseurs", "Commandes", "Expiration"].map(
              (x, i) => (
                <a key={i} className="hover:text-teal-700" href="#">
                  {x}
                </a>
              )
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit…"
              className="w-64 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>
      </header>

      {/* Bandeau */}
      <section className="bg-gradient-to-r from-teal-700 to-teal-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-extrabold">Tableau de bord</h1>
          <p className="text-teal-100">
            Stock total : <b>{stats.totalStock}</b> boîtes • Proches d’expiration :{" "}
            <b>{stats.exp}</b>
          </p>
        </div>
      </section>

      {/* Contenu */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Filtres */}
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
                category === val ? "bg-teal-600 text-white" : "bg-white"
              }`}
              onClick={() => setCategory(val)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Alertes d’expiration */}
        {expiring.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="font-semibold mb-2">
              ⚠ Produits à moins de 6 mois de la date d’expiration
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
                      <td className="px-3 py-2">{p.quantite_boites ?? p.quantite}</td>
                      <td className="px-3 py-2">
                        {new Date(p.date_expiration).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-3 py-2 font-semibold">{p.jours_restants}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Liste des produits */}
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
                      <td className="px-4 py-2 font-medium">{p.nom_commercial}</td>
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
                        <button
                          className="px-2 py-1 rounded border text-xs text-red-600"
                          onClick={() => handleDelete(p.id)}
                        >
                          Supprimer
                        </button>
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

      <footer className="py-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ParmaStock
      </footer>
    </div>
  );
}
