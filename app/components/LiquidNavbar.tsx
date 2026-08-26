"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LiquidNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 transition-all duration-300">
      <nav
        className={`flex items-center justify-between gap-6 px-6 py-3 rounded-full transition-all duration-500 ease-out ${
          scrolled
            ? "w-[92%] max-w-4xl bg-zinc-900/60 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.2)]"
            : "w-[96%] max-w-5xl bg-zinc-900/40 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
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
            <span className="text-[10px] text-zinc-400 font-medium tracking-widest -mt-1">
              命犬 • CANIN
            </span>
          </div>
        </a>

        {/* Liens centraux avec effet pill au survol */}
        <div className="hidden md:flex items-center gap-1 rounded-full bg-white/[0.03] p-1 border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
          <a
            href="#elevage"
            className="px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          >
            Élevage
          </a>
          <a
            href="#pension"
            className="px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          >
            Pension
          </a>
          <a
            href="#education"
            className="px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          >
            Éducation
          </a>
          <a
            href="#sellerie"
            className="px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          >
            Sellerie
          </a>
        </div>

        {/* Bouton d'action CTA en verre ambré */}
        <div className="flex items-center gap-3">
          <a
            href="#reservation"
            className="relative inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-zinc-950 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:brightness-110 active:scale-95 transition-all duration-200"
          >
            Réserver
          </a>
        </div>
      </nav>
    </header>
  );
}
