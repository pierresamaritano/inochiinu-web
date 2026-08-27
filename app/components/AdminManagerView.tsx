"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface ActionTarget {
  table: string;
  id: string;
  newStatus: string;
  title: string;
  clientName: string;
  currentNote?: string;
}

type PeriodOption = "1m" | "6m" | "1y";

export default function AdminManagerView() {
  const [eduList, setEduList] = useState<any[]>([]);
  const [pensionList, setPensionList] = useState<any[]>([]);
  const [adoptionList, setAdoptionList] = useState<any[]>([]);
  const [sellerieList, setSellerieList] = useState<any[]>([]);
  const [tab, setTab] = useState<"education" | "pension" | "elevage" | "sellerie">("education");
  
  // Filtre de période : "1m" par défaut
  const [period, setPeriod] = useState<PeriodOption>("1m");

  // Modale d'action avec message
  const [actionModal, setActionModal] = useState<ActionTarget | null>(null);
  const [noteText, setNoteText] = useState("");
  const [updating, setUpdating] = useState(false);

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

  // Fonction de filtrage par période
  const filterByPeriod = (items: any[]) => {
    const now = new Date().getTime();
    return items.filter((item) => {
      const itemDate = new Date(item.created_at || Date.now()).getTime();
      const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
      if (period === "1m") return diffDays <= 31;
      if (period === "6m") return diffDays <= 183;
      if (period === "1y") return diffDays <= 365;
      return true;
    });
  };

  const filteredEdu = useMemo(() => filterByPeriod(eduList), [eduList, period]);
  const filteredPension = useMemo(() => filterByPeriod(pensionList), [pensionList, period]);
  const filteredAdoption = useMemo(() => filterByPeriod(adoptionList), [adoptionList, period]);
  const filteredSellerie = useMemo(() => filterByPeriod(sellerieList), [sellerieList, period]);

  const openAction = (table: string, id: string, newStatus: string, title: string, clientName: string, currentNote?: string) => {
    setActionModal({ table, id, newStatus, title, clientName, currentNote });
    setNoteText(currentNote || "");
  };

  const handleConfirmAction = async () => {
    if (!actionModal) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from(actionModal.table)
        .update({ 
          status: actionModal.newStatus,
          admin_notes: noteText.trim() || null
        })
        .eq("id", actionModal.id);

      if (error) throw error;
      await fetchAll();
      setActionModal(null);
    } catch (err: any) {
      alert(`Erreur : ${err.message || "Action non autorisée"}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      
      {/* BARRE SUPÉRIEURE : ONGLETS RESPONSIVES + SÉLECTEUR DE PÉRIODE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* MENU ONGLETS FLUIDE SUR MOBILE */}
        <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-stone-100/90 border border-stone-200/60 shadow-inner">
            <button
              onClick={() => setTab("education")}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer ${
                tab === "education" ? "bg-white text-orange-600 shadow-sm" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Éducation ({filteredEdu.length})
            </button>
            <button
              onClick={() => setTab("pension")}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer ${
                tab === "pension" ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Pension ({filteredPension.length})
            </button>
            <button
              onClick={() => setTab("elevage")}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer ${
                tab === "elevage" ? "bg-white text-orange-600 shadow-sm" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Élevage ({filteredAdoption.length})
            </button>
            <button
              onClick={() => setTab("sellerie")}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer ${
                tab === "sellerie" ? "bg-white text-amber-600 shadow-sm" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Sellerie ({filteredSellerie.length})
            </button>
          </div>
        </div>

        {/* SÉLECTEUR DE PÉRIODE DÉROULANT */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="period-select" className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Période :
          </label>
          <select
            id="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodOption)}
            className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-black text-stone-800 shadow-sm focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="1m">1 Mois (Défaut)</option>
            <option value="6m">6 Mois</option>
            <option value="1y">1 Année</option>
          </select>
        </div>

      </div>

      {/* =========================================================================
          LISTE ÉDUCATION
          ========================================================================= */}
      {tab === "education" && (
        <div className="space-y-4">
          {filteredEdu.length === 0 ? (
            <div className="p-8 rounded-3xl bg-stone-50 text-center text-xs font-bold text-stone-400">
              Aucune demande d'éducation sur cette période.
            </div>
          ) : (
            filteredEdu.map((item) => (
              <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-orange-600">{item.client_name} • {item.client_phone}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      item.status === 'confirmé' ? 'bg-emerald-100 text-emerald-800' : item.status === 'annulé' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-stone-900 mt-1">{item.dog_name} ({item.dog_breed}, {item.dog_age})</h4>
                  <p className="text-xs text-stone-500 mt-1">{item.objectives}</p>
                  
                  {item.admin_notes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 text-[11px] text-stone-700">
                      <strong>Votre message client :</strong> {item.admin_notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {item.status === "annulé" ? (
                    <span className="text-xs font-bold text-stone-400 italic px-3 py-1 bg-stone-50 rounded-full border border-stone-100">
                      Demande annulée
                    </span>
                  ) : (
                    <>
                      {item.status !== "confirmé" && (
                        <button
                          onClick={() => openAction("education_requests", item.id, "confirmé", `la séance de ${item.dog_name}`, item.client_name, item.admin_notes)}
                          className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                        >
                          Confirmer
                        </button>
                      )}
                      <button
                        onClick={() => openAction("education_requests", item.id, "annulé", `la séance de ${item.dog_name}`, item.client_name, item.admin_notes)}
                        className="px-4 py-2 rounded-full bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-bold transition-all cursor-pointer"
                      >
                        {item.status === "confirmé" ? "Annuler réservation" : "Refuser"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          LISTE PENSION
          ========================================================================= */}
      {tab === "pension" && (
        <div className="space-y-4">
          {filteredPension.length === 0 ? (
            <div className="p-8 rounded-3xl bg-stone-50 text-center text-xs font-bold text-stone-400">
              Aucune demande de pension sur cette période.
            </div>
          ) : (
            filteredPension.map((item) => (
              <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-emerald-600">{item.client_name} • {item.client_phone}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      item.status === 'confirmé' ? 'bg-emerald-100 text-emerald-800' : item.status === 'annulé' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-stone-900 mt-1">{item.dog_name} ({item.dog_breed})</h4>
                  <p className="text-xs font-bold text-stone-700 mt-0.5">Du {item.start_date} au {item.end_date}</p>
                  {item.special_needs && <p className="text-xs text-stone-500 mt-1">Besoins : {item.special_needs}</p>}
                  
                  {item.admin_notes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-stone-700">
                      <strong>Votre message client :</strong> {item.admin_notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {item.status === "annulé" ? (
                    <span className="text-xs font-bold text-stone-400 italic px-3 py-1 bg-stone-50 rounded-full border border-stone-100">
                      Demande annulée
                    </span>
                  ) : (
                    <>
                      {item.status !== "confirmé" && (
                        <button
                          onClick={() => openAction("pension_requests", item.id, "confirmé", `le séjour de ${item.dog_name}`, item.client_name, item.admin_notes)}
                          className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                        >
                          Valider séjour
                        </button>
                      )}
                      <button
                        onClick={() => openAction("pension_requests", item.id, "annulé", `le séjour de ${item.dog_name}`, item.client_name, item.admin_notes)}
                        className="px-4 py-2 rounded-full bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-bold transition-all cursor-pointer"
                      >
                        {item.status === "confirmé" ? "Annuler réservation" : "Refuser"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          LISTE ÉLEVAGE
          ========================================================================= */}
      {tab === "elevage" && (
        <div className="space-y-4">
          {filteredAdoption.length === 0 ? (
            <div className="p-8 rounded-3xl bg-stone-50 text-center text-xs font-bold text-stone-400">
              Aucune candidature sur cette période.
            </div>
          ) : (
            filteredAdoption.map((item) => (
              <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-orange-600">{item.client_name} • {item.client_phone}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      item.status === 'accepté' ? 'bg-emerald-100 text-emerald-800' : item.status === 'liste_attente' ? 'bg-amber-100 text-amber-800' : item.status === 'annulé' ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-stone-900 mt-1">{item.preferred_breed}</h4>
                  <p className="text-xs text-stone-500 mt-1">Cadre : {item.living_environment}</p>
                  
                  {item.admin_notes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 text-[11px] text-stone-700">
                      <strong>Votre message client :</strong> {item.admin_notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {item.status === "annulé" ? (
                    <span className="text-xs font-bold text-stone-400 italic px-3 py-1 bg-stone-50 rounded-full border border-stone-100">
                      Candidature annulée
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => openAction("adoption_requests", item.id, "accepté", `la candidature de ${item.client_name}`, item.client_name, item.admin_notes)}
                        className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => openAction("adoption_requests", item.id, "liste_attente", `la candidature de ${item.client_name}`, item.client_name, item.admin_notes)}
                        className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                      >
                        Liste d'attente
                      </button>
                      <button
                        onClick={() => openAction("adoption_requests", item.id, "annulé", `la candidature de ${item.client_name}`, item.client_name, item.admin_notes)}
                        className="px-4 py-2 rounded-full bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-bold transition-all cursor-pointer"
                      >
                        Refuser
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          LISTE SELLERIE
          ========================================================================= */}
      {tab === "sellerie" && (
        <div className="space-y-4">
          {filteredSellerie.length === 0 ? (
            <div className="p-8 rounded-3xl bg-stone-50 text-center text-xs font-bold text-stone-400">
              Aucune commande de sellerie sur cette période.
            </div>
          ) : (
            filteredSellerie.map((item) => (
              <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-amber-600">{item.client_name} • {item.client_phone}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      item.status === 'expédié' ? 'bg-emerald-100 text-emerald-800' : item.status === 'en_atelier' ? 'bg-amber-100 text-amber-800' : item.status === 'annulé' ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-stone-900 mt-1">{item.item_type}</h4>
                  <p className="text-xs font-bold text-stone-700 mt-1">{item.color_finish} • {item.dog_size}</p>
                  
                  {item.admin_notes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-[11px] text-stone-700">
                      <strong>Votre message client :</strong> {item.admin_notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {item.status === "annulé" ? (
                    <span className="text-xs font-bold text-stone-400 italic px-3 py-1 bg-stone-50 rounded-full border border-stone-100">
                      Commande annulée
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => openAction("sellerie_orders", item.id, "en_atelier", `la commande de ${item.item_type}`, item.client_name, item.admin_notes)}
                        className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                      >
                        En atelier
                      </button>
                      <button
                        onClick={() => openAction("sellerie_orders", item.id, "expédié", `la commande de ${item.item_type}`, item.client_name, item.admin_notes)}
                        className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                      >
                        Expédier
                      </button>
                      <button
                        onClick={() => openAction("sellerie_orders", item.id, "annulé", `la commande de ${item.item_type}`, item.client_name, item.admin_notes)}
                        className="px-4 py-2 rounded-full bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-bold transition-all cursor-pointer"
                      >
                        Annuler
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODALE D'ACTION */}
      {actionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => !updating && setActionModal(null)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-8 shadow-2xl backdrop-blur-2xl">
            <button
              onClick={() => setActionModal(null)}
              className="absolute top-6 right-6 text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                Action administrative
              </span>
              <h3 className="text-xl font-black text-stone-900 mt-1">
                Passer en statut : <span className="capitalize text-orange-600">"{actionModal.newStatus}"</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Pour {actionModal.title} ({actionModal.clientName})
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Message / Explication pour le client
              </label>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ajoutez une consigne, un lieu ou la raison du changement..."
                className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                disabled={updating}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={updating}
                className="px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {updating ? "Mise à jour..." : "Confirmer et envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
