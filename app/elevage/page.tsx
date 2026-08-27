"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";

export default function ElevagePage() {
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    preferredBreed: "Akita Inu",
    livingEnvironment: "",
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
  }, [supabase]);

  const handleActionClick = () => {
    if (user) setIsFormOpen(true);
    else setIsAuthOpen(true);
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const redirectUrl = `${window.location.origin}/auth/callback?next=/elevage`;
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectUrl } });
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
      const { error } = await supabase.from("adoption_requests").insert([{
        user_id: user.id,
        client_name: user.user_metadata?.full_name || "Client",
        client_email: user.email,
        client_phone: formData.clientPhone,
        preferred_breed: formData.preferredBreed,
        living_environment: formData.livingEnvironment,
        status: "en_attente",
      }]);
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
      <LiquidNavbar />

      {/* HERO SECTION */}
      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-12 text-center px-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-50/70 backdrop-blur-md px-4 py-1 text-xs font-bold text-orange-700 shadow-sm">
          <span>Sélection & Passion</span>
        </div>
        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          Élevage Familial &{" "}
          <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Adoption</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-stone-600 sm:text-base">
          Des chiots bien dans leurs pattes, élevés en famille et sociabilisés avec soin pour devenir vos meilleurs compagnons de vie.
        </p>
      </section>

      {/* CADRE LÉGAL & CONDITIONS (NOUVEAU) */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-16">
        <div className="rounded-[2.5rem] bg-white border border-stone-200/80 shadow-sm p-8 sm:p-12">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Réglementation Française</span>
            <h2 className="text-2xl font-black text-stone-900 mt-4">Conditions d'Adoption</h2>
            <p className="text-sm text-stone-500 mt-2 max-w-2xl mx-auto">Adopter un chiot est un engagement sur 10 à 15 ans. Nous respectons strictement la législation française pour protéger nos animaux.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-black text-lg">1</div>
                <div>
                  <h4 className="font-black text-stone-900">Certificat d'Engagement</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">Obligatoire depuis le 1er octobre 2022, ce document doit être lu et signé <strong className="text-stone-900">au moins 7 jours avant</strong> la cession du chiot.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-black text-lg">2</div>
                <div>
                  <h4 className="font-black text-stone-900">Âge Légal de Cession</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">Nos chiots ne quittent l'élevage qu'à partir de <strong className="text-stone-900">8 semaines révolues</strong>, conformément à l'article L214-8 du Code rural.</p>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
              <h4 className="font-black text-stone-900 mb-4 flex items-center gap-2">📂 Documents remis au départ :</h4>
              <ul className="space-y-3 text-xs text-stone-600 font-medium">
                <li className="flex items-center gap-2"><span>✓</span> Attestation (ou contrat) de vente signée.</li>
                <li className="flex items-center gap-2"><span>✓</span> Carte d'identification I-CAD (Puce électronique).</li>
                <li className="flex items-center gap-2"><span>✓</span> Certificat vétérinaire de bonne santé.</li>
                <li className="flex items-center gap-2"><span>✓</span> Carnet de santé ou passeport européen (vaccins à jour).</li>
                <li className="flex items-center gap-2"><span>✓</span> Certificat de naissance (Inscription au LOF).</li>
                <li className="flex items-center gap-2"><span>✓</span> Un livret d'accueil et d'éducation personnalisé.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BANDEAU CANDIDATURE */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-stone-900 text-white shadow-xl">
          <div>
            <h2 className="text-xl font-black tracking-tight">Déposer une candidature</h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-400 font-medium">Parlez-nous de votre cadre de vie et de votre projet d'adoption.</p>
          </div>
          <button onClick={handleActionClick} className="w-full sm:w-auto shrink-0 flex h-12 items-center justify-center rounded-full bg-orange-500 hover:bg-orange-400 px-7 font-bold text-xs uppercase tracking-wider text-white transition-all cursor-pointer">
            Remplir le dossier
          </button>
        </div>
      </section>

      {/* MODALES (Auth & Form) identiques aux autres pages... */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white p-8 rounded-[2rem] text-center">
            <h3 className="text-2xl font-black text-stone-900">Connexion requise</h3>
            <p className="text-sm text-stone-500 mt-2">Connectez-vous pour soumettre votre dossier.</p>
            <button onClick={handleGoogleLogin} className="mt-6 w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold rounded-full transition-all">Continuer avec Google</button>
            <button onClick={() => setIsAuthOpen(false)} className="mt-4 text-xs font-bold text-stone-400">Annuler</button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white p-8 rounded-[2rem]">
            {submitted ? (
              <div className="text-center">
                <h3 className="text-xl font-black text-stone-900">Candidature envoyée !</h3>
                <p className="text-xs text-stone-500 mt-2">Nous étudierons votre profil et vous recontacterons très bientôt.</p>
                <button onClick={() => setIsFormOpen(false)} className="mt-6 px-6 py-2 bg-stone-900 text-white rounded-full text-xs font-bold">Fermer</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-black text-stone-900 border-b border-stone-100 pb-4 mb-4">Dossier d'Adoption</h3>
                
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Race souhaitée</label>
                  <select value={formData.preferredBreed} onChange={(e) => setFormData({...formData, preferredBreed: e.target.value})} className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none">
                    <option value="Akita Inu">Akita Inu</option>
                    <option value="Shiba Inu">Shiba Inu</option>
                    <option value="Autre race primitive">Autre race primitive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Téléphone de contact *</label>
                  <input required type="tel" value={formData.clientPhone} onChange={(e) => setFormData({...formData, clientPhone: e.target.value})} className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Cadre de vie & Projet *</label>
                  <textarea required rows={4} placeholder="Maison avec jardin ? Appartement ? Temps de présence à domicile ? Expérience avec les chiens ?" value={formData.livingEnvironment} onChange={(e) => setFormData({...formData, livingEnvironment: e.target.value})} className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none" />
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-xs font-bold text-stone-500">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-full text-xs hover:bg-orange-600 cursor-pointer">{submitting ? "Envoi..." : "Soumettre le dossier"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
