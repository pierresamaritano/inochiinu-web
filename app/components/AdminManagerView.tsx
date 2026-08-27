"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AdminManagerView() {
  const [eduList, setEduList] = useState<any[]>([]);
  const [pensionList, setPensionList] = useState<any[]>([]);
  const [adoptionList, setAdoptionList] = useState<any[]>([]);
  const [sellerieList, setSellerieList] = useState<any[]>([]);
  const [tab, setTab] = useState<"education" | "pension" | "elevage" | "sellerie">("education");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchAll = async () => {
    const [edu, pen, adp, sel] = await Promise.all([
      supabase.from("education_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("pension_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("adoption_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("sellerie_orders").select("*").order("created_at", { ascending: false }),
    ]);
    setEduList(edu.data || []);
    setPensionList(pen.data || []);
    setAdoptionList(adp.data || []);
    setSellerieList(sel.data || []);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateStatus = async (table: string, id: string, newStatus: string) => {
    await supabase.from(table).update({ status: newStatus }).eq("id", id);
    fetchAll();
  };

  return (
    <div className="mt-8 space-y-6">
      {/* ONGLETS SERVICES */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-full bg-stone-100 w-fit">
        <button
          onClick={() => setTab("education")}
          className={`px-5 py-2 rounded-full text-xs font-black uppercase transition-all cursor-pointer ${
            tab === "education" ? "bg-white text-orange-600 shadow-sm" : "text-stone-600"
          }`}
        >
          Éducation ({eduList.length})
        </button>
        <button
          onClick={() => setTab("pension")}
          className={`px-5 py-2 rounded-full text-xs font-black uppercase transition-all cursor-pointer ${
            tab === "pension" ? "bg-white text-emerald-600 shadow-sm" : "text-stone-600"
          }`}
        >
          Pension ({pensionList.length})
        </button>
        <button
          onClick={() => setTab("elevage")}
          className={`px-5 py-2 rounded-full text-xs font-black uppercase transition-all cursor-pointer ${
            tab === "elevage" ? "bg-white text-orange-600 shadow-sm" : "text-stone-600"
          }`}
        >
          Élevage ({adoptionList.length})
        </button>
        <button
          onClick={() => setTab("sellerie")}
          className={`px-5 py-2 rounded-full text-xs font-black uppercase transition-all cursor-pointer ${
            tab === "sellerie" ? "bg-white text-amber-600 shadow-sm" : "text-stone-600"
          }`}
        >
          Sellerie ({sellerieList.length})
        </button>
      </div>

      {/* LISTE ÉDUCATION */}
      {tab === "education" && (
        <div className="space-y-3">
          {eduList.length === 0 ? <p className="text-xs text-stone-400">Aucune demande d'éducation.</p> : eduList.map((item) => (
            <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-orange-600">{item.client_name} • {item.client_phone}</span>
                <h4 className="text-base font-black text-stone-900 mt-0.5">{item.dog_name} ({item.dog_breed}, {item.dog_age})</h4>
                <p className="text-xs text-stone-500 mt-1">{item.objectives}</p>
                <div className="flex gap-1.5 mt-2">
                  {item.issues?.map((iss: string) => (
                    <span key={iss} className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{iss}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateStatus("education_requests", item.id, "confirmé")}
                  className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600 transition-all cursor-pointer"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => updateStatus("education_requests", item.id, "annulé")}
                  className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LISTE PENSION */}
      {tab === "pension" && (
        <div className="space-y-3">
          {pensionList.length === 0 ? <p className="text-xs text-stone-400">Aucune demande de pension.</p> : pensionList.map((item) => (
            <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600">{item.client_name} • {item.client_phone}</span>
                <h4 className="text-base font-black text-stone-900 mt-0.5">{item.dog_name} ({item.dog_breed})</h4>
                <p className="text-xs font-bold text-stone-700 mt-1">Du {item.start_date} au {item.end_date}</p>
                {item.special_needs && <p className="text-xs text-stone-400 mt-1">Note : {item.special_needs}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateStatus("pension_requests", item.id, "confirmé")}
                  className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600 transition-all cursor-pointer"
                >
                  Valider séjour
                </button>
                <button
                  onClick={() => updateStatus("pension_requests", item.id, "annulé")}
                  className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LISTE ÉLEVAGE */}
      {tab === "elevage" && (
        <div className="space-y-3">
          {adoptionList.length === 0 ? <p className="text-xs text-stone-400">Aucune candidature d'adoption.</p> : adoptionList.map((item) => (
            <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-orange-600">{item.client_name} • {item.client_phone}</span>
                <h4 className="text-base font-black text-stone-900 mt-0.5">{item.preferred_breed}</h4>
                <p className="text-xs text-stone-500 mt-1">Cadre : {item.living_environment}</p>
                <p className="text-xs text-stone-600 mt-1 italic">"{item.motivation}"</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateStatus("adoption_requests", item.id, "accepté")}
                  className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600 transition-all cursor-pointer"
                >
                  Accepter
                </button>
                <button
                  onClick={() => updateStatus("adoption_requests", item.id, "liste_attente")}
                  className="px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-black hover:bg-amber-600 transition-all cursor-pointer"
                >
                  Liste d'attente
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LISTE SELLERIE */}
      {tab === "sellerie" && (
        <div className="space-y-3">
          {sellerieList.length === 0 ? <p className="text-xs text-stone-400">Aucune commande de sellerie.</p> : sellerieList.map((item) => (
            <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600">{item.client_name} • {item.client_phone}</span>
                <h4 className="text-base font-black text-stone-900 mt-0.5">{item.item_type}</h4>
                <p className="text-xs font-bold text-stone-700 mt-1">{item.color_finish} • {item.dog_size}</p>
                {item.custom_details && <p className="text-xs text-stone-400 mt-1">{item.custom_details}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateStatus("sellerie_orders", item.id, "en_atelier")}
                  className="px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-black hover:bg-amber-600 transition-all cursor-pointer"
                >
                  En atelier
                </button>
                <button
                  onClick={() => updateStatus("sellerie_orders", item.id, "expédié")}
                  className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-black hover:bg-emerald-600 transition-all cursor-pointer"
                >
                  Expédier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
