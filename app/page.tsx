import LiquidNavbar from "./components/LiquidNavbar";
import AppleCarousel from "./components/AppleCarousel";

export default function Home() {
  return (
    <>
      <LiquidNavbar />

      <main className="min-h-screen bg-[#FDFCF8] text-stone-800 pt-28 sm:pt-32 px-4 sm:px-8 pb-24 overflow-x-hidden">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* HERO HEADER */}
          <section className="text-center max-w-3xl mx-auto pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200/60 mb-4 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-700">
                Centre Canin Haut de Gamme
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
              L'harmonie et l'expertise au service de votre chien
            </h1>

            <p className="mt-4 text-stone-500 text-sm sm:text-lg font-medium leading-relaxed">
              Élevage d'Akita Inu, pension 12 boxs, cours d'éducation comportementale et atelier de sellerie tactique.
            </p>
          </section>

          {/* TON CARROUSEL APPLE */}
          <AppleCarousel />

          {/* GRILLE DES 4 SERVICES DÉDIÉS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. ÉDUCATION */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Éducation & Bilan
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-4">
                  Comportement & Obéissance
                </h3>
                <p className="text-stone-500 mt-2 text-xs sm:text-sm leading-relaxed">
                  Accompagnement individualisé : réactivité, rappel sans faille, marche en laisse sans traction et carnet numérique.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">Carnet interactif</span>
                <a
                  href="/education"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Prendre un cours ➔
                </a>
              </div>
            </div>

            {/* 2. PENSION */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Pension Canine
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-4">
                  Séjours & Garde de Confiance
                </h3>
                <p className="text-stone-500 mt-2 text-xs sm:text-sm leading-relaxed">
                  Capacité maîtrisée de 12 boxs spacieux et isolés, grands parcs de détente arborés et journal de bord photo quotidien.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">12 boxs max</span>
                <a
                  href="/pension"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Voir la pension ➔
                </a>
              </div>
            </div>

            {/* 3. ÉLEVAGE */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Élevage Passion
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-4">
                  Les héritiers de Boshin
                </h3>
                <p className="text-stone-500 mt-2 text-xs sm:text-sm leading-relaxed">
                  Sélection rigoureuse d'Akita Inu LOF. Suivi de croissance transparent, socialisation précoce et accompagnement à vie.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">Lignées LOF</span>
                <a
                  href="/elevage"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Découvrir l'élevage ➔
                </a>
              </div>
            </div>

            {/* 4. SELLERIE */}
            <div className="group rounded-[2.5rem] bg-white border border-stone-200/80 p-8 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Atelier & Sellerie
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-4">
                  Équipements Sur-Mesure
                </h3>
                <p className="text-stone-500 mt-2 text-xs sm:text-sm leading-relaxed">
                  Laisses modulaires, longes et colliers haute résistance confectionnés à la main avec une bouclerie robuste et éprouvée.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400">Fait main</span>
                <a
                  href="/sellerie"
                  className="text-xs font-black text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5 transition-colors"
                >
                  Configurer ➔
                </a>
              </div>
            </div>

          </section>

        </div>
      </main>
    </>
  );
}
