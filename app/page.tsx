"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "./components/LiquidNavbar";
import AppleCarousel from "./components/AppleCarousel";

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
    {
      title: "Élevage d'Akita Inu",
      desc: "Sélection rigoureuse, respect des standards et socialisation bienveillante dès le plus jeune âge.",
      tag: "Passion & Éthique",
      href: "/elevage",
    },
    {
      title: "Pension Canine Familiale",
      desc: "Accueil chaleureux en petit comité, espaces de détente sécurisés et suivi personnalisé au quotidien.",
      tag: "Capacité limitée",
      href: "/pension",
    },
    {
      title: "Éducation & Comportement",
      desc: "Accompagnement individualisé basé sur la compréhension canine et les méthodes positives.",
      tag: "Sur-mesure",
      href: "/education",
    },
    {
      title: "Sellerie & Équipements",
      desc: "Accessoires modulaires, laisses et harnais techniques pensés pour les chiens primitifs et le plein air.",
      tag: "Fabrication artisanale",
      href: "/sellerie",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-orange-200 selection:text-stone-900 scroll-smooth">
      
      {/* HALOS FAUVE (Optimisés pour iOS : Radial Gradient au lieu de Blur CSS) */}
      <div className="absolute top-0 inset-x-0 h-[100vh] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0) 70%)' }} />
        <div className="absolute top-[40%] right-[-20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0) 70%)' }} />
      </div>

      <LiquidNavbar />

      {/* Hero Section */}
      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-12 text-center px-4">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-50/70 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-orange-700 shadow-sm">
          <span>Structure Canine & Artisanat</span>
        </div>
        
        <h1 className="max-w-4xl text-5xl font-black tracking-tight text-stone-900 sm:text-7xl sm:leading-[1.1]">
          L'harmonie et l'expertise au service du{" "}
          <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            chien primitif
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-stone-600 sm:text-xl">
          Élevage passionné d'Akita Inu, pension canine à dimension
          humaine, accompagnement comportemental et sellerie sur-mesure.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => setIsReservationModalOpen(true)}
            className="flex h-14 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-8 font-bold text-white shadow-[0_4px_14px_rgba(249,115,22,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] transition hover:scale-105 hover:brightness-105 cursor-pointer"
          >
            Réservation
          </button>
          
          <a
            href="#contact"
            className="flex h-14 items-center justify-center rounded-full border border-stone-300 bg-white/60 backdrop-blur-md px-8 font-bold text-stone-700 shadow-sm transition hover:scale-105 hover:bg-white hover:text-stone-900 cursor-pointer"
          >
            Contact
          </a>
        </div>
      </section>

      {/* Carrousel Style Apple */}
      <div className="relative">
        <AppleCarousel />
      </div>

      {/* Activités Grid */}
      <section className="relative z-10 border-t border-stone-200/60 bg-transparent py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center sm:text-left">
            <h2 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
              Nos Pôles d'Activité
            </h2>
            <p className="mt-3 text-base text-stone-500">
              Un cadre dédié au bien-être, à la dépense saine et au confort de vos compagnons.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {activities.map((act) => (
              <div
                key={act.title}
                className="group relative rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-900/5"
              >
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                  {act.tag}
                </span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">
                  {act.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-stone-500">
                  {act.desc}
                </p>
                <div className="mt-8">
                  <a
                    href={act.href}
                    className="inline-flex items-center text-sm font-bold text-orange-500 transition-colors group-hover:text-orange-600"
                  >
                    En savoir plus <span className="ml-2 translate-x-0 transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION CONTACT */}
      <section id="contact" className="relative z-10 border-t border-stone-200/60 bg-white/40 backdrop-blur-md py-20 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-200/50">
              Nous Contacter
            </span>
            <h2 className="text-3xl font-black text-stone-900 mt-4">
              Restons en contact
            </h2>
            <p className="text-stone-500 text-sm mt-2">
              Pour toute question sur nos portées, nos disponibilités en pension ou un accompagnement éducatif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-stone-900">Téléphone</h3>
              <p className="text-xs text-stone-500 mt-1">Du lundi au samedi</p>
              <a href="tel:0600000000" className="mt-4 text-sm font-black text-orange-600 hover:text-orange-700">
                06 00 00 00 00
              </a>
            </div>

            <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-stone-900">Email</h3>
              <p className="text-xs text-stone-500 mt-1">Réponse sous 24h</p>
              <a href="mailto:contact@inochi-inu.fr" className="mt-4 text-sm font-black text-orange-600 hover:text-orange-700">
                contact@inochi-inu.fr
              </a>
            </div>

            <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-stone-900">Suivez nos aventures</h3>
              <p className="text-xs text-stone-500 mt-1">Photos quotidiennes & actualités</p>
              <div className="mt-4 flex gap-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full">
                  Instagram ➔
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full">
                  Facebook ➔
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {/* MODALE RÉSERVATION */}
      {isReservationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsReservationModalOpen(false)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <button
              onClick={() => setIsReservationModalOpen(false)}
              className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-stone-600 hover:bg-black/10 transition-all cursor-pointer"
            >
              ✕
            </button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
                犬
              </div>
              <h3 className="text-2xl font-black text-stone-900">
                Comment réserver ?
              </h3>
              <p className="mt-2 text-sm text-stone-500 font-medium leading-relaxed">
                Toutes nos réservations (Pension, Éducation, Élevage et Sellerie) sont centralisées et suivies en direct depuis votre <strong>Espace Membre</strong>.
              </p>
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
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="group flex h-13 w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white px-6 font-bold text-stone-800 shadow-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span>{authLoading ? "Redirection..." : "Se connecter / Créer mon compte"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}