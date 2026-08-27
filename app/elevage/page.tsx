"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";

// =========================================================================
// INTERFACES & TYPES
// =========================================================================
interface GrandParent {
  role: string;
  name: string;
  details?: string;
}

interface DogParent {
  name: string;
  origin: string;
  titles: string;
  desc: string;
  gParents: GrandParent[];
  ggParents: string[];
}

interface CarouselSlide {
  src: string;
  alt: string;
  tag: string;
  caption: string;
}

interface DogProfile {
  id: string;
  name: string;
  badgeName: string;
  role: "Étalon" | "Lice";
  affixe: string;
  
  // Nouveaux champs d'informations
  fullName: string;
  color: string;
  height: string;
  weight: string;
  birthDate: string;
  images: CarouselSlide[]; // Photos pour le carrousel

  titles: string;
  description: string;
  father: DogParent;
  mother: DogParent;
}

// =========================================================================
// COMPOSANT CARROUSEL APPLE INTEGRE (S'adapte au chien sélectionné)
// =========================================================================
function DogCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInCenter, setIsInCenter] = useState(false);
  
  const centerTargetRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
  }, [slides]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setIsInCenter(entry.isIntersecting); },
      { root: null, rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    if (centerTargetRef.current) observer.observe(centerTargetRef.current);
    return () => { if (centerTargetRef.current) observer.unobserve(centerTargetRef.current); };
  }, []);

  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

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

  if (!slides || slides.length === 0) return null;

  return (
    <section className={`relative w-full transition-all duration-300 ${isInCenter ? "z-[60]" : "z-40"}`}>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-700 ease-out pointer-events-none ${isInCenter ? "opacity-100 -z-10" : "opacity-0 -z-10"}`} />
      <div className="relative w-full overflow-x-hidden py-10">
        <div ref={centerTargetRef} className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative flex items-center justify-center min-h-[380px] sm:min-h-[520px] px-4" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="relative flex w-full max-w-5xl items-center justify-center">
            {slides.map((slide, index) => {
              const offset = index - currentIndex;
              const isActive = index === currentIndex;
              return (
                <div key={`${slide.tag}-${index}`} onClick={() => setCurrentIndex(index)} className={`absolute w-[88vw] max-w-[820px] aspect-[4/3] sm:aspect-[16/9] rounded-[2rem] sm:rounded-[3rem] overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-stone-200/80 ${isActive ? "z-20 scale-100 opacity-100 translate-x-0" : offset === 1 || offset === -(slides.length - 1) ? "z-10 scale-[0.85] opacity-25 brightness-75 translate-x-[70%] sm:translate-x-[60%] pointer-events-auto hover:opacity-50" : offset === -1 || offset === slides.length - 1 ? "z-10 scale-[0.85] opacity-25 brightness-75 -translate-x-[70%] sm:-translate-x-[60%] pointer-events-auto hover:opacity-50" : "z-0 scale-75 opacity-0 pointer-events-none"}`}>
                  <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover select-none pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between p-4 rounded-2xl bg-[#FDFCF8]/60 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">{slide.tag}</span>
                      <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">{slide.caption}</p>
                    </div>
                    <span className="hidden sm:inline-flex text-[11px] font-bold text-stone-500 bg-white/70 px-3 py-1 rounded-full border border-stone-200">{index + 1} / {slides.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={prevSlide} className="hidden md:flex absolute left-8 z-50 h-12 w-12 items-center justify-center rounded-full bg-[#FDFCF8]/80 backdrop-blur-xl border border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-stone-800 hover:scale-110 active:scale-95 transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
          <button onClick={nextSlide} className="hidden md:flex absolute right-8 z-50 h-12 w-12 items-center justify-center rounded-full bg-[#FDFCF8]/80 backdrop-blur-xl border border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-stone-800 hover:scale-110 active:scale-95 transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
        </div>
        <div className="flex justify-center items-center gap-2 mt-8 relative z-40">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)} className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8 bg-stone-700" : "w-2 bg-stone-300 hover:bg-stone-400"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// PAGE PRINCIPALE
// =========================================================================
export default function ElevagePage() {
  const [user, setUser] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Sélecteur de reproducteur (Menu Déroulant)
  const [selectedDogIndex, setSelectedDogIndex] = useState(0);
  const [isDogMenuOpen, setIsDogMenuOpen] = useState(false);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    preferredBreed: "Akita Inu LOF", livingEnvironment: "Maison avec jardin clôturé", experiencePrimitive: "Première expérience avec race primitive", familyComposition: "", motivation: "", clientPhone: "",
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
    { title: "Lignées Japonaises & Sélection LOF", subtitle: "Génétique rigoureusement testée pour des chiots sains.", tag: "Excellence", gradient: "from-stone-900/90 via-stone-900/60 to-black/80" },
    { title: "Socialisation Précoce Bienveillante", subtitle: "Éveil sensoriel en famille dès les premières semaines.", tag: "Développement", gradient: "from-orange-950/90 via-stone-900/60 to-black/80" },
    { title: "Suivi de Croissance & Conseils à Vie", subtitle: "Courbe de poids interactive sur votre Espace Membre.", tag: "Engagement", gradient: "from-amber-950/90 via-stone-900/60 to-black/80" },
  ];

  // Base de données des reproducteurs
  const dogs: DogProfile[] = [
    {
      id: "baiko", name: "Baïko (Ryu)", badgeName: "Baïko", role: "Étalon", affixe: "Affixe Kazan No",
      fullName: "Baïko Ryu Go Kazan No", color: "Roux (Aka)", height: "67 cm", weight: "34 kg", birthDate: "12 Octobre 2021",
      images: [
        { src: "/hero-akita.jpg", alt: "Baiko", tag: "Morphologie", caption: "Construction puissante et ossature forte." },
        { src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=2000&auto=format&fit=crop", alt: "Baiko forêt", tag: "Caractère", caption: "Tempérament posé en extérieur." }
      ],
      titles: "Lignées de Champions Internationaux & Japonais",
      description: "Issu du mariage d'excellence entre Katsunori Go et la championne Kazan No Teïumi. Il transmet une ossature puissante, un port de tête altier et un tempérament d'une rare sérénité.",
      father: {
        name: "Katsunori Go Senshi Shimai", origin: "Import Pologne", titles: "CH Junior France • Titré CACIB", desc: "Descendant direct des affixes Senshi No Inu et Isegumo Kensha.",
        gParents: [{ role: "Grand-Père Paternel", name: "Ryuseimaru Go Isegumo Kensha" }, { role: "Grand-Mère Paternelle", name: "Chikako Go Senshi No Inu", details: "Championne Pologne" }],
        ggParents: ["Hiryuu Go Rokkuhando Touwa", "Aihime Go Amakusa Tajiri", "Kou Zan Go Shun'You Kensha", "Lignée Senshi No Inu"],
      },
      mother: {
        name: "CH. Kazan No Teïumi", origin: "Affixe Kazan No", titles: "Championne de France • Junior World Winner", desc: "Fille directe de CH. Kazan No Rumi.",
        gParents: [{ role: "Grand-Père Maternel", name: "Kotei Go Sara Hana Kensha" }, { role: "Grand-Mère Maternelle", name: "CH. Kazan No Rumi" }],
        ggParents: ["Kanon Go Tamashi Kensha", "Lignée Sara Hana", "Kobe No Minami Go Tamashi", "CH. Nayakiwa Go Tokimitsu"],
      },
    },
    {
      id: "lice-1", name: "Lice 1 (À venir)", badgeName: "Lice 1", role: "Lice", affixe: "Affixe Officiel LOF",
      fullName: "Lice Akita 1", color: "Bringé (Tora)", height: "62 cm", weight: "28 kg", birthDate: "À venir",
      images: [
        { src: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=2000&auto=format&fit=crop", alt: "Lice 1", tag: "Morphologie", caption: "Excellente ligne de dos et aplombs." }
      ],
      titles: "Sélection LOF & Standard Japonais",
      description: "Notre lice vit au cœur du foyer aux côtés de la famille. Sélectionnée pour sa douceur, sa conformité morphologique et son équilibre.",
      father: {
        name: "Père de la Lice 1", origin: "Lignée Sélectionnée", titles: "Certifié LOF", desc: "Excellente tête et tempérament stable.",
        gParents: [{ role: "Grand-Père Paternel", name: "Paternel L1" }, { role: "Grand-Mère Paternelle", name: "Maternelle L1" }],
        ggParents: ["Arrière G.P 1", "Arrière G.M 1", "Arrière G.P 2", "Arrière G.M 2"],
      },
      mother: {
        name: "Mère de la Lice 1", origin: "Lignée Reconnue", titles: "Excellente en Exposition", desc: "Lignée indemne de dysplasie.",
        gParents: [{ role: "Grand-Père Maternel", name: "Paternel L1" }, { role: "Grand-Mère Maternelle", name: "Maternelle L1" }],
        ggParents: ["Arrière G.P 3", "Arrière G.M 3", "Arrière G.P 4", "Arrière G.M 4"],
      },
    }
  ];

  // Fonctions de logique du composant
  useEffect(() => {
    const interval = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % slides.length); }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const handleInitialClick = () => { if (localStorage.getItem("hideElevageInfo") === "true") { handleActionClick(); } else { setShowInfoModal(true); } };
  const handleContinueFromInfo = () => { if (dontShowAgain) { localStorage.setItem("hideElevageInfo", "true"); } setShowInfoModal(false); handleActionClick(); };
  const handleActionClick = () => { if (user) { setIsFormOpen(true); } else { setIsAuthOpen(true); } };
  const handleGoogleLogin = async () => {
    try { setAuthLoading(true); await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=/elevage` } }); } 
    catch (err) { console.error(err); setAuthLoading(false); }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user) return; setSubmitting(true);
    try {
      await supabase.from("adoption_requests").insert([{ user_id: user.id, client_name: user.user_metadata?.full_name || "Client", client_email: user.email, client_phone: formData.clientPhone, preferred_breed: formData.preferredBreed, living_environment: formData.livingEnvironment, experience_primitive: formData.experiencePrimitive, family_composition: formData.familyComposition, motivation: formData.motivation, status: "en_attente" }]);
      setSubmitted(true);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const currentProfile = dogs[selectedDogIndex];
  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-orange-200 selection:text-stone-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 inset-x-0 h-[10vh] bg-gradient-to-b from-orange-600/10 to-transparent blur-[40px]" />
        <div className="absolute top-[20%] -left-[25%] w-[30vw] h-[60vh] rounded-full bg-orange-600/10 blur-[130px]" />
        <div className="absolute top-[20%] -right-[25%] w-[30vw] h-[60vh] rounded-full bg-orange-600/10 blur-[130px]" />
        <div className="absolute -bottom-10 inset-x-0 h-[10vh] bg-gradient-to-t from-orange-600/8 to-transparent blur-[50px]" />
      </div>

      <LiquidNavbar />

      {/* EN-TÊTE PRINCIPAL */}
      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-6 text-center px-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-50/70 backdrop-blur-md px-4 py-1 text-xs font-bold text-orange-700 shadow-sm">
          <span>Les Héritiers de Boshin • Élevage Passion</span>
        </div>
        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          Chiots Akita Inu LOF <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Équilibrés</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-stone-600 sm:text-base leading-relaxed">
          Membre à part entière de la famille, notre lice vit et élève ses chiots à la maison, pour une socialisation dès leur plus jeune âge.
        </p>
      </section>

      {/* CARROUSEL VALEURS */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-stone-900 shadow-md min-h-[220px] sm:min-h-[240px] flex items-center">
          {slides.map((slide, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-700 flex flex-col justify-center px-8 sm:px-14 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
              <div className="relative z-10 max-w-xl text-white">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-white/10 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/10 inline-block mb-2">{slide.tag}</span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">{slide.title}</h2>
                <p className="mt-2 text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">{slide.subtitle}</p>
              </div>
            </div>
          ))}
          <button onClick={prevSlide} className="absolute left-4 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer">←</button>
          <button onClick={nextSlide} className="absolute right-4 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer">→</button>
          <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center gap-1.5">
            {slides.map((_, index) => (
              <button key={index} onClick={() => setCurrentSlide(index)} className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* BANDEAU CANDIDATURE */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-stone-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-black tracking-tight text-stone-900">Candidater pour une future portée d'Akita Inu</h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-medium">Remplissez votre questionnaire d'adoption pour réserver votre chiot Akita et suivre sa croissance.</p>
          </div>
          <button onClick={handleInitialClick} className="w-full sm:w-auto shrink-0 flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-7 font-bold text-xs uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition hover:scale-105 hover:brightness-105 cursor-pointer">
            Déposer une candidature
          </button>
        </div>
      </section>

      {/* PHILOSOPHIE ÉLEVAGE */}
      <section className="relative z-10 border-t border-stone-200/60 bg-transparent py-16">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">Éthique & Responsabilité</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 mt-1">
              Penser chaque étape avec exigence pour son bien-être et le vôtre
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm">
              <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">Santé</span>
              <h3 className="mt-4 text-lg font-bold text-stone-900">Tests Génétiques</h3>
              <p className="mt-2 text-xs text-stone-500">Reproducteurs Akita radiographiés hanches/coudes, dépistés tares oculaires et enregistrés LOF.</p>
            </div>
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm">
              <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">Éveil</span>
              <h3 className="mt-4 text-lg font-bold text-stone-900">Socialisation</h3>
              <p className="mt-2 text-xs text-stone-500">Contact quotidien avec les humains, bruits de maison, début de la propreté et du port du collier.</p>
            </div>
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/60 backdrop-blur-xl p-8 shadow-sm">
              <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">Accompagnement</span>
              <h3 className="mt-4 text-lg font-bold text-stone-900">Suivi à Vie</h3>
              <p className="mt-2 text-xs text-stone-500">Conseils d'éducation personnalisés, kit chiot complet et accompagnement dans l'intégration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
          GRANDE SECTION UNIFIÉE : NOS REPRODUCTEURS LOF 
          (Menu + Infos + Carrousel + Pedigree)
          ============================================================================== */}
      <section className="relative z-10 border-t border-stone-200/60 bg-white/50 backdrop-blur-xl py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">

          {/* 1. EN-TÊTE ET SÉLECTEUR DÉROULANT */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative">
            <div className="text-center lg:text-left mx-auto lg:mx-0 max-w-xl">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50/80 px-3 py-1 rounded-full sm:bg-transparent sm:p-0">
                Génétique & Standard Japonais
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 mt-2 sm:mt-1">
                Nos reproducteurs LOF
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                Découvrez les informations, la morphologie et l'arbre généalogique certifié de notre étalon et de nos lices.
              </p>
            </div>

            {/* SÉLECTEUR DÉROULANT (DROPDOWN) */}
            <div className="relative w-full max-w-xs mx-auto lg:mx-0 z-[70]">
              <button onClick={() => setIsDogMenuOpen(!isDogMenuOpen)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-sm transition-all hover:bg-stone-50 hover:border-stone-300 focus:outline-none cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-lg">
                    {currentProfile.role === "Étalon" ? "🐕" : "🌸"}
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-orange-600">{currentProfile.role} sélectionné(e)</span>
                    <span className="block text-sm font-black text-stone-900 mt-0.5">{currentProfile.badgeName}</span>
                  </div>
                </div>
                <span className={`text-stone-400 transition-transform duration-200 ${isDogMenuOpen ? "rotate-180" : ""}`}>▼</span>
              </button>

              {isDogMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDogMenuOpen(false)} />
                  <div className="absolute right-0 lg:right-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 backdrop-blur-xl shadow-xl">
                    {dogs.map((dog, index) => (
                      <button key={dog.id} onClick={() => { setSelectedDogIndex(index); setIsDogMenuOpen(false); }} className={`flex w-full items-center gap-3 p-3.5 text-left transition-colors cursor-pointer hover:bg-orange-50/50 ${selectedDogIndex === index ? "bg-orange-50 text-orange-900" : "text-stone-700"}`}>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${selectedDogIndex === index ? "bg-orange-200/50" : "bg-stone-100"}`}>
                          {dog.role === "Étalon" ? "🐕" : "🌸"}
                        </div>
                        <div>
                          <span className="block text-sm font-bold">{dog.badgeName}</span>
                          <span className="block text-[10px] font-medium text-stone-500 uppercase">{dog.role}</span>
                        </div>
                        {selectedDogIndex === index && <span className="ml-auto text-orange-600 font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. INFORMATIONS DU REPRODUCTEUR SÉLECTIONNÉ */}
          <div className="relative z-10 bg-white/80 rounded-[2rem] border border-stone-200/80 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-4 mb-4">Profil & Morphologie</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <span className="block text-[10px] font-bold uppercase text-stone-400">Nom Complet</span>
                <span className="block text-sm font-black text-stone-800 mt-1">{currentProfile.fullName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-stone-400">Naissance</span>
                <span className="block text-sm font-black text-stone-800 mt-1">{currentProfile.birthDate}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-stone-400">Couleur</span>
                <span className="block text-sm font-black text-stone-800 mt-1">{currentProfile.color}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-stone-400">Taille</span>
                <span className="block text-sm font-black text-stone-800 mt-1">{currentProfile.height}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-stone-400">Poids</span>
                <span className="block text-sm font-black text-stone-800 mt-1">{currentProfile.weight}</span>
              </div>
            </div>
            <p className="mt-6 text-sm text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-100">
              {currentProfile.description}
            </p>
          </div>

          {/* 3. CARROUSEL APPLE DÉDIÉ AU CHIEN */}
          <DogCarousel slides={currentProfile.images} />
          {/* 4. PEDIGREE : PALMARÈS ET ARBRE GÉNÉALOGIQUE */}
          <div className="pt-8 border-t border-stone-200/60 relative z-10">
            <h3 className="text-xl font-black text-stone-900 mb-6 text-center sm:text-left">Arbre Généalogique Officiel</h3>
            
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-8">
              {/* PÈRE */}
              <div className="rounded-[2rem] border border-stone-200/80 bg-white/90 p-5 sm:p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Lignée Paternelle</span>
                    <span className="text-[11px] sm:text-xs font-bold text-stone-400">{currentProfile.father.origin}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900">{currentProfile.father.name}</h3>
                  <p className="mt-1 text-xs font-bold text-orange-600">{currentProfile.father.titles}</p>
                  <p className="mt-2.5 text-xs text-stone-500 leading-relaxed">{currentProfile.father.desc}</p>
                </div>
              </div>

              {/* MÈRE */}
              <div className="rounded-[2rem] border border-stone-200/80 bg-white/90 p-5 sm:p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Lignée Maternelle</span>
                    <span className="text-[11px] sm:text-xs font-bold text-stone-400">{currentProfile.mother.origin}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900">{currentProfile.mother.name}</h3>
                  <p className="mt-1 text-xs font-bold text-orange-600">{currentProfile.mother.titles}</p>
                  <p className="mt-2.5 text-xs text-stone-500 leading-relaxed">{currentProfile.mother.desc}</p>
                </div>
              </div>
            </div>

            {/* ARBRE SUR 3 GÉNÉRATIONS */}
            <div className="rounded-[2rem] sm:rounded-[2.5rem] border border-stone-200/80 bg-white/90 p-5 sm:p-8 shadow-sm space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200/60 pb-3 sm:pb-4 text-center sm:text-left">
                <div>
                  <span className="text-[10px] font-black uppercase text-orange-600">Certificat Généalogique</span>
                  <h3 className="text-base sm:text-lg font-black text-stone-900">Pedigree certifié — {currentProfile.badgeName}</h3>
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2 text-stone-400 text-xs font-bold">
                  <span>{currentProfile.affixe}</span>
                  <span className="sm:hidden text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium">Glisser ➔</span>
                </div>
              </div>

              <div className="overflow-x-auto pb-3 -mx-2 px-2">
                <div className="min-w-[680px] grid grid-cols-3 gap-3 sm:gap-4 text-xs">
                  {/* 1ère Génération */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">1ère Génération</span>
                    <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-3 space-y-1">
                      <span className="text-[9px] font-black text-orange-700 uppercase block">Père</span>
                      <p className="font-black text-stone-900 leading-tight">{currentProfile.father.name}</p>
                      <p className="text-[10px] text-stone-500 font-medium">{currentProfile.father.titles}</p>
                    </div>
                    <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-3 space-y-1">
                      <span className="text-[9px] font-black text-orange-700 uppercase block">Mère</span>
                      <p className="font-black text-stone-900 leading-tight">{currentProfile.mother.name}</p>
                      <p className="text-[10px] text-stone-500 font-medium">{currentProfile.mother.titles}</p>
                    </div>
                  </div>

                  {/* 2ème Génération */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">2ème Génération</span>
                    {currentProfile.father.gParents.map((gp, i) => (
                      <div key={`f-gp-${i}`} className="rounded-2xl border border-stone-200 bg-stone-50/60 p-2.5 space-y-0.5">
                        <span className="text-[9px] font-bold text-stone-400 uppercase block">{gp.role}</span>
                        <p className="font-bold text-stone-800 leading-tight">{gp.name}</p>
                        {gp.details && <p className="text-[10px] text-stone-400">{gp.details}</p>}
                      </div>
                    ))}
                    {currentProfile.mother.gParents.map((gp, i) => (
                      <div key={`m-gp-${i}`} className="rounded-2xl border border-stone-200 bg-stone-50/60 p-2.5 space-y-0.5">
                        <span className="text-[9px] font-bold text-stone-400 uppercase block">{gp.role}</span>
                        <p className="font-bold text-stone-800 leading-tight">{gp.name}</p>
                        {gp.details && <p className="text-[10px] text-stone-400">{gp.details}</p>}
                      </div>
                    ))}
                  </div>

                  {/* 3ème Génération */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">3ème Génération</span>
                    {currentProfile.father.ggParents.map((name, i) => (
                      <div key={`f-gg-${i}`} className="rounded-xl border border-stone-200/70 bg-stone-50/40 p-2 text-[10px] text-stone-600 font-medium leading-tight">{name}</div>
                    ))}
                    {currentProfile.mother.ggParents.map((name, i) => (
                      <div key={`m-gg-${i}`} className="rounded-xl border border-stone-200/70 bg-stone-50/40 p-2 text-[10px] text-stone-600 font-medium leading-tight">{name}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION CONTACT & COORDONNÉES */}
      <section id="contact" className="relative z-10 border-t border-stone-200/60 bg-white/40 backdrop-blur-md py-20 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-200/50">Nous Contacter</span>
            <h2 className="text-3xl font-black text-stone-900 mt-4">Restons en contact</h2>
            <p className="text-stone-500 text-sm mt-2">Pour toute question sur nos portées, nos reproducteurs ou le suivi d'un chiot.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
              <h3 className="text-base font-bold text-stone-900">Téléphone</h3>
              <p className="text-xs text-stone-500 mt-1">Du lundi au samedi</p>
              <a href="tel:0600000000" className="mt-4 text-sm font-black text-orange-600 hover:text-orange-700">06 00 00 00 00</a>
            </div>
            <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
              <h3 className="text-base font-bold text-stone-900">Email</h3>
              <p className="text-xs text-stone-500 mt-1">Réponse sous 24h</p>
              <a href="mailto:contact@inochi-inu.fr" className="mt-4 text-sm font-black text-orange-600 hover:text-orange-700">contact@inochi-inu.fr</a>
            </div>
            <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
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

      {/* FOOTER & MODALES */}
      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowInfoModal(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <button onClick={() => setShowInfoModal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 cursor-pointer">✕</button>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4 text-xl">⚖️</div>
            <h3 className="text-xl font-black text-stone-900">Conditions d'adoption</h3>
            <div className="mt-4 space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>Adopter un chiot Akita est un engagement. Conformément à la législation française :</p>
              <ul className="list-disc pl-5 space-y-1 font-medium text-stone-700">
                <li><strong className="text-stone-900">Certificat d'Engagement</strong> : Doit être lu et signé 7 jours avant le départ.</li>
                <li><strong className="text-stone-900">Âge Légal</strong> : Départ à 8 semaines révolues.</li>
                <li><strong className="text-stone-900">Documents</strong> : Attestation de vente, I-CAD, certificat vétérinaire, LOF.</li>
              </ul>
            </div>
            <label className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-stone-100 border border-stone-200 cursor-pointer hover:bg-stone-200/50 transition-colors">
              <input type="checkbox" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer" />
              <span className="text-xs font-bold text-stone-600">J'ai lu et compris, ne plus afficher.</span>
            </label>
            <button onClick={handleContinueFromInfo} className="mt-6 w-full py-3.5 bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-stone-800 transition-all cursor-pointer shadow-md">
              Continuer vers la demande
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
              <p className="mt-2 text-sm text-stone-500 font-medium">Connectez-vous pour transmettre votre projet d'adoption.</p>
            </div>
            <button onClick={handleGoogleLogin} disabled={authLoading} className="mt-8 flex h-13 w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white px-6 font-bold text-stone-800 shadow-sm hover:scale-[1.02] cursor-pointer">
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
                <h3 className="text-xl font-black text-stone-900">Candidature enregistrée !</h3>
                <p className="text-xs text-stone-500 mt-2">Nous étudions avec soin votre cadre de vie pour vous proposer le chiot idéal.</p>
                <a href="/espace-membre" className="mt-6 inline-block px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full cursor-pointer">Voir mon Espace Membre</a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-black uppercase text-orange-600">Étape {step} sur 2</span>
                    <h3 className="text-lg font-black text-stone-900">{step === 1 ? "Votre Projet & Race" : "Environnement & Motivation"}</h3>
                  </div>
                </div>
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Race souhaitée</label>
                      <select value={formData.preferredBreed} onChange={(e) => setFormData({ ...formData, preferredBreed: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium cursor-pointer focus:outline-none focus:border-orange-500">
                        <option value="Akita Inu LOF">Akita Inu LOF</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Téléphone *</label>
                      <input type="tel" required placeholder="06 12 34 56 78" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" />
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button type="button" disabled={!formData.clientPhone} onClick={() => setStep(2)} className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full cursor-pointer disabled:opacity-50">Suivant ➔</button>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Cadre de vie</label>
                      <select value={formData.livingEnvironment} onChange={(e) => setFormData({ ...formData, livingEnvironment: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium cursor-pointer focus:outline-none focus:border-orange-500">
                        <option value="Maison avec jardin clôturé">Maison avec jardin clôturé</option>
                        <option value="Appartement avec sorties régulières">Appartement avec sorties régulières</option>
                        <option value="Domaine / Terrain ouvert">Domaine / Terrain ouvert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Votre expérience des chiens primitifs</label>
                      <textarea rows={2} placeholder="Avez-vous déjà eu un Akita ou un chien primitif ? Vos attentes..." value={formData.motivation} onChange={(e) => setFormData({ ...formData, motivation: e.target.value })} className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" />
                    </div>
                    <div className="pt-4 flex justify-between items-center">
                      <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-stone-500 cursor-pointer hover:text-stone-900">← Retour</button>
                      <button type="submit" disabled={submitting} className="px-6 py-3 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase rounded-full cursor-pointer disabled:opacity-50 shadow-md">{submitting ? "Envoi..." : "Envoyer ma candidature"}</button>
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
