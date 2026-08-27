"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import DogProfileManager from "./DogProfileManager";

interface CancelTarget {
  table: string;
  id: string;
  title: string;
}

type PeriodOption = "1m" | "6m" | "1y";

export default function ClientDashboardHub() {
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [eduRequests, setEduRequests] = useState<any[]>([]);
  const [pensionRequests, setPensionRequests] = useState<any[]>([]);
  const [adoptionRequests, setAdoptionRequests] = useState<any[]>([]);
  const [sellerieOrders, setSellerieOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtre de période côté client : 1 mois par défaut
  const [period, setPeriod] = useState<PeriodOption>("1m");

  const [cancelModal, setCancelModal] = useState<CancelTarget | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchUserServices = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [edu, pen, adp, sel] = await Promise.all([
      supabase.from("education_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("pension_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("adoption_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("sellerie_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    setEduRequests(edu.data || []);
    setPensionRequests(pen.data || []);
    setAdoptionRequests(adp.data || []);
    setSellerieOrders(sel.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserServices();
  }, []);

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

  const filteredEdu = useMemo(() => filterByPeriod(eduRequests), [eduRequests, period]);
  const filteredPension = useMemo(() => filterByPeriod(pensionRequests), [pensionRequests, period]);
  const filteredAdoption = useMemo(() => filterByPeriod(adoptionRequests), [adoptionRequests, period]);
  const filteredSellerie = useMemo(() => filterByPeriod(sellerieOrders), [sellerieOrders, period]);

  const handleConfirmCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);

    try {
      const { error } = await supabase
        .from(cancelModal.table)
        .update({ status: "annulé" })
        .eq("id", cancelModal.id);

      if (error) throw error;
      await fetchUserServices();
      setCancelModal(null);
    } catch (err: any) {
      alert(`Impossible d'annuler : ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="mt-12 text-center text-xs font-bold text-stone-400">Chargement de votre tableau de bord...</div>;
  }

  const hasAnyService = eduRequests.length > 0 || pensionRequests.length > 0 || adoptionRequests.length > 0 || sellerieOrders.length > 0;

  return (
    <>
      {/* SÉLECTEUR DE PÉRIODE CÔTÉ CLIENT */}
      <div className="flex items-center justify-end gap-2 mt-6">
        <label htmlFor="client-period" className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
          Période :
        </label>
        <select
          id="client-period"
          value={period}
          onChange={(e) => setPeriod(e.target.value as PeriodOption)}
          className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-black text-stone-800 shadow-sm focus:outline-none focus:border-orange-500 cursor-pointer"
        >
          <option value="1m">1 Mois (Défaut)</option>
          <option value="6m">6 Mois</option>
          <option value="1y">1 Année</option>
        </select>
      </div>

      {/* GESTIONNAIRE DE FICHES CHIENS (Désormais rétractable par défaut) */}
      <DogProfileManager />

      {!hasAnyService ? (
        <div className="mt-12 p-10 sm:p-16 rounded-[2.5rem] bg-white/40 border border-stone-200 border-dashed text-center flex flex-col items-center justify-center max-w-3xl mx-auto shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600 mb-6 shadow-inner">
            犬
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Votre historique de réservations est vide</h2>
          <p className="text-stone-500 mt-3 text-sm leading-relaxed max-w-lg">
            Vos demandes de pension, d'éducation ou commandes de sellerie apparaîtront ici.
          </p>
          <a href="/education" className="mt-8 px-8 py-3 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 transition-all">
            Découvrir nos services
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-start">
          
          {/* 1. WIDGET ÉDUCATION */}
          {filteredEdu.length > 0 && (
            <div className={`rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm transition-all duration-300 ${expandedWidget === 'edu' ? 'lg:col-span-2 shadow-md bg-white ring-1 ring-orange-100' : ''}`}>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">Éducation</span>
                  <h3 className="text-xl font-black text-stone-900 mt-1.5">Séances & Bilan</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center font-black text-xs text-orange-700">
                  {filteredEdu.length}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {/* LIMITÉ À 2 PAR DÉFAUT */}
                {(expandedWidget === 'edu' ? filteredEdu : filteredEdu.slice(0, 2)).map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-stone-50/70 border border-stone-100 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900">{item.dog_name} ({item.dog_breed})</h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'confirmé' ? 'bg-emerald-100 text-emerald-800' : item.status === 'annulé' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 block mt-0.5">{item.preferred_slot}</span>
                      </div>

                      {item.status !== "annulé" && item.status !== "terminé" && (
                        <button
                          onClick={() => setCancelModal({ table: "education_requests", id: item.id, title: `la séance de ${item.dog_name}` })}
                          className="text-xs font-bold text-stone-400 hover:text-red-600 px-3 py-1 rounded-full hover:bg-red-50 transition-all cursor-pointer shrink-0"
                        >
                          Annuler
                        </button>
                      )}
                    </div>

                    {item.admin_notes && (
                      <div className="p-3 rounded-xl bg-orange-50 border border-orange-200/60 text-xs text-orange-950 font-medium">
                        <span className="font-bold text-orange-700 block text-[10px] uppercase">Message Inochi Inu :</span>
                        {item.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredEdu.length > 2 && (
                <button onClick={() => setExpandedWidget(expandedWidget === 'edu' ? null : 'edu')} className="mt-3 text-xs font-bold text-stone-500 hover:text-stone-900 block mx-auto cursor-pointer">
                  {expandedWidget === 'edu' ? "Réduire" : `Voir tout (+${filteredEdu.length - 2})`}
                </button>
              )}
            </div>
          )}

          {/* 2. WIDGET PENSION */}
          {filteredPension.length > 0 && (
            <div className={`rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm transition-all duration-300 ${expandedWidget === 'pen' ? 'lg:col-span-2 shadow-md bg-white ring-1 ring-emerald-100' : ''}`}>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Pension</span>
                  <h3 className="text-xl font-black text-stone-900 mt-1.5">Séjours en Garde</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-xs text-emerald-700">
                  {filteredPension.length}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {/* LIMITÉ À 2 PAR DÉFAUT */}
                {(expandedWidget === 'pen' ? filteredPension : filteredPension.slice(0, 2)).map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-stone-50/70 border border-stone-100 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900">{item.dog_name}</h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'confirmé' ? 'bg-emerald-100 text-emerald-800' : item.status === 'annulé' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-medium block mt-0.5">Du {item.start_date} au {item.end_date}</span>
                      </div>

                      {item.status !== "annulé" && item.status !== "terminé" && (
                        <button
                          onClick={() => setCancelModal({ table: "pension_requests", id: item.id, title: `le séjour de ${item.dog_name}` })}
                          className="text-xs font-bold text-stone-400 hover:text-red-600 px-3 py-1 rounded-full hover:bg-red-50 transition-all cursor-pointer shrink-0"
                        >
                          Annuler
                        </button>
                      )}
                    </div>

                    {item.admin_notes && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-950 font-medium">
                        <span className="font-bold text-emerald-700 block text-[10px] uppercase">Message Inochi Inu :</span>
                        {item.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredPension.length > 2 && (
                <button onClick={() => setExpandedWidget(expandedWidget === 'pen' ? null : 'pen')} className="mt-3 text-xs font-bold text-stone-500 hover:text-stone-900 block mx-auto cursor-pointer">
                  {expandedWidget === 'pen' ? "Réduire" : `Voir tout (+${filteredPension.length - 2})`}
                </button>
              )}
            </div>
          )}

          {/* 3. WIDGET ÉLEVAGE */}
          {filteredAdoption.length > 0 && (
            <div className={`rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm transition-all duration-300 ${expandedWidget === 'adp' ? 'lg:col-span-2 shadow-md bg-white ring-1 ring-orange-100' : ''}`}>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">Élevage</span>
                  <h3 className="text-xl font-black text-stone-900 mt-1.5">Candidature Chiot</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center font-black text-xs text-orange-700">
                  {filteredAdoption.length}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {/* LIMITÉ À 2 PAR DÉFAUT */}
                {(expandedWidget === 'adp' ? filteredAdoption : filteredAdoption.slice(0, 2)).map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-stone-50/70 border border-stone-100 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900">{item.preferred_breed}</h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'accepté' ? 'bg-emerald-100 text-emerald-800' : item.status === 'annulé' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 block mt-0.5">{item.living_environment}</span>
                      </div>

                      {item.status !== "annulé" && (
                        <button
                          onClick={() => setCancelModal({ table: "adoption_requests", id: item.id, title: `votre candidature pour un ${item.preferred_breed}` })}
                          className="text-xs font-bold text-stone-400 hover:text-red-600 px-3 py-1 rounded-full hover:bg-red-50 transition-all cursor-pointer shrink-0"
                        >
                          Annuler
                        </button>
                      )}
                    </div>

                    {item.admin_notes && (
                      <div className="p-3 rounded-xl bg-orange-50 border border-orange-200/60 text-xs text-orange-950 font-medium">
                        <span className="font-bold text-orange-700 block text-[10px] uppercase">Message Inochi Inu :</span>
                        {item.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredAdoption.length > 2 && (
                <button onClick={() => setExpandedWidget(expandedWidget === 'adp' ? null : 'adp')} className="mt-3 text-xs font-bold text-stone-500 hover:text-stone-900 block mx-auto cursor-pointer">
                  {expandedWidget === 'adp' ? "Réduire" : `Voir tout (+${filteredAdoption.length - 2})`}
                </button>
              )}
            </div>
          )}

          {/* 4. WIDGET SELLERIE */}
          {filteredSellerie.length > 0 && (
            <div className={`rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm transition-all duration-300 ${expandedWidget === 'sel' ? 'lg:col-span-2 shadow-md bg-white ring-1 ring-amber-100' : ''}`}>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Sellerie</span>
                  <h3 className="text-xl font-black text-stone-900 mt-1.5">Commandes Atelier</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center font-black text-xs text-amber-700">
                  {filteredSellerie.length}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {/* LIMITÉ À 2 PAR DÉFAUT */}
                {(expandedWidget === 'sel' ? filteredSellerie : filteredSellerie.slice(0, 2)).map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-stone-50/70 border border-stone-100 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900">{item.item_type}</h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'expédié' ? 'bg-emerald-100 text-emerald-800' : item.status === 'annulé' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 block mt-0.5">{item.color_finish} • {item.dog_size}</span>
                      </div>

                      {item.status === "en_attente" && (
                        <button
                          onClick={() => setCancelModal({ table: "sellerie_orders", id: item.id, title: `la commande de ${item.item_type}` })}
                          className="text-xs font-bold text-stone-400 hover:text-red-600 px-3 py-1 rounded-full hover:bg-red-50 transition-all cursor-pointer shrink-0"
                        >
                          Annuler
                        </button>
                      )}
                    </div>

                    {item.admin_notes && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-950 font-medium">
                        <span className="font-bold text-amber-700 block text-[10px] uppercase">Message Inochi Inu :</span>
                        {item.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredSellerie.length > 2 && (
                <button onClick={() => setExpandedWidget(expandedWidget === 'sel' ? null : 'sel')} className="mt-3 text-xs font-bold text-stone-500 hover:text-stone-900 block mx-auto cursor-pointer">
                  {expandedWidget === 'sel' ? "Réduire" : `Voir tout (+${filteredSellerie.length - 2})`}
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* MODALE CONFIRMATION ANNULATION CLIENT */}
      {cancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => !cancelling && setCancelModal(null)}
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-8 shadow-2xl backdrop-blur-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 text-xl font-black">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-stone-900">
              Confirmer l'annulation ?
            </h3>
            <p className="mt-2 text-xs text-stone-500 leading-relaxed">
              Êtes-vous certain de vouloir annuler <strong>{cancelModal.title}</strong> ?
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {cancelling ? "Annulation en cours..." : "Oui, annuler la demande"}
              </button>
              <button
                onClick={() => setCancelModal(null)}
                disabled={cancelling}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-full transition-all cursor-pointer"
              >
                Non, conserver
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
