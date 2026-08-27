"use client";

import { useState } from "react";

interface PensionCalendarProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export default function PensionCalendar({ startDate, endDate, onChange }: PensionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigation des mois
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Jours du mois
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Ajuster pour que la semaine commence le lundi (0 = Lundi, 6 = Dimanche)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // =========================================================================
  // SIMULATEUR DE DISPONIBILITÉ (À remplacer plus tard par Supabase)
  // =========================================================================
  const getAvailability = (day: number) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    
    // Simulation : Les week-ends sont très demandés (Forte affluence)
    if (dayOfWeek === 0 || dayOfWeek === 6) return { available: 2, status: "haute" };
    // Simulation : Le 15 et 16 du mois sont complets
    if (day === 15 || day === 16) return { available: 0, status: "complet" };
    
    // Le reste du temps, c'est calme
    return { available: 5, status: "basse" }; 
  };

  // =========================================================================
  // GESTION DU CLIC ET DE LA SÉLECTION (Plage de dates)
  // =========================================================================
  const handleDayClick = (day: number) => {
    const { status } = getAvailability(day);
    if (status === "complet") return; // On empêche le clic si c'est complet

    const clickedDate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];

    if (!startDate || (startDate && endDate)) {
      // Nouvelle sélection
      onChange(clickedDate, "");
    } else {
      // Sélection de la date de fin
      if (clickedDate > startDate) {
        onChange(startDate, clickedDate);
      } else {
        onChange(clickedDate, ""); // Si on clique avant, ça devient la nouvelle date de début
      }
    }
  };

  // =========================================================================
  // GÉNÉRATION DE LA LÉGENDE DU MOIS EN COURS
  // =========================================================================
  const getBusyPeriodsText = () => {
    let hauteAffluence = [];
    let complets = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const { status } = getAvailability(i);
      if (status === "haute") hauteAffluence.push(i);
      if (status === "complet") complets.push(i);
    }

    return (
      <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
        <p className="font-black text-stone-900 uppercase text-[10px] tracking-wider mb-2">Aperçu de {monthNames[month]}</p>
        {complets.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-0.5"></span>
            <p><strong>Complet :</strong> Les jours {complets.join(", ")}.</p>
          </div>
        )}
        {hauteAffluence.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0 mt-0.5"></span>
            <p><strong>Forte demande (1 à 3 boxs) :</strong> Les {hauteAffluence.join(", ")}.</p>
          </div>
        )}
        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-stone-200/60">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 mt-0.5"></span>
          <p>Le reste du mois bénéficie d'une disponibilité optimale (4 à 6 boxs).</p>
        </div>
      </div>
    );
  };

  // =========================================================================
  // RENDU DU CALENDRIER
  // =========================================================================
  return (
    <div className="w-full">
      {/* En-tête du calendrier */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button type="button" onClick={prevMonth} className="p-2 hover:bg-stone-100 rounded-full cursor-pointer text-stone-600 font-bold">←</button>
        <span className="text-sm font-black text-stone-900 uppercase tracking-wide">
          {monthNames[month]} {year}
        </span>
        <button type="button" onClick={nextMonth} className="p-2 hover:bg-stone-100 rounded-full cursor-pointer text-stone-600 font-bold">→</button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-[10px] font-black uppercase text-stone-400">
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1">
        {/* Cases vides pour décaler le 1er du mois */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-12 rounded-xl bg-transparent" />
        ))}

        {/* Cases des jours */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const { available, status } = getAvailability(day);
          
          const currentISODate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
          
          const isSelectedStart = startDate === currentISODate;
          const isSelectedEnd = endDate === currentISODate;
          const isBetween = startDate && endDate && currentISODate > startDate && currentISODate < endDate;
          
          const isComplet = status === "complet";

          // Définition des couleurs de fond et bordures selon l'état et la sélection
          let bgClass = "bg-white border border-stone-200 hover:border-orange-400";
          let textClass = "text-stone-700";
          let badgeColor = "bg-emerald-400"; // Basse affluence par défaut

          if (status === "haute") badgeColor = "bg-orange-400";
          if (status === "complet") badgeColor = "bg-red-500";

          if (isComplet) {
            bgClass = "bg-stone-100 border border-stone-100 opacity-50 cursor-not-allowed";
            textClass = "text-stone-400 line-through";
          } else if (isSelectedStart || isSelectedEnd) {
            bgClass = "bg-orange-600 border border-orange-600 shadow-md";
            textClass = "text-white font-black";
            badgeColor = "bg-white"; // On met le badge en blanc si la case est orange
          } else if (isBetween) {
            bgClass = "bg-orange-50 border border-orange-100";
            textClass = "text-orange-900 font-bold";
          }

          return (
            <button
              key={day}
              type="button"
              disabled={isComplet}
              onClick={() => handleDayClick(day)}
              className={`relative h-12 w-full rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${bgClass}`}
            >
              <span className={`text-xs ${textClass}`}>{day}</span>
              
              {/* Petit point de couleur pour l'affluence */}
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${badgeColor}`}></span>

              {/* Mention "Complet" sur la case */}
              {isComplet && (
                <span className="absolute bottom-1 text-[8px] font-bold text-red-500 uppercase tracking-tighter">
                  Plein
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Affichage de la légende calculée */}
      {getBusyPeriodsText()}
      
      {/* Rappel des dates sélectionnées */}
      <div className="mt-4 flex items-center justify-between text-xs font-bold text-stone-600 bg-white p-3 rounded-2xl border border-stone-200">
        <div>
          <span className="block text-[10px] uppercase text-stone-400">Arrivée</span>
          {startDate ? new Date(startDate).toLocaleDateString("fr-FR") : "—"}
        </div>
        <div className="text-orange-400">➔</div>
        <div className="text-right">
          <span className="block text-[10px] uppercase text-stone-400">Départ</span>
          {endDate ? new Date(endDate).toLocaleDateString("fr-FR") : "—"}
        </div>
      </div>
    </div>
  );
}
