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
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-amber-200 selection:text-stone-900">
      {/* Navigation (Composant Liquid Glass) */}
      <LiquidNavbar />

      {/* Hero Section */}
      <section className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pt-32 pb-20 text-center sm:pt-40 sm:pb-28">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
          <span>Structure Canine & Artisanat</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 sm:text-6xl sm:leading-tight">
          L'harmonie et l'expertise au service du{" "}
          <span className="text-amber-500">chien primitif</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-stone-500 sm:text-lg">
          Élevage passionné d'Akita et de Shiba Inu, pension canine à dimension
          humaine, accompagnement comportemental et sellerie sur-mesure.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#pension"
            className="flex h-12 items-center justify-center rounded-xl bg-amber-500 px-6 font-bold text-stone-900 shadow-sm transition hover:bg-amber-400"
          >
            Réserver un séjour
          </a>
          <a
            href="#elevage"
            className="flex h-12 items-center justify-center rounded-xl border border-stone-200 bg-white px-6 font-semibold text-stone-600 shadow-sm transition hover:bg-stone-50 hover:text-stone-900"
          >
            Découvrir l'élevage
          </a>
        </div>
      </section>

      {/* Activités Grid */}
      <section className="border-t border-stone-200 bg-[#F9F6F0] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Nos Pôles d'Activité
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Un cadre dédié au bien-être, à la dépense saine et au confort de vos compagnons.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {activities.map((act) => (
              <div
                key={act.title}
                className="group relative rounded-3xl border border-stone-200 bg-white p-8 shadow-sm transition duration-300 hover:border-amber-500/40 hover:shadow-md"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  {act.tag}
                </span>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-stone-900">
                  {act.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  {act.desc}
                </p>
                <div className="mt-6">
                  <a
                    href={act.href}
                    className="inline-flex items-center text-xs font-bold text-amber-500 group-hover:text-amber-600 group-hover:underline"
                  >
                    En savoir plus →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-10 text-center text-xs text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>
    </div>
  );
}