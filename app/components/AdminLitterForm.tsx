"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface PuppyInput {
  tempId: number;
  name: string;
  gender: "male" | "female";
  status: "disponible" | "reserve" | "adopte";
}

export default function AdminLitterForm() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // État pour la Portée (Le Couple)
  const [litterData, setLitterData] = useState({
    title: "Portée attendue : L'union du Soleil et de la Lune",
    father_name: "Boshin",
    mother_name: "Laïka",
    story: "C'est l'histoire d'une rencontre évidente...",
    image_url: "", // Lien vers la photo du couple
  });

  // État pour la liste des chiots
  const [puppies, setPuppies] = useState<PuppyInput[]>([]);

  // Ajouter un chiot vide au formulaire
  const handleAddPuppy = () => {
    setPuppies([
      ...puppies,
      { tempId: Date.now(), name: "", gender: "male", status: "disponible" },
    ]);
  };

  // Mettre à jour un chiot spécifique
  const handlePuppyChange = (id: number, field: keyof PuppyInput, value: string) => {
    setPuppies(puppies.map(p => (p.tempId === id ? { ...p, [field]: value } : p)));
  };

  // Retirer un chiot du formulaire
  const handleRemovePuppy = (id: number) => {
    setPuppies(puppies.filter(p => p.tempId !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // 1. Enregistrer la portée (Le couple)
      const { data: litterInsert, error: litterError } = await supabase
        .from("litters")
        .insert([litterData])
        .select()
        .single();

      if (litterError) throw litterError;

      // 2. Si on a des chiots, on les enregistre en les liant à l'ID de la portée
      if (puppies.length > 0 && litterInsert) {
        const puppiesToInsert = puppies.map((p) => ({
          litter_id: litterInsert.id,
          name: p.name,
          gender: p.gender,
          status: p.status,
        }));

        const { error: puppiesError } = await supabase
          .from("puppies")
          .insert(puppiesToInsert);

        if (puppiesError) throw puppiesError;
      }

      setSuccess(true);
      // Réinitialiser le formulaire (optionnel)
      setPuppies([]);
      setLitterData({ ...litterData, title: "", story: "", image_url: "" });

    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white border border-stone-200 rounded-[2.5rem] shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-stone-900">Configurer une Portée</h2>
        <p className="text-sm text-stone-500 mt-1">Créez l'histoire du couple et ajoutez les chiots associés.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-200/50">✓</span>
          La portée et les chiots ont été publiés avec succès !
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* SECTION 1 : LE COUPLE & L'HISTOIRE */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-orange-600 border-b border-stone-100 pb-2">
            1. Le Couple & L'histoire
          </h3>
          
          <div>
            <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Titre de la portée *</label>
            <input type="text" required value={litterData.title} onChange={(e) => setLitterData({ ...litterData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-orange-500" placeholder="Ex: Portée Printemps 2026..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Nom du Père *</label>
              <input type="text" required value={litterData.father_name} onChange={(e) => setLitterData({ ...litterData, father_name: e.target.value })} className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-orange-500" placeholder="Ex: Boshin" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Nom de la Mère *</label>
              <input type="text" required value={litterData.mother_name} onChange={(e) => setLitterData({ ...litterData, mother_name: e.target.value })} className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-orange-500" placeholder="Ex: Laïka" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Photo du couple (URL)</label>
            <input type="url" value={litterData.image_url} onChange={(e) => setLitterData({ ...litterData, image_url: e.target.value })} className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-orange-500" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">L'histoire attachante *</label>
            <textarea required rows={4} value={litterData.story} onChange={(e) => setLitterData({ ...litterData, story: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-orange-500" placeholder="Racontez leur rencontre, leurs caractères..." />
          </div>
        </section>


        {/* SECTION 2 : LES CHIOTS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-orange-600">
              2. Liste des chiots
            </h3>
            <button type="button" onClick={handleAddPuppy} className="text-[11px] font-black text-white bg-stone-900 px-3 py-1.5 rounded-full hover:bg-stone-700 transition">
              + Ajouter un chiot
            </button>
          </div>

          {puppies.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-stone-50 border border-stone-200 border-dashed">
              <p className="text-xs text-stone-500 font-medium">Aucun chiot ajouté pour le moment. Cliquez sur le bouton pour en ajouter un.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {puppies.map((puppy, index) => (
                <div key={puppy.tempId} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-black text-stone-400 w-4">{index + 1}.</span>
                  
                  <input type="text" required placeholder="Nom du chiot" value={puppy.name} onChange={(e) => handlePuppyChange(puppy.tempId, "name", e.target.value)} className="flex-1 min-w-[120px] px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-500" />
                  
                  <select value={puppy.gender} onChange={(e) => handlePuppyChange(puppy.tempId, "gender", e.target.value)} className="px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white cursor-pointer focus:outline-none focus:border-orange-500">
                    <option value="male">🐕 Mâle</option>
                    <option value="female">🌸 Femelle</option>
                  </select>
                  
                  <select value={puppy.status} onChange={(e) => handlePuppyChange(puppy.tempId, "status", e.target.value)} className="px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white cursor-pointer focus:outline-none focus:border-orange-500">
                    <option value="disponible">🟢 Disponible</option>
                    <option value="reserve">🟠 Réservé</option>
                    <option value="adopte">🔴 Adopté</option>
                  </select>

                  <button type="button" onClick={() => handleRemovePuppy(puppy.tempId)} className="p-2 text-stone-400 hover:text-red-500 transition cursor-pointer">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BOUTON SOUMISSION */}
        <div className="pt-6 border-t border-stone-100 flex justify-end">
          <button type="submit" disabled={loading} className="px-8 py-3.5 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-md hover:scale-105 transition-all disabled:opacity-50 cursor-pointer">
            {loading ? "Création en cours..." : "Publier la portée"}
          </button>
        </div>

      </form>
    </div>
  );
}