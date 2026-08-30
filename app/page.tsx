// app/page.tsx
"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "./components/LiquidNavbar";
import AppleCarousel, { CarouselSlide } from "./components/AppleCarousel";
// ON IMPORTE NOTRE NOUVEAU COMPOSANT
import ContactSection from "./components/ContactSection";

export default function Home() {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const redirectUrl = `${window.location.origin}/auth/callback?next=/espace-membre`;
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

  const activities = [
    { title: "Élevage d'Akita Inu", desc: "Sélection rigoureuse, respect des standards et socialisation bienveillante dès le plus jeune âge.", tag: "Passion & Éthique", href: "/elevage" },
    { title: "Pension Canine Familiale", desc: "Accueil chaleureux en petit comité, espaces de détente sécurisés et suivi personnalisé au quotidien.", tag: "Capacité limitée", href: "/pension" },
    { title: "Éducation & Comportement", desc: "Accompagnement individualisé basé sur la compréhension canine et les méthodes positives.", tag: "Sur-mesure", href: "/education" },
    { title: "Sellerie & Équipements", desc: "Accessoires modulaires, laisses et harnais techniques pensés pour les chiens primitifs et le plein air.", tag: "Fabrication artisanale", href: "/sellerie" },
  ];

  const homeSlides: CarouselSlide[] = [
    { src: "/hero-akita.jpg", alt: "Akita Inu dans la nature", tag: "Akita Inu", caption: "Noblesse, puissance et équilibre au naturel" },
    { src: "/DODO-Akita.jpeg", alt: "Shiba Inu", tag: "Shiba Inu", caption: "Vivacité, autonomie et loyauté sans faille" },
    { src: "/DODO-papa.jpeg", alt: "Grand air et balades en forêt", tag: "Plein Air", caption: "Grands espaces et socialisation bienveillante" },
  ];

  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-orange-200 selection:text-stone-900 scroll-smooth">
      <div className="absolute top-0 inset-x-0 h-[100vh] overflow-hidden pointer-events-none z-0 transform-gpu">
        <div className="absolute top-[10%] left-[-20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0) 70%)' }} />
        <div className="absolute top-[40%] right-[-20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0) 70%)' }} />
      </div>

      <LiquidNavbar />

      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-12 text-center px-4">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-50/70 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-orange-700 shadow-sm">
          <span>Structure Canine & Artisanat</span>
        </div>
        <h1 className="max-w-4xl text-5xl font-black tracking-tight text-stone-900 sm:text-7xl sm:leading-[1.1]">
          L'harmonie et l'expertise au service du <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">chien primitif</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-stone-600 sm:text-xl">
          Élevage passionné d'Akita Inu, pension canine à dimension humaine, accompagnement comportemental et sellerie sur-mesure.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button onClick={() => setIsReservationModalOpen(true)} className="flex h-14 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-8 font-bold text-white shadow-[0_4px_14px_rgba(249,115,22,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] transition hover:scale-105 hover:brightness-105 cursor-pointer">
            Réservation
          </button>
          <a href="#contact" className="flex h-14 items-center justify-center rounded-full border border-stone-300 bg-white/60 backdrop-blur-md px-8 font-bold text-stone-700 shadow-sm transition hover:scale-105 hover:bg-white hover:text-stone-900 cursor-pointer">
            Contact
          </a>
        </div>
      </section>

      <div className="relative">
        <AppleCarousel slides={homeSlides} />
      </div>

      <section className="relative z-10 border-t border-stone-200/60 bg-transparent py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center sm:text-left">
            <h2 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">Nos Pôles d'Activité</h2>
            <p className="mt-3 text-base text-stone-500">Un cadre dédié au bien-être, à la dépense saine et au confort de vos compagnons.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {activities.map((act) => (
              <div key={act.title} className="group relative rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-900/5">
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">{act.tag}</span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">{act.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-stone-500">{act.desc}</p>
                <div className="mt-8">
                  <a href={act.href} className="inline-flex items-center text-sm font-bold text-orange-500 transition-colors group-hover:text-orange-600">
                    En savoir plus <span className="ml-2 translate-x-0 transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPEL DU COMPOSANT CONTACT */}
      <ContactSection />

      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {isReservationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setIsReservationModalOpen(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <button onClick={() => setIsReservationModalOpen(false)} className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-stone-600 hover:bg-black/10 transition-all cursor-pointer">✕</button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm shadow-[0_4px_12px_rgba(249,115,22,0.3)]">犬</div>
              <h3 className="text-2xl font-black text-stone-900">Comment réserver ?</h3>
              <p className="mt-2 text-sm text-stone-500 font-medium leading-relaxed">Toutes nos réservations (Pension, Éducation, Élevage et Sellerie) sont centralisées et suivies en direct depuis votre <strong>Espace Membre</strong>.</p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-stone-200/70 shadow-2xs">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-black">1</span>
                <p className="text-xs text-stone-600 font-medium"><strong>Créez votre compte en 1 clic</strong> avec votre compte Google sécurisé.</p>
              </div>
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-stone-200/70 shadow-2xs">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-black">2</span>
                <p className="text-xs text-stone-600 font-medium"><strong>Remplissez le formulaire du service</strong> souhaité (dates de garde, profil du chien ou commande).</p>
              </div>
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-stone-200/70 shadow-2xs">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-black">3</span>
                <p className="text-xs text-stone-600 font-medium"><strong>Suivez tout en temps réel</strong> : validation, carnet d'éducation, photos de pension et fabrication sellerie.</p>
              </div>
            </div>
            <div className="mt-8">
              <button onClick={handleGoogleLogin} disabled={authLoading} className="group flex h-13 w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white px-6 font-bold text-stone-800 shadow-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer">
                <span>{authLoading ? "Redirection..." : "Se connecter / Créer mon compte"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}