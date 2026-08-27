"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";
import AppleCarousel from "../components/AppleCarousel";

export default function EducationPage() {
  const [user, setUser] = useState<any>(null);
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
    <div className="relative min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-orange-200 selection:text-stone-900">
      
      {/* HALOS FAUVE (Identiques à la page principale) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 inset-x-0 h-[10vh] bg-gradient-to-b from-orange-600/10 to-transparent blur-[40px]" />
        <div className="absolute top-[20%] -left-[25%] w-[30vw] h-[60vh] rounded-full bg-orange-600/10 blur-[130px]" />
        <div className="absolute top-[20%] -right-[25%] w-[30vw] h-[60vh] rounded-full bg-orange-600/10 blur-[130px]" />
        <div className="absolute -bottom-10 inset-x-0 h-[10vh] bg-gradient-to-t from-orange-600/8 to-transparent blur-[50px]" />
      </div>

      <LiquidNavbar />

      {/* Hero Section Éducation */}
      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-8 text-center px-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-50/70 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-orange-700 shadow-sm">
          <span>Accompagnement Comportemental & Éthologie</span>
        </div>
        
        <h1 className="max-w-3xl text-4xl font-black tracking-tight text-stone-900 sm:text-5xl sm:leading-tight">
          Éducation Canine &{" "}
          <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Bilan Sur-Mesure
          </span>
        </h1>
        
        <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-stone-600 sm:text-lg">
          Une méthode respectueuse et cohérente, axée sur la communication naturelle et l'équilibre de votre compagnon.
        </p>
      </section>

      {/* Carrousel Apple */}
      <div className="relative">
        <AppleCarousel />
      </div>

      {/* Section Appel à l'action sous le carrousel */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 -mt-4 mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-stone-200/80 shadow-sm">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-stone-900">
              Réserver votre accompagnement
            </h2>
            <p className="mt-1 text-sm text-stone-500 font-medium">
              Prenez rendez-vous pour un bilan initial ou une séance individuelle sur terrain réel.
            </p>
          </div>
          <button
            onClick={handleActionClick}
            className="w-full sm:w-auto shrink-0 flex h-14 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-8 font-bold text-white shadow-[0_4px_14px_rgba(249,115,22,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] transition hover:scale-105 hover:brightness-105 cursor-pointer"
          >
            Prendre un cours / Réserver
          </button>
        </div>
      </section>

      {/* Détail des Formules & Pédagogie */}
      <section className="relative z-10 border-t border-stone-200/60 bg-transparent py-20">
        <div className="mx-auto max-w-6xl px-6 space-y-16">
          
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              Formules & Accompagnement
            </span>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 mt-2">
              Des cours adaptés à chaque étape
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                  Étape Obligatoire
                </span>
                <h3 className="mt-4 text-xl font-bold text-stone-900">
                  Bilan Comportemental
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  Séance approfondie de 1h30 : observation de l'environnement, analyse des signaux de communication et mise en place d'un programme d'apprentissage personnalisé.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-400">
                <span>Durée : 1h30</span>
                <span className="text-stone-800">À domicile / Extérieur</span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                  Perfectionnement
                </span>
                <h3 className="mt-4 text-xl font-bold text-stone-900">
                  Séances Individuelles
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  Mise en pratique en conditions réelles (ville, parcs, forêt) : marche en laisse sans traction, rappel avec fortes distractions et auto-contrôles.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-400">
                <span>Durée : 1h00</span>
                <span className="text-stone-800">Terrain varié</span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                  Collectif
                </span>
                <h3 className="mt-4 text-xl font-bold text-stone-900">
                  Balades Éducatives
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  Balades encadrées en petits comités pour développer les compétences sociales, la tolérance aux congénères et l'écoute en groupe.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-400">
                <span>Comité restreint</span>
                <span className="text-stone-800">Tous niveaux</span>
              </div>
            </div>
          </div>

          {/* Présentation de l'Approche / Éducateur */}
          <div className="rounded-[2.5rem] bg-stone-900 text-white p-8 sm:p-12 shadow-xl border border-stone-800">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                La Méthode Inochi Inu
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mt-2">
                Comprendre avant d'agir
              </h3>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed mt-4">
                Spécialisés dans les races primitives et les tempéraments affirmés, nous privilégions la lecture fine des postures, l'anticipation et la motivation. Pas de coercition inutile, mais un cadre clair et sécurisant pour vous et votre chien.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {/* =========================================================================
          MODALE DE CONNEXION GOOGLE (SI NON CONNECTÉ)
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
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
                犬
              </div>
              <h3 className="text-2xl font-black text-stone-900">
                Connexion requise
              </h3>
              <p className="mt-2 text-sm text-stone-500 font-medium">
                Connectez-vous pour envoyer votre demande et synchroniser vos séances sur votre Espace Membre.
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
          MODALE DE RÉSERVATION INTERACTIVE (SI CONNECTÉ)
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
                  Votre demande pour <strong>{formData.dogName}</strong> a bien été envoyée. Elle apparaîtra sur votre Espace Membre dès validation.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <a
                    href="/espace-membre"
                    className="px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 transition-all"
                  >
                    Voir mon Espace Membre
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
                        placeholder="Ex: Akita Inu, Shiba, Berger..."
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
                        className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 disabled:opacity-40 transition-all cursor-pointer"
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
                              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border cursor-pointer ${
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
                        Disponibilités souhaitées
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
                        className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
                      >
                        ← Retour
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-full hover:brightness-105 shadow-md disabled:opacity-50 transition-all cursor-pointer"
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
    </div>
  );
}
