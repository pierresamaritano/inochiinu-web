"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";

export default function EducationPage() {
  const [user, setUser] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Formulaire & Réservation
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    dogName: "",
    dogBreed: "",
    dogAge: "",
    clientPhone: "",
    formula: "Bilan Comportemental Initial",
    issues: [] as string[],
    objectives: "",
    preferredSlot: "Semaine en matinée",
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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Slides du Carrousel
  const slides = [
    {
      title: "Bilan Comportemental & Analyse Éthologique",
      subtitle: "Comprendre les motivations profondes et restaurer une communication claire",
      tag: "Fondation",
      gradient: "from-stone-900/80 via-stone-900/40 to-black/80",
      bgClass: "bg-gradient-to-br from-stone-800 to-stone-950",
    },
    {
      title: "Gestion des Émotions & Réactivité",
      subtitle: "Désensibilisation bienveillante face aux congénères et aux stimuli urbains",
      tag: "Spécialisation",
      gradient: "from-orange-950/80 via-stone-900/40 to-black/80",
      bgClass: "bg-gradient-to-br from-orange-950 to-stone-900",
    },
    {
      title: "École du Chiot & Socialisation Positive",
      subtitle: "Apprentissage naturel du rappel, marche sans tension et auto-contrôles",
      tag: "Chiots & Primitifs",
      gradient: "from-stone-900/80 via-stone-900/40 to-black/80",
      bgClass: "bg-gradient-to-br from-stone-900 to-amber-950",
    },
  ];

  // Défilement automatique du carrousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const availableIssues = [
    "Marche en laisse & tractions",
    "Rappel & écoute en liberté",
    "Réactivité congénères / humains",
    "Destruction & anxiété de solitude",
    "Saut & excitation intense",
    "Éveil & socialisation du chiot",
  ];

  const toggleIssue = (issue: string) => {
    setFormData((prev) => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter((i) => i !== issue)
        : [...prev.issues, issue],
    }));
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
      console.error("Erreur de connexion :", err);
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("education_requests").insert([
        {
          user_id: user.id,
          client_name: user.user_metadata?.full_name || "Client",
          client_email: user.email,
          client_phone: formData.clientPhone,
          dog_name: formData.dogName,
          dog_breed: formData.dogBreed,
          dog_age: formData.dogAge,
          issues: formData.issues,
          objectives: `Formule: ${formData.formula} | ${formData.objectives}`,
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
    <>
      <LiquidNavbar />

      <main className="min-h-screen bg-[#FDFCF8] text-stone-800 pt-28 sm:pt-32 px-4 sm:px-8 pb-24">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* 1. EN-TÊTE COMPACT */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200/60 mb-3 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-700">
                Éducation & Éthologie
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Éducation Canine & Bilan
            </h1>
            <p className="mt-2 text-stone-500 text-sm sm:text-base font-medium">
              Une approche cohérente, respectueuse et adaptée au tempérament naturel de votre chien.
            </p>
          </div>

          {/* 2. CARROUSEL INTERACTIF */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-200/80 shadow-lg min-h-[320px] sm:min-h-[380px] flex items-end">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 flex flex-col justify-end p-8 sm:p-12 ${slide.bgClass} ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-t ${slide.gradient}`} />
                
                <div className="relative z-10 max-w-xl text-white">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 inline-block mb-3">
                    {slide.tag}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                    {slide.title}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            ))}

            {/* Indicateurs de pagination du carrousel */}
            <div className="absolute top-6 right-6 z-20 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* 3. BOUTON D'ACTION PRINCIPAL SOUS LE CARROUSEL */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-stone-900">
                Prêt à débuter ou à perfectionner le suivi ?
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                Prenez rendez-vous pour un bilan comportemental ou réservez votre séance individuelle.
              </p>
            </div>

            <button
              onClick={handleActionClick}
              className="w-full sm:w-auto shrink-0 px-8 py-4 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-full hover:brightness-105 shadow-[0_4px_16px_rgba(249,115,22,0.3)] active:scale-95 transition-all"
            >
              Prendre un cours / Réserver
            </button>
          </div>

          {/* 4. PRÉSENTATION DES COURS & FORMULES */}
          <section className="space-y-8">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                Prestations & Pédagogie
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1">
                Nos Programmes d'Éducation
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                    Étape 1 Obligatoire
                  </span>
                  <h3 className="text-xl font-black text-stone-900 mt-4">
                    Bilan Comportemental
                  </h3>
                  <p className="text-xs text-stone-500 mt-3 leading-relaxed">
                    Séance complète de 1h30 à domicile ou en extérieur : analyse de l'environnement, des signaux de communication et définition du plan d'action personnalisé.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400">Durée : 1h30</span>
                  <span className="text-xs font-black text-stone-900">Sur rendez-vous</span>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                    Individualisé
                  </span>
                  <h3 className="text-xl font-black text-stone-900 mt-4">
                    Séances Individuelles
                  </h3>
                  <p className="text-xs text-stone-500 mt-3 leading-relaxed">
                    Travail en situation réelle (forêt, milieu urbain, parcs) : rappel sous forte distraction, marche en laisse sans tension et renforcement des auto-contrôles.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400">Durée : 1h00</span>
                  <span className="text-xs font-black text-stone-900">Terrain & Extérieur</span>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                    Socialisation
                  </span>
                  <h3 className="text-xl font-black text-stone-900 mt-4">
                    Balades Éducatives
                  </h3>
                  <p className="text-xs text-stone-500 mt-3 leading-relaxed">
                    Sorties collectives encadrées en petits groupes pour travailler la communication interspécifique, la tolérance aux congénères et la sérénité en liberté.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400">Groupe restreint</span>
                  <span className="text-xs font-black text-stone-900">Tous niveaux</span>
                </div>
              </div>
            </div>
          </section>

          {/* 5. PRÉSENTATION DE L'ÉDUCATEUR & PHILOSOPHIE */}
          <section className="p-8 sm:p-12 rounded-[2.5rem] bg-stone-900 text-white border border-stone-800 shadow-xl">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                La Philosophie Inochi Inu
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">
                Une éducation axée sur le respect et la clarté
              </h2>
              <p className="text-stone-300 text-sm leading-relaxed mt-4">
                Chaque chien possède son propre tempérament et sa sensibilité. Notre approche refuse toute contrainte excessive ou méthode archaïque. Nous privilégions la lecture précise des postures, l'anticipation, la motivation et la mise en place d'un cadre cohérent pour que l'apprentissage devienne un plaisir partagé.
              </p>
              
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-800">
                <div>
                  <div className="text-xl font-black text-white">Éthologie</div>
                  <div className="text-[11px] font-bold text-stone-400 mt-0.5">Compréhension du comportement</div>
                </div>
                <div>
                  <div className="text-xl font-black text-white">Sur-Mesure</div>
                  <div className="text-[11px] font-bold text-stone-400 mt-0.5">Adapté aux races primitives</div>
                </div>
                <div>
                  <div className="text-xl font-black text-white">Suivi Digital</div>
                  <div className="text-[11px] font-bold text-stone-400 mt-0.5">Carnet de bord en ligne</div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* =========================================================================
          MODALE 1 : CONNEXION RAPIDE GOOGLE (SI NON CONNECTÉ)
          ========================================================================= */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsAuthOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-stone-600 hover:bg-black/10 transition-all"
            >
              ✕
            </button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm">
                犬
              </div>
              <h3 className="text-2xl font-black text-stone-900">
                Connexion requise
              </h3>
              <p className="mt-2 text-sm text-stone-500 font-medium">
                Connectez-vous en 1 clic pour réserver votre cours et débloquer automatiquement votre carnet d'éducation en ligne.
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="group flex h-13 w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white px-6 font-bold text-stone-800 shadow-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>{authLoading ? "Redirection..." : "Continuer avec Google"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALE 2 : FORMULAIRE DE RÉSERVATION INTERACTIF (SI CONNECTÉ)
          ========================================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsFormOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-6 sm:p-10 shadow-2xl">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-stone-600 hover:bg-black/10 transition-all"
            >
              ✕
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-stone-900">Demande enregistrée !</h3>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                  Votre demande pour <strong>{formData.dogName}</strong> est bien reçue. Vous la retrouverez sur votre Espace Membre dès validation.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <a
                    href="/espace-membre"
                    className="px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 transition-all"
                  >
                    Aller sur Mon Espace
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">
                      Étape {step} sur 2
                    </span>
                    <h3 className="text-lg font-black text-stone-900">
                      {step === 1 ? "Profil du Chien & Formule" : "Objectifs & Disponibilités"}
                    </h3>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2].map((s) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all ${
                          s === step ? "w-6 bg-orange-500" : "w-2 bg-stone-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Formule souhaitée
                      </label>
                      <select
                        value={formData.formula}
                        onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                      >
                        <option value="Bilan Comportemental Initial">Bilan Comportemental Initial (1h30)</option>
                        <option value="Séance Individuelle (Extérieur/Ville)">Séance Individuelle (Extérieur/Ville)</option>
                        <option value="École du Chiot / Éveil">École du Chiot / Éveil</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Nom du chien *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Ryu"
                          value={formData.dogName}
                          onChange={(e) => setFormData({ ...formData, dogName: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Âge *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: 8 mois"
                          value={formData.dogAge}
                          onChange={(e) => setFormData({ ...formData, dogAge: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Race ou type *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Akita Inu, Berger Australien..."
                        value={formData.dogBreed}
                        onChange={(e) => setFormData({ ...formData, dogBreed: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Téléphone de contact *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="06 12 34 56 78"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        disabled={!formData.dogName || !formData.dogBreed || !formData.dogAge || !formData.clientPhone}
                        onClick={() => setStep(2)}
                        className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 disabled:opacity-40 transition-all"
                      >
                        Suivant ➔
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                        Thématiques ciblées
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableIssues.map((issue) => {
                          const isSel = formData.issues.includes(issue);
                          return (
                            <button
                              key={issue}
                              type="button"
                              onClick={() => toggleIssue(issue)}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                                isSel
                                  ? "bg-orange-500 text-white border-orange-500"
                                  : "bg-stone-50 text-stone-700 border-stone-200"
                              }`}
                            >
                              {isSel ? "✓ " : "+ "}
                              {issue}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Disponibilités préférées
                      </label>
                      <select
                        value={formData.preferredSlot}
                        onChange={(e) => setFormData({ ...formData, preferredSlot: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                      >
                        <option value="Semaine en matinée">Semaine en matinée</option>
                        <option value="Semaine en après-midi">Semaine en après-midi</option>
                        <option value="Samedi">Samedi</option>
                        <option value="Indifférent / À convenir">Indifférent / À convenir</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Précisions sur vos attentes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Comportements particuliers à signaler..."
                        value={formData.objectives}
                        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-stone-500 hover:text-stone-900"
                      >
                        ← Retour
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-full hover:brightness-105 shadow-md disabled:opacity-50 transition-all"
                      >
                        {submitting ? "Enregistrement..." : "Confirmer ma demande"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
