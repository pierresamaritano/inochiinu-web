"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface PensionCalendarProps {
  startDate: string;
  endDate: string;
  selectedDogId?: string;   // NOUVEAU : Chien 1
  selectedDog2Id?: string;  // NOUVEAU : Chien 2
  onChange: (start: string, end: string) => void;
}

interface ServiceClosure {
  id: string;
  start: string;
  end: string;
  services: string[]; 
}

export default function PensionCalendar({ startDate, endDate, selectedDogId, selectedDog2Id, onChange }: PensionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<any[]>([]);
  const [closures, setClosures] = useState<ServiceClosure[]>([]);
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

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id || null;
      setCurrentUser(userId);

      const { data: resData } = await supabase
        .from("pension_bookings")
        .select("user_id, dog_id, start_date, end_date, status")
        .neq("status", "annulé"); 
      setReservations(resData || []);

      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "service_closures")
        .single();
        
      if (settingsData && settingsData.value) {
        try { setClosures(JSON.parse(settingsData.value)); } 
        catch (e) { console.error(e); }
      }
    };
    fetchData();
  }, [month, year, supabase]);

  const isDateDisabled = (isoDate: string) => {
    if (closures.some(c => isoDate >= c.start && isoDate <= c.end && c.services.includes("pension"))) return true;

    let boxesOccupes = 0;
    let hasPersonal = false;
    
    reservations.forEach((res) => {
      if (isoDate >= res.start_date && isoDate <= res.end_date) {
        if (res.status === "confirmé") boxesOccupes++;
        if (res.user_id === currentUser) {
           const matchesDog = !selectedDogId || res.dog_id === selectedDogId || (selectedDog2Id && res.dog_id === selectedDog2Id);
           if (matchesDog) hasPersonal = true;
        }
      }
    });
    
    return (6 - boxesOccupes <= 0) || hasPersonal;
  };

  const getAvailability = (day: number) => {
    const currentISODate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
    
    const isClosed = closures.some(c => currentISODate >= c.start && currentISODate <= c.end && c.services.includes("pension"));

    let boxesOccupes = 0;
    let myPersonalStatus = null;
    
    reservations.forEach((res) => {
      if (currentISODate >= res.start_date && currentISODate <= res.end_date) {
        if (res.status === "confirmé") boxesOccupes++;
        if (res.user_id === currentUser) {
           const matchesDog = !selectedDogId || res.dog_id === selectedDogId || (selectedDog2Id && res.dog_id === selectedDog2Id);
           if (matchesDog) myPersonalStatus = res.status; 
        }
      }
    });

    const available = Math.max(0, 6 - boxesOccupes);
    
    let status = "basse";
    if (available === 0) status = "complet";
    else if (available <= 3) status = "haute";
    
    return { available, status, myPersonalStatus, isClosed };
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];

    if (isDateDisabled(clickedDate)) return;

    if (!startDate) {
      onChange(clickedDate, "");
    } else if (startDate && !endDate) {
      if (clickedDate >= startDate) { 
        let hasOverlap = false;
        let current = new Date(startDate + "T00:00:00Z");
        const end = new Date(clickedDate + "T00:00:00Z");
        
        while (current <= end) {
          const checkISODate = current.toISOString().split("T")[0];
          if (isDateDisabled(checkISODate)) {
            hasOverlap = true;
            break;
          }
          current.setUTCDate(current.getUTCDate() + 1);
        }

        if (hasOverlap) {
          alert("Votre sélection chevauche des dates indisponibles, fermées ou que vous avez déjà réservées pour ce chien.");
          onChange(clickedDate, ""); 
        } else {
          onChange(startDate, clickedDate);
        }
      } else {
        onChange(clickedDate, ""); 
      }
    } else {
      onChange(clickedDate, "");
    }
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
          const { status, myPersonalStatus, isClosed } = getAvailability(day);
          const currentISODate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
          
          const isSelectedStart = startDate === currentISODate;
          const isSelectedEnd = endDate === currentISODate;
          const isBetween = startDate && endDate && currentISODate > startDate && currentISODate < endDate;
          
          const isComplet = status === "complet";
          const isMyDay = !!myPersonalStatus;
          const isDisabled = isComplet || isMyDay || isClosed;

          let bgClass = "bg-white border border-stone-200 hover:border-orange-400";
          let textClass = "text-stone-700";
          let badgeColor = "bg-emerald-400"; 

          if (isClosed) {
             bgClass = "bg-[repeating-linear-gradient(45deg,#f5f5f4,#f5f5f4_4px,#ffffff_4px,#ffffff_8px)] border-red-200 opacity-80 cursor-not-allowed";
             textClass = "text-red-500 font-bold";
             badgeColor = "";
          } else if (isDisabled) {
            if (isMyDay) {
              bgClass = "bg-stone-50 border border-stone-200 opacity-60 cursor-not-allowed";
              textClass = "text-stone-500 font-bold";
            } else {
              bgClass = "bg-stone-100 border border-stone-100 opacity-50 cursor-not-allowed";
              textClass = "text-stone-400 line-through";
            }
            if (status === "haute") badgeColor = "bg-orange-400";
            if (status === "complet") badgeColor = "bg-red-500";
            if (myPersonalStatus === "en_attente") badgeColor = "bg-amber-400 shadow-sm ring-1 ring-amber-200";
            if (myPersonalStatus === "confirmé") badgeColor = "bg-blue-500 shadow-sm ring-1 ring-blue-200";
          } else if (isSelectedStart || isSelectedEnd) {
            bgClass = "bg-orange-600 border border-orange-600 shadow-md";
            textClass = "text-white font-black";
            badgeColor = "bg-white"; 
          } else if (isBetween) {
            bgClass = "bg-orange-50 border border-orange-100";
            textClass = "text-orange-900 font-bold";
          } else {
            if (status === "haute") badgeColor = "bg-orange-400";
          }

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled} 
              onClick={() => handleDayClick(day)}
              className={`relative h-12 w-full rounded-xl flex flex-col items-center justify-center transition-all ${isDisabled ? "" : "cursor-pointer"} ${bgClass}`}
              title={isClosed ? "Fermé" : isDisabled ? "Indisponible" : "Sélectionner"}
            >
              <span className={`text-xs ${textClass}`}>{day}</span>
              {badgeColor && <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${badgeColor}`}></span>}
              {(isComplet && !myPersonalStatus && !isClosed) && <span className="absolute bottom-1 text-[8px] font-bold text-red-500 uppercase tracking-tighter">Plein</span>}
              {isClosed && <span className="absolute bottom-1 text-[7px] font-black text-red-600 uppercase tracking-tighter">Fermé</span>}
            </button>
          );
        })}
      </div>
      
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