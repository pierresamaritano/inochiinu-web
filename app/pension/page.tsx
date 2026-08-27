"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";
import ClientDogSelector from "../components/ClientDogSelector";

// =========================================================================
// TYPES ET COMPOSANT CARROUSEL PENSION (Style Apple)
// =========================================================================
interface CarouselSlide {
  src: string;
  alt: string;
  tag: string;
  caption: string;
}

const pensionSlides: CarouselSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=2000&auto=format&fit=crop", // Remplacer par photo de vos parcs
    alt: "Chiens jouant dans les parcs",
    tag: "Jeux & Liberté",
    caption: "Détente en plein air et interactions dans nos parcs arborés.",
  },
  {
    src: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=2000&auto=format&fit=crop", // Remplacer par photo d'un box
    alt: "Box confortable",
    tag: "Confort Premium",
    caption: "6 boxs spacieux, isolés et climatisés avec courette.",
  },
  {
    src: "https://images.unsplash.com/photo-1558009250-d4d21628e717?q=80&w=2000&auto=format&fit=crop", // Remplacer par photo caméra/sécurité
    alt: "Surveillance",
    tag: "Sécurité 24/7",
    caption: "Surveillance vidéo continue pour une tranquillité absolue.",
  },
];

function PensionCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInCenter, setIsInCenter] = useState(false);
  
  const centerTargetRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setIsInCenter(entry.isIntersecting); },
      { root: null, rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    if (centerTargetRef.current) observer.observe(centerTargetRef.current);
    return () => { if (centerTargetRef.current) observer.unobserve(centerTargetRef.current); };
  }, []);

  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? pensionSlides.length - 1 : prev - 1));
  const nextSlide = () => setCurrentIndex((prev) => (prev === pensionSlides.length - 1 ? 0 : prev + 1));

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
    <section className={`relative w-full transition-all duration-300 ${isInCenter ? "z-[60]" : "z-40"}`}>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-700 ease-out pointer-events-none ${isInCenter ? "opacity-100 -z-10" : "opacity-0 -z-10"}`} />
      <div className="relative w-full overflow-x-hidden py-10">
        <div ref={centerTargetRef} className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative flex items-center justify-center min-h-[380px] sm:min-h-[520px] px-4" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="relative flex w-full max-w-5xl items-center justify-center">
            {pensionSlides.map((slide, index) => {
              const offset = index - currentIndex;
              const isActive = index === currentIndex;
              return (
                <div key={`${slide.tag}-${index}`} onClick={() => setCurrentIndex(index)} className={`absolute w-[88vw] max-w-[820px] aspect-[4/3] sm:aspect-[16/9] rounded-[2rem] sm:rounded-[3rem] overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-stone-200/80 ${isActive ? "z-20 scale-100 opacity-100 translate-x-0" : offset === 1 || offset === -(pensionSlides.length - 1) ? "z-10 scale-[0.85] opacity-25 brightness-75 translate-x-[70%] sm:translate-x-[60%] pointer-events-auto hover:opacity-50" : offset === -1 || offset === pensionSlides.length - 1 ? "z-10 scale-[0.85] opacity-25 brightness-75 -translate-x-[70%] sm:-translate-x-[60%] pointer-events-auto hover:opacity-50" : "z-0 scale-75 opacity-0 pointer-events-none"}`}>
                  <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover select-none pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between p-4 rounded-2xl bg-[#FDFCF8]/60 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">{slide.tag}</span>
                      <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">{slide.caption}</p>
                    </div>
                    <span className="hidden sm:inline-flex text-[11px] font-bold text-stone-500 bg-white/70 px-3 py-1 rounded-full border border-stone-200">{index + 1} / {pensionSlides.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={prevSlide} className="hidden md:flex absolute left-8 z-50 h-12 w-12 items-center justify-center rounded-full bg-[#FDFCF8]/80 backdrop-blur-xl border border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-stone-800 hover:scale-110 active:scale-95 transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
          <button onClick={nextSlide} className="hidden md:flex absolute right-8 z-50 h-12 w-12 items-center justify-center rounded-full bg-[#FDFCF8]/80 backdrop-blur-xl border border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-stone-800 hover:scale-110 active:scale-95 transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
        </div>
        <div className="flex justify-center items-center gap-2 mt-8 relative z-40">
          {pensionSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)} className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8 bg-stone-700" : "w-2 bg-stone-300 hover:bg-stone-400"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// PAGE PRINCIPALE PENSION
// =========================================================================
export default function PensionPage() {
  const [user, setUser] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // ÉTATS POUR LE POP-UP D'INFORMATION PRÉALABLE
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    dog_id: "",
    dogName: "",
    dogBreed: "",
    startDate: "",
    endDate: "",
    clientPhone: "",
    specialNeeds: "",
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

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const slides = [
    {
      title: "6 Boxs Spacieux & Isolés",
      subtitle: "Un confort thermique total été comme hiver avec accès direct à des courettes individuelles sécurisées.",
      tag: "Capacité Limitée",
      gradient: "from-emerald-950/90 via-stone-900/60 to-black/80",
    },
    {
      title: "Grands Parcs de Détente Arborés",
      subtitle: "Sorties régulières quotidiennes, jeux et interactions contrôlées selon les affinités.",
      tag: "Dépense & Éveil",
      gradient: "from-stone-900/90 via-stone-900/60 to-black/80",
    },
    {
      title: "Journal de Bord Photo Quotidien",
      subtitle: "Recevez chaque jour des nouvelles et des clichés de votre chien directement sur votre Espace Membre.",
      tag: "Suivi Digital",
      gradient: "from-orange-950/90 via-stone-900/60 to-black/80",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // VÉRIFICATION DU POP-UP AVANT DE CONTINUER
  const handleInitialClick = () => {
    const hideInfo = localStorage.getItem("hidePensionInfo");
    if (hideInfo === "true") {
      handleActionClick();
    } else {
      setShowInfoModal(true);
    }
  };

  const handleContinueFromInfo = () => {
    if (dontShowAgain) {
      localStorage.setItem("hidePensionInfo", "true");
    }
    setShowInfoModal(false);
    handleActionClick();
  };

  const handleActionClick = () => {
    if (user) {
      setIsFormOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const redirectUrl = `${window.location.origin}/auth/callback?next=/pension`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.dog_id) {
      alert("Veuillez sélectionner ou ajouter un chien pour la réservation.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("pension_requests").insert([
        {
          user_id: user.id,
          dog_id: formData.dog_id,
          client_name: user.user_metadata?.full_name || "Client",
          client_email: user.email,
          client_phone: formData.clientPhone,
          dog_name: formData.dogName,
          dog_breed: formData.dogBreed,
          start_date: formData.startDate,
          end_date: formData.endDate,
          special_needs: formData.specialNeeds,
          status: "en_attente",
        },
      ]);
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 inset-x-0 h-[10vh] bg-gradient-to-b from-orange-600/10 to-transparent blur-[40px]" />
        <div className="absolute top-[20%] -left-[25%] w-[30vw] h-[60vh] rounded-full bg-orange-600/10 blur-[130px]" />
        <div className="absolute top-[20%] -right-[25%] w-[30vw] h-[60vh] rounded-full bg-orange-600/10 blur-[130px]" />
        <div className="absolute -bottom-10 inset-x-0 h-[10vh] bg-gradient-to-t from-orange-600/8 to-transparent blur-[50px]" />
      </div>

      <LiquidNavbar />

      {/* HERO SECTION */}
      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-6 text-center px-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-50/70 backdrop-blur-md px-4 py-1 text-xs font-bold text-orange-700 shadow-sm">
          <span>Garde Sérénité & Sécurité</span>
        </div>
        
        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          Pension Canine{" "}
          <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Tout Confort
          </span>
        </h1>
        
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-stone-600 sm:text-base">
          Capacité limitée à 6 places pour un accueil ultra-personnalisé, attentif et respectueux du rythme naturel de votre animal.
        </p>
      </section>

      {/* CARROUSEL VALEURS HERO */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-stone-900 shadow-md min-h-[220px] sm:min-h-[240px] flex items-center">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 flex flex-col justify-center px-8 sm:px-14 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
              <div className="relative z-10 max-w-xl text-white">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-white/10 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/10 inline-block mb-2">
                  {slide.tag}
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                  {slide.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}

          <button onClick={prevSlide} className="absolute left-4 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md cursor-pointer">←</button>
          <button onClick={nextSlide} className="absolute right-4 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md cursor-pointer">→</button>

          <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide ? "w-5 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BANDEAU RÉSERVATION */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-stone-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-black tracking-tight text-stone-900">
              Réserver un séjour en pension
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-medium">
              Vérifiez la disponibilité de nos 6 boxs et bloquez vos dates en toute tranquillité.
            </p>
          </div>
          <button
            onClick={handleInitialClick}
            className="w-full sm:w-auto shrink-0 flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-7 font-bold text-xs uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(249,115,22,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] transition hover:scale-105 hover:brightness-105 cursor-pointer"
          >
            Réserver un séjour
          </button>
        </div>
      </section>

      {/* DÉTAIL DES INSTALLATIONS */}
      <section className="relative z-10 border-t border-stone-200/60 bg-transparent py-16">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              Infrastructures & Bien-Être
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 mt-1">
              Un cadre conçu pour leur confort
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* CARTE 1 : 6 BOXS */}
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  6 Boxs Uniquement
                </span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">
                  Espaces Individuels
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">
                  Boxs carrelés, isolés et nettoyés quotidiennement avec literie confortable et accès direct à une courette privée.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-bold text-stone-400">
                Hygiène rigoureuse
              </div>
            </div>

            {/* CARTE 2 : DÉTENTE & LIBERTÉ */}
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  Détente & Liberté
                </span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">
                  Parcs Clôturés
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">
                  Plusieurs parcs arborés et sécurisés pour des moments de liberté totale, des jeux de flair et des baignades en été.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-bold text-stone-400">
                Clôtures haute sécurité 2m
              </div>
            </div>

            {/* CARTE 3 : CAMÉRAS & CLIMATISATION */}
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  Caméras & Climatisation
                </span>
                <h3 className="mt-4 text-lg font-bold text-stone-900">
                  Sécurité & Confort
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-500">
                  Surveillance vidéo continue 24h/24, espace intérieur thermorégulé avec chauffage l'hiver et climatisation l'été.
                </p>
              </div>
              <div className
