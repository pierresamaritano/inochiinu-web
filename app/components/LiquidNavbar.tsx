"use client";

import { useState, useEffect } from "react";

export default function LiquidNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center p-4 transition-all duration-300">
      {/* Barre de navigation principale (Pilule) */}
      <nav
        className={`flex items-center justify-between gap-4 px-5 py-3 rounded-full transition-all duration-500 ease-out z-50 ${
          scrolled || isMobileMenuOpen
            ? "w-[96%] max-w-4xl bg-zinc-900/60 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.2)]"
            : "w-[98%] max-w-5xl bg-zinc-900/40 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
        } backdrop-blur-2xl backdrop-saturate-150 border border-white/10 ring-1 ring-black/5`}
      >
        {/* Logo & Kanji */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 font-black text-xs shadow-inner">
            犬
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              INOCHI INU
            </span>
            <span className="text-[10px] text-zinc-400 font-medium tracking-widest -mt-1 hidden sm:block">
              命犬 • CANIN
            </span>
          </div>
        </a>

        {/* Menu Central (Desktop uniquement) */}
        <div className="hidden md:flex items-center gap-1 rounded-full bg-white/[0.03] p-1 border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
          <a href="#elevage" className="px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">
            Élevage
          </a>
          <a href="#pension" className="px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">
            Pension
          </a>
          <a href="#education" className="px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">
            Éducation
          </a>
          <a href="#sellerie" className="px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">
            Sellerie
          </a>
        </div>

        {/* Actions de droite (Bouton réserver + Hamburger) */}
        <div className="flex items-center gap-2">
          <a
            href="#reservation"
            className="hidden sm:inline-flex relative items-center justify-center px-4 py-2 text-xs font-semibold text-zinc-950 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:brightness-110 active:scale-95 transition-all duration-200"
          >
            Réserver
          </a>

          {/* Menu Hamburger pour Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Ouvrir le menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Panneau du menu mobile (Liquid Glass) */}
      <div
        className={`md:hidden absolute top-[72px] w-[92%] transition-all duration-300 ease-out origin-top ${
          isMobileMenuOpen
            ? "opacity-100 scale-100 translate-y-0 visible"
            : "opacity-0 scale-95 -translate-y-4 invisible"
        }`}
      >
        <div className="flex flex-col gap-2 p-4 mt-2 rounded-3xl bg-zinc-900/70 backdrop-blur-3xl backdrop-saturate-200 border border-white/10 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.2)]">
          <a
            href="#elevage"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
          >
            Élevage d'Akita & Shiba
          </a>
          <a
            href="#pension"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
          >
            Pension Familiale
          </a>
          <a
            href="#education"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
          >
            Éducation Canine
          </a>
          <a
            href="#sellerie"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
          >
            Sellerie & Équipements
          </a>
          <div className="h-px w-full bg-white/10 my-1"></div>
          <a
            href="#reservation"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-3 text-sm font-semibold text-amber-500 hover:bg-white/5 rounded-2xl transition-all text-center flex items-center justify-center gap-2"
          >
            Réserver un séjour
          </a>
        </div>
      </div>
    </header>
  );
}
