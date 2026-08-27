"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";

export default function EducationPage() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // État du formulaire
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    dogName: "",
    dogBreed: "",
    dogAge: "",
    issues: [] as string[],
    objectives: "",
    preferredSlot: "Semaine en journée",
  });

  const availableIssues = [
    "Marche en laisse & tractions",
    "Rappel & écoute en liberté",
    "Réactivité congénères / humains",
    "Destruction / Solitude / Anxiété",
    "Saut / Excitations intenses",
    "Éducation de base du chiot",
    "Agressivité / Protection de ressources",
  ];

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
    if (!user) {
      setErrorMsg("Veuillez vous connecter via le bouton en haut pour soumettre votre demande.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from("education_requests").insert([
        {
          user_id: user.id,
          client_name: formData.clientName || user.user_metadata?.full_name || "Client",
          client_email: user.email,
          client_phone: formData.clientPhone,
          dog_name: formData.dogName,
          dog_breed: formData.dogBreed,
          dog_age: formData.dogAge,
          issues: formData.issues,
          objectives: formData.objectives,
          preferred_slot: formData.preferredSlot,
          status: "en_attente",
        },
      ]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LiquidNavbar />

      <main className="min-h-screen bg-[#FDFCF8] text-stone-800 pt-32 px-4 sm:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          
          {/* EN-TÊTE DE PRÉSENTATION */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3.5 py-1.5 rounded-full">
              Accompagnement & Éthologie
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mt-4">
              Éducation & Bilan Comportemental
            </h1>
            <p className="text-stone-500 mt-4 text-base sm:text-lg font-medium leading-relaxed">
              Une méthode moderne basée sur la lecture instinctive du chien, la cohérence et le renforcement des liens de confiance entre le maître et son compagnon.
            </p>
          </div>

          {/* SECTION FORMULAIRE / RÉSERVATION */}
          <div className="bg-white/80 border border-stone-200/90 rounded-[2.5rem] p-6 sm:p-12 shadow-sm">
            {submitted ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-6 shadow-inner">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-stone-900">Demande de bilan bien reçue !</h2>
                <p className="text-stone-500 mt-3 text-sm max-w-md mx-auto leading-relaxed">
                  Votre demande est actuellement enregistrée en attente de validation. Nous allons étudier le profil de <strong>{formData.dogName}</strong> et vous recontacter très rapidement.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <a
                    href="/espace-membre"
                    className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 transition-all shadow-md"
                  >
                    Voir mon Espace Membre
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* INDICATEUR D'ÉTAPES */}
                <div className="flex items-center justify-between pb-8 border-b border-stone-100 mb-8">
                  <div>
                    <span className="text-[11px] font-black uppercase text-orange-600 tracking-wider">
                      Étape {step} sur 3
                    </span>
                    <h2 className="text-lg font-extrabold text-stone-900 mt-0.5">
                      {step === 1 && "Votre chien & ses caractéristiques"}
                      {step === 2 && "Problématiques & Objectifs"}
                      {step === 3 && "Vos coordonnées & Disponibilités"}
                    </h2>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          s === step
                            ? "w-8 bg-orange-500"
                            : s < step
                            ? "w-2 bg-emerald-500"
                            : "w-2 bg-stone-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* ÉTAPE 1 : IDENTIFICATION DU CHIEN */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                        Nom du chien *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Ryu, Aïko..."
                        value={formData.dogName}
                        onChange={(e) => setFormData({ ...formData, dogName: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-medium transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                          Race ou croisement *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Akita Inu, Shiba, Berger..."
                          value={formData.dogBreed}
                          onChange={(e) => setFormData({ ...formData, dogBreed: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                          Âge du chien *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: 5 mois, 2 ans..."
                          value={formData.dogAge}
                          onChange={(e) => setFormData({ ...formData, dogAge: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                      <button
                        type="button"
                        disabled={!formData.dogName || !formData.dogBreed || !formData.dogAge}
                        onClick={() => setStep(2)}
                        className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 disabled:opacity-40 transition-all"
                      >
                        Étape suivante ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 2 : PROBLÉMATIQUES & ATTENTES */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
                        Thématiques à travailler (sélectionnez une ou plusieurs)
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {availableIssues.map((issue) => {
                          const selected = formData.issues.includes(issue);
                          return (
                            <button
                              key={issue}
                              type="button"
                              onClick={() => toggleIssue(issue)}
                              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${
                                selected
                                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                  : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300"
                              }`}
                            >
                              {selected ? "✓ " : "+ "}
                              {issue}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                        Précisions sur vos objectifs ou comportements particuliers
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Expliquez brièvement votre quotidien, l'élément déclencheur ou vos attentes..."
                        value={formData.objectives}
                        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-medium transition-all"
                      />
                    </div>

                    <div className="pt-6 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-stone-500 hover:text-stone-900"
                      >
                        ← Retour
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 transition-all"
                      >
                        Étape suivante ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 3 : COORDONNÉES & VALIDATION */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                          Votre nom complet *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Jean Dupont"
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                          Numéro de téléphone *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="06 12 34 56 78"
                          value={formData.clientPhone}
                          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                        Créneaux de préférence
                      </label>
                      <select
                        value={formData.preferredSlot}
                        onChange={(e) => setFormData({ ...formData, preferredSlot: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-500 focus:bg-white text-sm font-medium transition-all"
                      >
                        <option value="Semaine en matinée">Semaine en matinée</option>
                        <option value="Semaine en après-midi">Semaine en après-midi</option>
                        <option value="Samedi">Samedi</option>
                        <option value="Indifférent / À convenir">Indifférent / À convenir</option>
                      </select>
                    </div>

                    {errorMsg && (
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                        {errorMsg}
                      </div>
                    )}

                    {!user && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                        ⚠️ Vous devez être connecté avec votre compte pour enregistrer la demande dans votre Espace Membre.
                      </div>
                    )}

                    <div className="pt-6 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-bold text-stone-500 hover:text-stone-900"
                      >
                        ← Retour
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !formData.clientName || !formData.clientPhone}
                        className="px-8 py-3.5 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-full hover:brightness-105 shadow-[0_4px_16px_rgba(249,115,22,0.3)] disabled:opacity-50 transition-all"
                      >
                        {loading ? "Envoi en cours..." : "Envoyer ma demande de bilan"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
