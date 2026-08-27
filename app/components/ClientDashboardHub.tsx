"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ClientDashboardHub() {
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [eduRequests, setEduRequests] = useState<any[]>([]);
  const [pensionRequests, setPensionRequests] = useState<any[]>([]);
  const [adoptionRequests, setAdoptionRequests] = useState<any[]>([]);
  const [sellerieOrders, setSellerieOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
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

    fetchUserServices();
  }, [supabase]);

  if (loading) {
    return <div className="mt-12 text-center text-xs font-bold text-stone-400">Chargement de votre tableau de bord...</div>;
  }

  const hasAnyService = eduRequests.length > 0 || pensionRequests.length > 0 || adoptionRequests.length > 0 || sellerieOrders.length > 0;

  if (!hasAnyService) {
    return (
      <div className="mt-12 p-10 sm:p-16 rounded-[2.5rem] bg-white/40 border border-stone-200 border-dashed text-center flex flex-col items-center justify-center max-w-3xl mx-auto shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600 mb-6 shadow-inner">
          犬
        </div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Votre espace est prêt</h2>
        <p className="text-stone-500 mt-3 text-sm leading-relaxed max-w-lg">
          Ce tableau de bord s'animera automatiquement dès que vous effectuerez une réservation ou une commande.
        </p>
        <a href="/education" className="mt-8 px-8 py-3 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 transition-all">
          Découvrir nos services
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 items-start">
      
      {/* 1. WIDGET ÉDUCATION */}
      {eduRequests.length > 0 && (
        <div className={`rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm transition-all duration-300 ${expandedWidget === 'edu' ? 'lg:col-span-2 shadow-md bg-white ring-1 ring-orange-100' : ''}`}>
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">Éducation</span>
              <h3 className="text-xl font-black text-stone-900 mt-1.5">Séances & Bilan</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center font-black text-xs text-orange-700">
              {eduRequests.length}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {(expandedWidget === 'edu' ? eduRequests : eduRequests.slice(0, 3)).map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900">{item.dog_name} ({item.dog_breed})</h4>
                  <span className="text-[11px] text-stone-400">{item.preferred_slot}</span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  item.status === 'confirmé' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          {eduRequests.length > 3 && (
            <button onClick={() => setExpandedWidget(expandedWidget === 'edu' ? null : 'edu')} className="mt-3 text-xs font-bold text-stone-500 hover:text-stone-900 block mx-auto cursor-pointer">
              {expandedWidget === 'edu' ? "Réduire" : `Voir tout (+${eduRequests.length - 3})`}
            </button>
          )}
        </div>
      )}

      {/* 2. WIDGET PENSION */}
      {pensionRequests.length > 0 && (
        <div className={`rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm transition-all duration-300 ${expandedWidget === 'pen' ? 'lg:col-span-2 shadow-md bg-white ring-1 ring-emerald-100' : ''}`}>
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Pension</span>
              <h3 className="text-xl font-black text-stone-900 mt-1.5">Séjours en Garde</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-xs text-emerald-700">
              {pensionRequests.length}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {(expandedWidget === 'pen' ? pensionRequests : pensionRequests.slice(0, 3)).map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900">{item.dog_name}</h4>
                  <span className="text-[11px] text-stone-400 font-medium">Du {item.start_date} au {item.end_date}</span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  item.status === 'confirmé' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          {pensionRequests.length > 3 && (
            <button onClick={() => setExpandedWidget(expandedWidget === 'pen' ? null : 'pen')} className="mt-3 text-xs font-bold text-stone-500 hover:text-stone-900 block mx-auto cursor-pointer">
              {expandedWidget === 'pen' ? "Réduire" : `Voir tout (+${pensionRequests.length - 3})`}
            </button>
          )}
        </div>
      )}

      {/* 3. WIDGET ÉLEVAGE */}
      {adoptionRequests.length > 0 && (
        <div className="rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">Élevage</span>
              <h3 className="text-xl font-black text-stone-900 mt-1.5">Candidature Chiot</h3>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {adoptionRequests.map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900">{item.preferred_breed}</h4>
                  <span className="text-[11px] text-stone-400">{item.living_environment}</span>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-orange-100 text-orange-800">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. WIDGET SELLERIE */}
      {sellerieOrders.length > 0 && (
        <div className="rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Sellerie</span>
              <h3 className="text-xl font-black text-stone-900 mt-1.5">Commandes Atelier</h3>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {sellerieOrders.map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900">{item.item_type}</h4>
                  <span className="text-[11px] text-stone-400">{item.color_finish}</span>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
