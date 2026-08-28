"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";

// =========================================================================
// INTERFACES & TYPES
// =========================================================================
interface GrandParent { role: string; name: string; details?: string; }
interface DogParent { name: string; origin: string; titles: string; desc: string; gParents: GrandParent[]; ggParents: string[]; }
interface CarouselSlide { src: string; alt: string; tag: string; caption: string; }

interface DogProfile {
  id: string; name: string; badgeName: string; role: "Étalon" | "Lice"; affixe: string; fullName: string; color: string; height: string; weight: string; birthDate: string; images: CarouselSlide[]; titles: string; description: string; father: DogParent; mother: DogParent;
}

// =========================================================================
// COMPOSANT CARROUSEL APPLE INTEGRE
// =========================================================================
function DogCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => { setCurrentIndex(0); }, [slides]);

  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    touchStartX.current = null; touchEndX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-full overflow-x-hidden py-10 flex items-center justify-center" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="relative flex w-full max-w-5xl items-center justify-center min-h-[400px] sm:min-h-[600px]">
          {slides.map((slide, index) => {
            const offset = index - currentIndex;
            const isActive = index === currentIndex;
            return (
              <div key={`${slide.tag}-${index}`} onClick={() => setCurrentIndex(index)} className={`absolute w-[88vw] max-w-[900px] aspect-[4/3] sm:aspect-[16/9] rounded-[2rem] sm:rounded-[3rem] overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/20 ${isActive ? "z-20 scale-100 opacity-100 translate-x-0" : offset === 1 || offset === -(slides.length - 1) ? "z-10 scale-[0.85] opacity-40 brightness-50 translate-x-[70%] sm:translate-x-[60%] pointer-events-auto hover:opacity-70" : offset === -1 || offset === slides.length - 1 ? "z-10 scale-[0.85] opacity-40 brightness-50 -translate-x-[70%] sm:-translate-x-[60%] pointer-events-auto hover:opacity-70" : "z-0 scale-75 opacity-0 pointer-events-none"}`}>
                <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover select-none pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 flex items-center justify-between p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl text-white">
                  <div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-orange-400 drop-shadow-md">{slide.tag}</span>
                    <p className="text-sm sm:text-lg font-bold mt-1 drop-shadow-md">{slide.caption}</p>
                  </div>
                  <span className="hidden sm:inline-flex text-xs font-bold bg-black/40 px-4 py-2 rounded-full border border-white/20">{index + 1} / {slides.length}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={prevSlide} className="hidden md:flex absolute left-8 z-50 h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/30 shadow-xl text-white hover:scale-110 active:scale-95 transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
        <button onClick={nextSlide} className="hidden md:flex absolute right-8 z-50 h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/30 shadow-xl text-white hover:scale-110 active:scale-95 transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
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

  // --- ÉTATS POUR LES PORTÉES & POP-UP ---
  const [activeLitters, setActiveLitters] = useState<any[]>([]);
  const [selectedLitterIndex, setSelectedLitterIndex] = useState(0);
  const [showLitterModal, setShowLitterModal] = useState(false);
  const [isImmersionMode, setIsImmersionMode] = useState(false);
  const [modalSlideIndex, setModalSlideIndex] = useState(0); 
  const [selectedPuppy, setSelectedPuppy] = useState<any>(null); 
  // ------------------------------------------------

  // Sélecteur de reproducteur
  const [selectedDogIndex, setSelectedDogIndex] = useState(0);
  const [isDogMenuOpen, setIsDogMenuOpen] = useState(false);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    puppyPreference: "indifferent", // 'indifferent', 'male', 'female', 'specific'
    puppyId: "",
    livingEnvironment: "Maison avec jardin clôturé", 
    motivation: "", 
    clientPhone: "",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchUserAndLitters = async () => {
      const { data: userData } = await supabase.auth.getSession();
      setUser(userData.session?.user || null);

      const { data: littersData } = await supabase
        .from("litters")
        .select("*, puppies(*)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (littersData) {
        setActiveLitters(littersData);
      }
    };
    fetchUserAndLitters();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const getLitterSlides = (litter: any): CarouselSlide[] => {
    if (!litter) return [];
    const slides: CarouselSlide[] = [];
    if (litter.image_url) slides.push({ src: litter.image_url, alt: "Couple", tag: litter.image_tag || "Le Couple", caption: litter.image_caption || "Les parents" });
    if (litter.puppies && litter.puppies.length > 0) {
      litter.puppies.forEach((pup: any) => {
        if (pup.image_url) slides.push({ src: pup.image_url, alt: pup.name, tag: pup.image_tag || "Chiot", caption: pup.image_caption || pup.name });
      });
    }
    return slides;
  };

  const litterSlides = activeLitters.length > 0 ? getLitterSlides(activeLitters[selectedLitterIndex]) : [];

  const handleDiscoverClick = () => {
    if (activeLitters.length > 0) {
      setSelectedPuppy(null); 
      setModalSlideIndex(0);
      setSelectedLitterIndex(0); 
      setShowLitterModal(true);
    } else {
      handleApplyForLitter();
    }
  };

  // Candidature générale (depuis le bouton de la portée)
  const handleApplyForLitter = () => {
    setFormData(prev => ({ ...prev, puppyPreference: "indifferent", puppyId: "" }));
    setShowLitterModal(false);
    handleInitialClick();
  };

  // Candidature spécifique (depuis la fiche d'un chiot)
  const handleApplyForSpecificPuppy = (pup: any) => {
    setFormData(prev => ({ ...prev, puppyPreference: "specific", puppyId: pup.id }));
    setShowLitterModal(false);
    handleInitialClick();
  };

  const handleInitialClick = () => { if (localStorage.getItem("hideElevageInfo") === "true") { handleActionClick(); } else { setShowInfoModal(true); } };
  const handleContinueFromInfo = () => { if (dontShowAgain) { localStorage.setItem("hideElevageInfo", "true"); } setShowInfoModal(false); handleActionClick(); };
  const handleActionClick = () => { if (user) { setIsFormOpen(true); } else { setIsAuthOpen(true); } };
  const handleGoogleLogin = async () => { try { setAuthLoading(true); await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=/elevage` } }); } catch (err) { console.error(err); setAuthLoading(false); } };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user) return; setSubmitting(true);
    try {
      await supabase.from("adoption_requests").insert([{ 
        user_id: user.id, 
        client_name: user.user_metadata?.full_name || "Client", 
        client_email: user.email, 
        client_phone: formData.clientPhone, 
        living_environment: formData.livingEnvironment, 
        motivation: formData.motivation, 
        status: "en_attente", 
        litter_id: activeLitters[selectedLitterIndex]?.id || null,
        puppy_preference: formData.puppyPreference,
        puppy_id: formData.puppyPreference === 'specific' ? formData.puppyId : null
      }]);
      setSubmitted(true);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  // (Je réduis le code des chiens ici pour la lisibilité, vous gardez vos profils Baïko/Lice1 habituels)
  const dogs: DogProfile[] = [
    { id: "baiko", name: "Baïko (Ryu)", badgeName: "Baïko", role: "Étalon", affixe: "Affixe Kazan No", fullName: "Baïko Ryu Go Kazan No", color: "Roux (Aka)", height: "67 cm", weight: "34 kg", birthDate: "12 Octobre 2021", images: [{ src: "/hero-akita.jpg", alt: "Baiko", tag: "Morphologie", caption: "Construction puissante et ossature forte." }, { src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=2000&auto=format&fit=crop", alt: "Baiko forêt", tag: "Caractère", caption: "Tempérament posé en extérieur." }, { src: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2000&auto=format&fit=crop", alt: "Baiko", tag: "Standard", caption: "Respect rigoureux du standard japonais." }], titles: "Lignées de Champions Internationaux & Japonais", description: "Issu du mariage d'excellence entre Katsunori Go et la championne Kazan No Teïumi. Il transmet une ossature puissante, un port de tête altier et un tempérament d'une rare sérénité.", father: { name: "Katsunori Go Senshi Shimai", origin: "Import Pologne", titles: "CH Junior France • Titré CACIB", desc: "Descendant direct des affixes Senshi No Inu et Isegumo Kensha.", gParents: [{ role: "Grand-Père Paternel", name: "Ryuseimaru Go Isegumo Kensha" }, { role: "Grand-Mère Paternelle", name: "Chikako Go Senshi No Inu", details: "Championne Pologne" }], ggParents: ["Hiryuu Go Rokkuhando Touwa", "Aihime Go Amakusa Tajiri", "Kou Zan Go Shun'You Kensha", "Lignée Senshi No Inu"], }, mother: { name: "CH. Kazan No Teïumi", origin: "Affixe Kazan No", titles: "Championne de France • Junior World Winner", desc: "Fille directe de CH. Kazan No Rumi.", gParents: [{ role: "Grand-Père Maternel", name: "Kotei Go Sara Hana Kensha" }, { role: "Grand-Mère Maternelle", name: "CH. Kazan No Rumi" }], ggParents: ["Kanon Go Tamashi Kensha", "Lignée Sara Hana", "Kobe No Minami Go Tamashi", "CH. Nayakiwa Go Tokimitsu"], }, },
    { id: "lice-1", name: "Lice 1 (À venir)", badgeName: "Lice 1", role: "Lice", affixe: "Affixe Officiel LOF", fullName: "Lice Akita 1", color: "Bringé (Tora)", height: "62 cm", weight: "28 kg", birthDate: "À venir", images: [{ src: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=2000&auto=format&fit=crop", alt: "Lice 1", tag: "Morphologie", caption: "Excellente ligne de dos et aplombs." }, { src: "https://images.unsplash.com/photo-1558009250-d4d21628e717?q=80&w=2000&auto=format&fit=crop", alt: "Lice 1 douceur", tag: "Douceur", caption: "Instinct maternel très prononcé." }, { src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=2000&auto=format&fit=crop", alt: "Lice 1 parc", tag: "Vitalité", caption: "Chienne très dynamique et joueuse." }], titles: "Sélection LOF & Standard Japonais", description: "Notre lice vit au cœur du foyer aux côtés de la famille. Sélectionnée pour sa douceur, sa conformité morphologique et son équilibre.", father: { name: "Père de la Lice 1", origin: "Lignée Sélectionnée", titles: "Certifié LOF", desc: "Excellente tête et tempérament stable.", gParents: [{ role: "Grand-Père Paternel", name: "Paternel L1" }, { role: "Grand-Mère Paternelle", name: "Maternelle L1" }], ggParents: ["Arrière G.P 1", "Arrière G.M 1", "Arrière G.P 2", "Arrière G.M 2"], }, mother: { name: "Mère de la Lice 1", origin: "Lignée Reconnue", titles: "Excellente en Exposition", desc: "Lignée indemne de dysplasie.", gParents: [{ role: "Grand-Père Maternel", name: "Paternel L1" }, { role: "Grand-Mère Maternelle", name: "Maternelle L1" }], ggParents: ["Arrière G.P 3", "Arrière G.M 3", "Arrière G.P 4", "Arrière G.M 4"], }, }
  ];

  const slides = [
    { title: "Lignées Japonaises & Sélection LOF", subtitle: "Génétique rigoureusement testée pour des chiots sains.", tag: "Excellence", gradient: "from-stone-900/90 via-stone-900/60 to-black/80" },
    { title: "Socialisation Précoce Bienveillante", subtitle: "Éveil sensoriel en famille dès les premières semaines.", tag: "Développement", gradient: "from-orange-950/90 via-stone-900/60 to-black/80" },
    { title: "Suivi de Croissance & Conseils à Vie", subtitle: "Courbe de poids interactive sur votre Espace Membre.", tag: "Engagement", gradient: "from-amber-950/90 via-stone-900/60 to-black/80" },
  ];

  useEffect(() => {
    const interval = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % slides.length); }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const currentProfile = dogs[selectedDogIndex];

  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-orange-200 selection:text-stone-900">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 inset-x-0 h-[10vh] bg-gradient-to-b from-orange-600/10 to-transparent blur-[40px]" />
        <div className="absolute top-[20%] -left-[25%] w-[30vw] h-[60vh] rounded-full bg-orange-600/10 blur-[130px]" />
        <div className="absolute top-[20%] -right-[25%] w-[30vw] h-[60vh] rounded-full bg-orange-600/10 blur-[130px]" />
      </div>

      <LiquidNavbar />

      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-6 text-center px-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-50/70 backdrop-blur-md px-4 py-1 text-xs font-bold text-orange-700 shadow-sm">
          <span>Les Héritiers de Boshin • Élevage Passion</span>
        </div>
        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          Chiots Akita Inu LOF <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Équilibrés</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-stone-600 sm:text-base leading-relaxed">
          Membre à part entière de la famille, notre lice vit et élève ses chiots à la maison.
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

      {/* BANDEAU CANDIDATURE MODIFIÉ POUR OUVRIR LE POP-UP PORTÉE */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-stone-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-black tracking-tight text-stone-900">Accueillir un chiot chez vous</h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-medium">Découvrez nos naissances confirmées, les futurs départs et réservez votre compagnon.</p>
          </div>
          <button onClick={handleDiscoverClick} className="w-full sm:w-auto shrink-0 flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-7 font-bold text-xs uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition hover:scale-105 hover:brightness-105 cursor-pointer">
            Découvrir
          </button>
        </div>
      </section>

      {/* SECTION REPRODUCTEURS LOF */}
      <section className="relative z-10 border-t border-stone-200/60 bg-white/50 backdrop-blur-xl py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative">
            <div className="text-center lg:text-left mx-auto lg:mx-0 max-w-xl">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50/80 px-3 py-1 rounded-full sm:bg-transparent sm:p-0">
                Génétique & Standard Japonais
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 mt-2 sm:mt-1">
                Nos reproducteurs LOF
              </h2>
            </div>

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
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative z-10 bg-white/80 rounded-[2rem] border border-stone-200/80 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-4 mb-4">Profil & Morphologie</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div><span className="block text-[10px] font-bold uppercase text-stone-400">Nom Complet</span><span className="block text-sm font-black text-stone-800 mt-1">{currentProfile.fullName}</span></div>
              <div><span className="block text-[10px] font-bold uppercase text-stone-400">Naissance</span><span className="block text-sm font-black text-stone-800 mt-1">{currentProfile.birthDate}</span></div>
              <div><span className="block text-[10px] font-bold uppercase text-stone-400">Couleur</span><span className="block text-sm font-black text-stone-800 mt-1">{currentProfile.color}</span></div>
              <div><span className="block text-[10px] font-bold uppercase text-stone-400">Taille</span><span className="block text-sm font-black text-stone-800 mt-1">{currentProfile.height}</span></div>
              <div><span className="block text-[10px] font-bold uppercase text-stone-400">Poids</span><span className="block text-sm font-black text-stone-800 mt-1">{currentProfile.weight}</span></div>
            </div>
          </div>
        </div>

        <div className="w-full my-8">
          <DogCarousel slides={currentProfile.images} />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {/* =========================================================================
          MODE IMMERSION PLEIN ÉCRAN (SUPERPOSÉ À TOUT)
          ========================================================================= */}
      {isImmersionMode && activeLitters.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-stone-950/95 backdrop-blur-2xl flex flex-col justify-center animate-in fade-in duration-500">
          <button onClick={() => setIsImmersionMode(false)} className="absolute top-6 right-6 z-[250] text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="absolute top-8 left-8 z-[250]">
            <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">Mode Immersion</span>
          </div>
          <DogCarousel slides={litterSlides} />
        </div>
      )}

      {/* =========================================================================
          POP-UP : PORTÉE ET CHIOTS (STANDARD)
          ========================================================================= */}
      {showLitterModal && activeLitters.length > 0 && !isImmersionMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowLitterModal(false)} />
          <div className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[2rem] sm:rounded-[3rem] bg-[#FDFCF8] shadow-2xl">
            <button onClick={() => setShowLitterModal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 z-50 bg-white p-2 rounded-full shadow-sm cursor-pointer transition hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* En-tête de la Modale */}
            <div className="p-8 sm:p-12 pb-6 border-b border-stone-100 flex flex-col gap-6">
              {activeLitters.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {activeLitters.map((litter, idx) => (
                    <button key={litter.id} onClick={() => { setSelectedLitterIndex(idx); setSelectedPuppy(null); setModalSlideIndex(0); }} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${selectedLitterIndex === idx ? "bg-orange-500 text-white shadow-md scale-105" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
                      {litter.title}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    {activeLitters.length > 1 ? "Portée sélectionnée" : "Portée en cours"}
                  </span>
                  <h2 className="text-3xl font-black text-stone-900 mt-4">{activeLitters[selectedLitterIndex].title}</h2>
                  <p className="text-sm font-bold text-stone-500 mt-1">{activeLitters[selectedLitterIndex].father_name} x {activeLitters[selectedLitterIndex].mother_name}</p>
                </div>
                <button onClick={() => setIsImmersionMode(true)} className="text-[10px] font-black uppercase bg-stone-900 text-white px-5 py-3 rounded-full hover:scale-105 transition shadow-md cursor-pointer flex items-center gap-2">
                  Mode Immersion 🌟
                </button>
              </div>
            </div>

            {/* Corps de la Modale */}
            <div className="p-8 sm:p-12 pt-8 flex flex-col lg:flex-row gap-10">
              
              {/* Colonne de gauche */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                {litterSlides.length > 0 && (
                  <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden shadow-sm border border-stone-200 bg-stone-100 group">
                    <img src={litterSlides[modalSlideIndex].src} alt={litterSlides[modalSlideIndex].alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-sm">
                      <span className="text-[9px] font-black uppercase tracking-wider text-orange-600 block">{litterSlides[modalSlideIndex].tag}</span>
                      <span className="text-xs font-bold text-stone-800 truncate block mt-0.5">{litterSlides[modalSlideIndex].caption}</span>
                    </div>
                    {litterSlides.length > 1 && (
                      <>
                        <button onClick={() => setModalSlideIndex((p) => (p - 1 + litterSlides.length) % litterSlides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-stone-800 shadow-sm hover:bg-white transition cursor-pointer">←</button>
                        <button onClick={() => setModalSlideIndex((p) => (p + 1) % litterSlides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-stone-800 shadow-sm hover:bg-white transition cursor-pointer">→</button>
                      </>
                    )}
                  </div>
                )}
                <div className="prose prose-sm text-stone-600 bg-stone-50 p-6 rounded-3xl border border-stone-100">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">L'histoire</h4>
                  <p className="leading-relaxed whitespace-pre-line">{activeLitters[selectedLitterIndex].story}</p>
                </div>
                
                {/* Bouton de candidature générale */}
                <button onClick={handleApplyForLitter} className="w-full py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer">
                  Candidature spontanée
                </button>
              </div>

              {/* Colonne de droite (Chiots / Fiche Détaillée) */}
              <div className="w-full lg:w-2/3">
                {selectedPuppy ? (
                  // FICHE DÉTAILLÉE DU CHIOT SÉLECTIONNÉ
                  <div className="bg-orange-50/50 p-6 sm:p-10 rounded-[2.5rem] border border-orange-100 relative animate-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setSelectedPuppy(null)} className="absolute top-6 right-6 text-[10px] font-bold text-stone-500 hover:text-stone-900 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm transition cursor-pointer">
                      ← Retour aux chiots
                    </button>
                    
                    <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left mt-4 sm:mt-0">
                      <div className="w-40 h-40 sm:w-48 sm:h-48 shrink-0 rounded-3xl overflow-hidden shadow-md border-4 border-white bg-stone-100">
                        {selectedPuppy.image_url ? (
                          <img src={selectedPuppy.image_url} alt={selectedPuppy.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🐕</div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <span className="text-[10px] font-black uppercase text-orange-600 bg-white px-3 py-1 rounded-full border border-orange-100 shadow-sm">
                            {selectedPuppy.image_tag || "Chiot"}
                          </span>
                          <h4 className="text-3xl font-black text-stone-900 mt-3">
                            {selectedPuppy.name} <span className="text-xl">{selectedPuppy.gender === 'male' ? '🐕' : '🌸'}</span>
                          </h4>
                          <span className={`inline-block mt-2 text-[10px] font-black uppercase px-3 py-1 rounded-md ${selectedPuppy.status === 'disponible' ? 'bg-emerald-100 text-emerald-700' : selectedPuppy.status === 'reserve' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                            Statut : {selectedPuppy.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-stone-600 leading-relaxed bg-white/50 p-4 rounded-2xl border border-orange-50/50">
                          {selectedPuppy.image_caption || "Aucune description détaillée pour ce chiot."}
                        </p>
                        
                        {/* Bouton de candidature uniquement s'il est disponible */}
                        {selectedPuppy.status === 'disponible' ? (
                          <div className="pt-4">
                            <button onClick={() => handleApplyForSpecificPuppy(selectedPuppy)} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-tr from-stone-900 to-stone-800 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg hover:scale-105 transition-all cursor-pointer">
                              Candidater pour ce chiot
                            </button>
                          </div>
                        ) : (
                          <div className="pt-4">
                            <p className="text-xs font-bold text-red-600 bg-white px-4 py-2 rounded-xl inline-block border border-red-100">
                              Ce chiot a déjà trouvé sa famille.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // GRILLE DES CHIOTS
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-stone-900 mb-6 flex items-center gap-2">
                      Découvrez les chiots <span className="text-stone-400 font-bold text-xs">({activeLitters[selectedLitterIndex].puppies?.length || 0})</span>
                    </h4>
                    
                    {(!activeLitters[selectedLitterIndex].puppies || activeLitters[selectedLitterIndex].puppies.length === 0) ? (
                       <p className="text-sm text-stone-500 italic bg-stone-50 p-8 rounded-3xl text-center border border-stone-100">Aucun chiot n'a encore été ajouté à cette portée.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {activeLitters[selectedLitterIndex].puppies.map((pup: any) => (
                          <button key={pup.id} onClick={() => setSelectedPuppy(pup)} className="group flex flex-col text-left bg-white border border-stone-200 rounded-[1.5rem] overflow-hidden hover:border-orange-400 hover:shadow-md transition-all cursor-pointer">
                            <div className="aspect-square w-full bg-stone-100 relative overflow-hidden">
                              {pup.image_url ? (
                                <img src={pup.image_url} alt={pup.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">🐕</div>
                              )}
                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm shadow-sm border border-white/50">
                                {pup.gender === 'male' ? '🐕' : '🌸'}
                              </div>
                            </div>
                            <div className="p-4 bg-white relative z-10">
                              <span className="font-black text-stone-900 block truncate">{pup.name}</span>
                              <span className={`inline-block mt-1.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${pup.status === 'disponible' ? 'bg-emerald-50 text-emerald-600' : pup.status === 'reserve' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                                {pup.status}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTRES MODALES (Info, Connexion, Formulaire) */}
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
                    <h3 className="text-lg font-black text-stone-900">{step === 1 ? "Votre Projet" : "Environnement & Motivation"}</h3>
                  </div>
                </div>
                
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Préférence de chiot</label>
                      <select value={formData.puppyPreference} onChange={(e) => setFormData({ ...formData, puppyPreference: e.target.value, puppyId: "" })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium cursor-pointer focus:outline-none focus:border-orange-500">
                        <option value="indifferent">Peu importe (Indifférent)</option>
                        <option value="male">Un mâle</option>
                        <option value="female">Une femelle</option>
                        <option value="specific">Un chiot en particulier</option>
                      </select>
                    </div>

                    {formData.puppyPreference === 'specific' && (
                      <div className="animate-in fade-in">
                         <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Sélectionnez le chiot</label>
                         <select required value={formData.puppyId} onChange={(e) => setFormData({ ...formData, puppyId: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium cursor-pointer focus:outline-none focus:border-orange-500">
                           <option value="">-- Choisir un chiot disponible --</option>
                           {activeLitters[selectedLitterIndex]?.puppies?.filter((p: any) => p.status === 'disponible').map((pup: any) => (
                             <option key={pup.id} value={pup.id}>{pup.name} ({pup.gender === 'male' ? 'Mâle' : 'Femelle'})</option>
                           ))}
                         </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Téléphone *</label>
                      <input type="tel" required placeholder="06 12 34 56 78" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500" />
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button type="button" disabled={!formData.clientPhone || (formData.puppyPreference === 'specific' && !formData.puppyId)} onClick={() => setStep(2)} className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-full cursor-pointer disabled:opacity-50">Suivant ➔</button>
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