"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";
import ClientDogSelector from "../components/ClientDogSelector";

// IMPORTS DES COMPOSANTS MAÎTRES
import AppleCarousel, { CarouselSlide } from "../components/AppleCarousel";
import ContactSection from "../components/ContactSection";

export default function EducationPage() {
  const [user, setUser] = useState<any>(null);
  
  // --- CARROUSEL DES VALEURS HERO ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeToNext, setTimeToNext] = useState(6000);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // ÉTATS POUR LE POP-UP D'INFORMATION PRÉALABLE
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<{
    dog_id: string;
    dogName: string;
    dogBreed: string;
    dogAge: string;
    objectives: string;
    issues: string[];
    preferredSlot: string;
    clientPhone: string;
  }>({
    dog_id: "",
    dogName: "",
    dogBreed: "",
    dogAge: "",
    objectives: "",
    issues: [],
    preferredSlot: "Semaine en matinée",
    clientPhone: "",
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

  // Slides pour le Carrousel Texte (Hero)
  const slides = [
    {
      title: "Bilan Comportemental Initial",
      subtitle: "Une analyse complète à domicile ou sur terrain pour comprendre les besoins spécifiques de votre chien.",
      tag: "Évaluation",
      gradient: "from-orange-950/90 via-stone-900/60 to-black/80",
    },
    {
      title: "Cours Individuels Sur-Mesure",
      subtitle: "Travail des ordres de base, marche en laisse, rappel et gestion des troubles (réactivité, anxiété).",
      tag: "Progression",
      gradient: "from-stone-900/90 via-stone-900/60 to-black/80",
    },
    {
      title: "Promenades Éducatives & Socialisation",
      subtitle: "Mise en pratique en situation réelle avec des congénères codés pour renforcer les bons comportements.",
      tag: "En groupe",
      gradient: "from-amber-950/90 via-stone-900/60 to-black/80",
    },
  ];

  // Slides Images pour le composant AppleCarousel
  const educationCarouselSlides: CarouselSlide[] = [
    {
      src: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1080&auto=format&fit=crop",
      alt: "Chien attentif en éducation",
      tag: "Écoute & Complicité",
      caption: "Apprendre à communiquer avec son chien dans le calme.",
    },
    {
      src: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?q=80&w=1080&auto=format&fit=crop",
      alt: "Chien en extérieur",
      tag: "Mise en situation",
      caption: "Travail en environnement réel pour des résultats durables.",
    },
    {
      src: "https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=1080&auto=format&fit=crop",
      alt: "Maître et chien",
      tag: "Relation de confiance",
      caption: "Renforcer le lien maître-chien par le jeu et la positivité.",
    }
  ];

  // LOGIQUE DU MINUTEUR INTELLIGENT
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
    const hideInfo = localStorage.getItem("hideEducationInfo");
    if (hideInfo === "true") {
      handleActionClick();
    } else {
      setShowInfoModal(true);
    }
  };

  const handleContinueFromInfo = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideEducationInfo", "true");
    }
    setShowInfoModal(false);
    handleActionClick();
  };

  const handleActionClick = () => {
    if (user) {
      setIsFormOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const redirectUrl = `${window.location.origin}/auth/callback?next=/education`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setAuthLoading(false);
    }
  };

  const toggleIssue = (issue: string) => {
    setFormData((prev) => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter((i) => i !== issue)
        : [...prev.issues, issue],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.dog_id) {
      alert("Veuillez sélectionner ou ajouter un chien pour la réservation.");
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
          issues: formData.issues,
          preferred_slot: formData.preferredSlot,
          status: "en_attente",
        },
      ]);
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-orange-200 selection:text-stone-900">
      
      {/* HALOS FAUVE (Optimisés pour iOS) */}
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
          Éducation &{" "}
          <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Comportement Canin
          </span>
        </h1>
        
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-stone-600 sm:text-base">
          Des méthodes bienveillantes, claires et adaptées à la psychologie de votre chien pour bâtir une relation de confiance et de respect mutuel.
        </p>
      </section>

      {/* CARROUSEL VALEURS HERO */}
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
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-white/10 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/10 inline-block mb-2">
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
            <h2 className="text-xl font-black tracking-tight text-stone-900">
              Réserver votre Bilan Initial
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-medium">
              Première étape obligatoire. Nous analysons ensemble le comportement de votre chien pour établir un plan de travail.
            </p>
          </div>
          <button
            onClick={handleInitialClick}
            className="w-full sm:w-auto shrink-0 flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-7 font-bold text-xs uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(249,115,22,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] transition hover:scale-105 hover:brightness-105 cursor-pointer"
          >
            Prendre rendez-vous
          </button>
        </div>
      </section>

      <section className="relative z-10 border-t border-stone-200/60 bg-transparent py-16">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              Notre Approche
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 mt-1">
              Travailler avec la nature du chien
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  Étape 1
                </span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">
                  Comprendre & Analyser
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">
                  Le bilan permet d'identifier les causes profondes d'un comportement (peur, frustration, génétique) avant d'appliquer toute solution.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  Étape 2
                </span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">
                  Éduquer & Cadrer
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">
                  Mise en place de règles claires, apprentissage de la frustration et renforcement des comportements positifs.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  Étape 3
                </span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">
                  Socialiser & Généraliser
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">
                  Travail en extérieur, en ville et en présence de chiens régulateurs pour assurer un comportement stable en toute circonstance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPEL DU CARROUSEL MAÎTRE AVEC LES IMAGES "ÉDUCATION" */}
      <AppleCarousel slides={educationCarouselSlides} />

      {/* APPEL DU COMPOSANT CONTACT */}
      <ContactSection />

      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {/* NOUVEAU POP-UP : MODALE D'INFORMATION PRÉALABLE */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setShowInfoModal(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl">
            <button onClick={() => setShowInfoModal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 cursor-pointer">✕</button>
            
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4 text-xl">
              ℹ️
            </div>
            <h3 className="text-xl font-black text-stone-900">Déroulement des séances</h3>
            
            <div className="mt-4 space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>Avant de démarrer le travail éducatif avec votre chien, veuillez noter que :</p>
              <ul className="list-disc pl-5 space-y-1 font-medium text-stone-700">
                <li><strong className="text-stone-900">Le premier rendez-vous est toujours un bilan comportemental.</strong> (Indispensable pour créer un programme adapté).</li>
                <li>La présence et l'implication du maître sont obligatoires à chaque séance.</li>
                <li>Les vaccins de votre chien doivent être à jour.</li>
              </ul>
            </div>

            <label className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-stone-100 border border-stone-200 cursor-pointer hover:bg-stone-200/50 transition-colors">
              <input 
                type="checkbox" 
                checked={dontShowAgain} 
                onChange={(e) => setDontShowAgain(e.target.checked)} 
                className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer" 
              />
              <span className="text-xs font-bold text-stone-600">J'ai compris, ne plus afficher ce message.</span>
            </label>

            <button
              onClick={handleContinueFromInfo}
              className="mt-6 w-full py-3.5 bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-stone-800 transition-all cursor-pointer shadow-md"
            >
              Continuer vers la demande
            </button>
          </div>
        </div>
      )}

      {/* MODALE CONNEXION */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setIsAuthOpen(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-6 right-6 text-stone-600 cursor-pointer">✕</button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm">犬</div>
              <h3 className="text-2xl font-black text-stone-900">Connexion requise</h3>
              <p className="mt-2 text-sm text-stone-500 font-medium">Connectez-vous pour prendre un rendez-vous d'éducation et suivre l'évolution.</p>
            </div>
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="mt-8 flex h-13 w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white px-6 font-bold text-stone-800 shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>{authLoading ? "Redirection..." : "Continuer avec Google"}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODALE FORMULAIRE ÉDUCATION */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-6 sm:p-10 shadow-2xl">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-6 right-6 text-stone-600 cursor-pointer">✕</button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4">✓</div>
                <h3 className="text-xl font-black text-stone-900">Demande envoyée !</h3>
                <p className="text-xs text-stone-500 mt-2">Nous allons vous recontacter très vite pour fixer la date de votre bilan.</p>
                <a href="/espace-membre" className="mt-6 inline-block px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full cursor-pointer">Aller sur Mon Espace</a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-black uppercase text-orange-600">Étape {step} sur 2</span>
                    <h3 className="text-lg font-black text-stone-900">{step === 1 ? "Chien & Objectifs" : "Problématiques & Dispos"}</h3>
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-4">
                    
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
                          })
                        }
                      />
                    )}

                    <div className="w-full min-w-0">
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Âge du chien *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: 8 mois, 2 ans..." 
                        value={formData.dogAge} 
                        onChange={(e) => setFormData({ ...formData, dogAge: e.target.value })} 
                        className="w-full max-w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" 
                      />
                    </div>

                    <div className="w-full min-w-0">
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Que souhaitez-vous travailler ? *</label>
                      <textarea 
                        required 
                        rows={3} 
                        placeholder="Expliquez brièvement vos attentes..." 
                        value={formData.objectives} 
                        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })} 
                        className="w-full max-w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" 
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button 
                        type="button" 
                        disabled={!formData.dog_id || !formData.dogAge || !formData.objectives} 
                        onClick={() => setStep(2)} 
                        className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full disabled:opacity-40 cursor-pointer shadow-md"
                      >
                        Suivant ➔
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-2">Avez-vous remarqué ces comportements ?</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Aboiements excessifs", "Destruction", "Malpropreté", "Tire en laisse", "Réactivité congénères", "Réactivité humains", "Anxiété de séparation", "Fugue / Rappel difficile"].map((issue) => (
                          <label key={issue} className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="w-full min-w-0">
                        <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Disponibilité *</label>
                        <select 
                          value={formData.preferredSlot} 
                          onChange={(e) => setFormData({ ...formData, preferredSlot: e.target.value })} 
                          className="w-full max-w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          <option value="Semaine en matinée">Semaine en matinée</option>
                          <option value="Semaine en après-midi">Semaine en après-midi</option>
                          <option value="Week-end">Week-end</option>
                        </select>
                      </div>
                      <div className="w-full min-w-0">
                        <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Téléphone *</label>
                        <input 
                          type="tel" 
                          required 
                          placeholder="06 12 34 56 78" 
                          value={formData.clientPhone} 
                          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} 
                          className="w-full max-w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" 
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <button 
                        type="button" 
                        onClick={() => setStep(1)} 
                        className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
                      >
                        ← Retour
                      </button>
                      <button 
                        type="submit" 
                        disabled={submitting || !formData.clientPhone} 
                        className="px-6 py-3 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase rounded-full cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {submitting ? "Envoi..." : "Valider mon bilan"}
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