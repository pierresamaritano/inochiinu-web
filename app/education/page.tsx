"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";
import ClientDogSelector from "../components/ClientDogSelector";
import EducationCalendar from "../components/EducationCalendar";

// IMPORTS DES COMPOSANTS MAÎTRES
import AppleCarousel, { CarouselSlide } from "../components/AppleCarousel";
import ContactSection from "../components/ContactSection";

const BUCKET_URL = "https://qvybupsibujplkykufja.supabase.co/storage/v1/object/public/media";

export default function EducationPage() {
  const [user, setUser] = useState<any>(null);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeToNext, setTimeToNext] = useState(6000);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  
  const [userEduRequests, setUserEduRequests] = useState<any[]>([]);

  const [formData, setFormData] = useState<{
    dog_id: string;
    dogName: string;
    dogBreed: string;
    dogAge: string;
    objectives: string;
    issues: string[];
    scheduledDate: string;
    preferredSlot: string;
    clientPhone: string;
    sessionType: "bilan" | "suivi";
    location: "terrain" | "domicile";
  }>({
    dog_id: "",
    dogName: "",
    dogBreed: "",
    dogAge: "",
    objectives: "",
    issues: [],
    scheduledDate: "",
    preferredSlot: "",
    clientPhone: "",
    sessionType: "bilan",
    location: "terrain"
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", currentUser.id)
          .single();

        if (profile && profile.phone) {
          setFormData((prev) => ({ ...prev, clientPhone: profile.phone }));
        }

        const { data: reqs } = await supabase
          .from("education_requests")
          .select("dog_id, session_type, status, scheduled_date")
          .eq("user_id", currentUser.id);
        
        setUserEduRequests(reqs || []);
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const slides = [
    { title: "Bilan Comportemental Initial", subtitle: "Une analyse complète à domicile ou sur terrain pour comprendre les besoins spécifiques de votre chien.", tag: "Évaluation", gradient: "from-orange-950/90 via-stone-900/60 to-black/80" },
    { title: "Cours Individuels Sur-Mesure", subtitle: "Travail des ordres de base, marche en laisse, rappel et gestion des troubles (réactivité, anxiété).", tag: "Progression", gradient: "from-stone-900/90 via-stone-900/60 to-black/80" },
    { title: "Promenades Éducatives & Socialisation", subtitle: "Mise en pratique en situation réelle avec des congénères codés pour renforcer les bons comportements.", tag: "En groupe", gradient: "from-amber-950/90 via-stone-900/60 to-black/80" },
  ];

  const educationCarouselSlides: CarouselSlide[] = [
    { src: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1080&auto=format&fit=crop", alt: "Chien attentif", tag: "Écoute & Complicité", caption: "Apprendre à communiquer avec son chien dans le calme." },
    { src: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?q=80&w=1080&auto=format&fit=crop", alt: "Chien extérieur", tag: "Mise en situation", caption: "Travail en environnement réel pour des résultats durables." },
    { src: "https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=1080&auto=format&fit=crop", alt: "Maître et chien", tag: "Relation de confiance", caption: "Renforcer le lien maître-chien par le jeu et la positivité." }
  ];

  useEffect(() => {
    const timer = setTimeout(() => { setCurrentSlide((prev) => (prev + 1) % slides.length); setTimeToNext(6000); }, timeToNext);
    return () => clearTimeout(timer);
  }, [currentSlide, timeToNext, slides.length]);

  const handleUserInteraction = () => setTimeToNext(12000); 
  const nextSlide = () => { handleUserInteraction(); setCurrentSlide((prev) => (prev + 1) % slides.length); };
  const prevSlide = () => { handleUserInteraction(); setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length); };
  const goToSlide = (index: number) => { handleUserInteraction(); setCurrentSlide(index); };

  const handleInitialClick = () => {
    if (localStorage.getItem("hideEducationInfo") === "true") handleActionClick();
    else setShowInfoModal(true);
  };

  const handleContinueFromInfo = () => {
    if (dontShowAgain) localStorage.setItem("hideEducationInfo", "true");
    setShowInfoModal(false);
    handleActionClick();
  };

  const handleActionClick = () => {
    if (user) { setIsFormOpen(true); setStep(1); } 
    else setIsAuthOpen(true);
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true); setAuthError("");
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=/education` } });
      if (error) throw error;
    } catch (err: any) {
      console.error(err); setAuthError(err.message); setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError("");
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setIsAuthOpen(false); setIsFormOpen(true); setStep(1);
      }
    } catch (err: any) {
      console.error(err); setAuthError("Email ou mot de passe incorrect.");
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleIssue = (issue: string) => {
    setFormData((prev) => ({
      ...prev,
      issues: prev.issues.includes(issue) ? prev.issues.filter((i) => i !== issue) : [...prev.issues, issue],
    }));
  };

  const calculateDogAge = (birthDateString?: string | null) => {
    if (!birthDateString) return "";
    const dateObj = new Date(birthDateString);
    if (isNaN(dateObj.getTime())) return "";

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} jours`;
    else if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`;
    else return `${Math.floor(diffDays / 365)} ans`;
  };

  const getEstimatedPrice = () => {
    let basePrice = formData.sessionType === "bilan" ? 60 : 45; 
    if (formData.location === "domicile") basePrice += 20; 
    return basePrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.dog_id || !formData.scheduledDate || !formData.preferredSlot) {
      alert("Veuillez remplir toutes les informations nécessaires pour la réservation.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("education_requests").insert([
        {
          user_id: user.id,
          dog_id: formData.dog_id,
          client_name: user.user_metadata?.full_name || "Client",
          client_email: user.email,
          client_phone: formData.clientPhone,
          dog_name: formData.dogName,
          dog_breed: formData.dogBreed,
          dog_age: formData.dogAge,
          objectives: formData.objectives,
          issues: formData.sessionType === 'bilan' ? formData.issues : [], 
          scheduled_date: formData.scheduledDate,
          preferred_slot: formData.preferredSlot,
          session_type: formData.sessionType,
          location_preference: formData.location,
          price_estimate: getEstimatedPrice(),
          status: "en_attente",
        },
      ]);
      if (error) throw error;

      if (formData.clientPhone) {
        await supabase.from("profiles").update({ phone: formData.clientPhone }).eq("id", user.id);
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================================
  // NOUVEAU VERROU MÉTIER (Bilan Terminé + 1 an d'expiration)
  // =========================================================================
  
  // Requêtes du chien sélectionné
  const dogReqs = userEduRequests.filter(r => r.dog_id === formData.dog_id && r.status !== 'annulé');
  
  // 1. A-t-il un Bilan "terminé" ?
  const hasCompletedBilan = dogReqs.some(r => r.session_type === 'bilan' && r.status === 'terminé');
  
  // 2. A-t-il un Bilan "en attente" ou "confirmé" ? (Pour bloquer les bilans à l'infini)
  const hasPendingBilan = dogReqs.some(r => r.session_type === 'bilan' && (r.status === 'en_attente' || r.status === 'confirmé'));
  
  // 3. Est-ce que sa dernière séance remonte à moins d'un an ?
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const hasRecentSession = dogReqs.some(r => r.scheduled_date && new Date(r.scheduled_date) >= oneYearAgo);

  // Un bilan est VALIDE s'il est terminé ET récent (- d'1 an)
  const isBilanValid = hasCompletedBilan && hasRecentSession;

  // On bloque l'accès au Suivi si le bilan n'est pas valide
  const canBookSuivi = !!formData.dog_id && isBilanValid;
  // On bloque l'accès au Bilan s'il en a déjà un valide, ou s'il en a un en attente
  const canBookBilan = !!formData.dog_id && !isBilanValid && !hasPendingBilan;

  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-orange-200 selection:text-stone-900">
      
      <div className="absolute top-0 inset-x-0 h-[100vh] overflow-hidden pointer-events-none z-0 transform-gpu">
        <div className="absolute top-[10%] left-[-20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0) 70%)' }} />
        <div className="absolute top-[40%] right-[-20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0) 70%)' }} />
      </div>

      <LiquidNavbar />

      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-6 text-center px-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-50/70 backdrop-blur-md px-4 py-1 text-xs font-bold text-orange-700 shadow-sm">
          <span>Expertise Primitive & Japonaise</span>
        </div>
        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          Éducation & <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Comportement Canin</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-stone-600 sm:text-base">
          Des méthodes bienveillantes, claires et adaptées à la psychologie de votre chien pour bâtir une relation de confiance et de respect mutuel.
        </p>
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
          <p className="text-sm font-bold text-red-700 leading-relaxed">
            Actuellement en révision pour passage de l'ACACED ! Objectif, obtention en septembre 2026.<br className="hidden sm:block" />
            Restez connectés pour en savoir plus. 
          </p>
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-stone-900 shadow-md min-h-[220px] sm:min-h-[240px] flex items-center">
          <div className="absolute inset-y-0 left-0 w-1/2 z-20 cursor-pointer" onClick={prevSlide} />
          <div className="absolute inset-y-0 right-0 w-1/2 z-20 cursor-pointer" onClick={nextSlide} />

          {slides.map((slide, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-700 flex flex-col justify-center px-8 sm:px-14 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
              <div className="relative z-10 max-w-xl text-white pointer-events-none">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-white/10 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/10 inline-block mb-2">
                  {slide.tag}
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">{slide.title}</h2>
                <p className="mt-2 text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">{slide.subtitle}</p>
              </div>
            </div>
          ))}

          <button onClick={prevSlide} className="absolute left-4 z-30 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md cursor-pointer">←</button>
          <button onClick={nextSlide} className="absolute right-4 z-30 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md cursor-pointer">→</button>

          <div className="absolute bottom-4 inset-x-0 z-30 flex justify-center gap-1.5 pointer-events-none">
            {slides.map((_, index) => (
              <button key={index} onClick={() => goToSlide(index)} className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer pointer-events-auto ${index === currentSlide ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-stone-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-black tracking-tight text-stone-900">Demander un rendez-vous</h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-medium">Bilan comportemental initial ou séance de suivi personnalisée.</p>
          </div>
          <button onClick={handleInitialClick} className="w-full sm:w-auto shrink-0 flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-7 font-bold text-xs uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(249,115,22,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] transition hover:scale-105 hover:brightness-105 cursor-pointer">
            Prendre rendez-vous
          </button>
        </div>
      </section>

      <section className="relative z-10 border-t border-stone-200/60 bg-transparent py-16">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">Notre Approche</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 mt-1">Travailler avec la nature du chien</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">Étape 1</span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">Comprendre & Analyser</h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">Le bilan permet d'identifier les causes profondes d'un comportement (peur, frustration, génétique) avant d'appliquer toute solution.</p>
              </div>
            </div>
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">Étape 2</span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">Éduquer & Cadrer</h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">Mise en place de règles claires, apprentissage de la frustration et renforcement des comportements positifs.</p>
              </div>
            </div>
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">Étape 3</span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">Socialiser & Généraliser</h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">Travail en extérieur, en ville et en présence de chiens régulateurs pour assurer un comportement stable en toute circonstance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AppleCarousel slides={educationCarouselSlides} />

      <ContactSection />

      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setShowInfoModal(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl">
            <button onClick={() => setShowInfoModal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 cursor-pointer">✕</button>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4 text-xl">ℹ️</div>
            <h3 className="text-xl font-black text-stone-900">Déroulement des séances</h3>
            <div className="mt-4 space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>Avant de démarrer le travail éducatif avec votre chien, veuillez noter que :</p>
              <ul className="list-disc pl-5 space-y-1 font-medium text-stone-700">
                <li><strong className="text-stone-900">Nouveau client : </strong> Le premier rendez-vous est toujours un Bilan Initial.</li>
                <li>La présence et l'implication du maître sont obligatoires à chaque séance.</li>
                <li>Les vaccins de votre chien doivent être à jour.</li>
              </ul>
            </div>
            <label className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-stone-100 border border-stone-200 cursor-pointer hover:bg-stone-200/50 transition-colors">
              <input type="checkbox" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer" />
              <span className="text-xs font-bold text-stone-600">J'ai compris, ne plus afficher ce message.</span>
            </label>
            <button onClick={handleContinueFromInfo} className="mt-6 w-full py-3.5 bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-stone-800 transition-all cursor-pointer shadow-md">
              Continuer vers la demande
            </button>
          </div>
        </div>
      )}

      {/* MODALE CONNEXION (GOOGLE + EMAIL) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setIsAuthOpen(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-6 right-6 text-stone-600 cursor-pointer">✕</button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm">犬</div>
              <h3 className="text-2xl font-black text-stone-900">Connexion requise</h3>
              <p className="mt-2 text-sm text-stone-500 font-medium">Connectez-vous pour transmettre votre projet éducatif.</p>
            </div>

            {authError && <p className="mt-4 text-xs font-bold text-red-500 text-center bg-red-50 p-2 rounded-lg">{authError}</p>}

            <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
              <div>
                <input type="email" required placeholder="Votre adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <input type="password" required placeholder="Votre mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" />
              </div>
              <button type="submit" disabled={authLoading} className="w-full py-3.5 bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-stone-800 transition-all cursor-pointer shadow-md disabled:opacity-50">
                {authLoading ? "Chargement..." : (isSignUp ? "Créer mon compte" : "Se connecter par e-mail")}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer underline underline-offset-2">
                {isSignUp ? "Déjà un compte ? Connectez-vous" : "Pas de compte ? Inscrivez-vous"}
              </button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200"></div>
              <span className="text-[10px] font-black uppercase text-stone-400">Ou</span>
              <div className="flex-1 h-px bg-stone-200"></div>
            </div>

            <button onClick={handleGoogleLogin} disabled={authLoading} className="flex h-13 w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white px-6 font-bold text-stone-800 shadow-sm hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span>Continuer avec Google</span>
            </button>
          </div>
        </div>
      )}

      {/* MODALE FORMULAIRE ÉDUCATION */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-6 sm:p-10 shadow-2xl">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-6 right-6 text-stone-600 cursor-pointer z-50">✕</button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4">✓</div>
                <h3 className="text-xl font-black text-stone-900">Demande envoyée !</h3>
                <p className="text-xs text-stone-500 mt-2">Nous allons vous recontacter très vite pour fixer la date de votre {formData.sessionType === 'bilan' ? 'bilan' : 'séance'}.</p>
                <a href="/espace-membre" className="mt-6 inline-block px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full cursor-pointer">Aller sur Mon Espace</a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-black uppercase text-orange-600">Étape {step} sur 3</span>
                    <h3 className="text-lg font-black text-stone-900">
                      {step === 1 && "Choix du chien"}
                      {step === 2 && "Type de séance & Lieu"}
                      {step === 3 && "Disponibilités & Objectifs"}
                    </h3>
                  </div>
                </div>

                {/* ÉTAPE 1 : CHOIX DU CHIEN */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in">
                    
                    {user && (
                      <ClientDogSelector
                        isAdmin={false}
                        currentUserId={user.id}
                        onDogSelected={(dog) =>
                          setFormData({
                            ...formData,
                            dog_id: dog.id,
                            dogName: dog.name,
                            dogBreed: dog.breed,
                            dogAge: calculateDogAge(dog.birth_date || ""),
                          })
                        }
                      />
                    )}

                    {formData.dog_id && !canBookSuivi && !canBookBilan && (
                      <div className="p-4 mt-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium text-center">
                        ⚠️ Vous avez déjà une demande de Bilan en cours pour ce chien.
                      </div>
                    )}

                    <div className="pt-4 flex justify-end border-t border-stone-100 mt-4">
                      <button 
                        type="button" 
                        disabled={!formData.dog_id || (!canBookSuivi && !canBookBilan)} 
                        onClick={() => {
                          if (!canBookSuivi) {
                            setFormData(prev => ({ ...prev, sessionType: "bilan" }));
                          } else if (!canBookBilan) {
                            setFormData(prev => ({ ...prev, sessionType: "suivi" }));
                          }
                          setStep(2);
                        }} 
                        className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full disabled:opacity-40 cursor-pointer shadow-md hover:bg-stone-800 transition"
                      >
                        Suivant ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 2 : Type de séance et Lieu */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in">

                    <div className="space-y-3">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500">Nature de la demande</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button" 
                          disabled={!canBookBilan}
                          onClick={() => setFormData({ ...formData, sessionType: "bilan", preferredSlot: "", scheduledDate: "" })} 
                          className={`p-4 rounded-2xl border text-left transition-all ${!canBookBilan ? "opacity-50 grayscale cursor-not-allowed bg-stone-50" : formData.sessionType === "bilan" ? "border-orange-500 bg-orange-50 shadow-sm cursor-pointer" : "border-stone-200 bg-white hover:border-orange-300 cursor-pointer"}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-black text-sm ${formData.sessionType === "bilan" ? "text-orange-900" : "text-stone-800"}`}>Bilan Initial</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.sessionType === "bilan" ? "border-orange-500" : "border-stone-300"}`}>
                              {formData.sessionType === "bilan" && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                            </div>
                          </div>
                          <span className={`text-[10px] mt-1 block ${!canBookBilan ? "font-bold text-red-500" : "text-stone-500"}`}>
                            {!canBookBilan ? (hasPendingBilan ? "Demande en cours" : "Bilan déjà valide") : "1er rdv obligatoire"}
                          </span>
                        </button>

                        <button 
                          type="button" 
                          disabled={!canBookSuivi}
                          onClick={() => setFormData({ ...formData, sessionType: "suivi", preferredSlot: "", scheduledDate: "" })} 
                          className={`p-4 rounded-2xl border text-left transition-all ${!canBookSuivi ? "opacity-50 grayscale cursor-not-allowed bg-stone-50" : formData.sessionType === "suivi" ? "border-orange-500 bg-orange-50 shadow-sm cursor-pointer" : "border-stone-200 bg-white hover:border-orange-300 cursor-pointer"}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-black text-sm ${formData.sessionType === "suivi" ? "text-orange-900" : "text-stone-800"}`}>Suivi / Séance</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.sessionType === "suivi" ? "border-orange-500" : "border-stone-300"}`}>
                              {formData.sessionType === "suivi" && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                            </div>
                          </div>
                          <span className={`text-[10px] mt-1 block font-bold ${!canBookSuivi ? "text-red-500" : "text-stone-500 font-normal"}`}>
                            {!canBookSuivi ? "Bilan terminé et valide (- de 1 an) requis" : "Client existant"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500">Lieu de la séance</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setFormData({ ...formData, location: "terrain", preferredSlot: "", scheduledDate: "" })} className={`p-4 rounded-2xl border text-left transition-all ${formData.location === "terrain" ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-stone-200 bg-white hover:border-emerald-300 cursor-pointer"}`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-black text-sm ${formData.location === "terrain" ? "text-emerald-900" : "text-stone-800"}`}>Sur Terrain</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.location === "terrain" ? "border-emerald-500" : "border-stone-300"}`}>
                              {formData.location === "terrain" && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                            </div>
                          </div>
                          <span className="text-[10px] text-stone-500 mt-1 block">Tarif standard</span>
                        </button>

                        <button type="button" onClick={() => setFormData({ ...formData, location: "domicile", preferredSlot: "", scheduledDate: "" })} className={`p-4 rounded-2xl border text-left transition-all ${formData.location === "domicile" ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-stone-200 bg-white hover:border-emerald-300 cursor-pointer"}`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-black text-sm ${formData.location === "domicile" ? "text-emerald-900" : "text-stone-800"}`}>À Domicile</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.location === "domicile" ? "border-emerald-500" : "border-stone-300"}`}>
                              {formData.location === "domicile" && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                            </div>
                          </div>
                          <span className="text-[10px] text-stone-500 mt-1 block">+ Frais déplacement</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center border-t border-stone-100">
                      <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer">← Retour</button>
                      <button type="button" onClick={() => setStep(3)} className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full cursor-pointer shadow-md hover:bg-stone-800 transition">
                        Suivant ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 3 : Disponibilités & Objectifs */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in">

                    {/* Résumé de la demande avec Tarif */}
                    <div className="bg-stone-900 text-white p-6 rounded-[2rem] shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">Montant indicatif</span>
                        <div className="text-3xl font-black mt-1">
                          {getEstimatedPrice()}€
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">
                          {formData.sessionType === "bilan" ? "Bilan (1h30)" : "Séance (1h)"} • {formData.location === "domicile" ? "À domicile (+20€ dép.)" : "Sur terrain"}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-xl">
                        💳
                      </div>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-[2rem] border border-stone-200">
                      {/* INTÉGRATION DU CALENDRIER INTELLIGENT */}
                      <EducationCalendar 
                        location={formData.location}
                        selectedDate={formData.scheduledDate}
                        selectedTime={formData.preferredSlot}
                        selectedDogId={formData.dog_id} 
                        onChange={(date, time) => setFormData({ ...formData, scheduledDate: date, preferredSlot: time })}
                      />
                    </div>

                    <div className="w-full min-w-0">
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                        {formData.sessionType === "bilan" ? "Que souhaitez-vous travailler ? *" : "Objectif de la séance *"}
                      </label>
                      <textarea 
                        required 
                        rows={3} 
                        placeholder={formData.sessionType === "bilan" ? "Expliquez brièvement vos attentes pour ce premier bilan..." : "Point spécifique à réviser aujourd'hui..."}
                        value={formData.objectives} 
                        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })} 
                        className="w-full max-w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" 
                      />
                    </div>

                    {/* On affiche les problèmes spécifiques UNIQUEMENT lors d'un bilan initial */}
                    {formData.sessionType === "bilan" && (
                      <div className="animate-in slide-in-from-top-2">
                        <label className="block text-xs font-bold uppercase text-stone-600 mb-2">Comportements à signaler (Facultatif)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Aboiements excessifs", "Destruction", "Malpropreté", "Tire en laisse", "Réactivité congénères", "Réactivité humains", "Anxiété de séparation", "Fugue"].map((issue) => (
                            <label key={issue} className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-white cursor-pointer hover:bg-stone-50 transition-colors shadow-sm">
                              <input 
                                type="checkbox" 
                                checked={formData.issues.includes(issue)} 
                                onChange={() => toggleIssue(issue)} 
                                className="rounded text-orange-600 focus:ring-orange-500" 
                              />
                              <span className="text-[11px] font-medium text-stone-700">{issue}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="w-full min-w-0">
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Téléphone *</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="06 12 34 56 78" 
                        value={formData.clientPhone} 
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} 
                        className="w-full max-w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" 
                      />
                    </div>

                    <div className="pt-4 flex justify-between items-center border-t border-stone-100">
                      <button type="button" onClick={() => setStep(2)} className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer">← Retour</button>
                      <button type="submit" disabled={submitting || !formData.clientPhone || !formData.scheduledDate || !formData.preferredSlot} className="px-8 py-3.5 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-full cursor-pointer shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100">
                        {submitting ? "Envoi en cours..." : "Valider la demande"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}