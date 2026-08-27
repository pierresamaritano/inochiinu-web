"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Dog {
  id: string;
  name: string;
  breed: string;
  birth_date?: string;
  is_vaccinated: boolean;
  is_neutered: boolean;
  vaccine_expiry?: string;
}

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

interface Props {
  isAdmin: boolean;
  currentUserId: string;
  excludeDogId?: string; // Prop ajoutée pour exclure un chien déjà sélectionné
  onDogSelected: (dog: Dog, targetUserId: string, targetClientInfo?: { name: string; email: string; phone?: string }) => void;
}

export default function ClientDogSelector({ isAdmin, currentUserId, excludeDogId, onDogSelected }: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [targetUserId, setTargetUserId] = useState<string>(currentUserId);
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState<ClientProfile[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string>("");
  const [showAddDogModal, setShowAddDogModal] = useState(false);

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
  const [creatingDog, setCreatingDog] = useState(false);

  const getClientInfo = () => {
    return selectedClient
      ? { name: selectedClient.full_name, email: selectedClient.email, phone: selectedClient.phone }
      : undefined;
  };

  const fetchDogs = async (uid: string) => {
    const { data } = await supabase.from("dogs").select("*").eq("user_id", uid).order("name");
    
    // Filtrage pour ne pas afficher le chien correspondant à l'ID exclu (le cas échéant)
    const filteredDogs = (data || []).filter((dog) => dog.id !== excludeDogId);
    
    setDogs(filteredDogs);
    if (filteredDogs.length > 0) {
      setSelectedDogId(filteredDogs[0].id);
      onDogSelected(filteredDogs[0], uid, getClientInfo());
    } else {
      setSelectedDogId("");
    }
  };

  useEffect(() => {
    fetchDogs(targetUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId, excludeDogId]);

  useEffect(() => {
    if (!isAdmin || clientSearch.trim().length < 2) {
      setClientResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .or(`full_name.ilike.%${clientSearch}%,email.ilike.%${clientSearch}%`)
        .limit(6);
      setClientResults(data || []);
    }, 250);

    return () => clearTimeout(timer);
  }, [clientSearch, isAdmin, supabase]);

  const handleSelectClient = (client: ClientProfile) => {
    setSelectedClient(client);
    setTargetUserId(client.id);
    setClientSearch(`${client.full_name || client.email}`);
    setClientResults([]);
  };

  const handleDogChange = (dogId: string) => {
    setSelectedDogId(dogId);
    const d = dogs.find((item) => item.id === dogId);
    if (d) onDogSelected(d, targetUserId, getClientInfo());
  };

  const handleCreateDog = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!newDog.is_vaccinated) {
      alert("Attention : Nous n'acceptons que les chiens à jour de vaccination.");
      return;
    }

    setCreatingDog(true);
    try {
      const payload = {
        ...newDog,
        user_id: targetUserId,
        birth_date: newDog.birth_date || null,
        vaccine_expiry: newDog.vaccine_expiry || null,
      };

      const { data, error } = await supabase
        .from("dogs")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      
      await fetchDogs(targetUserId);
      
      if (data && data.id !== excludeDogId) {
        setSelectedDogId(data.id);
        onDogSelected(data, targetUserId, getClientInfo());
      }
      
      setShowAddDogModal(false);
      setNewDog({
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
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setCreatingDog(false);
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="relative">
          <label className="block text-[11px] font-black uppercase tracking-wider text-orange-700 mb-1">
            Réservation pour le compte client (Admin) :
          </label>
          <input
            type="text"
            placeholder="Rechercher par Nom, Prénom ou Email..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-orange-50/50 border border-orange-200 text-xs font-bold text-stone-900 focus:outline-none focus:border-orange-500"
          />

          {clientResults.length > 0 && (
            <div className="absolute top-full inset-x-0 mt-1 z-50 rounded-2xl bg-white border border-stone-200 shadow-xl overflow-hidden">
              {clientResults.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectClient(c)}
                  className="w-full px-4 py-2.5 text-left text-xs hover:bg-orange-50 border-b border-stone-100 last:border-none flex justify-between items-center cursor-pointer"
                >
                  <span className="font-bold text-stone-800">{c.full_name || "Sans nom"}</span>
                  <span className="text-[11px] text-stone-400">{c.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Chien concerné *
          </label>
          <button
            type="button"
            onClick={() => setShowAddDogModal(true)}
            className="text-[11px] font-black text-orange-600 hover:text-orange-700 cursor-pointer"
          >
            + Ajouter un chien
          </button>
        </div>

        {dogs.length === 0 ? (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
            <span>Aucun autre chien enregistré pour ce compte.</span>
            <button
              type="button"
              onClick={() => setShowAddDogModal(true)}
              className="px-3 py-1.5 bg-amber-600 text-white font-black text-[10px] uppercase rounded-full cursor-pointer shrink-0"
            >
              Créer sa fiche
            </button>
          </div>
        ) : (
          <select
            value={selectedDogId}
            onChange={(e) => handleDogChange(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            {dogs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.breed})
              </option>
            ))}
          </select>
        )}
      </div>

      {showAddDogModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAddDogModal(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-[#FDFCF8] border border-white p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowAddDogModal(false)}
              className="absolute top-6 right-6 text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-stone-900">Enregistrer une fiche chien</h3>
            <p className="text-xs text-stone-500 mt-1">Conformité vaccinale et profil pour le suivi.</p>

            <div className="mt-6 space-y-4">
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
                  <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Date d'anniversaire</label>
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
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Date de rappel vaccinal</label>
                  <input
                    type="date"
                    value={newDog.vaccine_expiry}
                    onChange={(e) => setNewDog({ ...newDog, vaccine_expiry: e.target.value })}
                    className="w-full max-w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:border-orange-500 appearance-none"
                  />
                </div>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Numéro d'identification / Puce</label>
                <input
                  type="text"
                  placeholder="25026..."
                  value={newDog.identification_number}
                  onChange={(e) => setNewDog({ ...newDog, identification_number: e.target.value })}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAddDogModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-stone-500 hover:text-stone-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateDog}
                  disabled={creatingDog || !newDog.is_vaccinated || !newDog.name || !newDog.breed}
                  className="px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  {creatingDog ? "Enregistrement..." : "Enregistrer et sélectionner"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
