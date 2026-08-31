"use client";

import { useState, useEffect, useRef } from "react";

export interface CarouselSlide {
  src: string;
  type?: "image" | "video"; // On ajoute ce paramètre
  alt: string;
  tag: string;
  caption: string;
}

interface AppleCarouselProps {
  slides: CarouselSlide[];
}

export default function AppleCarousel({ slides }: AppleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInCenter, setIsInCenter] = useState(false);
  
  const centerTargetRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (!slides || slides.length === 0) return null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInCenter(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "-45% 0px -45% 0px", 
        threshold: 0 
      }
    );

    if (centerTargetRef.current) {
      observer.observe(centerTargetRef.current);
    }

    return () => {
      if (centerTargetRef.current) observer.unobserve(centerTargetRef.current);
    };
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section className={`relative w-full transition-all duration-300 ${isInCenter ? "z-[60]" : "z-40"}`}>
      <div className={`fixed inset-0 bg-black/70 transition-opacity duration-500 ease-out pointer-events-none ${isInCenter ? "opacity-100 -z-10" : "opacity-0 -z-10"}`} />

      <div className="relative w-full overflow-x-hidden py-10">
        <div ref={centerTargetRef} className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative flex items-center justify-center min-h-[380px] sm:min-h-[520px] px-4" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="relative flex w-full max-w-5xl items-center justify-center">
            {slides.map((slide, index) => {
              const offset = index - currentIndex;
              const isActive = index === currentIndex;

              // Détection automatique si c'est une vidéo (.mp4) ou déclaré comme "video"
              const isVideo = slide.type === "video" || slide.src.toLowerCase().endsWith(".mp4") || slide.src.toLowerCase().endsWith(".mov");

              return (
                <div
                  key={`${slide.tag}-${index}`}
                  onClick={() => setCurrentIndex(index)}
                  className={`absolute w-[88vw] max-w-[820px] aspect-[4/3] sm:aspect-[16/9] rounded-[2rem] sm:rounded-[3rem] overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-stone-200/80 ${
                    isActive ? "z-20 scale-100 opacity-100 translate-x-0" : offset === 1 || offset === -(slides.length - 1) ? "z-10 scale-[0.85] opacity-25 brightness-75 translate-x-[70%] sm:translate-x-[60%] pointer-events-auto hover:opacity-50" : offset === -1 || offset === slides.length - 1 ? "z-10 scale-[0.85] opacity-25 brightness-75 -translate-x-[70%] sm:-translate-x-[60%] pointer-events-auto hover:opacity-50" : "z-0 scale-75 opacity-0 pointer-events-none"
                  }`}
                >
                {/* GESTION IMAGE VS VIDÉO */}
                    {isVideo ? (
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        className="h-full w-full object-cover select-none pointer-events-none"
                      >
                        <source src={slide.src} type="video/mp4" />
                      </video>
                    ) : (
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover select-none pointer-events-none"
                    />
                  )}
                  
                  {/* Légende */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between p-4 rounded-2xl bg-[#FDFCF8]/60 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">{slide.tag}</span>
                      <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">{slide.caption}</p>
                    </div>
                    <span className="hidden sm:inline-flex text-[11px] font-bold text-stone-500 bg-white/70 px-3 py-1 rounded-full border border-stone-200">
                      {index + 1} / {slides.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={prevSlide} aria-label="Image précédente" className="hidden md:flex absolute left-8 z-50 h-12 w-12 items-center justify-center rounded-full bg-[#FDFCF8]/80 backdrop-blur-xl border border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-stone-800 hover:scale-110 active:scale-95 transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <button onClick={nextSlide} aria-label="Image suivante" className="hidden md:flex absolute right-8 z-50 h-12 w-12 items-center justify-center rounded-full bg-[#FDFCF8]/80 backdrop-blur-xl border border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-stone-800 hover:scale-110 active:scale-95 transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>

        <div className="flex justify-center items-center gap-2 mt-8 relative z-40">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)} aria-label={`Aller à la photo ${i + 1}`} className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === currentIndex ? "w-8 bg-stone-700" : "w-2 bg-stone-300 hover:bg-stone-400"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}