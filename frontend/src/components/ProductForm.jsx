import { useEffect, useState } from "react";

const empty = {
  nom_commercial: "", dci: "", dosage: "", forme: "Comprimé",
  nb_comprimes: "", fiche_url: "", quantite_boites: 0,
  numero_lot: "", date_expiration: "", ppa: "", shp: "",
  categorie: "MEDICAMENT",
};

export default function ProductForm({ initial, onCancel, onSubmit }) {
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");

  useEffect(()=> {
    setForm(initial ? {
      ...empty, ...initial,
      nb_comprimes: initial.nb_comprimes ?? "",
      dci: initial.dci ?? "",
      dosage: initial.dosage ?? "",
      fiche_url: initial.fiche_url ?? "",
      shp: initial.shp ?? "",
      date_expiration: initial.date_expiration ? String(initial.date_expiration).slice(0,10) : ""
    } : empty);
  }, [initial]);

  const update = (k,v)=> setForm(s=>({...s, [k]: v}));

  function validate() {
    if (!form.nom_commercial.trim()) return "Nom commercial requis";
    if (!form.numero_lot.trim()) return "Numéro de lot requis";
    if (!form.date_expiration) return "Date d’expiration requise";
    if (form.ppa === "" || isNaN(Number(form.ppa))) return "PPA invalide";
    return "";
  }

  function submit(e){
    e.preventDefault();
    const v = validate();
    if (v) { setErr(v); return; }
    const payload = {
      ...form,
      nb_comprimes: form.nb_comprimes === "" ? null : Number(form.nb_comprimes),
      quantite_boites: Number(form.quantite_boites || 0),
      ppa: Number(form.ppa || 0),
      shp: form.shp === "" ? null : Number(form.shp),
      dci: form.dci === "" ? null : form.dci,
      dosage: form.dosage === "" ? null : form.dosage,
      fiche_url: form.fiche_url === "" ? null : form.fiche_url,
      date_expiration: form.date_expiration,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {err && <div className="p-2 text-red-700 bg-red-50 border border-red-200 rounded">{err}</div>}
      <div className="grid md:grid-cols-2 gap-3">
        <Input label="Nom commercial *" value={form.nom_commercial} onChange={v=>update("nom_commercial", v)} />
        <Select label="Catégorie" value={form.categorie} onChange={v=>update("categorie", v)}
          options={[["MEDICAMENT","Médicament"],["PARAPHARMACIE","Parapharmacie"]]} />
        <Input label="DCI" value={form.dci} onChange={v=>update("dci", v)} />
        <Input label="Dosage" value={form.dosage} onChange={v=>update("dosage", v)} />
        <Input label="Forme" value={form.forme} onChange={v=>update("forme", v)} placeholder="Comprimé, Sirop, Gel..." />
        <Input label="Nb comprimés" type="number" value={form.nb_comprimes} onChange={v=>update("nb_comprimes", v)} />
        <Input label="Quantité (boîtes)" type="number" value={form.quantite_boites} onChange={v=>update("quantite_boites", v)} />
        <Input label="Numéro de lot *" value={form.numero_lot} onChange={v=>update("numero_lot", v)} />
        <Input label="Date d’expiration *" type="date" value={form.date_expiration} onChange={v=>update("date_expiration", v)} />
        <Input label="PPA *" type="number" step="0.01" value={form.ppa} onChange={v=>update("ppa", v)} />
        <Input label="SHP" type="number" step="0.01" value={form.shp} onChange={v=>update("shp", v)} />
        <Input label="Fiche (URL)" value={form.fiche_url} onChange={v=>update("fiche_url", v)} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="px-3 py-2 rounded-xl border" onClick={onCancel}>Annuler</button>
        <button type="submit" className="px-3 py-2 rounded-xl bg-teal-600 text-white">
          {initial ? "Mettre à jour" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}

function Input({ label, type="text", value, onChange, ...rest }) {
  return (
    <label className="text-sm">
      <span className="block mb-1 text-gray-600">{label}</span>
      <input type={type} value={value ?? ""} onChange={e=>onChange(e.target.value)}
        className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600" {...rest}/>
    </label>
  );
}

function Select({ label, value, onChange, options=[] }) {
  return (
    <label className="text-sm">
      <span className="block mb-1 text-gray-600">{label}</span>
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600">
        {options.map(([v,t])=> <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
}



