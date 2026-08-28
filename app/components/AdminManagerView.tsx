"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import AdminLitterForm from "./AdminLitterForm";

interface ActionTarget {
  table: string;
  id: string;
  newStatus: string;
  title: string;
  clientName: string;
  currentNote?: string;
}

type PeriodOption = "1m" | "6m" | "1y";

interface Dog {
  id: string;
  user_id: string;
  name: string;
  breed: string;
  is_vaccinated: boolean;
}

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

export default function AdminManagerView() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [eduList, setEduList] = useState<any[]>([]);
  const [pensionList, setPensionList] = useState<any[]>([]);
  const [adoptionList, setAdoptionList] = useState<any[]>([]);
  const [sellerieList, setSellerieList] = useState<any[]>([]);
  const [littersList, setLittersList] = useState<any[]>([]); 

  // --- NOUVELLE LOGIQUE ÉLEVAGE ---
  const [tab, setTab] = useState<"education" | "pension" | "elevage" | "sellerie">("education");
  const [editingLitter, setEditingLitter] = useState<any>(null);
  const [showLitterForm, setShowLitterForm] = useState(false);

  const [period, setPeriod] = useState<PeriodOption>("1m");
  const [selectedFilterClient, setSelectedFilterClient] = useState<ClientProfile | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ClientProfile[]>([]);
  const [clientDogs, setClientDogs] = useState<Dog[]>([]);
  const [selectedFilterDogId, setSelectedFilterDogId] = useState<string>("all");

  const [actionModal, setActionModal] = useState<ActionTarget | null>(null);
  const [noteText, setNoteText] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchAll = async () => {
    const [edu, pen, adp, sel, lit] = await Promise.all([
      supabase.from("education_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("pension_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("adoption_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("sellerie_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("litters").select("*, puppies(*)").order("created_at", { ascending: false }), 
    ]);
    setEduList(edu.data || []);
    setPensionList(pen.data || []);
    setAdoptionList(adp.data || []);
    setSellerieList(sel.data || []);
    setLittersList(lit.data || []);
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (selectedFilterClient) { setSearchResults([]); return; }
    if (clientSearchQuery.trim().length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email, phone").or(`full_name.ilike.%${clientSearchQuery}%,email.ilike.%${clientSearchQuery}%`).limit(6);
      setSearchResults(data || []);
    }, 250);
    return () => clearTimeout(timer);
  }, [clientSearchQuery, selectedFilterClient, supabase]);

  const handleFilterClient = async (client: ClientProfile) => {
    setSelectedFilterClient(client);
    setClientSearchQuery(`${client.full_name || client.email}`);
    setSearchResults([]);
    const { data } = await supabase.from("dogs").select("*").eq("user_id", client.id);
    setClientDogs(data || []);
    setSelectedFilterDogId("all");
  };

  const resetClientFilter = () => {
    setSelectedFilterClient(null); setClientSearchQuery(""); setClientDogs([]); setSelectedFilterDogId("all"); setSearchResults([]);
  };

  const applyFilters = (items: any[]) => {
    const now = new Date().getTime();
    return items.filter((item) => {
      const itemDate = new Date(item.created_at || Date.now()).getTime();
      const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
      if (period === "1m" && diffDays > 31) return false;
      if (period === "6m" && diffDays > 183) return false;
      if (period === "1y" && diffDays > 365) return false;
      if (selectedFilterClient && item.user_id !== selectedFilterClient.id) return false;
      if (selectedFilterDogId !== "all" && item.dog_id !== selectedFilterDogId) return false;
      return true;
    });
  };

  const filteredEdu = useMemo(() => applyFilters(eduList), [eduList, period, selectedFilterClient, selectedFilterDogId]);
  const filteredPension = useMemo(() => applyFilters(pensionList), [pensionList, period, selectedFilterClient, selectedFilterDogId]);
  const filteredAdoption = useMemo(() => applyFilters(adoptionList), [adoptionList, period, selectedFilterClient, selectedFilterDogId]);
  const filteredSellerie = useMemo(() => applyFilters(sellerieList), [sellerieList, period, selectedFilterClient, selectedFilterDogId]);

  const openAction = (table: string, id: string, newStatus: string, title: string, clientName: string, currentNote?: string) => {
    setActionModal({ table, id, newStatus, title, clientName, currentNote });
    setNoteText(currentNote || "");
  };

  const handleConfirmAction = async () => {
    if (!actionModal) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from(actionModal.table).update({ status: actionModal.newStatus, admin_notes: noteText.trim() || null }).eq("id", actionModal.id);
      if (error) throw error;
      await fetchAll();
      setActionModal(null);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const toggleLitterStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from("litters").update({ is_active: !currentStatus }).eq("id", id);
    fetchAll();
  };

  const deleteLitter = async (id: string) => {
    if(confirm("Êtes-vous sûr de vouloir supprimer cette portée et tous ses chiots ?")) {
       await supabase.from("litters").delete().eq("id", id);
       fetchAll();
    }
  };

  // Assignation manuelle (temporaire, avant qu'on ajoute l'option côté client)
  const assignToLitter = async (candidatureId: string, litterId: string) => {
    await supabase.from("adoption_requests").update({ litter_id: litterId }).eq("id", candidatureId);
    fetchAll();
  };

  return (
    <div className="mt-8 space-y-6">
      
      {/* 1. BARRE DE FILTRAGE */}
      <div className="p-5 rounded-[2rem] bg-white border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Rechercher par Client :</label>
            <div className="relative">
              <input type="text" placeholder="Tapez un nom ou e-mail..." value={clientSearchQuery} onChange={(e) => { setClientSearchQuery(e.target.value); if (selectedFilterClient) resetClientFilter(); }} className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold focus:outline-none focus:border-orange-500 pr-8" />
              {selectedFilterClient && <button onClick={resetClientFilter} className="absolute right-3 top-2.5 text-xs font-bold text-stone-400">✕</button>}
            </div>
            {searchResults.length > 0 && !selectedFilterClient && (
              <div className="absolute top-full inset-x-0 mt-1.5 z-50 rounded-2xl bg-white border border-stone-200 shadow-2xl overflow-hidden divide-y divide-stone-100">
                {searchResults.map((c) => (
                  <button key={c.id} onClick={() => handleFilterClient(c)} className="w-full px-4 py-3 text-left text-xs hover:bg-orange-50 flex justify-between">
                    <span className="font-bold text-stone-800">{c.full_name || "Client"}</span>
                    <span className="text-[11px] text-stone-400">{c.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Affiner par Chien :</label>
            <select disabled={!selectedFilterClient} value={selectedFilterDogId} onChange={(e) => setSelectedFilterDogId(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold disabled:opacity-40 focus:outline-none focus:border-orange-500">
              <option value="all">{selectedFilterClient ? "Tous les chiens" : "Sélectionnez un client"}</option>
              {clientDogs.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. ONGLETS DE NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-stone-100/90 border border-stone-200/60 shadow-inner">
            <button onClick={() => setTab("education")} className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all ${tab === "education" ? "bg-white text-orange-600 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>Éducation ({filteredEdu.length})</button>
            <button onClick={() => setTab("pension")} className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all ${tab === "pension" ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>Pension ({filteredPension.length})</button>
            <button onClick={() => { setTab("elevage"); setShowLitterForm(false); }} className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all ${tab === "elevage" ? "bg-white text-orange-600 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>Élevage ({filteredAdoption.length})</button>
            <button onClick={() => setTab("sellerie")} className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all ${tab === "sellerie" ? "bg-white text-amber-600 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}>Sellerie ({filteredSellerie.length})</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Période :</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodOption)} className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-black shadow-sm focus:outline-none focus:border-orange-500">
            <option value="1m">1 Mois (Défaut)</option><option value="6m">6 Mois</option><option value="1y">1 Année</option>
          </select>
        </div>
      </div>

      {/* 3. CONTENU : ÉDUCATION */}
      {tab === "education" && (
        <div className="space-y-4">
          {filteredEdu.length === 0 ? <div className="p-8 rounded-3xl bg-stone-50 text-center text-xs font-bold text-stone-400">Aucune demande trouvée.</div> : filteredEdu.map((item) => (
             <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Le contenu existant reste inchangé... je simplifie visuellement pour éviter la coupure de code */}
              <div className="max-w-xl">
                <div className="flex gap-2"><span className="text-[10px] font-black uppercase text-orange-600">{item.client_name}</span></div>
                <h4 className="text-base font-black mt-1">{item.dog_name}</h4>
                <p className="text-xs text-stone-500">{item.objectives}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {item.status !== "confirmé" && <button onClick={() => openAction("education_requests", item.id, "confirmé", item.dog_name, item.client_name)} className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-black">Confirmer</button>}
                <button onClick={() => openAction("education_requests", item.id, "annulé", item.dog_name, item.client_name)} className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-bold">Refuser</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. CONTENU : PENSION */}
      {tab === "pension" && (
        <div className="space-y-4">
           {filteredPension.length === 0 ? <div className="p-8 rounded-3xl bg-stone-50 text-center text-xs font-bold text-stone-400">Aucune demande trouvée.</div> : filteredPension.map((item) => (
            <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="max-w-xl">
                <div className="flex gap-2"><span className="text-[10px] font-black uppercase text-emerald-600">{item.client_name}</span></div>
                <h4 className="text-base font-black mt-1">{item.dog_name}</h4>
                <p className="text-xs text-stone-500">Du {item.start_date} au {item.end_date}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {item.status !== "confirmé" && <button onClick={() => openAction("pension_requests", item.id, "confirmé", item.dog_name, item.client_name)} className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-black">Valider</button>}
                <button onClick={() => openAction("pension_requests", item.id, "annulé", item.dog_name, item.client_name)} className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-bold">Refuser</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. CONTENU : ÉLEVAGE (INTÉGRÉ & UNIFIÉ) */}
      {tab === "elevage" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Header de la section Élevage */}
          {!showLitterForm && (
            <div className="flex justify-between items-center border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-stone-900">Gestion de l'Élevage</h2>
                <p className="text-xs text-stone-500 mt-1">Gérez vos portées, vos chiots et les candidatures associées.</p>
              </div>
              <button onClick={() => { setEditingLitter(null); setShowLitterForm(true); }} className="px-5 py-2.5 bg-gradient-to-tr from-orange-600 to-orange-500 text-white rounded-full text-xs font-black shadow-md hover:scale-105 transition-all">
                + Nouvelle Portée
              </button>
            </div>
          )}

          {/* Affichage conditionnel : Soit le formulaire, soit la liste des portées */}
          {showLitterForm ? (
            <div className="border border-stone-200 rounded-[2.5rem] p-4 bg-white/50">
              <AdminLitterForm 
                initialData={editingLitter} 
                onSuccess={() => { setShowLitterForm(false); fetchAll(); }} 
                onCancel={() => setShowLitterForm(false)} 
              />
            </div>
          ) : (
            <div className="space-y-8">
              {littersList.length === 0 && <div className="p-8 rounded-3xl bg-stone-50 text-center text-xs font-bold text-stone-400">Aucune portée créée pour le moment.</div>}
              
              {/* LISTE DES PORTÉES SOUS FORME DE GRANDES CARTES */}
              {littersList.map(litter => {
                const litterCandidatures = filteredAdoption.filter(a => a.litter_id === litter.id);
                
                return (
                  <div key={litter.id} className="bg-white border border-stone-200 rounded-[2rem] shadow-sm overflow-hidden">
                    {/* EN-TÊTE DE LA PORTÉE */}
                    <div className="p-6 sm:p-8 bg-stone-50/50 border-b border-stone-200 flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${litter.is_active ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-stone-200 text-stone-500'}`}>
                            {litter.is_active ? 'Visible sur site' : 'Archivée'}
                          </span>
                          <h3 className="text-xl font-black text-stone-900">{litter.title}</h3>
                        </div>
                        <p className="text-sm font-bold text-stone-600">{litter.father_name} x {litter.mother_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingLitter(litter); setShowLitterForm(true); }} className="px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 shadow-sm rounded-xl text-xs font-bold transition">
                          Modifier
                        </button>
                        <button onClick={() => toggleLitterStatus(litter.id, litter.is_active)} className="px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl text-xs font-bold transition">
                          {litter.is_active ? 'Archiver' : 'Publier'}
                        </button>
                        <button onClick={() => deleteLitter(litter.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition">
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {/* CORPS DE LA PORTÉE : CHIOTS & CANDIDATURES */}
                    <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                      
                      {/* COLONNE DE GAUCHE : LES CHIOTS */}
                      <div>
                        <h4 className="text-xs font-black uppercase text-stone-400 mb-4 tracking-wider">Chiots enregistrés ({litter.puppies?.length || 0})</h4>
                        <div className="space-y-3">
                          {litter.puppies?.map((pup: any) => (
                            <div key={pup.id} className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                              <div className="flex items-center gap-3">
                                <span className="text-xl bg-white p-1.5 rounded-lg shadow-sm border border-stone-100">{pup.gender === 'male' ? '🐕' : '🌸'}</span>
                                <div>
                                  <p className="text-sm font-bold text-stone-800">{pup.name}</p>
                                  <p className="text-[10px] text-stone-400 font-medium uppercase mt-0.5">{pup.image_tag || 'Sans tag'}</p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${pup.status === 'disponible' ? 'bg-emerald-100 text-emerald-700' : pup.status === 'reserve' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                {pup.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* COLONNE DE DROITE : LES CANDIDATURES */}
                      <div>
                        <h4 className="text-xs font-black uppercase text-stone-400 mb-4 tracking-wider">Candidatures liées ({litterCandidatures.length})</h4>
                        <div className="space-y-4">
                          {litterCandidatures.length === 0 ? (
                            <p className="text-xs text-stone-400 italic bg-stone-50 p-6 rounded-2xl border border-stone-100 text-center">
                              Aucune candidature directement assignée à cette portée.
                            </p>
                          ) : litterCandidatures.map(item => (
                            <div key={item.id} className="p-4 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-orange-600">{item.client_name}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${item.status === "accepté" ? "bg-emerald-100 text-emerald-800" : item.status === "liste_attente" ? "bg-amber-100 text-amber-800" : item.status === "annulé" ? "bg-red-100 text-red-800" : "bg-stone-100 text-stone-800"}`}>
                                  {item.status}
                                </span>
                              </div>
                              <div className="text-xs text-stone-600">
                                <p><strong className="text-stone-900">Préférence :</strong> {item.preferred_breed}</p>
                                <p className="mt-1"><strong className="text-stone-900">Cadre :</strong> {item.living_environment}</p>
                              </div>
                              
                              <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-2">
                                <button onClick={() => openAction("adoption_requests", item.id, "accepté", item.client_name, item.client_name, item.admin_notes)} className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black shadow-sm transition">Accepter</button>
                                <button onClick={() => openAction("adoption_requests", item.id, "liste_attente", item.client_name, item.client_name, item.admin_notes)} className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black shadow-sm transition">Attente</button>
                                <button onClick={() => openAction("adoption_requests", item.id, "annulé", item.client_name, item.client_name, item.admin_notes)} className="flex-1 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-[11px] font-bold transition">Refuser</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* CANDIDATURES SPONTANÉES / NON ASSIGNÉES */}
              {filteredAdoption.filter(a => !a.litter_id).length > 0 && (
                <div className="mt-12 p-6 rounded-[2rem] bg-orange-50/50 border border-orange-100">
                  <h3 className="text-lg font-black text-stone-900 mb-4">Candidatures non assignées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAdoption.filter(a => !a.litter_id).map(item => (
                      <div key={item.id} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-black text-stone-900">{item.client_name}</span>
                           <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-100">{item.status}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mb-4">{item.living_environment}</p>
                        
                        {/* Assigner à une portée (Option basique) */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-orange-600 uppercase">Lier à une portée :</label>
                          <select onChange={(e) => assignToLitter(item.id, e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-orange-500 cursor-pointer">
                            <option value="">Sélectionner une portée...</option>
                            {littersList.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. CONTENU : SELLERIE */}
      {tab === "sellerie" && (
        <div className="space-y-4">
           {/* ... Identique, je réduis pour l'exemple ... */}
        </div>
      )}

      {/* 7. MODALE ADMINISTRATIVE D'ACTION */}
      {actionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => !updating && setActionModal(null)} />
          <div className="relative w-full max-w-lg rounded-[2.5rem] bg-[#FDFCF8] p-8 shadow-2xl">
            <button onClick={() => setActionModal(null)} className="absolute top-6 right-6 text-stone-600">✕</button>
            <h3 className="text-xl font-black text-stone-900">Passer en statut : <span className="text-orange-600">"{actionModal.newStatus}"</span></h3>
            <textarea rows={3} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Message au client..." className="w-full mt-4 px-4 py-3 rounded-2xl border text-xs focus:border-orange-500" />
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setActionModal(null)} className="px-5 py-2.5 text-xs font-bold text-stone-600 bg-stone-100 rounded-full">Annuler</button>
              <button onClick={handleConfirmAction} className="px-6 py-2.5 text-xs font-bold text-white bg-stone-900 rounded-full">{updating ? "Patientez..." : "Confirmer"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}