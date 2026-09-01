"use client";

import { useState, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

interface AdminReproducteursProps {
  supabase: SupabaseClient<any, "public", any>;
}

export default function AdminReproducteurs({ supabase }: AdminReproducteursProps) {
  const [dogs, setDogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: "",
    badge_name: "",
    role: "Lice",
    affixe: "",
    full_name: "",
    color: "",
    height: "",
    weight: "",
    birth_date: "",
    titles: "",
    description: "",
  });

  const fetchDogs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("reproducteurs").select("*").order("created_at", { ascending: true });
    if (!error && data) setDogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDogs();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("reproducteurs").insert([formData]);
      if (error) throw error;
      setShowForm(false);
      fetchDogs();
      // Reset form
      setFormData({ name: "", badge_name: "", role: "Lice", affixe: "", full_name: "", color: "", height: "", weight: "", birth_date: "", titles: "", description: "" });
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    }
  };

  const deleteDog = async (id: string) => {
    if (confirm("Supprimer ce reproducteur de l'élevage ?")) {
      await supabase.from("reproducteurs").delete().eq("id", id);
      fetchDogs();
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-stone-200/90 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-stone-900">Lices & Étalons</h2>
          <p className="text-xs text-stone-500 mt-0.5">Gérez les reproducteurs affichés sur la vitrine.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-black shadow-md hover:bg-stone-800 transition-all cursor-pointer"
        >
          + Ajouter un chien
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-stone-400">Chargement des reproducteurs...</p>
      ) : dogs.length === 0 ? (
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 text-center text-xs text-stone-400 font-bold">
          Aucun reproducteur enregistré pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dogs.map(dog => (
            <div key={dog.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl shrink-0">
                  {dog.role === 'Étalon' ? '🐕' : '🌸'}
                </div>
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${dog.role === 'Étalon' ? 'bg-orange-100 text-orange-700' : 'bg-pink-100 text-pink-700'}`}>
                    {dog.role}
                  </span>
                  <h4 className="text-sm font-black text-stone-900 mt-1">{dog.name}</h4>
                  <p className="text-[10px] text-stone-500 font-bold">{dog.full_name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => deleteDog(dog.id)} className="p-2 text-red-400 hover:text-red-600 bg-white rounded-full shadow-sm cursor-pointer transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE D'AJOUT RAPIDE */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-8 rounded-[2.5rem] shadow-2xl z-10">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 cursor-pointer">✕</button>
            <h3 className="text-xl font-black text-stone-900 mb-6">Ajouter un reproducteur</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Nom usuel *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" placeholder="Ex: Baïko" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Nom sur badge *</label>
                  <input required value={formData.badge_name} onChange={e => setFormData({...formData, badge_name: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" placeholder="Ex: Baïko" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Rôle *</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500">
                    <option value="Lice">Lice (Femelle)</option>
                    <option value="Étalon">Étalon (Mâle)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Affixe</label>
                  <input value={formData.affixe} onChange={e => setFormData({...formData, affixe: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" placeholder="Ex: Kazan No" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Nom Complet (Pedigree)</label>
                  <input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" placeholder="Ex: Baïko Ryu Go Kazan No" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Date de naissance</label>
                  <input type="text" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" placeholder="Ex: 12 Octobre 2021" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Couleur</label>
                  <input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" placeholder="Ex: Roux (Aka)" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Taille (cm)</label>
                  <input value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" placeholder="Ex: 67 cm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Poids (kg)</label>
                  <input value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" placeholder="Ex: 34 kg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Titres / Palmarès</label>
                  <input value={formData.titles} onChange={e => setFormData({...formData, titles: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" placeholder="Ex: Champion de France..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" placeholder="Description du chien..." />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white rounded-full text-xs font-black uppercase shadow-md hover:bg-orange-600 transition cursor-pointer">Enregistrer</button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}