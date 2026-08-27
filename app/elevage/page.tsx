"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";

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

interface DogProfile {
  id: string;
  name: string;
  badgeName: string;
  role: "Étalon" | "Lice";
  affixe: string;
  titles: string;
  description: string;
  father: DogParent;
  mother: DogParent;
}

export default function ElevagePage() {
  const [user, setUser] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Sélecteur de reproducteur (Onglets directs)
  const [selectedDogIndex, setSelectedDogIndex] = useState(0);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    preferredBreed: "Akita Inu LOF",
    livingEnvironment: "Maison avec jardin clôturé",
    experiencePrimitive: "Première expérience avec race primitive",
    familyComposition: "",
    motivation: "",
    clientPhone: "",
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
      title: "Lignées Japonaises & Sélection LOF",
      subtitle: "Génétique rigoureusement testée (dysplasie, tares oculaires, ADN) pour des chiots Akita sains et équilibrés.",
      tag: "Excellence & Standard",
      gradient: "from-stone-900/90 via-stone-900/60 to-black/80",
    },
    {
      title: "Socialisation Précoce Bienveillante",
      subtitle: "Éveil sensoriel en famille, familiarisation aux bruits, textures et manipulations dès les premières semaines.",
      tag: "Développement Chiot",
      gradient: "from-orange-950/90 via-stone-900/60 to-black/80",
    },
    {
      title: "Suivi de Croissance & Conseils à Vie",
      subtitle: "Courbe de poids interactive sur votre Espace Membre et disponibilité totale tout au long de sa vie.",
      tag: "Engagement Inochi",
      gradient: "from-amber-950/90 via-stone-900/60 to-black/80",
    },
  ];

  // Liste typée des 5 reproducteurs
  const dogs: DogProfile[] = [
    {
      id: "baiko",
      name: "Baïko (Ryu)",
      badgeName: "Baïko",
      role: "Étalon",
      affixe: "Affixe Kazan No",
      titles: "Lignées de Champions Internationaux & Japonais",
      description: "Issu du mariage d'excellence entre Katsunori Go et la championne Kazan No Teïumi. Il transmet une ossature puissante, un port de tête altier et un tempérament d'une rare sérénité.",
      father: {
        name: "Katsunori Go Senshi Shimai",
        origin: "Import Pologne",
        titles: "CH Junior France • Titré CACIB",
        desc: "Descendant direct des affixes Senshi No Inu et Isegumo Kensha. Construction robuste et expression typique.",
        gParents: [
          { role: "Grand-Père Paternel", name: "Ryuseimaru Go Isegumo Kensha" },
          { role: "Grand-Mère Paternelle", name: "Chikako Go Senshi No Inu", details: "Championne Pologne" },
        ],
        ggParents: [
          "Hiryuu Go Rokkuhando Touwa",
          "Aihime Go Amakusa Tajiri",
          "Kou Zan Go Shun'You Kensha",
          "Lignée Senshi No Inu",
        ],
      },
      mother: {
        name: "CH. Kazan No Teïumi",
        origin: "Affixe Kazan No",
        titles: "Championne de France • Junior World Winner",
        desc: "Fille directe de CH. Kazan No Rumi (Championne de France et Hozonkai). Expression noble et tempérament calme.",
        gParents: [
          { role: "Grand-Père Maternel", name: "Kotei Go Sara Hana Kensha", details: "Import Italie / Akiho" },
          { role: "Grand-Mère Maternelle", name: "CH. Kazan No Rumi", details: "CH France • Vainqueur Hozonkai" },
        ],
        ggParents: [
          "Kanon Go Tamashi Kensha",
          "Lignée Sara Hana",
          "Kobe No Minami Go Tamashi",
          "CH. Nayakiwa Go Tokimitsu",
        ],
      },
    },
    {
      id: "lice-1",
      name: "Lice 1 (À venir)",
      badgeName: "Lice 1",
      role: "Lice",
      affixe: "Affixe Officiel LOF",
      titles: "Sélection LOF & Standard Japonais",
      description: "Notre lice vit au cœur du foyer aux côtés de la famille. Sélectionnée pour sa douceur, sa conformité morphologique et son équilibre.",
      father: {
        name: "Père de la Lice 1",
        origin: "Lignée Sélectionnée",
        titles: "Certifié LOF • Cotation d'Élevage",
        desc: "Excellente tête, aplombs parfaits et tempérament stable.",
        gParents: [
          { role: "Grand-Père Paternel", name: "Grand-Père Paternel L1" },
          { role: "Grand-Mère Paternelle", name: "Grand-Mère Paternelle L1", details: "Cotation Recommandée" },
        ],
        ggParents: [
          "Arrière-Grand-Père 1",
          "Arrière-Grand-Mère 1",
          "Arrière-Grand-Père 2",
          "Arrière-Grand-Mère 2",
        ],
      },
      mother: {
        name: "Mère de la Lice 1",
        origin: "Lignée Reconnue",
        titles: "Excellente en Exposition LOF",
        desc: "Lignée indemne de dysplasie et testée génétiquement.",
        gParents: [
          { role: "Grand-Père Maternel", name: "Grand-Père Maternel L1", details: "Titré Exposition" },
          { role: "Grand-Mère Maternelle", name: "Grand-Mère Maternelle L1", details: "Lignée Primée" },
        ],
        ggParents: [
          "Arrière-Grand-Père 3",
          "Arrière-Grand-Mère 3",
          "Arrière-Grand-Père 4",
          "Arrière-Grand-Mère 4",
        ],
      },
    },
    {
      id: "lice-2",
      name: "Lice 2 (À venir)",
      badgeName: "Lice 2",
      role: "Lice",
      affixe: "Affixe Officiel LOF",
      titles: "Sélection Caractère & Morphologie",
      description: "Deuxième lice intégrant notre programme d'élevage familial. Éveil, câlins et socialisation assurés au salon.",
      father: {
        name: "Père de la Lice 2",
        origin: "Import / Sélection LOF",
        titles: "Certifié LOF",
        desc: "Ossature robuste et excellente qualité de fourrure.",
        gParents: [
          { role: "Grand-Père Paternel", name: "Grand-Père Paternel L2" },
          { role: "Grand-Mère Paternelle", name: "Grand-Mère Paternelle L2", details: "Recommandée LOF" },
        ],
        ggParents: [
          "Arrière-Grand-Père 5",
          "Arrière-Grand-Mère 5",
          "Arrière-Grand-Père 6",
          "Arrière-Grand-Mère 6",
        ],
      },
      mother: {
        name: "Mère de la Lice 2",
        origin: "Lignée Sélectionnée",
        titles: "Confirmée LOF",
        desc: "Tempérament posé et maternel.",
        gParents: [
          { role: "Grand-Père Maternel", name: "Grand-Père Maternel L2", details: "Champion Régional" },
          { role: "Grand-Mère Maternelle", name: "Grand-Mère Maternelle L2", details: "Cotation 4" },
        ],
        ggParents: [
          "Arrière-Grand-Père 7",
          "Arrière-Grand-Mère 7",
          "Arrière-Grand-Père 8",
          "Arrière-Grand-Mère 8",
        ],
      },
    },
    {
      id: "chien-4",
      name: "Future Lice (À venir)",
      badgeName: "Lice 3",
      role: "Lice",
      affixe: "Affixe LOF",
      titles: "Sélection Standard Japonais",
      description: "Informations sur nos futures portées et sélection génétique à venir.",
      father: {
        name: "Lignée Paternelle (À venir)",
        origin: "Sélection LOF",
        titles: "Certifié LOF",
        desc: "Détails publiés prochainement.",
        gParents: [
          { role: "Grand-Père Paternel", name: "—" },
          { role: "Grand-Mère Paternelle", name: "—" },
        ],
        ggParents: ["—", "—", "—", "—"],
      },
      mother: {
        name: "Lignée Maternelle (À venir)",
        origin: "Sélection LOF",
        titles: "Certifiée LOF",
        desc: "Détails publiés prochainement.",
        gParents: [
          { role: "Grand-Père Maternel", name: "—" },
          { role: "Grand-Mère Maternelle", name: "—" },
        ],
        ggParents: ["—", "—", "—", "—"],
      },
    },
    {
      id: "chien-5",
      name: "Futur Reproducteur (À venir)",
      badgeName: "Futur Étalon",
      role: "Étalon",
      affixe: "Affixe LOF",
      titles: "Sélection Standard Japonais",
      description: "Informations sur nos futures portées et sélection génétique à venir.",
      father: {
        name: "Lignée Paternelle (À venir)",
        origin: "Sélection LOF",
        titles: "Certifié LOF",
        desc: "Détails publiés prochainement.",
        gParents: [
          { role: "Grand-Père Paternel", name: "—" },
          { role: "Grand-Mère Paternelle", name: "—" },
        ],
        ggParents: ["—", "—", "—", "—"],
      },
      mother: {
        name: "Lignée Maternelle (À venir)",
        origin: "Sélection LOF",
        titles: "Certifiée LOF",
        desc: "Détails publiés prochainement.",
        gParents: [
          { role: "Grand-Père Maternel", name: "—" },
          { role: "Grand-Mère Maternelle", name: "—" },
        ],
        ggParents: ["—", "—", "—", "—"],
      },
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
    const hideInfo = localStorage.getItem("hideElevageInfo");
    if (hideInfo === "true") {
      handleActionClick();
    } else {
      setShowInfoModal(true);
    }
  };

  const handleContinueFromInfo = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideElevageInfo", "true");
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
      const redirectUrl = `${window.location.origin}/auth/callback?next=/elevage`;
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

    setSubmitting(true);
    try {
      const { error } = await supabase.from("adoption_requests").insert([
        {
          user_id: user.id,
          client_name: user.user_metadata?.full_name || "Client",
          client_email: user.email,
          client_phone: formData.clientPhone,
          preferred_breed: formData.preferredBreed,
          living_environment: formData.livingEnvironment,
          experience_primitive: formData.experiencePrimitive,
          family_composition: formData.familyComposition,
          motivation: formData.motivation,
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
          Chiots Akita Inu LOF{" "}
          <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Équilibrés
          </span>
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-stone-600 sm:text-base leading-relaxed">
          Membre à part entière de la famille, notre lice vit et élève ses chiots à la maison, pour une socialisation dès leur plus jeune âge.
        </p>
      </section>

      {/* CARROUSEL VALEURS */}
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
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-white/10 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/10 inline-block mb-2">
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

          <button onClick={prevSlide} className="absolute left-4 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer">←</button>
          <button onClick={nextSlide} className="absolute right-4 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer">→</button>

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

      {/* BANDEAU CANDIDATURE */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-stone-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-black tracking-tight text-stone-900">
              Candidater pour une future portée d'Akita Inu
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-medium">
              Remplissez votre questionnaire d'adoption pour réserver votre chiot Akita et suivre sa croissance.
            </p>
          </div>
          <button
            onClick={handleInitialClick}
            className="w-full sm:w-auto shrink-0 flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-7 font-bold text-xs uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition hover:scale-105 hover:brightness-105 cursor-pointer"
          >
            Déposer une candidature
          </button>
        </div>
      </section>

      {/* PHILOSOPHIE ÉLEVAGE */}
      <section className="relative z-10 border-t border-stone-200/60 bg-transparent py-16">
        <div className="mx-auto max-w-5xl px-6 space-y-12">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              Éthique & Bien-Être
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 mt-1">
              Des chiots Akita équilibrés pour des familles sereines
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

      {/* SECTION PEDIGREE : NAVIGATION DIRECTE ET SANS SAUT DE PAGE */}
      <section className="relative z-10 border-t border-stone-200/60 bg-white/40 backdrop-blur-xl py-16">
        <div className="mx-auto max-w-5xl px-6 space-y-8">

          {/* EN-TÊTE FIXE DU PEDIGREE */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                Génétique & Standard Japonais
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 mt-1">
                Pedigree de nos reproducteurs LOF
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                Consultez l'arbre généalogique officiel sur 3 générations de notre étalon et de nos lices.
              </p>
            </div>

            {/* SÉLECTEUR PLAT (5 REPRODUCTEURS) */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80 shadow-xs">
              {dogs.map((dog, index) => {
                const isSelected = selectedDogIndex === index;
                return (
                  <button
                    key={dog.id}
                    onClick={() => setSelectedDogIndex(index)}
                    className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-stone-900 text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                    }`}
                  >
                    <span>{dog.role === "Étalon" ? "🐕" : "🌸"}</span>
                    <span>{dog.badgeName}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-normal ${
                        isSelected
                          ? "bg-stone-800 text-stone-300"
                          : "bg-stone-200 text-stone-500"
                      }`}
                    >
                      {dog.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PALMARÈS ET LIGNÉES DU REPRODUCTEUR SÉLECTIONNÉ */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* PÈRE */}
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    Lignée Paternelle
                  </span>
                  <span className="text-xs font-bold text-stone-400">{currentProfile.father.origin}</span>
                </div>
                <h3 className="text-lg font-black text-stone-900">
                  {currentProfile.father.name}
                </h3>
                <p className="mt-1 text-xs font-bold text-orange-600">
                  {currentProfile.father.titles}
                </p>
                <p className="mt-3 text-xs text-stone-500 leading-relaxed">
                  {currentProfile.father.desc}
                </p>
              </div>
            </div>

            {/* MÈRE */}
            <div className="rounded-[2rem] border border-stone-200/80 bg-white/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    Lignée Maternelle
                  </span>
                  <span className="text-xs font-bold text-stone-400">{currentProfile.mother.origin}</span>
                </div>
                <h3 className="text-lg font-black text-stone-900">
                  {currentProfile.mother.name}
                </h3>
                <p className="mt-1 text-xs font-bold text-orange-600">
                  {currentProfile.mother.titles}
                </p>
                <p className="mt-3 text-xs text-stone-500 leading-relaxed">
                  {currentProfile.mother.desc}
                </p>
              </div>
            </div>
          </div>

          {/* ARBRE GÉNÉALOGIQUE SUR 3 GÉNÉRATIONS */}
          <div className="rounded-[2.5rem] border border-stone-200/80 bg-white/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200/60 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-orange-600">Arbre Généalogique Officiel</span>
                <h3 className="text-lg font-black text-stone-900">
                  Pedigree certifié — {currentProfile.name}
                </h3>
              </div>
              <span className="text-xs font-bold text-stone-400">{currentProfile.affixe}</span>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="min-w-[720px] grid grid-cols-3 gap-4 text-xs">
                {/* COLONNE 1 : PARENTS */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">1ère Génération (Parents)</span>

                  <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-3.5 space-y-1">
                    <span className="text-[9px] font-black text-orange-700 uppercase block">Père</span>
                    <p className="font-black text-stone-900">{currentProfile.father.name}</p>
                    <p className="text-[10px] text-stone-500 font-medium">{currentProfile.father.titles}</p>
                  </div>

                  <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-3.5 space-y-1">
                    <span className="text-[9px] font-black text-orange-700 uppercase block">Mère</span>
                    <p className="font-black text-stone-900">{currentProfile.mother.name}</p>
                    <p className="text-[10px] text-stone-500 font-medium">{currentProfile.mother.titles}</p>
                  </div>
                </div>

                {/* COLONNE 2 : GRANDS-PARENTS */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">2ème Génération</span>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3 space-y-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase block">{currentProfile.father.gParents[0].role}</span>
                    <p className="font-bold text-stone-800">{currentProfile.father.gParents[0].name}</p>
                    {currentProfile.father.gParents[0].details && (
                      <p className="text-[10px] text-stone-400">{currentProfile.father.gParents[0].details}</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3 space-y-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase block">{currentProfile.father.gParents[1].role}</span>
                    <p className="font-bold text-stone-800">{currentProfile.father.gParents[1].name}</p>
                    {currentProfile.father.gParents[1].details && (
                      <p className="text-[10px] text-stone-400">{currentProfile.father.gParents[1].details}</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3 space-y-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase block">{currentProfile.mother.gParents[0].role}</span>
                    <p className="font-bold text-stone-800">{currentProfile.mother.gParents[0].name}</p>
                    {currentProfile.mother.gParents[0].details && (
                      <p className="text-[10px] text-stone-400">{currentProfile.mother.gParents[0].details}</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3 space-y-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase block">{currentProfile.mother.gParents[1].role}</span>
                    <p className="font-bold text-stone-800">{currentProfile.mother.gParents[1].name}</p>
                    {currentProfile.mother.gParents[1].details && (
                      <p className="text-[10px] text-stone-400">{currentProfile.mother.gParents[1].details}</p>
                    )}
                  </div>
                </div>

                {/* COLONNE 3 : ARRIÈRE-GRANDS-PARENTS */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">3ème Génération</span>

                  {currentProfile.father.ggParents.map((name, i) => (
                    <div key={`f-gg-${i}`} className="rounded-xl border border-stone-200/70 bg-stone-50/40 p-2 text-[11px] text-stone-600 font-medium">
                      {name}
                    </div>
                  ))}
                  {currentProfile.mother.ggParents.map((name, i) => (
                    <div key={`m-gg-${i}`} className="rounded-xl border border-stone-200/70 bg-stone-50/40 p-2 text-[11px] text-stone-600 font-medium">
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* POINTS CLÉS DU PEDIGREE */}
          <div className="rounded-[2rem] border border-stone-200/80 bg-stone-900 p-6 sm:p-8 text-white shadow-md">
            <h3 className="text-base font-black tracking-tight text-white mb-4">
              Les piliers de notre élevage :
            </h3>
            <div className="grid gap-4 sm:grid-cols-3 text-xs text-stone-300 font-medium">
              <div className="border-l-2 border-orange-500 pl-3 space-y-1">
                <span className="font-bold text-white block">Conformité au Standard</span>
                <span>Têtes typées, expressions franches et constructions robustes certifiées LOF.</span>
              </div>
              <div className="border-l-2 border-orange-500 pl-3 space-y-1">
                <span className="font-bold text-white block">Santé & Tests Génétiques</span>
                <span>Radiographies hanches/coudes, dépistages tares oculaires et identification ADN.</span>
              </div>
              <div className="border-l-2 border-orange-500 pl-3 space-y-1">
                <span className="font-bold text-white block">Stabilité Émotionnelle</span>
                <span>Chiens élevés en famille, calmes, affectueux et équilibrés au quotidien.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {/* POP-UP D'INFORMATION LÉGALE (ADOPTION) */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowInfoModal(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <button onClick={() => setShowInfoModal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 cursor-pointer">✕</button>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4 text-xl">
              ⚖️
            </div>
            <h3 className="text-xl font-black text-stone-900">Conditions d'adoption</h3>

            <div className="mt-4 space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>Adopter un chiot Akita est un engagement. Conformément à la législation française :</p>
              <ul className="list-disc pl-5 space-y-1 font-medium text-stone-700">
                <li><strong className="text-stone-900">Certificat d'Engagement</strong> : Doit être obligatoirement lu et signé au moins 7 jours avant le départ du chiot.</li>
                <li><strong className="text-stone-900">Âge Légal</strong> : Nos chiots Akita ne quittent l'élevage qu'à l'âge de 8 semaines révolues.</li>
                <li><strong className="text-stone-900">Documents</strong> : Attestation de vente, carte I-CAD, certificat vétérinaire de bonne santé et inscription au LOF fournis.</li>
              </ul>
            </div>

            <label className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-stone-100 border border-stone-200 cursor-pointer hover:bg-stone-200/50 transition-colors">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-stone-600">J'ai lu et compris, ne plus afficher.</span>
            </label>

            <button
              onClick={handleContinueFromInfo}
              className="mt-6 w-full py-3.5 bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-stone-800 transition-all cursor-pointer shadow-md"
            >
              Continuer vers la demande
            </button>
          </div>
        </div>
      )}

      {/* MODALE CONNEXION */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAuthOpen(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-6 right-6 text-stone-600 cursor-pointer">✕</button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm">犬</div>
              <h3 className="text-2xl font-black text-stone-900">Connexion requise</h3>
              <p className="mt-2 text-sm text-stone-500 font-medium">Connectez-vous pour transmettre votre projet d'adoption et suivre la courbe de croissance.</p>
            </div>
            <button onClick={handleGoogleLogin} disabled={authLoading} className="mt-8 flex h-13 w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white px-6 font-bold text-stone-800 shadow-sm hover:scale-[1.02] cursor-pointer">
              <span>{authLoading ? "Redirection..." : "Continuer avec Google"}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODALE FORMULAIRE ÉLEVAGE */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/80 bg-[#FDFCF8] p-6 sm:p-10 shadow-2xl">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-6 right-6 text-stone-600 cursor-pointer">✕</button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4">✓</div>
                <h3 className="text-xl font-black text-stone-900">Candidature enregistrée !</h3>
                <p className="text-xs text-stone-500 mt-2">Nous étudions avec soin votre cadre de vie pour vous proposer le chiot Akita idéal.</p>
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
