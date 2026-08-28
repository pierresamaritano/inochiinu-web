"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";
import ClientDogSelector from "../components/ClientDogSelector";
import PensionCalendar from "../components/PensionCalendar";

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
    src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=2000&auto=format&fit=crop", 
    alt: "Chiens jouant dans les parcs",
    tag: "Jeux & Liberté",
    caption: "Détente en plein air et interactions dans nos parcs arborés.",
  },
  {
    src: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=2000&auto=format&fit=crop", 
    alt: "Box confortable",
    tag: "Confort Premium",
    caption: "6 boxs spacieux, isolés et climatisés avec courette.",
  },
  {
    src: "https://images.unsplash.com/photo-1558009250-d4d21628e717?q=80&w=2000&auto=format&fit=crop", 
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
  
  const [hasSecondDog, setHasSecondDog] = useState(false);
  
  const [formData, setFormData] = useState({
    dog_id: "",
    dogName: "",
    dogBreed: "",
    dog2_id: "",
    dog2Name: "",
    dog2Breed: "",
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
      alert("Veuillez sélectionner au moins un premier chien.");
      return;
    }
    if (hasSecondDog && !formData.dog2_id) {
      alert("Veuillez sélectionner le deuxième chien, ou décochez l'option.");
      return;
    }

    setSubmitting(true);
    try {
      const finalDogName = hasSecondDog ? `${formData.dogName} & ${formData.dog2Name}` : formData.dogName;
      const finalDogBreed = hasSecondDog ? `${formData.dogBreed} - ${formData.dog2Breed}` : formData.dogBreed;
      
      const { error } = await supabase.from("pension_requests").insert([
        {
          user_id: user.id,
          dog_id: formData.dog_id, // L'ID du chien principal sert de référence
          client_name: user.user_metadata?.full_name || "Client",
          client_email: user.email,
          client_phone: formData.clientPhone,
          dog_name: finalDogName,
          dog_breed: finalDogBreed,
          start_date: formData.startDate,
          end_date: formData.endDate,
          special_needs: formData.specialNeeds,
          status: "en_attente",
        },
      ]);
      
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      console.error("Erreur Supabase :", err);
      alert(`Erreur lors de la réservation : ${err.message || "Veuillez réessayer."}`);
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
              <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-bold text-stone-400">
                Technologie au service du chien
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CARROUSEL DES INSTALLATIONS PENSION (Style Apple) */}
      <PensionCarousel />
      {/* SECTION CONTACT & COORDONNÉES */}
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
              <a href="tel:0600000000" className="mt-4 text-sm font-black text-orange-600 hover:text-orange-700">06 00 00 00 00</a>
            </div>

            <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-stone-900">Email</h3>
              <p className="text-xs text-stone-500 mt-1">Réponse sous 24h</p>
              <a href="mailto:contact@inochi-inu.fr" className="mt-4 text-sm font-black text-orange-600 hover:text-orange-700">contact@inochi-inu.fr</a>
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
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full">Instagram ➔</a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full">Facebook ➔</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {/* MODALES */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowInfoModal(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <button onClick={() => setShowInfoModal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 cursor-pointer">✕</button>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4 text-xl">ℹ️</div>
            <h3 className="text-xl font-black text-stone-900">Avant de réserver...</h3>
            <div className="mt-4 space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>Pour garantir la sécurité et le bien-être de tous nos pensionnaires, voici nos prérequis :</p>
              <ul className="list-disc pl-5 space-y-1 font-medium text-stone-700">
                <li><strong className="text-stone-900">Vaccins à jour obligatoires</strong> (incluant la toux du chenil).</li>
                <li>Chien identifié (puce ou tatouage).</li>
                <li>Traitement antiparasitaire de moins d'un mois.</li>
              </ul>
              <p className="text-xs text-stone-500 italic">Un justificatif vous sera demandé à votre arrivée.</p>
            </div>
            <label className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-stone-100 border border-stone-200 cursor-pointer hover:bg-stone-200/50 transition-colors">
              <input type="checkbox" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer" />
              <span className="text-xs font-bold text-stone-600">J'ai compris, ne plus afficher ce message.</span>
            </label>
            <button onClick={handleContinueFromInfo} className="mt-6 w-full py-3.5 bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-stone-800 transition-all cursor-pointer shadow-md">
              Continuer vers la réservation
            </button>
          </div>
        </div>
      )}

      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAuthOpen(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-6 right-6 text-stone-600 cursor-pointer">✕</button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm">犬</div>
              <h3 className="text-2xl font-black text-stone-900">Connexion requise</h3>
              <p className="mt-2 text-sm text-stone-500 font-medium">Connectez-vous pour demander une réservation de pension et recevoir vos photos quotidiennes.</p>
            </div>
            <button onClick={handleGoogleLogin} disabled={authLoading} className="mt-8 flex h-13 w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white px-6 font-bold text-stone-800 shadow-sm hover:scale-[1.02] transition-all cursor-pointer">
              <span>{authLoading ? "Redirection..." : "Continuer avec Google"}</span>
            </button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-6 sm:p-10 shadow-2xl">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-6 right-6 text-stone-600 cursor-pointer">✕</button>
            {submitted ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4">✓</div>
                <h3 className="text-xl font-black text-stone-900">Demande de séjour reçue !</h3>
                <p className="text-xs text-stone-500 mt-2">Nous vérifions le planning des 6 boxs et validons votre demande rapidement.</p>
                <a href="/espace-membre" className="mt-6 inline-block px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full cursor-pointer">Aller sur Mon Espace</a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-black uppercase text-orange-600">Étape {step} sur 2</span>
                    <h3 className="text-lg font-black text-stone-900">{step === 1 ? "Dates & Chien(s)" : "Besoins & Contact"}</h3>
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="mb-6">
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-3">Sélectionnez vos dates *</label>
                      <PensionCalendar 
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        onChange={(start, end) => setFormData(prev => ({ ...prev, startDate: start, endDate: end }))}
                      />
                    </div>
                    {user && (
                      <>
                        <ClientDogSelector
                          isAdmin={false}
                          currentUserId={user.id}
                          onDogSelected={(dog) =>
                            setFormData(prev => ({ ...prev, dog_id: dog.id, dogName: dog.name, dogBreed: dog.breed }))
                          }
                        />
                        <div className="mt-2">
                          {!hasSecondDog ? (
                            <button
                              type="button"
                              onClick={() => setHasSecondDog(true)}
                              className="text-[11px] font-black text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-1"
                            >
                              + Ajouter un deuxième chien (même box)
                            </button>
                          ) : (
                            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 relative mt-4">
                              <button 
                                type="button" 
                                onClick={() => {
                                  setHasSecondDog(false);
                                  setFormData(prev => ({ ...prev, dog2_id: "", dog2Name: "", dog2Breed: "" }));
                                }}
                                className="absolute top-3 right-3 text-[10px] font-bold text-stone-400 hover:text-red-500 cursor-pointer"
                              >
                                ✕ Retirer
                              </button>
                              <p className="text-[10px] font-black uppercase text-orange-700 mb-3">Deuxième pensionnaire</p>
                              <ClientDogSelector
                                isAdmin={false}
                                currentUserId={user.id}
                                excludeDogId={formData.dog_id}
                                onDogSelected={(dog) =>
                                  setFormData(prev => ({ ...prev, dog2_id: dog.id, dog2Name: dog.name, dog2Breed: dog.breed }))
                                }
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="pt-4 flex justify-end">
                      <button 
                        type="button" 
                        disabled={!formData.startDate || !formData.endDate || !formData.dog_id || (hasSecondDog && !formData.dog2_id)} 
                        onClick={() => setStep(2)} 
                        className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full disabled:opacity-40 cursor-pointer transition-opacity"
                      >
                        Suivant ➔
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Téléphone de contact *</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="06 12 34 56 78" 
                        value={formData.clientPhone} 
                        onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))} 
                        className="w-full max-w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Besoins spécifiques / Alimentation / Médicaments</label>
                      <textarea 
                        rows={3} 
                        placeholder="Précisez le type de croquettes, allergies, compatibilité congénères..." 
                        value={formData.specialNeeds} 
                        onChange={(e) => setFormData(prev => ({ ...prev, specialNeeds: e.target.value }))} 
                        className="w-full max-w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" 
                      />
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-stone-500 cursor-pointer hover:text-stone-900">← Retour</button>
                      <button type="submit" disabled={submitting} className="px-6 py-3 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase rounded-full cursor-pointer shadow-md disabled:opacity-50 transition-all">{submitting ? "Envoi..." : "Envoyer ma demande"}</button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}