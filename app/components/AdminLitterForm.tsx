"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface PuppyInput {
  id?: string;
  tempId: string | number;
  name: string;
  gender: "male" | "female";
  status: "disponible" | "reserve" | "adopte";
  image_url?: string;
  image_file: File | null;
  image_tag: string;
  image_caption: string;
}

export default function AdminLitterForm({ initialData, onSuccess, onCancel }: { initialData?: any, onSuccess?: () => void, onCancel?: () => void }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(false);
  
  const [litterData, setLitterData] = useState({
    title: "", father_name: "", mother_name: "", story: "", image_file: null as File | null, image_tag: "LE COUPLE", image_caption: "",
  });
  const [puppies, setPuppies] = useState<PuppyInput[]>([]);

  // Initialisation si on est en mode "Modification"
  useEffect(() => {
    if (initialData) {
      setLitterData({
        title: initialData.title || "",
        father_name: initialData.father_name || "",
        mother_name: initialData.mother_name || "",
        story: initialData.story || "",
        image_tag: initialData.image_tag || "LE COUPLE",
        image_caption: initialData.image_caption || "",
        image_file: null
      });
      if (initialData.puppies) {
        setPuppies(initialData.puppies.map((p: any) => ({
          id: p.id, tempId: p.id, name: p.name, gender: p.gender, status: p.status, image_url: p.image_url, image_tag: p.image_tag, image_caption: p.image_caption, image_file: null
        })));
      }
    }
  }, [initialData]);

  // MODIFICATION ICI : On génère un vrai UUID pour les nouveaux chiots
  const handleAddPuppy = () => {
    const newId = crypto.randomUUID(); 
    setPuppies([...puppies, { 
      id: newId, // Assure que la base de données ne plantera pas
      tempId: newId, 
      name: "", 
      gender: "male", 
      status: "disponible", 
      image_file: null, 
      image_tag: "NOUVEAU-NÉ", 
      image_caption: "" 
    }]);
  };

  const handlePuppyChange = (id: string | number, field: keyof PuppyInput, value: any) => {
    setPuppies(puppies.map(p => (p.tempId === id ? { ...p, [field]: value } : p)));
  };

  const handleRemovePuppy = (id: string | number) => {
    setPuppies(puppies.filter(p => p.tempId !== id));
  };

  const uploadImage = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Gérer l'image du couple (nouvelle ou existante)
      let coupleImageUrl = initialData?.image_url || "";
      if (litterData.image_file) {
        coupleImageUrl = await uploadImage(litterData.image_file, 'couples');
      }

      // 2. Enregistrer ou mettre à jour la portée
      const litterPayload = {
        ...(initialData ? { id: initialData.id } : {}),
        title: litterData.title,
        father_name: litterData.father_name,
        mother_name: litterData.mother_name,
        story: litterData.story,
        image_url: coupleImageUrl,
        image_tag: litterData.image_tag,
        image_caption: litterData.image_caption,
      };

      const { data: litterInsert, error: litterError } = await supabase.from("litters").upsert([litterPayload]).select().single();
      if (litterError) throw litterError;

      // 3. Supprimer les chiots qui ont été retirés via le formulaire
      if (initialData) {
        const currentPuppyIds = puppies.map(p => p.id).filter(Boolean);
        const originalPuppyIds = initialData.puppies?.map((p: any) => p.id) || [];
        const idsToDelete = originalPuppyIds.filter((id: string) => !currentPuppyIds.includes(id));
        if (idsToDelete.length > 0) {
          await supabase.from("puppies").delete().in("id", idsToDelete);
        }
      }

      // 4. Enregistrer ou mettre à jour les chiots actuels
      if (puppies.length > 0) {
        const puppiesToUpsert = await Promise.all(puppies.map(async (p) => {
          let pupImageUrl = p.image_url || "";
          if (p.image_file) {
            pupImageUrl = await uploadImage(p.image_file, 'chiots');
          }
          return {
            ...(p.id ? { id: p.id } : {}),
            litter_id: litterInsert.id,
            name: p.name, gender: p.gender, status: p.status,
            image_url: pupImageUrl, image_tag: p.image_tag, image_caption: p.image_caption,
          };
        }));
        const { error: puppiesError } = await supabase.from("puppies").upsert(puppiesToUpsert);
        if (puppiesError) throw puppiesError;
      }

      if (onSuccess) onSuccess();

    } catch (error: any) {
      alert(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-stone-900">{initialData ? "Modifier la portée" : "Créer une Portée"}</h2>
          <p className="text-sm text-stone-500 mt-1">Configurez l'histoire et ajoutez les chiots.</p>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-xs font-bold text-stone-500 hover:text-stone-900 bg-stone-100 px-4 py-2 rounded-full transition cursor-pointer">
            Annuler & Retour
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* SECTION 1 : LE COUPLE */}
        <section className="space-y-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-orange-600 border-b border-stone-100 pb-2">1. Le Couple & L'histoire</h3>
          <div>
            <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Titre de la portée *</label>
            <input type="text" required value={litterData.title} onChange={(e) => setLitterData({ ...litterData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-orange-500" placeholder="Ex: Portée Printemps 2026..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Nom du Père *</label>
              <input type="text" required value={litterData.father_name} onChange={(e) => setLitterData({ ...litterData, father_name: e.target.value })} className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Nom de la Mère *</label>
              <input type="text" required value={litterData.mother_name} onChange={(e) => setLitterData({ ...litterData, mother_name: e.target.value })} className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-orange-500" />
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Photo du couple {initialData?.image_url && "(Une image est déjà enregistrée)"}</label>
              <input type="file" accept="image/*" onChange={(e) => setLitterData({ ...litterData, image_file: e.target.files?.[0] || null })} className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Tag (Texte orange court)</label>
                <input type="text" value={litterData.image_tag} onChange={(e) => setLitterData({ ...litterData, image_tag: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Légende détaillée</label>
                <input type="text" value={litterData.image_caption} onChange={(e) => setLitterData({ ...litterData, image_caption: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-500" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">L'histoire attachante *</label>
            <textarea required rows={4} value={litterData.story} onChange={(e) => setLitterData({ ...litterData, story: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-orange-500" />
          </div>
        </section>

        {/* SECTION 2 : LES CHIOTS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-orange-600">2. Liste des chiots</h3>
            <button type="button" onClick={handleAddPuppy} className="text-[11px] font-black text-white bg-stone-900 px-4 py-2 rounded-full hover:bg-stone-700 transition shadow-sm cursor-pointer">
              + Ajouter un chiot
            </button>
          </div>
          {puppies.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-stone-50 border border-stone-200 border-dashed">
              <p className="text-xs text-stone-500 font-medium">Aucun chiot pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {puppies.map((puppy, index) => (
                <div key={puppy.tempId} className="p-5 rounded-[1.5rem] bg-white border border-stone-200 shadow-sm relative space-y-4">
                  <button type="button" onClick={() => handleRemovePuppy(puppy.tempId)} className="absolute top-4 right-4 text-[10px] font-bold text-stone-400 hover:text-red-500 transition cursor-pointer">✕ Retirer</button>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-black">{index + 1}</span>
                    <h4 className="text-sm font-black text-stone-800">Fiche du chiot</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" required placeholder="Nom / Collier" value={puppy.name} onChange={(e) => handlePuppyChange(puppy.tempId, "name", e.target.value)} className="px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-orange-500" />
                    <select value={puppy.gender} onChange={(e) => handlePuppyChange(puppy.tempId, "gender", e.target.value)} className="px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm cursor-pointer focus:outline-none focus:border-orange-500">
                      <option value="male">🐕 Mâle</option>
                      <option value="female">🌸 Femelle</option>
                    </select>
                    <select value={puppy.status} onChange={(e) => handlePuppyChange(puppy.tempId, "status", e.target.value)} className="px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm cursor-pointer focus:outline-none focus:border-orange-500">
                      <option value="disponible">🟢 Disponible</option>
                      <option value="reserve">🟠 Réservé</option>
                      <option value="adopte">🔴 Adopté</option>
                    </select>
                  </div>
                  <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Photo du chiot {puppy.image_url && "(Image existante)"}</label>
                      <input type="file" accept="image/*" onChange={(e) => handlePuppyChange(puppy.tempId, "image_file", e.target.files?.[0] || null)} className="w-full text-xs text-stone-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Tag (Ex: ÉVEIL)</label>
                        <input type="text" value={puppy.image_tag} onChange={(e) => handlePuppyChange(puppy.tempId, "image_tag", e.target.value)} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Légende descriptive</label>
                        <input type="text" value={puppy.image_caption} onChange={(e) => handlePuppyChange(puppy.tempId, "image_caption", e.target.value)} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="pt-6 border-t border-stone-100 flex justify-end">
          <button type="submit" disabled={loading} className="px-8 py-4 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-[0_4px_14px_rgba(249,115,22,0.35)] hover:scale-105 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2">
            {loading ? "Sauvegarde..." : (initialData ? "Enregistrer les modifications" : "Créer la portée")}
          </button>
        </div>
      </form>
    </div>
  );
}