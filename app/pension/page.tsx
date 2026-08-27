"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";

export default function PensionPage() {
  const [user, setUser] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    dogName: "",
    dogBreed: "",
    startDate: "",
    endDate: "",
    clientPhone: "",
    specialNeeds: "",
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
    {
      title: "12 Boxs Spacieux & Isolés",
      subtitle: "Un confort thermique total été comme hiver avec accès direct à des courettes individuelles sécurisées.",
      tag: "Capacité Limitée",
      gradient: "from-emerald-950/90 via-stone-900/60 to-black/80",
    },
    {
      title: "Grands Parcs de Détente Arborés",
      subtitle: "Sorties régulières quotidiennes, jeux et interactions contrôlées selon les affinités.",
      tag: "Dépense & Éveil",
      gradient: "from-stone-900/90 via-stone-900/60 to-black/80",
    },
    {
      title: "Journal de Bord Photo Quotidien",
      subtitle: "Recevez chaque jour des nouvelles et des clichés de votre chien directement sur votre Espace Membre.",
      tag: "Suivi Digital",
      gradient: "from-orange-950/90 via-stone-900/60 to-black/80",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

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
      const redirectUrl = `${window.location.origin}/auth/callback?next=/pension`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("pension_requests").insert([
        {
          user_id: user.id,
          client_name: user.user_metadata?.full_name || "Client",
          client_email: user.email,
          client_phone: formData.clientPhone,
          dog_name: formData.dogName,
          dog_breed: formData.dogBreed,
          start_date: formData.startDate,
          end_date: formData.endDate,
          special_needs: formData.specialNeeds,
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 inset-x-0 h-[10vh] bg-gradient-to-b from-orange-600/10 to-transparent blur-[40px]" />
        <div className="absolute top-[20%] -left-[25%] w-[30vw] h-[60vh] rounded-full bg-orange-600/10 blur-[130px]" />
        <div className="absolute top-[20%] -right-[25%] w-[30vw] h-[60vh] rounded-full bg-orange-600/10 blur-[130px]" />
        <div className="absolute -bottom-10 inset-x-0 h-[10vh] bg-gradient-to-t from-orange-600/8 to-transparent blur-[50px]" />
      </div>

      <LiquidNavbar />

      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-6 text-center px-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-50/70 backdrop-blur-md px-4 py-1 text-xs font-bold text-orange-700 shadow-sm">
          <span>Garde Sérénité & Sécurité</span>
        </div>
        
        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          Pension Canine{" "}
          <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Tout Confort
          </span>
        </h1>
        
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-stone-600 sm:text-base">
          Capacité limitée à 12 places pour un accueil personnalisé, attentif et respectueux du rythme naturel de votre animal.
        </p>
      </section>

      {/* CARROUSEL COMPACT */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-stone-900 shadow-md min-h-[220px] sm:min-h-[240px] flex items-center">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 flex flex-col justify-center px-8 sm:px-14 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
              <div className="relative z-10 max-w-xl text-white">
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

          <button onClick={prevSlide} className="absolute left-4 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md">←</button>
          <button onClick={nextSlide} className="absolute right-4 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md">→</button>

          <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-5 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BANDEAU D'ACTION */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-stone-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-black tracking-tight text-stone-900">
              Réserver un séjour en pension
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-medium">
              Vérifiez la disponibilité de nos 12 boxs et bloquez vos dates en toute tranquillité.
            </p>
          </div>
          <button
            onClick={handleActionClick}
            className="w-full sm:w-auto shrink-0 flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-7 font-bold text-xs uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(249,115,22,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] transition hover:scale-105 hover:brightness-105 cursor-pointer"
          >
            Réserver un séjour
          </button>
        </div>
      </section>

      {/* DÉTAIL DES INSTALLATIONS */}
      <section className="relative z-10 border-t border-stone-200/60 bg-transparent py-16">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              Infrastructures & Bien-Être
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 mt-1">
              Un cadre conçu pour leur confort
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  12 Boxs Uniquement
                </span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">
                  Espaces Individuels
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">
                  Boxs carrelés, isolés et nettoyés quotidiennement avec literie confortable et musique d'ambiance apaisante.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-bold text-stone-400">
                Isolation thermique renforcée
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  Détente & Sécurité
                </span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">
                  Parcs Clôturés
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">
                  Plusieurs parcs arborés et sécurisés pour des moments de liberté, jeux de flair et baignades en été.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-bold text-stone-400">
                Clôtures haute sécurité 2m
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  Attention Quotidienne
                </span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">
                  Soins Personnalisés
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">
                  Administration des traitements médicaux, respect des régimes spécifiques (BARF / croquettes) et câlins réguliers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-bold text-stone-400">
                Surveillance continue
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {/* MODALE CONNEXION */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAuthOpen(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-6 right-6 text-stone-600">✕</button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm">犬</div>
              <h3 className="text-2xl font-black text-stone-900">Connexion requise</h3>
              <p className="mt-2 text-sm text-stone-500 font-medium">Connectez-vous pour demander une réservation de pension et recevoir vos photos quotidiennes.</p>
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

      {/* MODALE FORMULAIRE PENSION */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-6 sm:p-10 shadow-2xl">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-6 right-6 text-stone-600">✕</button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4">✓</div>
                <h3 className="text-xl font-black text-stone-900">Demande de séjour reçue !</h3>
                <p className="text-xs text-stone-500 mt-2">Nous vérifions le planning des 12 boxs et validons votre demande rapidement.</p>
                <a href="/espace-membre" className="mt-6 inline-block px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full">Aller sur Mon Espace</a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-black uppercase text-orange-600">Étape {step} sur 2</span>
                    <h3 className="text-lg font-black text-stone-900">{step === 1 ? "Dates & Chien" : "Besoins & Contact"}</h3>
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Date d'arrivée *</label>
                        <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Date de départ *</label>
                        <input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Nom du chien *</label>
                        <input type="text" required placeholder="Ryu" value={formData.dogName} onChange={(e) => setFormData({ ...formData, dogName: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Race *</label>
                        <input type="text" required placeholder="Akita Inu" value={formData.dogBreed} onChange={(e) => setFormData({ ...formData, dogBreed: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium" />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button type="button" disabled={!formData.startDate || !formData.endDate || !formData.dogName} onClick={() => setStep(2)} className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full disabled:opacity-40 cursor-pointer">Suivant ➔</button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Téléphone de contact *</label>
                      <input type="tel" required placeholder="06 12 34 56 78" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Besoins spécifiques / Alimentation / Médicaments</label>
                      <textarea rows={3} placeholder="Précisez le type de croquettes, allergies, compatibilité congénères..." value={formData.specialNeeds} onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })} className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium" />
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-stone-500">← Retour</button>
                      <button type="submit" disabled={submitting} className="px-6 py-3 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase rounded-full cursor-pointer">{submitting ? "Envoi..." : "Envoyer ma demande"}</button>
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
