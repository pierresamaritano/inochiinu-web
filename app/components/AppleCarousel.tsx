"use client";

import { useState, useRef } from "react";

interface CarouselSlide {
  src: string;
  alt: string;
  tag: string;
  caption: string;
}

const slides: CarouselSlide[] = [
  {
    src: "/hero-akita.jpg",
    alt: "Akita Inu dans la nature",
    tag: "Akita Inu",
    caption: "Noblesse, puissance et équilibre au naturel",
  },
  {
    src: "/DODO-Akita.jpeg",
    alt: "Shiba Inu",
    tag: "Shiba Inu",
    caption: "Vivacité, autonomie et loyauté sans faille",
  },
  {
    src: "/DODO-papa.jpeg",
    alt: "Grand air et balades en forêt",
    tag: "Plein Air",
    caption: "Grands espaces et socialisation bienveillante",
  },
];

export default function AppleCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const prevSlide = () => { setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1)); };
  const nextSlide = () => { setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1)); };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section className="relative w-full py-6 sm:py-10 z-20">
      <div 
        className="relative w-full max-w-4xl mx-auto px-4 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* CONTENEUR FLEX GLISSANT (Sans position absolute qui fait buguer Safari) */}
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={slide.tag} className="w-full shrink-0 px-2">
              <div className="relative aspect-[4/3] sm:aspect-[16/9] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-lg border border-stone-200/80 bg-stone-100">
                <img
                  src={slide.src}
                  alt={slide.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover select-none pointer-events-none"
                />
                
                {/* Légende */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between p-4 rounded-2xl bg-white/9onta backdrop-blur-md border border-white/80 shadow-sm">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                      {slide.tag}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">
                      {slide.caption}
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex text-[11px] font-bold text-stone-500 bg-white/70 px-3 py-1 rounded-full border border-stone-200">
                    {index + 1} / {slides.length}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Boutons de navigation (PC) */}
        <button
          onClick={prevSlide}
          aria-label="Précédent"
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-stone-200 shadow-md text-stone-800 hover:scale-110 transition-all cursor-pointer"
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          aria-label="Suivant"
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-stone-200 shadow-md text-stone-800 hover:scale-110 transition-all cursor-pointer"
        >
          →
        </button>

        {/* Indicateurs */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Aller à la diapositive ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIndex ? "w-8 bg-stone-700" : "w-2 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}