import LiquidNavbar from "./components/LiquidNavbar";

export default function Home() {
  return (
    <>
      <LiquidNavbar />

      <main className="min-h-screen bg-[#FDFCF8] text-stone-800 pt-32 px-4 sm:px-8 pb-24 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-24">
          
          {/* HERO SECTION */}
          <section className="text-center max-w-3xl mx-auto pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/60 mb-6 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-700">
                Centre Canin Haut de Gamme
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-stone-900 tracking-tight leading-[1.1]">
              L'harmonie et l'expertise au service de votre chien
            </h1>

            <p className="mt-6 text-stone-500 text-base sm:text-xl font-medium leading-relaxed">
              Élevage passionné d'Akita Inu, pension tout confort, éducation canine moderne et sellerie tactique sur-mesure.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="/education"
                className="px-8 py-4 bg-stone-900 text-white font-black text-xs uppercase tracking-wider rounded-full hover:bg-stone-800 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
              >
                Réserver un Bilan
              </a>
              <a
                href="/elevage"
                className="px-8 py-4 bg-white border border-stone-200 text-stone-800 font-bold text-xs uppercase tracking-wider rounded-full hover:bg-stone-50 hover:shadow-md active:scale-95 transition-all"
              >
                Nos Portées Akita
              </a>
            </div>
          </section>

          {/* GRILLE DES 4 SERVICES DÉDIÉS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. ÉDUCATION */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Éducation & Bilan
                </span>
                <h2 className="text-2xl font-black text-stone-900 mt-4">
                  Comportement & Obéissance
                </h2>
                <p className="text-stone-500 mt-3 text-sm leading-relaxed">
                  Accompagnement individualisé pour chiots et adultes : réactivité, marche en laisse sans traction, rappel fiable et auto-contrôles.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">Carnet de suivi en ligne</span>
                <a
                  href="/education"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Découvrir & Réserver ➔
                </a>
              </div>
            </div>

            {/* 2. PENSION */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Pension Canine
                </span>
                <h2 className="text-2xl font-black text-stone-900 mt-4">
                  Séjours & Garde de Confiance
                </h2>
                <p className="text-stone-500 mt-3 text-sm leading-relaxed">
                  Capacité maîtrisée de 12 boxs spacieux et isolés, grands parcs de détente arborés et journal de bord photo quotidien.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">Places limitées</span>
                <a
                  href="/pension"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Voir les installations ➔
                </a>
              </div>
            </div>

            {/* 3. ÉLEVAGE */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Élevage Passion
                </span>
                <h2 className="text-2xl font-black text-stone-900 mt-4">
                  Les héritiers de Boshin
                </h2>
                <p className="text-stone-500 mt-3 text-sm leading-relaxed">
                  Sélection rigoureuse d'Akita Inu LOF. Suivi de croissance transparent, socialisation précoce et accompagnement à vie.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">Lignées sélectionnées</span>
                <a
                  href="/elevage"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Consulter les portées ➔
                </a>
              </div>
            </div>

            {/* 4. SELLERIE */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Atelier & Sellerie
                </span>
                <h2 className="text-2xl font-black text-stone-900 mt-4">
                  Équipements Tactiques Sur-Mesure
                </h2>
                <p className="text-stone-500 mt-3 text-sm leading-relaxed">
                  Laisses modulaires, longes et colliers haute résistance confectionnés à la main avec une bouclerie robuste et éprouvée.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">Confection artisanale</span>
                <a
                  href="/sellerie"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Configurer un équipement ➔
                </a>
              </div>
            </div>

          </section>

        </div>
      </main>
    </>
  );
}
