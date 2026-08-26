"use client";

import { useState } from "react";

interface EducationItem {
  id: string;
  title: string;
  date: string;
  status: "validé" | "en cours" | "à venir";
  notes: string;
  homework?: string;
}

interface PensionItem {
  id: string;
  title: string;
  date: string;
  status: "en cours" | "réservé" | "passé";
  details: string;
}

export default function ClientDashboardHub() {
  // Gestion de l'expansion du widget (col-span-full ou hauteur)
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  // Gestion de la sélection d'une ligne spécifique ("Gros Widget" ouvert)
  const [selectedItem, setSelectedItem] = useState<EducationItem | null>(null);

  // Données mockées pour l'éducation
  const educationSessions: EducationItem[] = [
    {
      id: "edu-1",
      title: "Séance 1 : Évaluation & Prise de contact",
      date: "12 Août 2026",
      status: "validé",
      notes: "Très bonne attention, bon focus. Début de la marche sans traction.",
      homework: "Pratiquer le demi-tour dès tension sur 5 min par balade.",
    },
    {
      id: "edu-2",
      title: "Séance 2 : Suivi naturel & Marche en laisse",
      date: "19 Août 2026",
      status: "validé",
      notes: "Chien très réceptif aux changements de direction. Laisse détendue sur 80% du parcours.",
      homework: "Intégrer les zones avec distractions légères.",
    },
    {
      id: "edu-3",
      title: "Séance 3 : Rappel sous distraction",
      date: "26 Août 2026",
      status: "en cours",
      notes: "Travail à la longe 10m. Temps de réaction immédiat sans stimulus fort.",
      homework: "Renforcer la récompense jackpot au retour immédiat.",
    },
    {
      id: "edu-4",
      title: "Séance 4 : Croisements congénères & Auto-contrôles",
      date: "02 Septembre 2026",
      status: "à venir",
      notes: "Séance prévue en milieu urbain / parc.",
    },
    {
      id: "edu-5",
      title: "Séance 5 : Bilan final & Perfectionnement",
      date: "09 Septembre 2026",
      status: "à venir",
      notes: "Validation de la grille globale d'autonomie.",
    },
  ];

  // Données mockées pour la pension
  const pensionStays: PensionItem[] = [
    {
      id: "pen-1",
      title: "Séjour Estival (Box N°4)",
      date: "01 - 07 Août 2026",
      status: "passé",
      details: "Sorties régulières en parc de détente, excellente entente avec le groupe.",
    },
    {
      id: "pen-2",
      title: "Week-end Automne (Box N°2)",
      date: "18 - 20 Septembre 2026",
      status: "réservé",
      details: "Réservation confirmée. Repas personnalisés enregistrés.",
    },
  ];

  // Pourcentage global d'apprentissage
  const progressPercent = 65;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const isEduExpanded = expandedWidget === "education";
  const displayedEduList = isEduExpanded ? educationSessions : educationSessions.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* =========================================================================
          WIDGET 1 : ÉDUCATION (AVEC JAUGE CIRCULAIRE & EXPANSION EN LONGUEUR/LARGEUR)
          ========================================================================= */}
      <div
        className={`rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm transition-all duration-300 ${
          isEduExpanded ? "lg:col-span-2 shadow-md bg-white ring-1 ring-orange-100" : ""
        }`}
      >
        {/* EN-TÊTE DU WIDGET : TITRE + JAUGE CIRCULAIRE */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                Éducation
              </span>
              <span className="text-xs text-stone-400 font-semibold">
                {educationSessions.length} séances au carnet
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-stone-900 mt-2">
              Progression & Apprentissage
            </h2>
          </div>

          {/* JAUGE CIRCULAIRE SVG */}
          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              {/* Cercle d'arrière-plan */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-stone-100"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Cercle de progression */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-orange-500 transition-all duration-700 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-sm font-black text-stone-900 leading-none">
                {progressPercent}%
              </span>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                Acquis
              </span>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL : VUE STANDARD OU DÉTAIL D'UNE LIGNE SÉLECTIONNÉE */}
        {selectedItem ? (
          /* --- GROS WIDGET : DÉTAIL DE LA LIGNE CLIQUEE --- */
          <div className="mt-6 p-6 rounded-2xl bg-orange-50/40 border border-orange-100">
            <div className="flex items-center justify-between pb-4 border-b border-orange-200/50">
              <button
                onClick={() => setSelectedItem(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour aux séances
              </button>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  selectedItem.status === "validé"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedItem.status === "en cours"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {selectedItem.status}
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-stone-500 font-semibold">{selectedItem.date}</span>
              <h3 className="text-lg font-black text-stone-900 mt-0.5">{selectedItem.title}</h3>
              
              <div className="mt-4 space-y-3">
                <div className="bg-white p-4 rounded-xl border border-stone-200/60 shadow-2xs">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Observations de séance
                  </span>
                  <p className="text-sm text-stone-700 font-medium mt-1">
                    {selectedItem.notes}
                  </p>
                </div>

                {selectedItem.homework && (
                  <div className="bg-white p-4 rounded-xl border border-orange-200/70 shadow-2xs">
                    <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">
                      Exercices recommandés à la maison
                    </span>
                    <p className="text-sm text-stone-700 font-medium mt-1">
                      {selectedItem.homework}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* --- LISTE DES LIGNES CLICQUABLES --- */
          <div className="mt-4 space-y-2">
            {displayedEduList.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-stone-50/70 hover:bg-orange-50/70 border border-stone-100 hover:border-orange-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.status === "validé"
                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        : item.status === "en cours"
                        ? "bg-orange-500 animate-pulse"
                        : "bg-stone-300"
                    }`}
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-orange-950 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {item.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full hidden sm:inline-block ${
                      item.status === "validé"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "en cours"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {item.status}
                  </span>
                  <svg
                    className="w-4 h-4 text-stone-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOUTON "VOIR PLUS / VOIR MOINS" POUR AGRANDIR LE WIDGET */}
        {!selectedItem && educationSessions.length > 3 && (
          <div className="mt-4 pt-2 border-t border-stone-100 flex justify-center">
            <button
              onClick={() => setExpandedWidget(isEduExpanded ? null : "education")}
              className="text-xs font-extrabold text-stone-500 hover:text-stone-900 hover:bg-stone-100 py-1.5 px-4 rounded-full transition-all flex items-center gap-1.5"
            >
              {isEduExpanded ? (
                <>
                  <span>Réduire la vue</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Voir tout l'historique (+{educationSessions.length - 3})</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          WIDGET 2 : PENSION (EXEMPLE COMPACT POUR OBSERVER LE REAGENCEMENT)
          ========================================================================= */}
      <div className="rounded-[2.5rem] bg-white/80 border border-stone-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              Pension
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 mt-2">
              Séjours & Garde
            </h2>
          </div>
          <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-black text-emerald-700">1</span>
            <span className="text-[8px] font-bold text-emerald-600 uppercase">À venir</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {pensionStays.map((stay) => (
            <div
              key={stay.id}
              className="p-3.5 rounded-2xl bg-stone-50/70 border border-stone-100 flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">{stay.title}</h4>
                <span className="text-[11px] text-stone-400 font-medium">{stay.date}</span>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-stone-200/60 text-stone-700">
                {stay.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
