"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import AdminLitterForm from "./AdminLitterForm";
import AdminReproducteurs from "./AdminReproducteurs"; // L'IMPORT EST ICI !

interface ActionTarget {
  table: string;
  id: string;
  newStatus: string;
  title: string;
  clientName: string;
  currentNote?: string;
}

type PeriodOption = "1m" | "6m" | "1y";

// Nouveau type pour les filtres de statut
type StatusGroup = "en_attente" | "valide" | "termine" | "annule" | "tous";

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

interface ServiceClosure {
  id: string;
  start: string;
  end: string;
  services: string[]; 
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

  const [tab, setTab] = useState<"education" | "pension" | "elevage" | "sellerie">("education");
  
  // --- État du filtre par statut (par défaut sur en_attente) ---
  const [statusFilter, setStatusFilter] = useState<StatusGroup>("en_attente");
  
  const [editingLitter, setEditingLitter] = useState<any>(null);
  const [showLitterForm, setShowLitterForm] = useState(false);

  const [collapsedSections, setCollapsedSections] = useState<{ [litterId: string]: { waitlist: boolean; refused: boolean } }>({});

  const [period, setPeriod] = useState<PeriodOption>("1m");
  const [selectedFilterClient, setSelectedFilterClient] = useState<ClientProfile | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ClientProfile[]>([]);
  const [clientDogs, setClientDogs] = useState<Dog[]>([]);
  const [selectedFilterDogId, setSelectedFilterDogId] = useState<string>("all");

  const [actionModal, setActionModal] = useState<ActionTarget | null>(null);
  const [noteText, setNoteText] = useState("");
  const [updating, setUpdating] = useState(false);

  const [isEmergencyStop, setIsEmergencyStop] = useState(false);
  const [togglingEmergency, setTogglingEmergency] = useState(false);
  
  const [showAdminCalendar, setShowAdminCalendar] = useState(false);
  const [adminCalDate, setAdminCalDate] = useState(new Date());
  
  const [closures, setClosures] = useState<ServiceClosure[]>([]);
  const [newClosureStart, setNewClosureStart] = useState("");
  const [newClosureEnd, setNewClosureEnd] = useState("");
  const [newClosureServices, setNewClosureServices] = useState<string[]>(["education", "pension", "elevage", "sellerie"]);
  const [savingClosure, setSavingClosure] = useState(false);
  
  const [closureViewMode, setClosureViewMode] = useState<"calendar" | "list">("calendar");

  const availableServices = [
    { id: "education", label: "Éducation" },
    { id: "pension", label: "Pension" },
    { id: "elevage", label: "Élevage" },
    { id: "sellerie", label: "Sellerie" }
  ];

  const fetchAll = async () => {
    try {
      const { data: settings } = await supabase.from("site_settings").select("key, value");
      if (settings) {
        const emergency = settings.find(s => s.key === "emergency_stop");
        if (emergency && emergency.value === "true") setIsEmergencyStop(true);
        else setIsEmergencyStop(false);

        const closuresData = settings.find(s => s.key === "service_closures");
        if (closuresData && closuresData.value) {
          try {
            setClosures(JSON.parse(closuresData.value));
          } catch (e) {
            console.error("Erreur de parsing des blocages");
          }
        }
      }
    } catch (e) {}

    const [edu, pen, adp, sel, lit] = await Promise.all([
      supabase.from("education_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("pension_bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("adoption_requests").select("*, puppies(name)").order("created_at", { ascending: false }),
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

      if (statusFilter !== "tous") {
        if (statusFilter === "en_attente" && !['en_attente', 'liste_attente'].includes(item.status)) return false;
        if (statusFilter === "valide" && !['confirmé', 'accepté', 'en_atelier'].includes(item.status)) return false;
        if (statusFilter === "termine" && !['terminé', 'expédié'].includes(item.status)) return false;
        if (statusFilter === "annule" && !['annulé', 'refusé'].includes(item.status)) return false;
      }

      return true;
    });
  };

  const filteredEdu = useMemo(() => applyFilters(eduList), [eduList, period, selectedFilterClient, selectedFilterDogId, statusFilter]);
  const filteredPension = useMemo(() => applyFilters(pensionList), [pensionList, period, selectedFilterClient, selectedFilterDogId, statusFilter]);
  const filteredAdoption = useMemo(() => applyFilters(adoptionList), [adoptionList, period, selectedFilterClient, selectedFilterDogId, statusFilter]);
  const filteredSellerie = useMemo(() => applyFilters(sellerieList), [sellerieList, period, selectedFilterClient, selectedFilterDogId, statusFilter]);

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

      if (actionModal.table === "adoption_requests") {
        const { data: request } = await supabase.from("adoption_requests").select("puppy_id").eq("id", actionModal.id).single();
        if (request && request.puppy_id) {
          if (actionModal.newStatus === "accepté") {
            await supabase.from("puppies").update({ status: "reserve" }).eq("id", request.puppy_id);
          } else if (actionModal.newStatus === "annulé" || actionModal.newStatus === "refusé") {
            await supabase.from("puppies").update({ status: "disponible" }).eq("id", request.puppy_id);
          }
        }
      }
      await fetchAll();
      setActionModal(null);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const toggleEmergencyStop = async () => {
    if (confirm(isEmergencyStop ? "Réactiver toutes les réservations sur le site ?" : "ATTENTION : Suspendre immédiatement TOUTES les nouvelles réservations sur le site ?")) {
      setTogglingEmergency(true);
      try {
        const newValue = isEmergencyStop ? "false" : "true";
        const { error } = await supabase.from("site_settings").upsert({ key: "emergency_stop", value: newValue }, { onConflict: "key" });
        if (error) throw error;
        setIsEmergencyStop(!isEmergencyStop);
      } catch (err: any) {
        alert(`Erreur lors de la modification de l'état : ${err.message}`);
      } finally {
        setTogglingEmergency(false);
      }
    }
  };

  const checkOverlapWithReservations = (startStr: string, endStr: string) => {
    let curr = new Date(startStr);
    let end = new Date(endStr);
    let hasOverlap = false;

    while (curr <= end) {
      let checkStr = curr.toISOString().split("T")[0];
      const eduC = eduList.filter(r => r.scheduled_date === checkStr && r.status !== 'annulé').length;
      const penC = pensionList.filter(r => checkStr >= r.start_date && checkStr <= r.end_date && r.status !== 'annulé').length;
      if (eduC > 0 || penC > 0) {
        hasOverlap = true;
        break;
      }
      curr.setDate(curr.getDate() + 1);
    }
    return hasOverlap;
  };

  const handleCalClick = (dateStr: string, closureId?: string, hasReservations?: boolean) => {
    if (closureId) {
      removeClosure(closureId);
      return;
    }

    if (hasReservations) {
      alert("Impossible de bloquer cette date : vous avez déjà des réservations confirmées ou en attente à ce moment-là.");
      return;
    }

    if (closureViewMode !== "calendar") setClosureViewMode("calendar");

    if (!newClosureStart || (newClosureStart && newClosureEnd)) {
      setNewClosureStart(dateStr);
      setNewClosureEnd("");
    } else {
      if (dateStr >= newClosureStart) {
        if (checkOverlapWithReservations(newClosureStart, dateStr)) {
          alert("La période sélectionnée englobe des jours avec des réservations. La sélection a été réinitialisée.");
          setNewClosureStart(dateStr);
          setNewClosureEnd("");
        } else {
          setNewClosureEnd(dateStr);
        }
      } else {
        setNewClosureStart(dateStr);
        setNewClosureEnd("");
      }
    }
  };

  const handleToggleService = (serviceId: string) => {
    setNewClosureServices(prev => 
      prev.includes(serviceId) ? prev.filter(s => s !== serviceId) : [...prev, serviceId]
    );
  };

  const saveClosureDates = async () => {
    if (!newClosureStart || (!newClosureEnd && newClosureStart)) setNewClosureEnd(newClosureStart);
    if (newClosureServices.length === 0) {
      alert("Veuillez sélectionner au moins un service à bloquer.");
      return;
    }
    setSavingClosure(true);
    try {
      const newClosure: ServiceClosure = {
        id: Date.now().toString(),
        start: newClosureStart,
        end: newClosureEnd || newClosureStart,
        services: newClosureServices
      };
      const updatedClosures = [...closures, newClosure];
      await supabase.from("site_settings").upsert([{ key: "service_closures", value: JSON.stringify(updatedClosures) }], { onConflict: "key" });
      setClosures(updatedClosures);
      setNewClosureStart("");
      setNewClosureEnd("");
      setClosureViewMode("list");
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setSavingClosure(false);
    }
  };

  const removeClosure = async (idToRemove: string) => {
    if(!confirm("Voulez-vous réouvrir cette période à la réservation ?")) return;
    setSavingClosure(true);
    try {
      const updatedClosures = closures.filter(c => c.id !== idToRemove);
      await supabase.from("site_settings").upsert([{ key: "service_closures", value: JSON.stringify(updatedClosures) }], { onConflict: "key" });
      setClosures(updatedClosures);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSavingClosure(false);
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

  const assignToLitter = async (candidatureId: string, litterId: string) => {
    await supabase.from("adoption_requests").update({ litter_id: litterId }).eq("id", candidatureId);
    fetchAll();
  };

  const assignToPuppy = async (candidatureId: string, puppyId: string) => {
    await supabase.from("adoption_requests").update({ puppy_id: puppyId || null }).eq("id", candidatureId); 
    fetchAll();
  };

  const renderPreferenceText = (item: any) => {
    if (item.puppy_preference === 'specific' && item.puppies?.name) return `Ce chiot : ${item.puppies.name}`;
    if (item.puppy_preference === 'male') return "Un mâle";
    if (item.puppy_preference === 'female') return "Une femelle";
    return "Indifférent";
  };

  const toggleSectionCollapse = (litterId: string, section: 'waitlist' | 'refused') => {
    setCollapsedSections(prev => ({
      ...prev,
      [litterId]: {
        waitlist: section === 'waitlist' ? !(prev[litterId]?.waitlist ?? true) : (prev[litterId]?.waitlist ?? true),
        refused: section === 'refused' ? !(prev[litterId]?.refused ?? true) : (prev[litterId]?.refused ?? true),
      }
    }));
  };

  const renderAppCard = (item: any, litter: any = null) => {
    const isRefused = ['annulé', 'refusé'].includes(item.status);
    const hasPuppySelected = Boolean(item.puppy_id);

    return (
      <div key={item.id} className={`p-4 rounded-2xl border ${isRefused ? 'border-stone-100 bg-stone-50 opacity-80' : 'border-stone-200 bg-white shadow-sm'} space-y-3`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">{item.client_name}</span>
          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${item.status === "accepté" ? "bg-emerald-100 text-emerald-800" : item.status === "liste_attente" ? "bg-amber-100 text-amber-800" : isRefused ? "bg-red-100 text-red-800" : "bg-stone-100 text-stone-800"}`}>
            {item.status}
          </span>
        </div>

        <div className="text-xs text-stone-600 space-y-1">
          <p><strong className="text-stone-900">Tél :</strong> {item.client_phone}</p>
          <p><strong className="text-stone-900">Préférence :</strong> {renderPreferenceText(item)}</p>
          <p><strong className="text-stone-900">Cadre :</strong> {item.living_environment}</p>
          {item.admin_notes && <div className="mt-2 p-2 rounded-xl bg-orange-50/70 border border-orange-100 text-[10px] text-stone-700"><strong>Message :</strong> {item.admin_notes}</div>}
        </div>

        {litter && !isRefused && (
          <div className="pt-2 border-t border-stone-100">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">Rattacher à un chiot * :</label>
            <select value={item.puppy_id || ""} onChange={(e) => assignToPuppy(item.id, e.target.value)} className="w-full px-2 py-1.5 text-xs font-bold rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-orange-500 cursor-pointer">
              <option value="">Sélectionner un chiot (obligatoire)...</option>
              {litter.puppies?.filter((pup: any) => pup.status === 'disponible' || pup.id === item.puppy_id).map((pup: any) => (
                <option key={pup.id} value={pup.id}>{pup.name} ({pup.status})</option>
              ))}
            </select>
          </div>
        )}

        {!litter && !isRefused && (
          <div className="pt-2 border-t border-stone-100 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Lier à une portée :</label>
            <select onChange={(e) => assignToLitter(item.id, e.target.value)} className="w-full px-2 py-1.5 text-xs font-bold rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-orange-500 cursor-pointer">
              <option value="">Sélectionner une portée...</option>
              {littersList.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
        )}

        {!isRefused ? (
          <div className="pt-2 flex flex-wrap gap-2 items-center">
            <button 
              onClick={() => {
                if (!hasPuppySelected) { alert("Veuillez impérativement assigner un chiot avant d'accepter."); return; }
                openAction("adoption_requests", item.id, "accepté", item.client_name, item.client_name, item.admin_notes);
              }} 
              title={!hasPuppySelected ? "Sélectionnez un chiot ci-dessus pour activer" : ""}
              className={`flex-1 py-1.5 rounded-lg text-white text-[11px] font-black shadow-sm transition cursor-pointer ${
                !hasPuppySelected ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              Accepter
            </button>
            {item.status !== "liste_attente" && (
              <button onClick={() => openAction("adoption_requests", item.id, "liste_attente", item.client_name, item.client_name, item.admin_notes)} className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black shadow-sm transition cursor-pointer">
                Attente
              </button>
            )}
            <button onClick={() => openAction("adoption_requests", item.id, "annulé", item.client_name, item.client_name, item.admin_notes)} className="flex-1 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-[11px] font-bold transition cursor-pointer">
              Refuser
            </button>
          </div>
        ) : (
          <div className="pt-2 flex flex-wrap gap-2">
             <button onClick={() => openAction("adoption_requests", item.id, "en_attente", item.client_name, item.client_name, item.admin_notes)} className="w-full py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold transition cursor-pointer">Remettre en attente</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8 space-y-6">

      {/* 0. NOUVEAU CONTRÔLE GLOBAL (Boutons d'accès rapide) */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-5 rounded-[2.5rem] border border-stone-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-stone-900">Vue d'ensemble</h2>
          <p className="text-xs text-stone-500 mt-0.5">Gérez les demandes, les plannings et l'état du site.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowAdminCalendar(true)} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-stone-200 shadow-sm rounded-full text-xs font-bold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
          >
            📅 Calendrier & Fermetures
          </button>
          <button 
            onClick={toggleEmergencyStop}
            disabled={togglingEmergency}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${isEmergencyStop ? 'bg-stone-800 text-white hover:bg-stone-900 cursor-pointer' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer'}`}
          >
            {isEmergencyStop ? "🟢 Rétablir les accès" : "🚨 Arrêt d'Urgence"}
          </button>
        </div>
      </div>

      {/* 1. BARRE DE FILTRAGE PAR CLIENT/CHIEN */}
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

      {/* 2. ONGLETS DE SERVICES ET SOUS-FILTRES DE STATUT */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-auto">
            <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-1.5 p-1.5 rounded-[1.5rem] md:rounded-full bg-stone-100/90 border border-stone-200/60 shadow-inner w-full md:w-auto">
              <button onClick={() => setTab("education")} className={`px-2 py-2.5 md:px-4 md:py-2 rounded-xl md:rounded-full text-[10px] sm:text-xs font-black uppercase text-center transition-all ${tab === "education" ? "bg-white text-orange-600 shadow-sm" : "text-stone-500 hover:text-stone-900 cursor-pointer"}`}>
                Éducation <span className="opacity-60 font-bold ml-1">({filteredEdu.length})</span>
              </button>
              <button onClick={() => setTab("pension")} className={`px-2 py-2.5 md:px-4 md:py-2 rounded-xl md:rounded-full text-[10px] sm:text-xs font-black uppercase text-center transition-all ${tab === "pension" ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-900 cursor-pointer"}`}>
                Pension <span className="opacity-60 font-bold ml-1">({filteredPension.length})</span>
              </button>
              <button onClick={() => { setTab("elevage"); setShowLitterForm(false); }} className={`px-2 py-2.5 md:px-4 md:py-2 rounded-xl md:rounded-full text-[10px] sm:text-xs font-black uppercase text-center transition-all ${tab === "elevage" ? "bg-white text-orange-600 shadow-sm" : "text-stone-500 hover:text-stone-900 cursor-pointer"}`}>
                Élevage <span className="opacity-60 font-bold ml-1">({filteredAdoption.length})</span>
              </button>
              <button onClick={() => setTab("sellerie")} className={`px-2 py-2.5 md:px-4 md:py-2 rounded-xl md:rounded-full text-[10px] sm:text-xs font-black uppercase text-center transition-all ${tab === "sellerie" ? "bg-white text-amber-600 shadow-sm" : "text-stone-500 hover:text-stone-900 cursor-pointer"}`}>
                Sellerie <span className="opacity-60 font-bold ml-1">({filteredSellerie.length})</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider hidden sm:block">Période :</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodOption)} className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-black shadow-sm focus:outline-none focus:border-orange-500 cursor-pointer">
              <option value="1m">1 Mois (Défaut)</option><option value="6m">6 Mois</option><option value="1y">1 Année</option>
            </select>
          </div>
        </div>

        {/* NOUVEAU : Boutons de filtre par STATUT */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button 
            onClick={() => setStatusFilter("en_attente")} 
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${statusFilter === "en_attente" ? "bg-orange-500 text-white shadow-md" : "bg-white border border-stone-200 text-stone-500 hover:bg-stone-50"}`}
          >
            Nouvelles / Attente
          </button>
          <button 
            onClick={() => setStatusFilter("valide")} 
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${statusFilter === "valide" ? "bg-emerald-500 text-white shadow-md" : "bg-white border border-stone-200 text-stone-500 hover:bg-stone-50"}`}
          >
            Validées / En cours
          </button>
          <button 
            onClick={() => setStatusFilter("termine")} 
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${statusFilter === "termine" ? "bg-stone-800 text-white shadow-md" : "bg-white border border-stone-200 text-stone-500 hover:bg-stone-50"}`}
          >
            Terminées / Expédiées
          </button>
          <button 
            onClick={() => setStatusFilter("annule")} 
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${statusFilter === "annule" ? "bg-red-500 text-white shadow-md" : "bg-white border border-stone-200 text-stone-500 hover:bg-stone-50"}`}
          >
            Refusées / Annulées
          </button>
          <button 
            onClick={() => setStatusFilter("tous")} 
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${statusFilter === "tous" ? "bg-stone-200 text-stone-800 shadow-md" : "bg-white border border-stone-200 text-stone-500 hover:bg-stone-50"}`}
          >
            Tout voir
          </button>
        </div>
      </div>

      {/* 3. CONTENU : ÉDUCATION */}
      {tab === "education" && (
        <div className="space-y-4">
          {filteredEdu.length === 0 ? (
            <div className="p-8 rounded-3xl bg-stone-50 text-center text-xs font-bold text-stone-400 border border-stone-100">Aucune demande trouvée avec ces filtres.</div>
          ) : (
            filteredEdu.map((item) => {
              const isTerminated = item.status === "terminé" || item.status === "annulé";
              return (
                <div key={item.id} className={`p-6 rounded-[2rem] border transition-all flex flex-col lg:flex-row justify-between items-start lg:items-stretch gap-6 ${isTerminated ? 'border-stone-100 bg-stone-50/50 opacity-80' : 'border-stone-200 bg-white shadow-sm'}`}>
                  <div className="flex-1 w-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider bg-orange-50 px-2 py-0.5 rounded-md">
                          {item.client_name} • {item.client_phone}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${item.status === 'confirmé' ? 'bg-emerald-100 text-emerald-800' : item.status === 'annulé' ? 'bg-red-100 text-red-800' : item.status === 'terminé' ? 'bg-stone-200 text-stone-600' : 'bg-amber-100 text-amber-800'}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-stone-900 mt-1">
                        {item.dog_name} <span className="text-xs text-stone-500 font-medium">({item.dog_breed}{item.dog_age ? `, ${item.dog_age}` : ''})</span>
                      </h4>
                      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-600 font-medium">
                        <p className="flex items-center gap-1.5">
                          <span className="text-stone-400">🏷️</span> 
                          <strong className="text-stone-900 capitalize">{item.session_type === 'bilan' ? 'Bilan Initial' : 'Suivi / Séance'}</strong>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="text-stone-400">📅</span> 
                          <span className={item.scheduled_date ? "text-stone-900 font-bold" : "text-stone-400 italic"}>
                            {item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString('fr-FR') : 'Non définie'} à {item.preferred_slot || '--:--'}
                          </span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="text-stone-400">📍</span> 
                          {item.location_preference === 'domicile' ? 'À Domicile' : 'Sur Terrain'}
                          {item.price_estimate && <span className="ml-1 px-1.5 bg-stone-100 rounded text-[10px] text-stone-500">{item.price_estimate}€</span>}
                        </p>
                      </div>
                    </div>
                    {item.admin_notes && (
                      <div className="mt-4 p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 text-[11px] text-stone-700">
                        <strong className="uppercase text-[9px] text-orange-800 tracking-wider block mb-0.5">Votre message :</strong> 
                        {item.admin_notes}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full bg-stone-50 p-4 rounded-2xl border border-stone-100/80 flex flex-col">
                    <strong className="text-stone-400 uppercase text-[9px] font-black tracking-wider block mb-1.5">Objectifs de la séance :</strong>
                    <p className="text-xs text-stone-800 leading-relaxed flex-1">{item.objectives}</p>
                    {item.issues && Array.isArray(item.issues) && item.issues.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-stone-200/60">
                        <strong className="text-stone-400 uppercase text-[9px] font-black tracking-wider block mb-2">Comportements signalés :</strong>
                        <div className="flex flex-wrap gap-1.5">
                          {item.issues.map((issue: string) => (
                            <span key={issue} className="bg-white border border-stone-200 text-stone-600 text-[9px] font-bold px-2 py-1 rounded-md shadow-sm">
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-32 justify-end lg:justify-start">
                    {item.status === "en_attente" && (
                      <>
                        <button onClick={() => openAction("education_requests", item.id, "confirmé", item.dog_name, item.client_name, item.admin_notes)} className="flex-1 lg:flex-none py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-sm transition cursor-pointer">Valider</button>
                        <button onClick={() => openAction("education_requests", item.id, "annulé", item.dog_name, item.client_name, item.admin_notes)} className="flex-1 lg:flex-none py-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-bold transition cursor-pointer">Refuser</button>
                      </>
                    )}
                    {item.status === "confirmé" && (
                      <>
                        <button onClick={() => openAction("education_requests", item.id, "terminé", item.dog_name, item.client_name, item.admin_notes)} className="flex-1 lg:flex-none py-2 rounded-xl bg-stone-800 hover:bg-black text-white text-xs font-black shadow-sm transition cursor-pointer">Terminer</button>
                        <button onClick={() => openAction("education_requests", item.id, "annulé", item.dog_name, item.client_name, item.admin_notes)} className="flex-1 lg:flex-none py-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-bold transition cursor-pointer">Annuler</button>
                      </>
                    )}
                    {isTerminated && (
                      <button onClick={() => openAction("education_requests", item.id, "en_attente", item.dog_name, item.client_name, item.admin_notes)} className="w-full py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-500 hover:text-stone-900 text-xs font-bold transition cursor-pointer">
                        Restaurer
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. CONTENU : PENSION */}
      {tab === "pension" && (
        <div className="space-y-4">
           {filteredPension.length === 0 ? <div className="p-8 rounded-3xl bg-stone-50 text-center text-xs font-bold text-stone-400 border border-stone-100">Aucune demande trouvée avec ces filtres.</div> : filteredPension.map((item) => (
            <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="max-w-xl">
                <div className="flex gap-2"><span className="text-[10px] font-black uppercase text-emerald-600">{item.client_name} • {item.client_phone}</span></div>
                <h4 className="text-base font-black mt-1">{item.dog_name}</h4>
                <p className="text-xs text-stone-500">Du {item.start_date} au {item.end_date}</p>
                {item.admin_notes && <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-stone-700"><strong>Votre message :</strong> {item.admin_notes}</div>}
              </div>
              <div className="flex gap-2 shrink-0">
                {item.status !== "confirmé" && <button onClick={() => openAction("pension_bookings", item.id, "confirmé", item.dog_name, item.client_name, item.admin_notes)} className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-black cursor-pointer hover:bg-emerald-600">Valider</button>}
                <button onClick={() => openAction("pension_bookings", item.id, "annulé", item.dog_name, item.client_name, item.admin_notes)} className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-bold cursor-pointer hover:bg-stone-200">Refuser</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. CONTENU : ÉLEVAGE (AVEC NOUVEAU COMPOSANT REPRODUCTEURS) */}
      {tab === "elevage" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* NOUVEAU COMPOSANT ICI */}
          <AdminReproducteurs supabase={supabase} />

          {!showLitterForm && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-stone-900">Gestion des Portées</h2>
                <p className="text-xs text-stone-500 mt-1">Gérez vos portées, vos chiots et les candidatures associées.</p>
              </div>
              <button onClick={() => { setEditingLitter(null); setShowLitterForm(true); }} className="px-5 py-2.5 bg-gradient-to-tr from-orange-600 to-orange-500 text-white rounded-full text-xs font-black shadow-md hover:scale-105 transition-all cursor-pointer">
                + Nouvelle Portée
              </button>
            </div>
          )}

          {showLitterForm ? (
            <div className="border border-stone-200 rounded-[2.5rem] p-4 bg-white/50">
              <AdminLitterForm initialData={editingLitter} onSuccess={() => { setShowLitterForm(false); fetchAll(); }} onCancel={() => setShowLitterForm(false)} />
            </div>
          ) : (
            <div className="space-y-8">
              {littersList.length === 0 && <div className="p-8 rounded-3xl bg-stone-50 text-center text-xs font-bold text-stone-400 border border-stone-100">Aucune portée créée pour le moment.</div>}

              {littersList.map(litter => {
                const activeLitterApps = adoptionList.filter(a => a.litter_id === litter.id && !(a.status === 'accepté' && a.puppy_id));
                const newApps = activeLitterApps.filter(a => a.status === 'en_attente' || (a.status === 'accepté' && !a.puppy_id));
                const waitlistApps = activeLitterApps.filter(a => a.status === 'liste_attente');
                const refusedApps = activeLitterApps.filter(a => ['annulé', 'refusé'].includes(a.status));

                const isWaitlistCollapsed = collapsedSections[litter.id]?.waitlist ?? true;
                const isRefusedCollapsed = collapsedSections[litter.id]?.refused ?? true;

                const shouldShowNew = statusFilter === "tous" || statusFilter === "en_attente" || statusFilter === "valide";
                const shouldShowWait = statusFilter === "tous" || statusFilter === "en_attente";
                const shouldShowRefused = statusFilter === "tous" || statusFilter === "annule";

                return (
                  <div key={litter.id} className="bg-white border border-stone-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8 bg-stone-50/50 border-b border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${litter.is_active ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-stone-200 text-stone-500'}`}>
                            {litter.is_active ? 'Visible sur site' : 'Archivée'}
                          </span>
                          <h3 className="text-xl font-black text-stone-900">{litter.title}</h3>
                        </div>
                        <p className="text-sm font-bold text-stone-600">{litter.father_name} x {litter.mother_name}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => { setEditingLitter(litter); setShowLitterForm(true); }} className="px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 shadow-sm rounded-xl text-xs font-bold transition cursor-pointer">Modifier</button>
                        <button onClick={() => toggleLitterStatus(litter.id, litter.is_active)} className="px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl text-xs font-bold transition cursor-pointer">{litter.is_active ? 'Archiver' : 'Publier'}</button>
                        <button onClick={() => deleteLitter(litter.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition cursor-pointer">Supprimer</button>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-stone-400 mb-4 tracking-wider">Chiots enregistrés ({litter.puppies?.length || 0})</h4>
                        <div className="space-y-3">
                          {litter.puppies?.map((pup: any) => {
                            const acceptedApp = adoptionList.find(a => a.puppy_id === pup.id && a.status === 'accepté');
                            return (
                              <div key={pup.id} className="flex flex-col p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-stone-200 shadow-sm flex items-center justify-center text-xl shrink-0">
                                      {pup.image_url ? <img src={pup.image_url} alt={pup.name} className="w-full h-full object-cover" /> : (pup.gender === 'male' ? '🐕' : '🌸')}
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-stone-900">{pup.name}</p>
                                      <p className="text-[10px] text-stone-400 font-black uppercase mt-0.5">{pup.image_tag || 'NOUVEAU-NÉ'}</p>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-wider ${pup.status === 'disponible' ? 'bg-emerald-100 text-emerald-800' : pup.status === 'reserve' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                                    {pup.status === 'reserve' ? 'RÉSERVÉ' : pup.status === 'adopte' ? 'ADOPTÉ' : 'DISPONIBLE'}
                                  </span>
                                </div>
                                {acceptedApp ? (
                                  <div className="mt-3 pt-3 border-t border-stone-200 flex flex-col gap-2">
                                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">👤 Réservé par {acceptedApp.client_name}</p>
                                    <div className="flex items-center justify-between">
                                      <a href={`tel:${acceptedApp.client_phone}`} className="text-[11px] font-bold text-stone-500 hover:text-stone-900">📞 {acceptedApp.client_phone}</a>
                                      <button onClick={() => openAction("adoption_requests", acceptedApp.id, "annulé", acceptedApp.client_name, acceptedApp.client_name, acceptedApp.admin_notes)} className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer">Annuler la résa.</button>
                                    </div>
                                  </div>
                                ) : (pup.status === 'reserve' || pup.status === 'adopte') ? (
                                  <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-1.5">
                                    <p className="text-[10px] font-black text-stone-500 uppercase tracking-wider">📝 Réservation hors plateforme</p>
                                    <p className="text-[9px] font-bold text-stone-400 leading-tight">Ce chiot a été réservé manuellement. Modifiez la portée pour changer son statut.</p>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-stone-400 mb-4 tracking-wider">Candidatures en cours ({activeLitterApps.length})</h4>
                        {activeLitterApps.length === 0 ? (
                          <p className="text-xs text-stone-400 italic bg-stone-50 p-6 rounded-2xl border border-stone-100 text-center">Aucune candidature en attente pour cette portée.</p>
                        ) : (
                          <div className="space-y-6">
                            {shouldShowNew && newApps.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-bold uppercase text-orange-600 mb-3 border-b border-orange-100 pb-1.5 flex items-center justify-between">
                                  <span>Nouvelles / Validées ({newApps.length})</span>
                                </h5>
                                <div className="space-y-3">{newApps.map(item => renderAppCard(item, litter))}</div>
                              </div>
                            )}
                            {shouldShowWait && waitlistApps.length > 0 && (
                              <div>
                                <button onClick={() => toggleSectionCollapse(litter.id, 'waitlist')} className="w-full text-[10px] font-bold uppercase text-amber-600 mb-3 border-b border-amber-100 pb-1.5 flex items-center justify-between hover:bg-amber-50/50 transition cursor-pointer">
                                  <span>Liste d'attente ({waitlistApps.length})</span>
                                  <span className="text-stone-400 font-bold">{isWaitlistCollapsed ? "▼ Déplier" : "▲ Replier"}</span>
                                </button>
                                {!isWaitlistCollapsed && <div className="space-y-3 animate-in fade-in duration-200">{waitlistApps.map(item => renderAppCard(item, litter))}</div>}
                              </div>
                            )}
                            {shouldShowRefused && refusedApps.length > 0 && (
                              <div>
                                <button onClick={() => toggleSectionCollapse(litter.id, 'refused')} className="w-full text-[10px] font-bold uppercase text-stone-400 mb-3 border-b border-stone-100 pb-1.5 flex items-center justify-between hover:bg-stone-50 transition cursor-pointer">
                                  <span>Archivées / Refusées ({refusedApps.length})</span>
                                  <span className="text-stone-400 font-bold">{isRefusedCollapsed ? "▼ Déplier" : "▲ Replier"}</span>
                                </button>
                                {!isRefusedCollapsed && <div className="space-y-3 animate-in fade-in duration-200">{refusedApps.map(item => renderAppCard(item, litter))}</div>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredAdoption.filter(a => !a.litter_id).length > 0 && (
                <div className="mt-12 p-8 rounded-[2.5rem] bg-orange-50/50 border border-orange-100">
                  <h3 className="text-lg font-black text-stone-900 mb-6">Candidatures spontanées (Non assignées)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAdoption.filter(a => !a.litter_id).map(item => renderAppCard(item, null))}
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
          {filteredSellerie.length === 0 ? <div className="p-8 rounded-3xl bg-stone-50 text-center text-xs font-bold text-stone-400 border border-stone-100">Aucune commande trouvée avec ces filtres.</div> : filteredSellerie.map((item) => (
             <div key={item.id} className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="max-w-xl">
                <div className="flex gap-2"><span className="text-[10px] font-black uppercase text-amber-600">{item.client_name} • {item.client_phone}</span></div>
                <h4 className="text-base font-black mt-1">{item.item_type}</h4>
                <p className="text-xs text-stone-500">{item.color_finish} • {item.dog_size}</p>
                {item.admin_notes && <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-[11px] text-stone-700"><strong>Votre message :</strong> {item.admin_notes}</div>}
              </div>
              <div className="flex gap-2 shrink-0">
                {item.status !== "expédié" && <button onClick={() => openAction("sellerie_orders", item.id, "expédié", item.item_type, item.client_name, item.admin_notes)} className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-black cursor-pointer hover:bg-emerald-600">Expédier</button>}
                {item.status !== "en_atelier" && <button onClick={() => openAction("sellerie_orders", item.id, "en_atelier", item.item_type, item.client_name, item.admin_notes)} className="px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-black cursor-pointer hover:bg-amber-600">En atelier</button>}
                <button onClick={() => openAction("sellerie_orders", item.id, "annulé", item.item_type, item.client_name, item.admin_notes)} className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-bold cursor-pointer hover:bg-stone-200">Annuler</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. MODALE ADMINISTRATIVE D'ACTION */}
      {actionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => !updating && setActionModal(null)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-8 shadow-2xl backdrop-blur-2xl">
            <button onClick={() => setActionModal(null)} className="absolute top-6 right-6 text-stone-600 hover:text-stone-900 cursor-pointer">✕</button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">Action administrative</span>
              <h3 className="text-xl font-black text-stone-900 mt-1">Passer en statut : <span className="capitalize text-orange-600">"{actionModal.newStatus}"</span></h3>
              <p className="text-xs text-stone-500 mt-1">Pour {actionModal.title} ({actionModal.clientName})</p>
            </div>
            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Message explicatif pour le client (affiché sur son espace)</label>
              <textarea rows={3} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Ex: Rendez-vous validé..." className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setActionModal(null)} disabled={updating} className="px-5 py-2.5 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-all cursor-pointer">Annuler</button>
              <button onClick={handleConfirmAction} disabled={updating} className="px-6 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50">{updating ? "Mise à jour..." : "Confirmer et enregistrer"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODALE DU CALENDRIER GLOBAL */}
      {showAdminCalendar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAdminCalendar(false)} />
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-[#FDFCF8] p-4 pt-14 sm:p-8 sm:pt-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-4 sm:gap-8 overflow-y-auto">
            <button onClick={() => setShowAdminCalendar(false)} className="absolute top-3 right-3 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full cursor-pointer z-50 transition">✕</button>

            {/* PARTIE GAUCHE : LE CALENDRIER */}
            <div className="w-full md:w-[65%] bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-stone-200 shadow-sm flex-shrink-0">
              <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-stone-100 pb-3 sm:pb-4">
                <button onClick={() => setAdminCalDate(new Date(adminCalDate.getFullYear(), adminCalDate.getMonth() - 1, 1))} className="px-2 sm:px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg sm:rounded-xl font-black text-stone-600 cursor-pointer">←</button>
                <h3 className="text-sm sm:text-lg font-black uppercase tracking-wider text-stone-900">
                  {["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"][adminCalDate.getMonth()]} {adminCalDate.getFullYear()}
                </h3>
                <button onClick={() => setAdminCalDate(new Date(adminCalDate.getFullYear(), adminCalDate.getMonth() + 1, 1))} className="px-2 sm:px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg sm:rounded-xl font-black text-stone-600 cursor-pointer">→</button>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[8px] sm:text-[10px] font-black uppercase text-stone-400">
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* VIDES */}
                {Array.from({ length: new Date(adminCalDate.getFullYear(), adminCalDate.getMonth(), 1).getDay() === 0 ? 6 : new Date(adminCalDate.getFullYear(), adminCalDate.getMonth(), 1).getDay() - 1 }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-12 rounded-xl bg-transparent" />
                ))}
                
                {/* JOURS */}
                {Array.from({ length: new Date(adminCalDate.getFullYear(), adminCalDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = new Date(Date.UTC(adminCalDate.getFullYear(), adminCalDate.getMonth(), day)).toISOString().split("T")[0];
                  
                  // Décompte pour les pastilles
                  const eduCount = eduList.filter(r => r.scheduled_date === dateStr && r.status !== 'annulé').length;
                  const penCount = pensionList.filter(r => dateStr >= r.start_date && dateStr <= r.end_date && r.status !== 'annulé').length;
                  const hasReservations = eduCount > 0 || penCount > 0;

                  const closure = closures.find(c => dateStr >= c.start && dateStr <= c.end);
                  const isClosed = !!closure;

                  // Gestion de la sélection (pour ajouter un blocage)
                  const isSelectedStart = newClosureStart === dateStr;
                  const isSelectedEnd = newClosureEnd === dateStr;
                  const isBetween = newClosureStart && newClosureEnd && dateStr > newClosureStart && dateStr < newClosureEnd;

                  let cellClass = "bg-stone-50 border border-stone-100";
                  let textClass = "text-stone-700";

                  if (isClosed) {
                    cellClass = "bg-[repeating-linear-gradient(45deg,#f5f5f4,#f5f5f4_5px,#ffffff_5px,#ffffff_10px)] border-red-200 opacity-80 cursor-pointer hover:border-red-400";
                  } else if (hasReservations) {
                    cellClass = "bg-stone-50 border-stone-200 cursor-not-allowed"; 
                  } else if (isSelectedStart || isSelectedEnd) {
                    cellClass = "bg-stone-800 border-stone-900 shadow-md scale-105 z-10 cursor-pointer";
                    textClass = "text-white font-black";
                  } else if (isBetween) {
                    cellClass = "bg-stone-200 border-stone-300 cursor-pointer";
                    textClass = "text-stone-900 font-bold";
                  } else {
                    cellClass += " hover:border-orange-400 cursor-pointer";
                  }

                  return (
                    <button 
                      key={day} 
                      disabled={hasReservations && !isClosed && !isSelectedStart && !isSelectedEnd && !isBetween}
                      onClick={() => handleCalClick(dateStr, closure?.id, hasReservations)}
                      className={`relative h-12 w-full rounded-xl flex flex-col items-center justify-center transition-all ${cellClass}`}
                      title={isClosed ? "Cliquer pour supprimer cette fermeture" : hasReservations ? "Impossible à bloquer : des réservations sont prévues" : "Cliquer pour sélectionner"}
                    >
                      <span className={`text-[10px] sm:text-xs ${textClass}`}>{day}</span>
                      
                      <div className="absolute bottom-1 sm:bottom-2 flex gap-0.5 sm:gap-1 items-center justify-center w-full">
                        {eduCount > 0 && <span className="flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 text-[6px] sm:text-[8px] font-bold text-white shadow-sm">{eduCount}</span>}
                        {penCount > 0 && <span className="flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-500 text-[6px] sm:text-[8px] font-bold text-white shadow-sm">{penCount}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-center gap-4 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Éducation</span>
                 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Pension</span>
              </div>
            </div>

            {/* PARTIE DROITE : GESTION DES BLOCAGES AVEC TOGGLE */}
            <div className="w-full md:w-1/3 flex flex-col gap-4 sm:gap-6 mt-4 md:mt-0 flex-shrink-0 min-w-0">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-stone-900">Gérer les fermetures</h2>
                <p className="text-[10px] sm:text-xs text-stone-500 mt-1">Créez ou supprimez vos indisponibilités.</p>
              </div>

              {/* TOGGLE VUE */}
              <div className="flex bg-stone-100/80 p-1 sm:p-1.5 rounded-lg sm:rounded-xl shrink-0">
                <button
                  onClick={() => setClosureViewMode("calendar")}
                  className={`flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md sm:rounded-lg transition-all cursor-pointer ${closureViewMode === "calendar" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                >
                  + Nouveau
                </button>
                <button
                  onClick={() => setClosureViewMode("list")}
                  className={`flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md sm:rounded-lg transition-all cursor-pointer ${closureViewMode === "list" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                >
                  Liste ({closures.length})
                </button>
              </div>

              {closureViewMode === "calendar" ? (
                <div className="w-full bg-white p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-stone-200 shadow-sm flex flex-col gap-3 sm:gap-4 animate-in fade-in zoom-in-95 duration-200 overflow-hidden box-border">
                  <div className="flex flex-col gap-3 w-full">
                    <div className="w-full min-w-0 flex-1">
                      <label className="block text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 mb-1.5">Du</label>
                      <input type="date" value={newClosureStart} onChange={e => setNewClosureStart(e.target.value)} className="w-full min-w-0 max-w-full appearance-none box-border h-10 sm:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-stone-50 border border-stone-200 text-[10px] sm:text-xs font-bold focus:outline-none focus:border-orange-500 cursor-pointer" />
                    </div>
                    <div className="w-full min-w-0 flex-1">
                      <label className="block text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 mb-1.5">Au</label>
                      <input type="date" value={newClosureEnd} onChange={e => setNewClosureEnd(e.target.value)} className="w-full min-w-0 max-w-full appearance-none box-border h-10 sm:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-stone-50 border border-stone-200 text-[10px] sm:text-xs font-bold focus:outline-none focus:border-orange-500 cursor-pointer" />
                    </div>
                  </div>

                  <div className="w-full min-w-0">
                    <label className="block text-[9px] sm:text-[10px] font-bold uppercase text-stone-400 mb-1.5 sm:mb-2">Services à bloquer :</label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {availableServices.map(service => (
                        <label key={service.id} className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border text-[9px] sm:text-[10px] font-bold cursor-pointer transition-all ${newClosureServices.includes(service.id) ? 'bg-stone-800 border-stone-900 text-white' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'}`}>
                          <input type="checkbox" className="hidden" checked={newClosureServices.includes(service.id)} onChange={() => handleToggleService(service.id)} />
                          {service.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button onClick={saveClosureDates} disabled={savingClosure || !newClosureStart || newClosureServices.length === 0} className="w-full py-2.5 sm:py-3 bg-stone-900 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider hover:bg-stone-800 transition disabled:opacity-50 cursor-pointer mt-1 sm:mt-2">
                    {savingClosure ? "..." : "+ Ajouter le blocage"}
                  </button>
                  <p className="text-[8px] sm:text-[9px] text-stone-400 text-center italic">Sélectionnez les jours directement sur le calendrier à gauche pour pré-remplir les dates.</p>
                </div>
              ) : (
                <div className="flex-1 space-y-2 sm:space-y-3 animate-in fade-in zoom-in-95 duration-200 min-w-0 w-full">
                  {closures.length === 0 ? (
                    <div className="text-center p-4 sm:p-6 text-[10px] sm:text-xs text-stone-400 italic">Aucune fermeture programmée.</div>
                  ) : (
                    closures.map(closure => (
                      <div key={closure.id} className="flex justify-between items-center p-3 sm:p-4 bg-white border border-stone-200 rounded-xl sm:rounded-2xl shadow-sm w-full">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-[10px] sm:text-xs font-black text-stone-800 truncate">
                            {new Date(closure.start).toLocaleDateString('fr-FR')} {closure.start !== closure.end ? `- ${new Date(closure.end).toLocaleDateString('fr-FR')}` : ''}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1 sm:mt-1.5">
                            {closure.services.map(s => (
                              <span key={s} className="px-1 sm:px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded text-[8px] sm:text-[9px] font-bold uppercase">{availableServices.find(as => as.id === s)?.label}</span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => removeClosure(closure.id)} className="shrink-0 h-6 w-6 sm:h-8 sm:w-8 flex justify-center items-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer transition shadow-sm text-xs">✕</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}