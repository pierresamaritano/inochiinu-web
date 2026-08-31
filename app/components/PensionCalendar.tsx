"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface PensionCalendarProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export default function PensionCalendar({ startDate, endDate, onChange }: PensionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // =========================================================================
  // RÉCUPÉRATION SUPABASE (Capacité Globale + Séjours Personnels)
  // =========================================================================
  useEffect(() => {
    const fetchData = async () => {
      // 1. Récupérer l'utilisateur connecté
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id || null;
      setCurrentUser(userId);

      // 2. Récupérer TOUTES les réservations (pour calculer la limite de 6 boxs)
      const { data } = await supabase
        .from("pension_bookings")
        .select("user_id, start_date, end_date, status")
        .neq("status", "annulé"); // On ignore les annulées
      
      setReservations(data || []);
    };
    fetchData();
  }, [month, year, supabase]);

  // =========================================================================
  // CALCUL DES DISPONIBILITÉS & STATUT PERSONNEL
  // =========================================================================
  const getAvailability = (day: number) => {
    const currentISODate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
    
    let boxesOccupes = 0;
    let myPersonalStatus = null;
    
    reservations.forEach((res) => {
      // Si la date tombe pendant un séjour
      if (currentISODate >= res.start_date && currentISODate <= res.end_date) {
        
        // Pour la capacité globale : seuls les confirmés occupent physiquement un box
        if (res.status === "confirmé") {
          boxesOccupes++;
        }
        
        // Pour l'affichage personnel (points bleus/jaunes)
        if (res.user_id === currentUser) {
          myPersonalStatus = res.status; 
        }
      }
    });

    const available = Math.max(0, 6 - boxesOccupes);
    
    let status = "basse";
    if (available === 0) status = "complet";
    else if (available <= 3) status = "haute";
    
    return { available, status, myPersonalStatus };
  };

  const handleDayClick = (day: number) => {
    const { status } = getAvailability(day);
    if (status === "complet") return; 

    const clickedDate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];

    if (!startDate || (startDate && endDate)) {
      onChange(clickedDate, "");
    } else {
      if (clickedDate > startDate) {
        onChange(startDate, clickedDate);
      } else {
        onChange(clickedDate, ""); 
      }
    }
  };

  const getBusyPeriodsText = () => {
    let hauteAffluence = [];
    let complets = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const { status } = getAvailability(i);
      if (status === "haute") hauteAffluence.push(i);
      if (status === "complet") complets.push(i);
    }

    const hasMyPending = reservations.some(r => r.user_id === currentUser && r.status === "en_attente");
    const hasMyConfirmed = reservations.some(r => r.user_id === currentUser && r.status === "confirmé");

    return (
      <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-4">
        
        {/* LÉGENDE PERSONNELLE (Conditionnelle) */}
        {(hasMyPending || hasMyConfirmed) && (
          <div className="pb-4 border-b border-stone-200/80 space-y-2">
            <p className="font-black text-stone-900 uppercase text-[10px] tracking-wider mb-2">Vos séjours</p>
            {hasMyPending && (
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-0.5 shadow-sm ring-1 ring-amber-200"></span>
                <p><strong>En attente :</strong> Demande en cours de traitement.</p>
              </div>
            )}
            {hasMyConfirmed && (
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-0.5 shadow-sm ring-1 ring-blue-200"></span>
                <p><strong>Validé :</strong> Votre séjour est confirmé.</p>
              </div>
            )}
          </div>
        )}

        {/* LÉGENDE GLOBALE DE CAPACITÉ */}
        <div className="space-y-2">
          <p className="font-black text-stone-900 uppercase text-[10px] tracking-wider mb-2">Disponibilité de {monthNames[month]}</p>
          {complets.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-0.5"></span>
              <p><strong>Complet :</strong> Les jours {complets.join(", ")}.</p>
            </div>
          )}
          {hauteAffluence.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0 mt-0.5"></span>
              <p><strong>Forte demande (1 à 3 boxs restants) :</strong> Les {hauteAffluence.join(", ")}.</p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 mt-0.5"></span>
            <p>Le reste du mois bénéficie d'une disponibilité optimale.</p>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <button type="button" onClick={prevMonth} className="p-2 hover:bg-stone-100 rounded-full cursor-pointer text-stone-600 font-bold">←</button>
        <span className="text-sm font-black text-stone-900 uppercase tracking-wide">
          {monthNames[month]} {year}
        </span>
        <button type="button" onClick={nextMonth} className="p-2 hover:bg-stone-100 rounded-full cursor-pointer text-stone-600 font-bold">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-[10px] font-black uppercase text-stone-400">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-12 rounded-xl bg-transparent" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const { status, myPersonalStatus } = getAvailability(day);
          const currentISODate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
          
          const isSelectedStart = startDate === currentISODate;
          const isSelectedEnd = endDate === currentISODate;
          const isBetween = startDate && endDate && currentISODate > startDate && currentISODate < endDate;
          const isComplet = status === "complet";

          let bgClass = "bg-white border border-stone-200 hover:border-orange-400";
          let textClass = "text-stone-700";
          let badgeColor = "bg-emerald-400"; 

          // 1. Définition de la couleur par défaut (Capacité globale)
          if (status === "haute") badgeColor = "bg-orange-400";
          if (status === "complet") badgeColor = "bg-red-500";

          // 2. Surcharge par le statut personnel (Le Jaune et le Bleu demandés)
          if (myPersonalStatus === "en_attente") badgeColor = "bg-amber-400 shadow-sm ring-1 ring-amber-200";
          if (myPersonalStatus === "confirmé") badgeColor = "bg-blue-500 shadow-sm ring-1 ring-blue-200";

          // 3. Application des styles visuels (Sélection, Complet, etc.)
          if (isComplet && !myPersonalStatus) {
            bgClass = "bg-stone-100 border border-stone-100 opacity-50 cursor-not-allowed";
            textClass = "text-stone-400 line-through";
          } else if (isSelectedStart || isSelectedEnd) {
            bgClass = "bg-orange-600 border border-orange-600 shadow-md";
            textClass = "text-white font-black";
            badgeColor = "bg-white"; 
          } else if (isBetween) {
            bgClass = "bg-orange-50 border border-orange-100";
            textClass = "text-orange-900 font-bold";
          }

          return (
            <button
              key={day}
              type="button"
              disabled={isComplet && !myPersonalStatus} 
              onClick={() => handleDayClick(day)}
              className={`relative h-12 w-full rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${bgClass}`}
            >
              <span className={`text-xs ${textClass}`}>{day}</span>
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${badgeColor}`}></span>
              {(isComplet && !myPersonalStatus) && <span className="absolute bottom-1 text-[8px] font-bold text-red-500 uppercase tracking-tighter">Plein</span>}
            </button>
          );
        })}
      </div>

      {getBusyPeriodsText()}
      
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