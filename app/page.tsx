import LiquidNavbar from "./components/LiquidNavbar";

export default function Home() {
  const activities = [
    {
      title: "Élevage d'Akita & Shiba Inu",
      desc: "Sélection rigoureuse, respect des standards et socialisation bienveillante dès le plus jeune âge.",
      tag: "Passion & Éthique",
      href: "#elevage",
    },
    {
      title: "Pension Canine Familiale",
      desc: "Accueil chaleureux en petit comité, espaces de détente sécurisés et suivi personnalisé au quotidien.",
      tag: "Capacité limitée",
      href: "#pension",
    },
    {
      title: "Éducation & Comportement",
      desc: "Accompagnement individualisé basé sur la compréhension canine et les méthodes positives.",
      tag: "Sur-mesure",
      href: "#education",
    },
    {
      title: "Sellerie & Équipements",
      desc: "Accessoires modulaires, laisses et harnais techniques pensés pour les chiens primitifs et le plein air.",
      tag: "Fabrication artisanale",
      href: "#sellerie",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-orange-200 selection:text-stone-900">
      <LiquidNavbar />

      {/* Hero Section avec Image de fond */}
      <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-20 text-center">
        
        {/* L'image de fond 100% nette (aucun flou global) */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-akita.jpg"
            alt="Chien primitif dans la nature"
            className="h-full w-full object-cover"
          />
          {/* Dégradé léger uniquement tout en bas pour fondre l'image avec la section d'en dessous */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#FDFCF8] to-transparent"></div>
        </div>

        {/* Le bloc "Liquid Glass" collé autour du texte */}
        <div className="relative z-10 mx-auto max-w-4xl p-8 sm:p-12 mt-8 rounded-[2.5rem] bg-white/30 backdrop-blur-xl backdrop-saturate-[1.5] border border-white/60 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,1)]">
          
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-white/70 px-4 py-1.5 text-xs font-bold text-orange-700 shadow-sm backdrop-blur-md">
            <span>Structure Canine & Artisanat</span>
          </div>
          
          <h1 className="text-5xl font-black tracking-tight text-stone-900 sm:text-7xl sm:leading-[1.1]">
            L'harmonie et l'expertise au service du{" "}
            <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              chien primitif
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg font-bold text-stone-800 sm:text-xl">
            Élevage passionné d'Akita et de Shiba Inu, pension canine à dimension
            humaine, accompagnement comportemental et sellerie sur-mesure.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#pension"
              className="flex h-14 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 to-orange-500 px-8 font-bold text-white shadow-[0_4px_14px_rgba(249,115,22,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] transition hover:scale-105 hover:brightness-105"
            >
              Réserver un séjour
            </a>
            <a
              href="#elevage"
              className="flex h-14 items-center justify-center rounded-full border border-stone-300 bg-white/80 px-8 font-bold text-stone-700 shadow-sm backdrop-blur-md transition hover:scale-105 hover:bg-white hover:text-stone-900"
            >
              Découvrir l'élevage
            </a>
          </div>
        </div>
      </section>

      {/* Activités Grid */}
      <section className="relative z-10 border-t border-stone-200/60 bg-[#F9F6F0] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center sm:text-left">
            <h2 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
              Nos Pôles d'Activité
            </h2>
            <p className="mt-3 text-base text-stone-500">
              Un cadre dédié au bien-être, à la dépense saine et au confort de vos compagnons.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {activities.map((act) => (
              <div
                key={act.title}
                className="group relative rounded-[2rem] border border-stone-200/80 bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-900/5"
              >
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                  {act.tag}
                </span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">
                  {act.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-stone-500">
                  {act.desc}
                </p>
                <div className="mt-8">
                  <a
                    href={act.href}
                    className="inline-flex items-center text-sm font-bold text-orange-500 transition-colors group-hover:text-orange-600"
                  >
                    En savoir plus <span className="ml-2 translate-x-0 transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>
    </div>
  );
}