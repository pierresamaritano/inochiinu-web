"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface PuppyInput {
  tempId: number;
  name: string;
  gender: "male" | "female";
  status: "disponible" | "reserve" | "adopte";
  image_file: File | null;
  image_tag: string;
  image_caption: string;
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
    image_file: null as File | null,
    image_tag: "LE COUPLE",
    image_caption: "Une rencontre exceptionnelle sous le signe de l'équilibre.",
  });

  // État pour la liste des chiots
  const [puppies, setPuppies] = useState<PuppyInput[]>([]);

  // Ajouter un chiot vide au formulaire
  const handleAddPuppy = () => {
    setPuppies([
      ...puppies,
      { tempId: Date.now(), name: "", gender: "male", status: "disponible", image_file: null, image_tag: "NOUVEAU-NÉ", image_caption: "" },
    ]);
  };

  // Mettre à jour un chiot spécifique
  const handlePuppyChange = (id: number, field: keyof PuppyInput, value: any) => {
    setPuppies(puppies.map(p => (p.tempId === id ? { ...p, [field]: value } : p)));
  };

  // Retirer un chiot du formulaire
  const handleRemovePuppy = (id: number) => {
    setPuppies(puppies.filter(p => p.tempId !== id));
  };

  // Fonction d'upload d'image vers Supabase Storage
  const uploadImage = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // 1. Uploader l'image du couple (si fournie)
      let coupleImageUrl = "";
      if (litterData.image_file) {
        coupleImageUrl = await uploadImage(litterData.image_file, 'couples');
      }

      // 2. Enregistrer la portée
      const { data: litterInsert, error: litterError } = await supabase
        .from("litters")
        .insert([{
          title: litterData.title,
          father_name: litterData.father_name,
          mother_name: litterData.mother_name,
          story: litterData.story,
          image_url: coupleImageUrl,
          image_tag: litterData.image_tag,
          image_caption: litterData.image_caption,
        }])
        .select()
        .single();

      if (litterError) throw litterError;

      // 3. Uploader les images des chiots et les enregistrer
      if (puppies.length > 0 && litterInsert) {
        const puppiesToInsert = await Promise.all(puppies.map(async (p) => {
          let pupImageUrl = "";
          if (p.image_file) {
            pupImageUrl = await uploadImage(p.image_file, 'chiots');
          }

          return {
            litter_id: litterInsert.id,
            name: p.name,
            gender: p.gender,
            status: p.status,
            image_url: pupImageUrl,
            image_tag: p.image_tag,
            image_caption: p.image_caption,
          };
        }));

        const { error: puppiesError } = await supabase
          .from("puppies")
          .insert(puppiesToInsert);

        if (puppiesError) throw puppiesError;
      }

      setSuccess(true);
      // Réinitialiser
      setPuppies([]);
      setLitterData({ ...litterData, title: "", story: "", image_file: null, image_caption: "" });

    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-white border border-stone-200 rounded-[2.5rem] shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-stone-900">Configurer une Portée</h2>
        <p className="text-sm text-stone-500 mt-1">Créez l'histoire du couple et ajoutez les chiots associés avec leurs photos.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-200/50 shrink-0">✓</span>
          La portée et les chiots ont été publiés avec succès ! Vous pouvez les voir sur la page Élevage.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* SECTION 1 : LE COUPLE & L'HISTOIRE */}
        <section className="space-y-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-orange-600 border-b border-stone-100 pb-2">
            1. Le Couple & L'histoire
          </h3>
          
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
            <h4 className="text-[11px] font-black uppercase text-stone-800">Photo & Légende du Couple</h4>
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Importer une image</label>
              <input type="file" accept="image/*" onChange={(e) => setLitterData({ ...litterData, image_file: e.target.files?.[0] || null })} className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Tag (Texte orange court)</label>
                <input type="text" value={litterData.image_tag} onChange={(e) => setLitterData({ ...litterData, image_tag: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-500" placeholder="Ex: LE COUPLE" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Légende détaillée</label>
                <input type="text" value={litterData.image_caption} onChange={(e) => setLitterData({ ...litterData, image_caption: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-500" placeholder="Ex: Une rencontre sous le signe de l'équilibre." />
              </div>
            </div>
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
            <button type="button" onClick={handleAddPuppy} className="text-[11px] font-black text-white bg-stone-900 px-4 py-2 rounded-full hover:bg-stone-700 transition shadow-sm">
              + Ajouter un chiot
            </button>
          </div>

          {puppies.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-stone-50 border border-stone-200 border-dashed">
              <p className="text-xs text-stone-500 font-medium">Aucun chiot ajouté pour le moment. Cliquez sur le bouton pour en ajouter un.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {puppies.map((puppy, index) => (
                <div key={puppy.tempId} className="p-5 rounded-[1.5rem] bg-white border border-stone-200 shadow-sm relative space-y-4">
                  
                  <button type="button" onClick={() => handleRemovePuppy(puppy.tempId)} className="absolute top-4 right-4 text-[10px] font-bold text-stone-400 hover:text-red-500 transition cursor-pointer">
                    ✕ Retirer
                  </button>

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
                      <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Photo du chiot</label>
                      <input type="file" accept="image/*" onChange={(e) => handlePuppyChange(puppy.tempId, "image_file", e.target.files?.[0] || null)} className="w-full text-xs text-stone-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Tag (Ex: ÉVEIL)</label>
                        <input type="text" value={puppy.image_tag} onChange={(e) => handlePuppyChange(puppy.tempId, "image_tag", e.target.value)} className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Légende descriptive</label>
                        <input type="text" value={puppy.image_caption} onChange={(e) => handlePuppyChange(puppy.tempId, "image_caption", e.target.value)} placeholder="Ex: Chiot très joueur et curieux." className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-orange-500" />
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        {/* BOUTON SOUMISSION */}
        <div className="pt-6 border-t border-stone-100 flex justify-end">
          <button type="submit" disabled={loading} className="px-8 py-4 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-[0_4px_14px_rgba(249,115,22,0.35)] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer flex items-center gap-2">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Publication en cours...
              </>
            ) : "Publier la portée"}
          </button>
        </div>

      </form>
    </div>
  );
}