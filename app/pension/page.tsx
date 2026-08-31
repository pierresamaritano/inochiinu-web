"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";
import ClientDogSelector from "../components/ClientDogSelector";
import PensionCalendar from "../components/PensionCalendar";

// IMPORTS DES COMPOSANTS MAÎTRES 
import AppleCarousel, { CarouselSlide } from "../components/AppleCarousel";
import ContactSection from "../components/ContactSection";

const BUCKET_URL = "https://qvybupsibujplkykufja.supabase.co/storage/v1/object/public/media";

export default function PensionPage() {
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
  const [hasSecondDog, setHasSecondDog] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  
  const [formData, setFormData] = useState({
    dog_id: "", dogName: "", dogBreed: "", dog2_id: "", dog2Name: "", dog2Breed: "",
    startDate: "", endDate: "", clientPhone: "", specialNeeds: "",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    fetchUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const slides = [
    { title: "6 Boxs Spacieux & Isolés", subtitle: "Un confort thermique total été comme hiver avec accès direct à des courettes individuelles sécurisées.", tag: "Capacité Limitée", gradient: "from-emerald-950/90 via-stone-900/60 to-black/80" },
    { title: "Grands Parcs de Détente Arborés", subtitle: "Sorties régulières quotidiennes, jeux et interactions contrôlées selon les affinités.", tag: "Dépense & Éveil", gradient: "from-stone-900/90 via-stone-900/60 to-black/80" },
    { title: "Journal de Bord Photo Quotidien", subtitle: "Recevez chaque jour des nouvelles et des clichés de votre chien directement sur votre Espace Membre.", tag: "Suivi Digital", gradient: "from-orange-950/90 via-stone-900/60 to-black/80" },
  ];

  const pensionCarouselSlides: CarouselSlide[] = [
    {
      src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=2000&auto=format&fit=crop", 
      alt: "Chiens jouant dans les parcs",
      tag: "Jeux & Liberté",
      caption: "Détente en plein air et interactions dans nos parcs arborés.",
    },
    {
      src: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=2000&auto=format&fit=crop", 
      alt: "Box confortable",
      tag: "Confort Premium",
      caption: "6 boxs spacieux, isolés et climatisés avec courette.",
    },
    {
      src: "https://images.unsplash.com/photo-1558009250-d4d21628e717?q=80&w=2000&auto=format&fit=crop", 
      alt: "Surveillance",
      tag: "Sécurité 24/7",
      caption: "Surveillance vidéo continue pour une tranquillité absolue.",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeToNext(6000);
    }, timeToNext);
    return () => clearTimeout(timer);
  }, [currentSlide, timeToNext, slides.length]);

  const handleUserInteraction = () => setTimeToNext(12000);

  const nextSlide = () => { handleUserInteraction(); setCurrentSlide((prev) => (prev + 1) % slides.length); };
  const prevSlide = () => { handleUserInteraction(); setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length); };
  const goToSlide = (index: number) => { handleUserInteraction(); setCurrentSlide(index); };

  const handleInitialClick = () => {
    const hideInfo = localStorage.getItem("hidePensionInfo");
    if (hideInfo === "true") { handleActionClick(); } else { setShowInfoModal(true); }
  };

  const handleContinueFromInfo = () => {
    if (dontShowAgain) { localStorage.setItem("hidePensionInfo", "true"); }
    setShowInfoModal(false);
    handleActionClick();
  };

  const handleActionClick = () => {
    if (user) { setIsFormOpen(true); } else { setIsAuthOpen(true); }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      setAuthError("");
      const redirectUrl = `${window.location.origin}/auth/callback?next=/pension`;
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectUrl } });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message);
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setIsAuthOpen(false);
        setIsFormOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError("Email ou mot de passe incorrect.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.dog_id) { alert("Veuillez sélectionner au moins un premier chien."); return; }
    if (hasSecondDog && !formData.dog2_id) { alert("Veuillez sélectionner le deuxième chien, ou décochez l'option."); return; }

    setSubmitting(true);
    try {
      const finalDogName = hasSecondDog ? `${formData.dogName} & ${formData.dog2Name}` : formData.dogName;
      const finalDogBreed = hasSecondDog ? `${formData.dogBreed} - ${formData.dog2Breed}` : formData.dogBreed;
      
      const { error } = await supabase.from("pension_bookings").insert([{
        user_id: user.id,
        dog_id: formData.dog_id || null,
        client_name: user.user_metadata?.full_name || "Client",
        client_email: user.email,
        client_phone: formData.clientPhone,
        dog_name: finalDogName,
        dog_breed: finalDogBreed,
        start_date: formData.startDate,
        end_date: formData.endDate,
        special_needs: formData.specialNeeds,
        status: "en_attente",
      }]);
      
      if (error) {
        console.error("Erreur Supabase :", error);
        alert(`Erreur de réservation : ${error.message}`);
        setSubmitting(false);
        return;
      }
      
      setSubmitted(true);
    } catch (err: any) {
      console.error("Erreur application :", err);
      alert(`Erreur : ${err.message || "Veuillez réessayer."}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-orange-200 selection:text-stone-900">
      
      <div className="absolute top-0 inset-x-0 h-[100vh] overflow-hidden pointer-events-none z-0 transform-gpu">
        <div className="absolute top-[10%] left-[-20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0) 70%)' }} />
        <div className="absolute top-[40%] right-[-20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0) 70%)' }} />
      </div>

      <LiquidNavbar />

      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-6 text-center px-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-50/70 backdrop-blur-md px-4 py-1 text-xs font-bold text-orange-700 shadow-sm">
          <span>Garde Sérénité & Sécurité</span>
        </div>
        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          Pension Canine <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Tout Confort</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-stone-600 sm:text-base">
          Capacité limitée à 6 places pour un accueil ultra-personnalisé, attentif et respectueux du rythme naturel de votre animal.
        </p>
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
          <p className="text-sm font-bold text-red-700 leading-relaxed">
            Actuellement en recherche de notre futur terrain, l'ouverture est prévue d'ici mi-2027.<br className="hidden sm:block" />
            Rejoignez nous sur instagram pour suivre la construction de la pension ! 
          </p>
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-stone-900 shadow-md min-h-[220px] sm:min-h-[240px] flex items-center">
          
          <div className="absolute inset-y-0 left-0 w-1/2 z-20 cursor-pointer" onClick={prevSlide} />
          <div className="absolute inset-y-0 right-0 w-1/2 z-20 cursor-pointer" onClick={nextSlide} />

          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 flex flex-col justify-center px-8 sm:px-14 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
              <div className="relative z-10 max-w-xl text-white pointer-events-none">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-white/10 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/10 inline-block mb-2">
                  {slide.tag}
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                  {slide.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}

          <button onClick={prevSlide} className="absolute left-4 z-30 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md cursor-pointer">←</button>
          <button onClick={nextSlide} className="absolute right-4 z-30 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md cursor-pointer">→</button>

          <div className="absolute bottom-4 inset-x-0 z-30 flex justify-center gap-1.5 pointer-events-none">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer pointer-events-auto ${
                  index === currentSlide ? "w-5 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-stone-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-black tracking-tight text-stone-900">Réserver un séjour en pension</h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-medium">Vérifiez la disponibilité de nos 6 boxs et bloquez vos dates en toute tranquillité.</p>
          </div>
          <button onClick={handleInitialClick} className="w-full sm:w-auto shrink-0 flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-7 font-bold text-xs uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(249,115,22,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] transition hover:scale-105 hover:brightness-105 cursor-pointer">
            Réserver un séjour
          </button>
        </div>
      </section>

      <section className="relative z-10 border-t border-stone-200/60 bg-transparent py-16">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">Infrastructures & Bien-Être</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 mt-1">Un cadre conçu pour leur confort</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">6 Boxs Uniquement</span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">Espaces Individuels</h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">Boxs carrelés, isolés et nettoyés quotidiennement avec literie confortable et accès direct à une courette privée.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-bold text-stone-400">Hygiène rigoureuse</div>
            </div>
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">Détente & Liberté</span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">Parcs Clôturés</h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">Plusieurs parcs arborés et sécurisés pour des moments de liberté totale, des jeux de flair et des baignades en été.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-bold text-stone-400">Clôtures haute sécurité 2m</div>
            </div>
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">Caméras & Climatisation</span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">Sécurité & Confort</h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">Surveillance vidéo continue 24h/24, espace intérieur thermorégulé avec chauffage l'hiver et climatisation l'été.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-bold text-stone-400">Technologie au service du chien</div>
            </div>
          </div>
        </div>
      </section>

      <AppleCarousel slides={pensionCarouselSlides} />

      <ContactSection />

      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowInfoModal(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <button onClick={() => setShowInfoModal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 cursor-pointer">✕</button>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4 text-xl">ℹ️</div>
            <h3 className="text-xl font-black text-stone-900">Avant de réserver...</h3>
            <div className="mt-4 space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>Pour garantir la sécurité et le bien-être de tous nos pensionnaires, voici nos prérequis :</p>
              <ul className="list-disc pl-5 space-y-1 font-medium text-stone-700">
                <li><strong className="text-stone-900">Vaccins à jour obligatoires</strong> (incluant la toux du chenil).</li>
                <li>Chien identifié (puce ou tatouage).</li>
                <li>Traitement antiparasitaire de moins d'un mois.</li>
              </ul>
              <p className="text-xs text-stone-500 italic">Un justificatif vous sera demandé à votre arrivée.</p>
            </div>
            <label className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-stone-100 border border-stone-200 cursor-pointer hover:bg-stone-200/50 transition-colors">
              <input type="checkbox" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer" />
              <span className="text-xs font-bold text-stone-600">J'ai compris, ne plus afficher ce message.</span>
            </label>
            <button onClick={handleContinueFromInfo} className="mt-6 w-full py-3.5 bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-stone-800 transition-all cursor-pointer shadow-md">
              Continuer vers la réservation
            </button>
          </div>
        </div>
      )}

      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAuthOpen(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 shadow-2xl backdrop-blur-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-6 right-6 text-stone-600 cursor-pointer">✕</button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm">犬</div>
              <h3 className="text-2xl font-black text-stone-900">Connexion requise</h3>
              <p className="mt-2 text-sm text-stone-500 font-medium">Connectez-vous pour demander une réservation et recevoir vos photos quotidiennes.</p>
            </div>

            {authError && <p className="mt-4 text-xs font-bold text-red-500 text-center bg-red-50 p-2 rounded-lg">{authError}</p>}

            <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
              <div>
                <input 
                  type="email" 
                  required 
                  placeholder="Votre adresse e-mail" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" 
                />
              </div>
              <div>
                <input 
                  type="password" 
                  required 
                  placeholder="Votre mot de passe" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" 
                />
              </div>
              <button 
                type="submit" 
                disabled={authLoading} 
                className="w-full py-3.5 bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-stone-800 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {authLoading ? "Chargement..." : (isSignUp ? "Créer mon compte" : "Se connecter par e-mail")}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer underline underline-offset-2"
              >
                {isSignUp ? "Déjà un compte ? Connectez-vous" : "Pas de compte ? Inscrivez-vous"}
              </button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200"></div>
              <span className="text-[10px] font-black uppercase text-stone-400">Ou</span>
              <div className="flex-1 h-px bg-stone-200"></div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              disabled={authLoading} 
              className="flex h-13 w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white px-6 font-bold text-stone-800 shadow-sm hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span>Continuer avec Google</span>
            </button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-6 sm:p-10 shadow-2xl">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-6 right-6 text-stone-600 cursor-pointer">✕</button>
            {submitted ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4">✓</div>
                <h3 className="text-xl font-black text-stone-900">Demande de séjour reçue !</h3>
                <p className="text-xs text-stone-500 mt-2">Nous vérifions le planning des 6 boxs et validons votre demande rapidement.</p>
                <a href="/espace-membre" className="mt-6 inline-block px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full cursor-pointer">Aller sur Mon Espace</a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-black uppercase text-orange-600">Étape {step} sur 2</span>
                    <h3 className="text-lg font-black text-stone-900">{step === 1 ? "Dates & Chien(s)" : "Besoins & Contact"}</h3>
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="mb-6">
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-3">Sélectionnez vos dates *</label>
                      <PensionCalendar 
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        onChange={(start, end) => setFormData(prev => ({ ...prev, startDate: start, endDate: end }))}
                      />
                    </div>
                    {user && (
                      <>
                        <ClientDogSelector
                          isAdmin={false}
                          currentUserId={user.id}
                          onDogSelected={(dog) =>
                            setFormData(prev => ({ ...prev, dog_id: dog.id, dogName: dog.name, dogBreed: dog.breed }))
                          }
                        />
                        <div className="mt-2">
                          {!hasSecondDog ? (
                            <button
                              type="button"
                              onClick={() => setHasSecondDog(true)}
                              className="text-[11px] font-black text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-1"
                            >
                              + Ajouter un deuxième chien (même box)
                            </button>
                          ) : (
                            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 relative mt-4">
                              <button 
                                type="button" 
                                onClick={() => {
                                  setHasSecondDog(false);
                                  setFormData(prev => ({ ...prev, dog2_id: "", dog2Name: "", dog2Breed: "" }));
                                }}
                                className="absolute top-3 right-3 text-[10px] font-bold text-stone-400 hover:text-red-500 cursor-pointer"
                              >
                                ✕ Retirer
                              </button>
                              <p className="text-[10px] font-black uppercase text-orange-700 mb-3">Deuxième pensionnaire</p>
                              <ClientDogSelector
                                isAdmin={false}
                                currentUserId={user.id}
                                excludeDogId={formData.dog_id}
                                onDogSelected={(dog) =>
                                  setFormData(prev => ({ ...prev, dog2_id: dog.id, dog2Name: dog.name, dog2Breed: dog.breed }))
                                }
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="pt-4 flex justify-end">
                      <button 
                        type="button" 
                        disabled={!formData.startDate || !formData.endDate || !formData.dog_id || (hasSecondDog && !formData.dog2_id)} 
                        onClick={() => setStep(2)} 
                        className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full disabled:opacity-40 cursor-pointer transition-opacity"
                      >
                        Suivant ➔
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Téléphone de contact *</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="06 12 34 56 78" 
                        value={formData.clientPhone} 
                        onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))} 
                        className="w-full max-w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Besoins spécifiques / Alimentation / Médicaments</label>
                      <textarea 
                        rows={3} 
                        placeholder="Précisez le type de croquettes, allergies, compatibilité congénères..." 
                        value={formData.specialNeeds} 
                        onChange={(e) => setFormData(prev => ({ ...prev, specialNeeds: e.target.value }))} 
                        className="w-full max-w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" 
                      />
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-stone-500 cursor-pointer hover:text-stone-900">← Retour</button>
                      <button type="submit" disabled={submitting} className="px-6 py-3 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase rounded-full cursor-pointer shadow-md disabled:opacity-50 transition-all">{submitting ? "Envoi..." : "Envoyer ma demande"}</button>
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