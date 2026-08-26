"use client";

import { useState, useEffect } from "react";

export default function LiquidNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [bubbleStyle, setBubbleStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeMenuOnScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("scroll", closeMenuOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeMenuOnScroll);
  }, [isMobileMenuOpen]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    setBubbleStyle({
      left: target.offsetLeft,
      width: target.offsetWidth,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setBubbleStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  const navItems = [
    { label: "Élevage", href: "#elevage" },
    { label: "Pension", href: "#pension" },
    { label: "Éducation", href: "#education" },
    { label: "Sellerie", href: "#sellerie" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex flex-col items-center pt-4 transition-all duration-300">
      <nav
        className={`flex items-center justify-between gap-4 px-5 py-3 rounded-full transition-all duration-300 ease-out z-50 ${
          scrolled || isMobileMenuOpen
            ? "w-[92%] max-w-4xl bg-white/50 backdrop-blur-2xl backdrop-saturate-[1.5] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(255,255,255,1)] border border-white ring-1 ring-black/5"
            : "w-[96%] max-w-5xl bg-white/30 backdrop-blur-2xl backdrop-saturate-[2] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,1)] border border-white/70"
        }`}
      >
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-stone-900 font-black text-xs shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_2px_4px_rgba(249,115,22,0.3)]">
            犬
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-stone-900 group-hover:text-orange-600 transition-colors">
              INOCHI INU
            </span>
            <span className="text-[10px] text-stone-500 font-bold tracking-widest -mt-1 hidden sm:block">
              命犬 • CANIN
            </span>
          </div>
        </a>

        {/* Menu Central avec Bulle de survol teintée Fauve */}
        <div 
          className="hidden md:flex items-center relative rounded-full bg-black/[0.04] p-1 border border-black/[0.05] shadow-[inset_0_1px_4px_rgba(0,0,0,0.08)]"
          onMouseLeave={handleMouseLeave}
        >
          {/* La bulle animée : Verre poli + Voile fauve chaleureux intégré */}
          <div
            className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-orange-100/60 via-amber-100/50 to-orange-100/60 backdrop-blur-md backdrop-saturate-[2] shadow-[0_4px_12px_rgba(249,115,22,0.12),inset_0_1px_2px_rgba(255,255,255,1),inset_0_-1px_1px_rgba(249,115,22,0.1)] border border-orange-200/60 transition-all duration-300 ease-out pointer-events-none"
            style={bubbleStyle}
          />

          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onMouseEnter={handleMouseEnter}
              className="relative z-10 px-4 py-1.5 text-xs font-bold text-stone-600 hover:text-orange-900 transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#reservation"
            className="hidden sm:inline-flex relative items-center justify-center px-4 py-2 text-xs font-bold text-white rounded-full bg-gradient-to-b from-orange-400 to-orange-500 shadow-[0_4px_12px_rgba(249,115,22,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:brightness-105 active:scale-95 transition-all duration-200"
          >
            Réserver
          </a>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-full bg-black/5 border border-black/10 text-stone-800 hover:bg-black/10 active:bg-black/15 active:scale-95 transition-all shadow-sm"
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

      <div
        className={`md:hidden absolute top-[76px] mt-2 w-[92%] max-w-4xl flex flex-col gap-2 p-4 origin-top transform-gpu transition-all duration-200 ease-out rounded-[2rem] bg-white/50 backdrop-blur-2xl backdrop-saturate-[2] border border-orange-100 ring-1 ring-black/5 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,1)] ${
          isMobileMenuOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-3 text-sm font-bold text-stone-700 hover:text-orange-600 active:text-orange-600 active:bg-orange-50/50 hover:bg-orange-50/50 hover:shadow-[0_4px_10px_rgba(249,115,22,0.05),inset_0_1px_2px_rgba(255,255,255,1)] border border-transparent hover:border-orange-200/50 rounded-2xl transition-all duration-200"
          >
            {item.label}
          </a>
        ))}
        <div className="h-px w-full bg-black/5 my-1"></div>
        <a
          href="#reservation"
          onClick={() => setIsMobileMenuOpen(false)}
          className="px-4 py-3 text-sm font-bold text-orange-600 active:bg-orange-100/50 hover:bg-orange-100/50 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,1)] border border-transparent hover:border-orange-200 rounded-2xl transition-all duration-200 text-center"
        >
          Réserver un séjour
        </a>
      </div>
    </header>
  );
}