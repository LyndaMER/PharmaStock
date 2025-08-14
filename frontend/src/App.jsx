// frontend/src/App.jsx
import { Link, NavLink, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

// Image de bannière (URL fournie)
const HERO_URL =
  "https://nell-associes.com/wp-content/uploads/shutterstock_1467369743-min.jpg";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header fixé au-dessus de tout */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto p-4 flex items-center gap-6">


          <nav className="flex gap-5 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                "px-1 py-0.5 transition " +
                (isActive ? "text-teal-700 font-semibold" : "text-gray-700 hover:text-teal-700")
              }
            >
              Accueil
            </NavLink>

            <NavLink
              to="/produits"
              className={({ isActive }) =>
                "px-1 py-0.5 transition " +
                (isActive ? "text-teal-700 font-semibold" : "text-gray-700 hover:text-teal-700")
              }
            >
              Produits
            </NavLink>

            {/* Placeholders pour plus tard */}
            <span className="text-gray-300 select-none">|</span>
            <a className="hover:text-teal-700 text-gray-700" href="#">Fournisseurs</a>
            <a className="hover:text-teal-700 text-gray-700" href="#">Commandes</a>
            <a className="hover:text-teal-700 text-gray-700" href="#">Expiration</a>
          </nav>
        </div>
      </header>

      {/* BANNIÈRE IMAGE (remplace la loupe) */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "220px", // ajuste si tu veux: 260px/300px
        }}
      >
        {/* Voile pour lisibilité du texte */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Titre à droite comme dans ton Figma */}
        <div className="relative max-w-6xl mx-auto h-full px-4 flex items-end justify-end pb-5">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            ParmaStock
          </h1>
        </div>
      </section>

      {/* Routes : Accueil et Produits -> même page (Dashboard) */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/produits" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
