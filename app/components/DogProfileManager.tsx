"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import DogProfileManager from "./DogProfileManager";


export default function DogProfileManager() {
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDog, setSelectedDog] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchDogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("dogs").select("*").eq("user_id", user.id).order("name");
    setDogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDogs();
  }, []);

  const handleSaveDog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDog) return;

    await supabase.from("dogs").update({
      name: selectedDog.name,
      breed: selectedDog.breed,
      birth_date: selectedDog.birth_date,
      is_neutered: selectedDog.is_neutered,
      is_vaccinated: selectedDog.is_vaccinated,
      vaccine_expiry: selectedDog.vaccine_expiry,
      identification_number: selectedDog.identification_number,
      health_notes: selectedDog.health_notes,
    }).eq("id", selectedDog.id);

    setEditing(false);
    fetchDogs();
  };

  if (loading) return null;

  return (
    <div className="mt-10 p-6 sm:p-8 rounded-[2.5rem] bg-white border border-stone-200/90 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div>
          <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
            Mes Compagnons
          </span>
          <h3 className="text-xl font-black text-stone-900 mt-1">Fiches Chiens & Santé</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {dogs.map((dog) => (
          <div key={dog.id} className="p-5 rounded-2xl bg-stone-50 border border-stone-200/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-stone-900">{dog.name}</h4>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  dog.is_vaccinated ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                }`}>
                  {dog.is_vaccinated ? "Vacciné ✓" : "Non à jour ⚠️"}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{dog.breed} • {dog.gender === "male" ? "Mâle" : "Femelle"}</p>
              
              <div className="mt-3 space-y-1 text-[11px] text-stone-600">
                <div>🎂 <strong>Anniversaire :</strong> {dog.birth_date || "Non renseigné"}</div>
                <div>✂️ <strong>Stérilisation :</strong> {dog.is_neutered ? "Oui" : "Non"}</div>
                <div>💉 <strong>Rappel vaccin :</strong> {dog.vaccine_expiry || "À renseigner"}</div>
              </div>
            </div>

            <button
              onClick={() => { setSelectedDog(dog); setEditing(true); }}
              className="mt-4 w-full py-2 bg-white border border-stone-200 hover:border-stone-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Modifier la fiche
            </button>
          </div>
        ))}
      </div>

      {/* MODALE D'ÉDITION FICHE CHIEN */}
      {editing && selectedDog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditing(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] bg-[#FDFCF8] p-8 shadow-2xl border border-white">
            <h3 className="text-xl font-black text-stone-900">Mettre à jour la fiche de {selectedDog.name}</h3>
            
            <form onSubmit={handleSaveDog} className="mt-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-600">Date d'anniversaire</label>
                <input
                  type="date"
                  value={selectedDog.birth_date || ""}
                  onChange={(e) => setSelectedDog({ ...selectedDog, birth_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs"
                />
              </div>

              <div className="p-3 bg-stone-100 rounded-xl space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span>Vaccins à jour (Obligatoire)</span>
                  <input
                    type="checkbox"
                    checked={selectedDog.is_vaccinated}
                    onChange={(e) => setSelectedDog({ ...selectedDog, is_vaccinated: e.target.checked })}
                    className="h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span>Stérilisé / Castré</span>
                  <input
                    type="checkbox"
                    checked={selectedDog.is_neutered}
                    onChange={(e) => setSelectedDog({ ...selectedDog, is_neutered: e.target.checked })}
                    className="h-4 w-4"
                  />
                </label>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500">Date de rappel vaccinal</label>
                  <input
                    type="date"
                    value={selectedDog.vaccine_expiry || ""}
                    onChange={(e) => setSelectedDog({ ...selectedDog, vaccine_expiry: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-xs font-bold text-stone-500">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-stone-900 text-white font-bold text-xs rounded-full cursor-pointer">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
