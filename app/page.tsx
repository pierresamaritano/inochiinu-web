"use client";

import { useState, useEffect } from "react";
import LiquidNavbar from "./components/LiquidNavbar";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Élevage Passionné d'Akita Inu",
      subtitle: "Les héritiers de Boshin — Sélection rigoureuse, socialisation précoce et suivi de croissance transparent.",
      tag: "Élevage & Lignées",
      link: "/elevage",
      btnText: "Découvrir les portées",
      bgClass: "bg-gradient-to-br from-stone-900 to-stone-950",
      gradient: "from-stone-900/90 via-stone-900/40 to-black/80",
    },
    {
      title: "Pension Canine Tout Confort",
      subtitle: "12 boxs spacieux et isolés, grands parcs de détente arborés et nouvelles quotidiennes.",
      tag: "Pension Sérénité",
      link: "/pension",
      btnText: "Voir les installations",
      bgClass: "bg-gradient-to-br from-emerald-950 to-stone-900",
      gradient: "from-emerald-950/90 via-stone-900/40 to-black/80",
    },
    {
      title: "Éducation & Bilan Comportemental",
      subtitle: "Une approche moderne basée sur la compréhension mutuelle, le calme et le respect de l'instinct.",
      tag: "Éthologie & Cours",
      link: "/education",
      btnText: "Prendre un cours",
      bgClass: "bg-gradient-to-br from-orange-950 to-stone-900",
      gradient: "from-orange-950/90 via-stone-900/40 to-black/80",
    },
    {
      title: "Atelier Sellerie & Matériel Tactique",
      subtitle: "Équipements sur-mesure, laisses modulaires et accessoires robustes confectionnés à la main.",
      tag: "Artisanat Canin",
      link: "/sellerie",
      btnText: "Configurer un équipement",
      bgClass: "bg-gradient-to-br from-amber-950 to-stone-900",
      gradient: "from-amber-950/90 via-stone-900/40 to-black/80",
    },
  ];

  // Défilement automatique toutes les 6 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <>
      <LiquidNavbar />

      <main className="min-h-screen bg-[#FDFCF8] text-stone-800 pt-28 sm:pt-32 px-4 sm:px-8 pb-24 overflow-x-hidden">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* 1. HERO HEADER COMPACT */}
          <section className="text-center max-w-3xl mx-auto pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200/60 mb-4 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-700">
                Centre Canin Haut de Gamme
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
              L'harmonie et l'expertise au service de votre chien
            </h1>

            <p className="mt-4 text-stone-500 text-sm sm:text-lg font-medium leading-relaxed">
              Élevage d'Akita Inu, pension 12 boxs, cours d'éducation comportementale et atelier de sellerie tactique.
            </p>
          </section>

          {/* 2. GRAND CARROUSEL INTERACTIF */}
          <section className="relative overflow-hidden rounded-[2.5rem] border border-stone-200/80 shadow-xl min-h-[360px] sm:min-h-[420px] flex items-end">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 flex flex-col justify-end p-8 sm:p-14 ${slide.bgClass} ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-t ${slide.gradient}`} />
                
                <div className="relative z-10 max-w-2xl text-white">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10 inline-block mb-3">
                    {slide.tag}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                    {slide.title}
                  </h2>
                  <p className="mt-3 text-xs sm:text-sm text-stone-300 font-medium leading-relaxed max-w-xl">
                    {slide.subtitle}
                  </p>

                  <div className="mt-6">
                    <a
                      href={slide.link}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-stone-900 font-extrabold text-xs uppercase tracking-wider hover:bg-orange-50 hover:text-orange-600 transition-all shadow-md active:scale-95"
                    >
                      {slide.btnText} ➔
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination cliquable en haut à droite du carrousel */}
            <div className="absolute top-6 right-6 z-20 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Aller au slide ${index + 1}`}
                />
              ))}
            </div>
          </section>

          {/* 3. GRILLE DES 4 SERVICES DÉDIÉS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. ÉDUCATION */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Éducation & Bilan
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-4">
                  Comportement & Obéissance
                </h3>
                <p className="text-stone-500 mt-2 text-xs sm:text-sm leading-relaxed">
                  Accompagnement individualisé : réactivité, rappel sans faille, marche en laisse sans traction et carnet numérique.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">Carnet interactif</span>
                <a
                  href="/education"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Prendre un cours ➔
                </a>
              </div>
            </div>

            {/* 2. PENSION */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Pension Canine
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-4">
                  Séjours & Garde de Confiance
                </h3>
                <p className="text-stone-500 mt-2 text-xs sm:text-sm leading-relaxed">
                  Capacité maîtrisée de 12 boxs spacieux et isolés, grands parcs de détente arborés et journal de bord photo quotidien.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">12 boxs max</span>
                <a
                  href="/pension"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Voir la pension ➔
                </a>
              </div>
            </div>

            {/* 3. ÉLEVAGE */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Élevage Passion
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-4">
                  Les héritiers de Boshin
                </h3>
                <p className="text-stone-500 mt-2 text-xs sm:text-sm leading-relaxed">
                  Sélection rigoureuse d'Akita Inu LOF. Suivi de croissance transparent, socialisation précoce et accompagnement à vie.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">Lignées LOF</span>
                <a
                  href="/elevage"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Découvrir l'élevage ➔
                </a>
              </div>
            </div>

            {/* 4. SELLERIE */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Atelier & Sellerie
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-4">
                  Équipements Sur-Mesure
                </h3>
                <p className="text-stone-500 mt-2 text-xs sm:text-sm leading-relaxed">
                  Laisses modulaires, longes et colliers haute résistance confectionnés à la main avec une bouclerie robuste et éprouvée.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">Fait main</span>
                <a
                  href="/sellerie"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Configurer ➔
                </a>
              </div>
            </div>

          </section>

        </div>
      </main>
    </>
  );
}
