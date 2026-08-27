"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function DogProfileManager() {
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDog, setSelectedDog] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [creatingDog, setCreatingDog] = useState(false);
  const [newDog, setNewDog] = useState({
    name: "",
    breed: "",
    birth_date: "",
    gender: "male",
    is_neutered: false,
    is_vaccinated: true,
    vaccine_expiry: "",
    identification_number: "",
    health_notes: "",
  });

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateDog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDog.is_vaccinated) {
      alert("Attention : Nous n'acceptons que les chiens à jour de vaccination.");
      return;
    }

    setCreatingDog(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setCreatingDog(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("dogs")
        .insert([{ 
          ...newDog, 
          user_id: user.id,
          birth_date: newDog.birth_date || null,
          vaccine_expiry: newDog.vaccine_expiry || null
        }]);

      if (error) throw error;
      
      setShowAddModal(false);
      setNewDog({
        name: "", breed: "", birth_date: "", gender: "male",
        is_neutered: false, is_vaccinated: true, vaccine_expiry: "",
        identification_number: "", health_notes: "",
      });
      fetchDogs();
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setCreatingDog(false);
    }
  };

  const handleSaveDog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDog) return;

    await supabase.from("dogs").update({
      name: selectedDog.name,
      breed: selectedDog.breed,
      birth_date: selectedDog.birth_date || null,
      is_neutered: selectedDog.is_neutered,
      is_vaccinated: selectedDog.is_vaccinated,
      vaccine_expiry: selectedDog.vaccine_expiry || null,
      identification_number: selectedDog.identification_number,
      health_notes: selectedDog.health_notes,
    }).eq("id", selectedDog.id);

    setEditing(false);
    fetchDogs();
  };

  if (loading) return null;

  return (
    <div className="mt-10 p-6 sm:p-8 rounded-[2.5rem] bg-white border border-stone-200/90 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
            Mes Compagnons
          </span>
          <h3 className="text-xl font-black text-stone-900 mt-1">Fiches Chiens & Santé</h3>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-10 items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-xs font-bold text-white transition-all hover:bg-stone-800 cursor-pointer shadow-sm shrink-0"
        >
          <span>+ Ajouter un chien</span>
        </button>
      </div>

      {dogs.length === 0 ? (
        <div className="mt-6 p-6 rounded-2xl bg-stone-50 border border-stone-100 text-sm text-stone-500 text-center flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-200/50 text-xl">
            🐕
          </div>
          <p>Aucun chien enregistré pour le moment.<br/>Créez une fiche pour faciliter vos futures réservations.</p>
        </div>
      ) : (
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
      )}

      {/* MODALE AJOUT RAPIDE */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => !creatingDog && setShowAddModal(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-[#FDFCF8] border border-white p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-stone-900">Enregistrer un nouveau chien</h3>
            <p className="text-xs text-stone-500 mt-1">Gérez son carnet de santé digital.</p>

            <form onSubmit={handleCreateDog} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="w-full min-w-0">
                  <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ryu"
                    value={newDog.name}
                    onChange={(e) => setNewDog({ ...newDog, name: e.target.value })}
                    className="w-full max-w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="w-full min-w-0">
                  <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Race *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Akita Inu"
                    value={newDog.breed}
                    onChange={(e) => setNewDog({ ...newDog, breed: e.target.value })}
                    className="w-full max-w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="w-full min-w-0">
                  <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Date de naissance</label>
                  <input
                    type="date"
                    value={newDog.birth_date}
                    onChange={(e) => setNewDog({ ...newDog, birth_date: e.target.value })}
                    className="w-full max-w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500 appearance-none"
                  />
                </div>
                <div className="w-full min-w-0">
                  <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Sexe</label>
                  <select
                    value={newDog.gender}
                    onChange={(e) => setNewDog({ ...newDog, gender: e.target.value })}
                    className="w-full max-w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="male">Mâle</option>
                    <option value="female">Femelle</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-3 overflow-hidden">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-stone-900 pr-2">Vaccins à jour (Obligatoire) *</label>
                  <input
                    type="checkbox"
                    checked={newDog.is_vaccinated}
                    onChange={(e) => setNewDog({ ...newDog, is_vaccinated: e.target.checked })}
                    className="h-4 w-4 rounded text-orange-600 cursor-pointer shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 pr-2">Stérilisé / Castré</label>
                  <input
                    type="checkbox"
                    checked={newDog.is_neutered}
                    onChange={(e) => setNewDog({ ...newDog, is_neutered: e.target.checked })}
                    className="h-4 w-4 rounded text-orange-600 cursor-pointer shrink-0"
                  />
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                    Date d'échéance / rappel de vaccin
                  </label>
                  <input
                    type="date"
                    value={newDog.vaccine_expiry}
                    onChange={(e) => setNewDog({ ...newDog, vaccine_expiry: e.target.value })}
                    className="w-full max-w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:border-orange-500 appearance-none"
                  />
                </div>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">
                  Puce ou tatouage
                </label>
                <input
                  type="text"
                  placeholder="Ex: 25026..."
                  value={newDog.identification_number}
                  onChange={(e) => setNewDog({ ...newDog, identification_number: e.target.value })}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingDog || !newDog.is_vaccinated || !newDog.name || !newDog.breed}
                  className="px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  {creatingDog ? "Création..." : "Créer la fiche"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE D'ÉDITION FICHE CHIEN */}
      {editing && selectedDog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditing(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] bg-[#FDFCF8] p-8 shadow-2xl border border-white">
            <h3 className="text-xl font-black text-stone-900">Mettre à jour {selectedDog.name}</h3>
            
            <form onSubmit={handleSaveDog} className="mt-4 space-y-4">
              <div className="w-full min-w-0">
                <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">Date d'anniversaire</label>
                <input
                  type="date"
                  value={selectedDog.birth_date || ""}
                  onChange={(e) => setSelectedDog({ ...selectedDog, birth_date: e.target.value })}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs focus:outline-none focus:border-orange-500 appearance-none"
                />
              </div>

              <div className="p-4 bg-stone-100 rounded-2xl space-y-3 overflow-hidden">
                <label className="flex items-center justify-between text-xs font-bold text-stone-800 pr-2">
                  <span>Vaccins à jour (Obligatoire)</span>
                  <input
                    type="checkbox"
                    checked={selectedDog.is_vaccinated}
                    onChange={(e) => setSelectedDog({ ...selectedDog, is_vaccinated: e.target.checked })}
                    className="h-4 w-4 rounded text-orange-600 cursor-pointer shrink-0"
                  />
                </label>
                <label className="flex items-center justify-between text-xs font-bold text-stone-800 pr-2">
                  <span>Stérilisé / Castré</span>
                  <input
                    type="checkbox"
                    checked={selectedDog.is_neutered}
                    onChange={(e) => setSelectedDog({ ...selectedDog, is_neutered: e.target.checked })}
                    className="h-4 w-4 rounded text-orange-600 cursor-pointer shrink-0"
                  />
                </label>
                <div className="pt-1 w-full min-w-0">
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Date de rappel vaccinal</label>
                  <input
                    type="date"
                    value={selectedDog.vaccine_expiry || ""}
                    onChange={(e) => setSelectedDog({ ...selectedDog, vaccine_expiry: e.target.value })}
                    className="w-full max-w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:border-orange-500 appearance-none"
                  />
                </div>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">Puce ou tatouage</label>
                <input
                  type="text"
                  value={selectedDog.identification_number || ""}
                  onChange={(e) => setSelectedDog({ ...selectedDog, identification_number: e.target.value })}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 flex-wrap">
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-800 cursor-pointer">Annuler</button>
                <button type="submit" className="px-5 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 cursor-pointer shadow-md">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
