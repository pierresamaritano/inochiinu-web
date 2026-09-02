"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import DogProfileManager from "./DogProfileManager";
import ClientDogSelector from "./ClientDogSelector";
import EducationCalendar from "./EducationCalendar";
import MiniEducationCalendar from "./MiniEducationCalendar";
import PensionCalendar from "./PensionCalendar"; 
import MiniPensionCalendar from "./MiniPensionCalendar"; 
import PaymentSimulation from "./PaymentSimulation"; 

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

  // --- NOUVEAU : État de l'arrêt d'urgence ---
  const [isEmergencyStopActive, setIsEmergencyStopActive] = useState(false);

  const [period, setPeriod] = useState<PeriodOption>("1m");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clientPhone, setClientPhone] = useState("");

  const [userDogs, setUserDogs] = useState<any[]>([]);

  const [cancelModal, setCancelModal] = useState<CancelTarget | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // --- ÉTATS ÉDUCATION ---
  const [showEduCalendar, setShowEduCalendar] = useState(false);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickSubmitted, setQuickSubmitted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [quickForm, setQuickForm] = useState({
    dog_id: "", dogName: "", dogBreed: "", dogAge: "",
    objectives: "", location: "terrain" as "terrain" | "domicile",
    scheduledDate: "", timeSlot: "",
  });

  // --- ÉTATS PENSION ---
  const [showPenCalendar, setShowPenCalendar] = useState(false);
  const [isQuickPenBookOpen, setIsQuickPenBookOpen] = useState(false);
  const [quickPenSubmitting, setQuickPenSubmitting] = useState(false);
  const [quickPenSubmitted, setQuickPenSubmitted] = useState(false);
  const [hasSecondDog, setHasSecondDog] = useState(false);

  const [quickPenForm, setQuickPenForm] = useState({
    dog_id: "", dogName: "", dogBreed: "",
    dog2_id: "", dog2Name: "", dog2Breed: "",
    startDate: "", endDate: "", specialNeeds: ""
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchUserServices = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    // --- Vérification de l'arrêt d'urgence ---
    try {
      const { data: setting } = await supabase.from("site_settings").select("value").eq("key", "emergency_stop").single();
      if (setting && setting.value === "true") setIsEmergencyStopActive(true);
      else setIsEmergencyStopActive(false);
    } catch (e) {
      // Ignore si la table n'existe pas encore
    }

    const { data: profile } = await supabase.from("profiles").select("phone").eq("id", user.id).single();
    if (profile && profile.phone) setClientPhone(profile.phone);

    const [edu, pen, adp, sel, dogsData] = await Promise.all([
      supabase.from("education_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("pension_bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("adoption_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("sellerie_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("dogs").select("id, name, breed, birth_date").eq("user_id", user.id),
    ]);

    setEduRequests(edu.data || []);
    setPensionRequests(pen.data || []);
    setAdoptionRequests(adp.data || []);
    setSellerieOrders(sel.data || []);
    setUserDogs(dogsData.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserServices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // --- NOUVEAU : Calculs des badges (Pastilles) sans les terminés/annulés ---
  const eduBadgeCount = filteredEdu.filter(item => ['en_attente', 'confirmé'].includes(item.status)).length;
  const pensionBadgeCount = filteredPension.filter(item => ['en_attente', 'confirmé'].includes(item.status)).length;
  const adoptionBadgeCount = filteredAdoption.filter(item => ['en_attente', 'liste_attente', 'accepté'].includes(item.status)).length;
  const sellerieBadgeCount = filteredSellerie.filter(item => ['en_attente', 'en_atelier'].includes(item.status)).length;

  const handleConfirmCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      const { error } = await supabase.from(cancelModal.table).update({ status: "annulé" }).eq("id", cancelModal.id);
      if (error) throw error;
      await fetchUserServices();
      setCancelModal(null);
    } catch (err: any) {
      alert(`Impossible d'annuler : ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  const toggleWidget = (widgetId: string) => {
    const isExpanding = expandedWidget !== widgetId;
    setExpandedWidget(isExpanding ? widgetId : null);
    if (isExpanding) {
      setTimeout(() => {
        const element = document.getElementById(`widget-${widgetId}`);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 150);
    }
  };

  const calculateDogAge = (birthDateString?: string | null) => {
    if (!birthDateString) return "";
    const dateObj = new Date(birthDateString);
    if (isNaN(dateObj.getTime())) return "";
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} jours`;
    else if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`;
    else return `${Math.floor(diffDays / 365)} ans`;
  };

  // ---------------------------------------------------------------------------
  // GESTIONNAIRES ÉDUCATION
  // ---------------------------------------------------------------------------
  const handleMiniCalClick = (dateStr: string, dogId?: string) => {
    setQuickForm(prev => ({ ...prev, scheduledDate: dateStr, timeSlot: "", dog_id: dogId || (userDogs.length === 1 ? userDogs[0].id : prev.dog_id) }));
    setQuickSubmitted(false);
    setShowPayment(false);
    setIsQuickBookOpen(true);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!quickForm.dog_id || !quickForm.timeSlot || !quickForm.objectives) {
      alert("Veuillez remplir toutes les informations nécessaires.");
      return;
    }
    setShowPayment(true);
  };

  const handleFinalSubmit = async () => {
    setQuickSubmitting(true);
    try {
      const { error } = await supabase.from("education_requests").insert([{
        user_id: currentUser.id, dog_id: quickForm.dog_id, client_name: currentUser.user_metadata?.full_name || "Client",
        client_email: currentUser.email, client_phone: clientPhone, dog_name: quickForm.dogName,
        dog_breed: quickForm.dogBreed, dog_age: quickForm.dogAge, objectives: quickForm.objectives,
        issues: [], scheduled_date: quickForm.scheduledDate, preferred_slot: quickForm.timeSlot,
        session_type: "suivi", location_preference: quickForm.location,
        price_estimate: quickForm.location === "domicile" ? 65 : 45, status: "en_attente",
      }]);
      if (error) throw error;
      setQuickSubmitted(true);
      fetchUserServices(); 
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la réservation.");
    } finally {
      setQuickSubmitting(false);
    }
  };

  const dogBilanStatus = useMemo(() => {
    if (!quickForm.dog_id) return { isValid: false, isPending: false, needsNew: false };
    const dogReqs = eduRequests.filter(r => r.dog_id === quickForm.dog_id && r.status !== 'annulé');
    const hasCompletedBilan = dogReqs.some(r => r.session_type === 'bilan' && r.status === 'terminé');
    const hasPendingBilan = dogReqs.some(r => r.session_type === 'bilan' && (r.status === 'en_attente' || r.status === 'confirmé'));
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const hasRecentSession = dogReqs.some(r => {
      if (!r.scheduled_date) return true;
      return new Date(r.scheduled_date) >= oneYearAgo;
    });

    if (hasCompletedBilan && hasRecentSession) return { isValid: true, isPending: false, needsNew: false };
    if (hasPendingBilan) return { isValid: false, isPending: true, needsNew: false };
    return { isValid: false, isPending: false, needsNew: true };
  }, [quickForm.dog_id, eduRequests]);


  // ---------------------------------------------------------------------------
  // GESTIONNAIRES PENSION
  // ---------------------------------------------------------------------------
  const handleMiniPenCalClick = (dateStr: string, dogId?: string) => {
    setQuickPenForm(prev => ({ 
      ...prev, 
      startDate: dateStr, 
      endDate: "", 
      dog_id: dogId || (userDogs.length === 1 ? userDogs[0].id : prev.dog_id) 
    }));
    setQuickPenSubmitted(false);
    setIsQuickPenBookOpen(true);
  };

  const openQuickPenBooking = () => {
    setQuickPenForm(prev => ({ ...prev, startDate: "", endDate: "", dog_id: userDogs.length === 1 ? userDogs[0].id : prev.dog_id }));
    setQuickPenSubmitted(false);
    setIsQuickPenBookOpen(true);
  };

  const handleQuickPenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!quickPenForm.dog_id || !quickPenForm.startDate || !quickPenForm.endDate) return;
    if (hasSecondDog && !quickPenForm.dog2_id) return;

    setQuickPenSubmitting(true);
    try {
      const finalDogName = hasSecondDog ? `${quickPenForm.dogName} & ${quickPenForm.dog2Name}` : quickPenForm.dogName;
      const finalDogBreed = hasSecondDog ? `${quickPenForm.dogBreed} - ${quickPenForm.dog2Breed}` : quickPenForm.dogBreed;

      const { error } = await supabase.from("pension_bookings").insert([{
        user_id: currentUser.id, dog_id: quickPenForm.dog_id || null,
        client_name: currentUser.user_metadata?.full_name || "Client", client_email: currentUser.email,
        client_phone: clientPhone, dog_name: finalDogName, dog_breed: finalDogBreed,
        start_date: quickPenForm.startDate, end_date: quickPenForm.endDate,
        special_needs: quickPenForm.specialNeeds, status: "en_attente",
      }]);

      if (error) throw error;
      setQuickPenSubmitted(true);
      fetchUserServices(); 
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la réservation de la pension.");
    } finally {
      setQuickPenSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mt-12 text-center text-xs font-bold text-stone-400">Chargement de votre tableau de bord...</div>;
  }

  const hasAnyService = eduRequests.length > 0 || pensionRequests.length > 0 || adoptionRequests.length > 0 || sellerieOrders.length > 0;

  return (
    <>
      {/* BANDEAU ARRÊT D'URGENCE GLOBAL */}
      {isEmergencyStopActive && (
        <div className="mt-6 p-4 rounded-2xl bg-red-600 text-white text-center text-sm font-bold shadow-md animate-in fade-in">
          ⚠️ En raison d'un imprévu, les nouvelles réservations sont momentanément suspendues. Rassurez-vous, vos séjours et séances déjà validés sont maintenus.
        </div>
      )}

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

      <DogProfileManager />

      {!hasAnyService ? (
        <div className="mt-12 p-10 sm:p-16 rounded-[2.5rem] bg-white/40 border border-stone-200 border-dashed text-center flex flex-col items-center justify-center max-w-3xl mx-auto shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600 mb-6 shadow-inner">犬</div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Votre historique de réservations est vide</h2>
          <p className="text-stone-500 mt-3 text-sm leading-relaxed max-w-lg">Vos demandes de pension, d'éducation ou commandes de sellerie apparaîtront ici.</p>
          <a href="/education" className="mt-8 px-8 py-3 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 transition-all">Découvrir nos services</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-start">

          {/* ========================================================================= */}
          {/* WIDGET ÉDUCATION */}
          {/* ========================================================================= */}
          {filteredEdu.length > 0 && (
            <div id="widget-edu" className={`rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm transition-all duration-300 ${expandedWidget === 'edu' ? 'lg:col-span-2 shadow-md bg-white ring-1 ring-orange-100' : ''}`}>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">Éducation</span>
                  <h3 className="text-xl font-black text-stone-900 mt-1.5">Séances & Bilan</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => !isEmergencyStopActive && setShowEduCalendar(!showEduCalendar)}
                    disabled={isEmergencyStopActive}
                    title={isEmergencyStopActive ? "Réservations suspendues" : "Afficher/Masquer le calendrier"}
                    className={`flex items-center justify-center h-10 w-10 rounded-full border text-lg transition-colors shadow-sm ${
                      isEmergencyStopActive ? 'bg-stone-100 border-stone-200 text-stone-300 cursor-not-allowed opacity-60' 
                      : showEduCalendar ? 'bg-orange-50 border-orange-200 text-orange-600 cursor-pointer' 
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-500 cursor-pointer'
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </button>
                  {/* Utilisation de la nouvelle pastille */}
                  {eduBadgeCount > 0 && (
                    <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center font-black text-xs text-orange-700 shrink-0 shadow-sm">
                      {eduBadgeCount}
                    </div>
                  )}
                </div>
              </div>

              {showEduCalendar && !isEmergencyStopActive && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <MiniEducationCalendar eduRequests={eduRequests} userDogs={userDogs} onDayClick={handleMiniCalClick} />
                </div>
              )}

              <div className="mt-6 space-y-3">
                {(expandedWidget === 'edu' ? filteredEdu : filteredEdu.slice(0, 2)).map((item) => {
                  const isTerminated = item.status === "terminé" || item.status === "annulé";
                  return (
                    <div key={item.id} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${isTerminated ? 'border-stone-100 bg-stone-50 opacity-80' : 'border-stone-200 bg-white shadow-sm'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-stone-900">{item.dog_name}</h4>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.status === 'confirmé' ? 'bg-emerald-100 text-emerald-800' : item.status === 'annulé' ? 'bg-red-100 text-red-800' : item.status === 'terminé' ? 'bg-stone-200 text-stone-600' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500 font-medium block mt-1.5">
                            <strong className="text-stone-700">{item.session_type === 'bilan' ? 'Bilan' : 'Séance'}</strong> • {item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString('fr-FR') : 'Date à définir'} à {item.preferred_slot}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            📍 {item.location_preference === 'domicile' ? 'À Domicile' : 'Sur Terrain'}
                          </span>
                        </div>

                        {!isTerminated && (
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
                  )
                })}
              </div>

              {filteredEdu.length > 2 && (
                <button onClick={() => toggleWidget('edu')} className="mt-4 text-xs font-bold text-stone-500 hover:text-stone-900 block mx-auto cursor-pointer">
                  {expandedWidget === 'edu' ? "Réduire" : `Voir tout (+${filteredEdu.length - 2})`}
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* WIDGET PENSION */}
          {/* ========================================================================= */}
          {filteredPension.length > 0 && (
            <div id="widget-pen" className={`rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm transition-all duration-300 ${expandedWidget === 'pen' ? 'lg:col-span-2 shadow-md bg-white ring-1 ring-emerald-100' : ''}`}>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Pension</span>
                  <h3 className="text-xl font-black text-stone-900 mt-1.5">Séjours en Garde</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => !isEmergencyStopActive && setShowPenCalendar(!showPenCalendar)}
                    disabled={isEmergencyStopActive}
                    title={isEmergencyStopActive ? "Réservations suspendues" : "Afficher/Masquer le calendrier de la pension"}
                    className={`flex items-center justify-center h-10 w-10 rounded-full border text-lg transition-colors shadow-sm ${
                      isEmergencyStopActive ? 'bg-stone-100 border-stone-200 text-stone-300 cursor-not-allowed opacity-60' 
                      : showPenCalendar ? 'bg-emerald-50 border-emerald-200 text-emerald-600 cursor-pointer' 
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-500 cursor-pointer'
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </button>
                  {/* Utilisation de la nouvelle pastille */}
                  {pensionBadgeCount > 0 && (
                    <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-xs text-emerald-700 shrink-0 shadow-sm">
                      {pensionBadgeCount}
                    </div>
                  )}
                </div>
              </div>

              {showPenCalendar && !isEmergencyStopActive && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <MiniPensionCalendar userDogs={userDogs} onDayClick={handleMiniPenCalClick} />
                </div>
              )}

              <div className="mt-6 space-y-3">
                {(expandedWidget === 'pen' ? filteredPension : filteredPension.slice(0, 2)).map((item) => {
                  const isTerminated = item.status === "terminé" || item.status === "annulé";
                  return (
                    <div key={item.id} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${isTerminated ? 'border-stone-100 bg-stone-50 opacity-80' : 'border-stone-200 bg-white shadow-sm'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-stone-900">{item.dog_name}</h4>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.status === 'confirmé' ? 'bg-emerald-100 text-emerald-800' : item.status === 'annulé' ? 'bg-red-100 text-red-800' : item.status === 'terminé' ? 'bg-stone-200 text-stone-600' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500 font-medium block mt-1.5">Du {item.start_date ? new Date(item.start_date).toLocaleDateString('fr-FR') : ''} au {item.end_date ? new Date(item.end_date).toLocaleDateString('fr-FR') : ''}</span>
                        </div>

                        {!isTerminated && (
                          <button
                            onClick={() => setCancelModal({ table: "pension_bookings", id: item.id, title: `le séjour de ${item.dog_name}` })}
                            className="text-xs font-bold text-stone-400 hover:text-red-600 px-3 py-1 rounded-full hover:bg-red-50 transition-all cursor-pointer shrink-0"
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredPension.length > 2 && (
                <button onClick={() => toggleWidget('pen')} className="mt-4 text-xs font-bold text-stone-500 hover:text-stone-900 block mx-auto cursor-pointer">
                  {expandedWidget === 'pen' ? "Réduire" : `Voir tout (+${filteredPension.length - 2})`}
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* WIDGET ADOPTION */}
          {/* ========================================================================= */}
          {filteredAdoption.length > 0 && (
            <div id="widget-adp" className={`rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm transition-all duration-300 ${expandedWidget === 'adp' ? 'lg:col-span-2 shadow-md bg-white ring-1 ring-orange-100' : ''}`}>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">Élevage</span>
                  <h3 className="text-xl font-black text-stone-900 mt-1.5">Candidature Chiot</h3>
                </div>
                {/* Utilisation de la nouvelle pastille */}
                {adoptionBadgeCount > 0 && (
                  <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center font-black text-xs text-orange-700">
                    {adoptionBadgeCount}
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {(expandedWidget === 'adp' ? filteredAdoption : filteredAdoption.slice(0, 2)).map((item) => {
                  const isTerminated = item.status === "annulé" || item.status === "refusé";
                  return (
                    <div key={item.id} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${isTerminated ? 'border-stone-100 bg-stone-50 opacity-80' : 'border-stone-200 bg-white shadow-sm'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-stone-900">{item.preferred_breed}</h4>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.status === 'accepté' ? 'bg-emerald-100 text-emerald-800' : isTerminated ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500 font-medium block mt-1.5">{item.living_environment}</span>
                        </div>

                        {!isTerminated && (
                          <button
                            onClick={() => setCancelModal({ table: "adoption_requests", id: item.id, title: `votre candidature pour un ${item.preferred_breed}` })}
                            className="text-xs font-bold text-stone-400 hover:text-red-600 px-3 py-1 rounded-full hover:bg-red-50 transition-all cursor-pointer shrink-0"
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredAdoption.length > 2 && (
                <button onClick={() => toggleWidget('adp')} className="mt-4 text-xs font-bold text-stone-500 hover:text-stone-900 block mx-auto cursor-pointer">
                  {expandedWidget === 'adp' ? "Réduire" : `Voir tout (+${filteredAdoption.length - 2})`}
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* WIDGET SELLERIE */}
          {/* ========================================================================= */}
          {filteredSellerie.length > 0 && (
            <div id="widget-sel" className={`rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm transition-all duration-300 ${expandedWidget === 'sel' ? 'lg:col-span-2 shadow-md bg-white ring-1 ring-amber-100' : ''}`}>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Sellerie</span>
                  <h3 className="text-xl font-black text-stone-900 mt-1.5">Commandes Atelier</h3>
                </div>
                {/* Utilisation de la nouvelle pastille */}
                {sellerieBadgeCount > 0 && (
                  <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center font-black text-xs text-amber-700">
                    {sellerieBadgeCount}
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {(expandedWidget === 'sel' ? filteredSellerie : filteredSellerie.slice(0, 2)).map((item) => {
                  const isTerminated = item.status === "annulé";
                  return (
                    <div key={item.id} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${isTerminated ? 'border-stone-100 bg-stone-50 opacity-80' : 'border-stone-200 bg-white shadow-sm'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-stone-900">{item.item_type}</h4>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.status === 'expédié' ? 'bg-emerald-100 text-emerald-800' : isTerminated ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500 font-medium block mt-1.5">{item.color_finish} • {item.dog_size}</span>
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
                    </div>
                  )
                })}
              </div>

              {filteredSellerie.length > 2 && (
                <button onClick={() => toggleWidget('sel')} className="mt-4 text-xs font-bold text-stone-500 hover:text-stone-900 block mx-auto cursor-pointer">
                  {expandedWidget === 'sel' ? "Réduire" : `Voir tout (+${filteredSellerie.length - 2})`}
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* ... MODALE ANNULATION ... */}
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

      {/* ========================================================================= */}
      {/* MODALE RÉSERVATION RAPIDE ÉDUCATION */}
      {/* ========================================================================= */}
      {isQuickBookOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsQuickBookOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-6 sm:p-10 shadow-2xl">
            <button onClick={() => setIsQuickBookOpen(false)} className="absolute top-6 right-6 text-stone-600 hover:text-stone-900 bg-white shadow-sm p-1.5 rounded-full cursor-pointer z-50">✕</button>

            {quickSubmitted ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4">✓</div>
                <h3 className="text-xl font-black text-stone-900">Paiement validé !</h3>
                <p className="text-xs text-stone-500 mt-2">Votre demande pour le {new Date(quickForm.scheduledDate).toLocaleDateString('fr-FR')} a bien été enregistrée.</p>
                <button 
                  onClick={() => setIsQuickBookOpen(false)} 
                  className="mt-6 inline-block px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full cursor-pointer shadow-md"
                >
                  Fermer
                </button>
              </div>
            ) : showPayment ? (
              <PaymentSimulation 
                amount={quickForm.location === "domicile" ? 65 : 45} 
                serviceName="Séance de Suivi"
                onSuccess={handleFinalSubmit}
                onCancel={() => setShowPayment(false)}
              />
            ) : (
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-stone-900">Demander un suivi</h3>
                  <p className="text-xs text-stone-500 mt-1">Réservez une nouvelle séance pour votre chien.</p>
                </div>

                <div className="space-y-5 animate-in fade-in">

                  {currentUser && (
                    <div className="w-full min-w-0">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">Chien concerné *</label>
                      <select 
                        required
                        value={quickForm.dog_id} 
                        onChange={(e) => {
                          const dog = userDogs.find(d => d.id === e.target.value);
                          setQuickForm({
                            ...quickForm, 
                            dog_id: e.target.value, 
                            dogName: dog?.name || "", 
                            dogBreed: dog?.breed || "", 
                            dogAge: calculateDogAge(dog?.birth_date || "") 
                          });
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-bold focus:outline-none focus:border-orange-500 cursor-pointer shadow-sm"
                      >
                        <option value="">Sélectionnez un chien...</option>
                        {userDogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  )}

                  {quickForm.dog_id && !dogBilanStatus.isValid ? (
                    dogBilanStatus.isPending ? (
                      <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 text-center animate-in zoom-in-95 duration-200 mt-4 shadow-sm">
                        <div className="text-3xl mb-3">⏳</div>
                        <h4 className="text-sm font-black text-orange-900 mb-2">Bilan en cours</h4>
                        <p className="text-xs text-orange-700 leading-relaxed">
                          Vous pourrez planifier vos futures séances de suivi avec <strong>{quickForm.dogName}</strong> dès que nous aurons réalisé et validé ensemble le bilan comportemental initial.
                        </p>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-center animate-in zoom-in-95 duration-200 mt-4 shadow-sm">
                        <div className="text-3xl mb-3">⚠️</div>
                        <h4 className="text-sm font-black text-red-900 mb-2">Bilan initial requis</h4>
                        <p className="text-xs text-red-700 leading-relaxed mb-5">
                          Vous ne pouvez pas réserver de séance de suivi car le <strong>Bilan Initial</strong> de {quickForm.dogName} n'a jamais été réalisé ou la dernière séance remonte à plus d'un an.
                        </p>
                        <a href="/education" className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider rounded-full transition-colors shadow-sm cursor-pointer">
                          Aller réserver un bilan
                        </a>
                      </div>
                    )
                  ) : (
                    <div className={`space-y-5 transition-all duration-300 ${!quickForm.dog_id ? "opacity-30 pointer-events-none grayscale" : "mt-2"}`}>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setQuickForm({ ...quickForm, location: "terrain", timeSlot: "" })} className={`p-4 rounded-2xl border text-left transition-all ${quickForm.location === "terrain" ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-stone-200 bg-white hover:border-emerald-300"}`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-black text-sm ${quickForm.location === "terrain" ? "text-emerald-900" : "text-stone-800"}`}>Sur Terrain</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${quickForm.location === "terrain" ? "border-emerald-500" : "border-stone-300"}`}>
                              {quickForm.location === "terrain" && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                            </div>
                          </div>
                          <span className="text-[10px] text-stone-500 mt-1 block">Tarif standard (45€)</span>
                        </button>

                        <button type="button" onClick={() => setQuickForm({ ...quickForm, location: "domicile", timeSlot: "" })} className={`p-4 rounded-2xl border text-left transition-all ${quickForm.location === "domicile" ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-stone-200 bg-white hover:border-emerald-300"}`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-black text-sm ${quickForm.location === "domicile" ? "text-emerald-900" : "text-stone-800"}`}>À Domicile</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${quickForm.location === "domicile" ? "border-emerald-500" : "border-stone-300"}`}>
                              {quickForm.location === "domicile" && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                            </div>
                          </div>
                          <span className="text-[10px] text-stone-500 mt-1 block">+ Frais déplacement (65€)</span>
                        </button>
                      </div>

                      <div className="bg-stone-50 p-4 rounded-[2rem] border border-stone-200">
                        <EducationCalendar 
                          location={quickForm.location}
                          selectedDate={quickForm.scheduledDate}
                          selectedTime={quickForm.timeSlot}
                          selectedDogId={quickForm.dog_id} 
                          onChange={(date, time) => setQuickForm({ ...quickForm, scheduledDate: date, timeSlot: time })}
                        />
                      </div>

                      <div className="w-full min-w-0">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">Objectif de la séance *</label>
                        <textarea 
                          required 
                          rows={2} 
                          placeholder="Point spécifique à travailler aujourd'hui..."
                          value={quickForm.objectives} 
                          onChange={(e) => setQuickForm({ ...quickForm, objectives: e.target.value })} 
                          className="w-full max-w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500 shadow-sm" 
                        />
                      </div>

                      <div className="pt-2 border-t border-stone-100">
                        <button type="submit" disabled={quickSubmitting || !quickForm.dog_id || !quickForm.timeSlot || !quickForm.objectives} className="w-full py-3.5 bg-stone-900 text-white font-black text-xs uppercase tracking-wider rounded-full cursor-pointer shadow-md disabled:opacity-50 hover:scale-105 transition-all">
                          Payer {quickForm.location === "domicile" ? 65 : 45}€ et Valider
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE RÉSERVATION RAPIDE PENSION */}
      {/* ========================================================================= */}
      {isQuickPenBookOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsQuickPenBookOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-6 sm:p-10 shadow-2xl">
            <button onClick={() => setIsQuickPenBookOpen(false)} className="absolute top-6 right-6 text-stone-600 hover:text-stone-900 bg-white shadow-sm p-1.5 rounded-full cursor-pointer z-50">✕</button>

            {quickPenSubmitted ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4">✓</div>
                <h3 className="text-xl font-black text-stone-900">Demande de séjour envoyée !</h3>
                <p className="text-xs text-stone-500 mt-2">Nous vérifions le planning des boxs et validons votre demande très vite.</p>
                <button 
                  onClick={() => setIsQuickPenBookOpen(false)} 
                  className="mt-6 inline-block px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full cursor-pointer shadow-md"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuickPenSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-stone-900">Réserver un séjour</h3>
                  <p className="text-xs text-stone-500 mt-1">Bloquez vos dates en pension.</p>
                </div>

                <div className="space-y-5 animate-in fade-in">

                  {/* SÉLECTION DU CHIEN */}
                  {currentUser && (
                    <div className="w-full min-w-0">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">Pensionnaire(s) *</label>
                      <select 
                        required
                        value={quickPenForm.dog_id} 
                        onChange={(e) => {
                          const dog = userDogs.find(d => d.id === e.target.value);
                          setQuickPenForm({
                            ...quickPenForm, 
                            dog_id: e.target.value, 
                            dogName: dog?.name || "", 
                            dogBreed: dog?.breed || "", 
                          });
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-bold focus:outline-none focus:border-orange-500 cursor-pointer shadow-sm"
                      >
                        <option value="">Sélectionnez un premier chien...</option>
                        {userDogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>

                      <div className="mt-2">
                        {!hasSecondDog ? (
                          <button
                            type="button"
                            onClick={() => setHasSecondDog(true)}
                            className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
                          >
                            + Ajouter un deuxième chien (même box)
                          </button>
                        ) : (
                          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 relative mt-3 shadow-sm">
                            <button 
                              type="button" 
                              onClick={() => {
                                setHasSecondDog(false);
                                setQuickPenForm(prev => ({ ...prev, dog2_id: "", dog2Name: "", dog2Breed: "" }));
                              }}
                              className="absolute top-3 right-3 text-[10px] font-bold text-stone-400 hover:text-red-500 cursor-pointer"
                            >
                              ✕ Retirer
                            </button>
                            <p className="text-[10px] font-black uppercase text-emerald-700 mb-2">Deuxième pensionnaire</p>
                            <select 
                              required={hasSecondDog}
                              value={quickPenForm.dog2_id} 
                              onChange={(e) => {
                                const dog = userDogs.find(d => d.id === e.target.value);
                                setQuickPenForm({
                                  ...quickPenForm, 
                                  dog2_id: e.target.value, 
                                  dog2Name: dog?.name || "", 
                                  dog2Breed: dog?.breed || "", 
                                });
                              }}
                              className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
                            >
                              <option value="">Sélectionnez le second chien...</option>
                              {userDogs.filter(d => d.id !== quickPenForm.dog_id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-stone-50 p-4 rounded-[2rem] border border-stone-200">
                    <PensionCalendar 
                      startDate={quickPenForm.startDate}
                      endDate={quickPenForm.endDate}
                      onChange={(start, end) => setQuickPenForm({ ...quickPenForm, startDate: start, endDate: end })}
                    />
                  </div>

                  <div className="w-full min-w-0">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">Besoins spécifiques</label>
                    <textarea 
                      rows={2} 
                      placeholder="Précisez le type de croquettes, traitements..."
                      value={quickPenForm.specialNeeds} 
                      onChange={(e) => setQuickPenForm({ ...quickPenForm, specialNeeds: e.target.value })} 
                      className="w-full max-w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-emerald-500 shadow-sm" 
                    />
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <button type="submit" disabled={quickPenSubmitting || !quickPenForm.dog_id || !quickPenForm.startDate || !quickPenForm.endDate || (hasSecondDog && !quickPenForm.dog2_id)} className="w-full py-3.5 bg-stone-900 text-white font-black text-xs uppercase tracking-wider rounded-full cursor-pointer shadow-md disabled:opacity-50 hover:scale-105 transition-all">
                      {quickPenSubmitting ? "Envoi en cours..." : "Réserver ce séjour"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}