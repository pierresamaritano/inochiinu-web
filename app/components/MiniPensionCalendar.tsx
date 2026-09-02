"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface MiniPensionCalendarProps {
  userDogs?: any[]; 
  onDayClick: (dateStr: string, dogId?: string) => void;
}

interface ServiceClosure {
  id: string;
  start: string;
  end: string;
  services: string[]; 
}

export default function MiniPensionCalendar({ userDogs = [], onDayClick }: MiniPensionCalendarProps) {
  const [miniCalDate, setMiniCalDate] = useState(new Date());
  const [reservations, setReservations] = useState<any[]>([]);
  const [closures, setClosures] = useState<ServiceClosure[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [selectedDogId, setSelectedDogId] = useState<string>("all");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const year = miniCalDate.getFullYear();
  const month = miniCalDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay() === 0 ? 6 : new Date(year, month, 1).getDay() - 1;
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id || null;
      setCurrentUser(userId);

      // Récupération des réservations
      const { data: resData } = await supabase
        .from("pension_bookings")
        .select("user_id, dog_id, start_date, end_date, status")
        .neq("status", "annulé"); 
      setReservations(resData || []);

      // Récupération des fermetures
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

  const getAvailability = (day: number) => {
    const currentISODate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
    
    // Vérification si la pension est fermée ce jour-là
    const isClosed = closures.some(c => currentISODate >= c.start && currentISODate <= c.end && c.services.includes("pension"));

    let boxesOccupes = 0;
    let myPersonalStatus = null;

    reservations.forEach((res) => {
      if (currentISODate >= res.start_date && currentISODate <= res.end_date) {
        if (res.status === "confirmé") boxesOccupes++;
        if (res.user_id === currentUser) {
          if (selectedDogId === "all" || res.dog_id === selectedDogId) {
            myPersonalStatus = res.status; 
          }
        }
      }
    });

    const available = Math.max(0, 6 - boxesOccupes);
    let status = "basse";
    if (available === 0) status = "complet";
    else if (available <= 3) status = "haute";

    return { available, status, myPersonalStatus, isClosed }; 
  };

  return (
    <div className="mt-4 p-5 rounded-3xl bg-stone-50/50 border border-stone-100">
      
      {userDogs.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          <button 
            onClick={() => setSelectedDogId("all")} 
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${selectedDogId === "all" ? "bg-stone-800 text-white shadow-md" : "bg-white border border-stone-200 text-stone-500 hover:border-stone-400"}`}
          >
            Tous
          </button>
          {userDogs.map(d => (
            <button 
              key={d.id} 
              onClick={() => setSelectedDogId(d.id)} 
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${selectedDogId === d.id ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-stone-200 text-stone-500 hover:border-emerald-300"}`}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMiniCalDate(new Date(year, month - 1, 1))} className="text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer px-2 py-1">←</button>
        <span className="text-[11px] font-black uppercase tracking-wider text-stone-900">{monthNames[month]} {year}</span>
        <button onClick={() => setMiniCalDate(new Date(year, month + 1, 1))} className="text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer px-2 py-1">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-black text-stone-400">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
          const today = new Date().toISOString().split("T")[0];

          const { status, myPersonalStatus, isClosed } = getAvailability(day); 
          
          const isPast = dateStr <= today; 
          const isComplet = status === "complet";
          const isMyDay = !!myPersonalStatus;

          const isDisabled = isPast || isComplet || isMyDay || isClosed; 

          let bgClass = "bg-white border border-stone-200 hover:border-emerald-400 text-stone-700 cursor-pointer shadow-sm";
          let badgeColor = "";

          // Design Fermeture Globale (A la priorité)
          if (isClosed) {
             bgClass = "bg-[repeating-linear-gradient(45deg,#f5f5f4,#f5f5f4_3px,#ffffff_3px,#ffffff_6px)] border-red-200 opacity-70 text-red-500 cursor-not-allowed";
          } else {
            if (status === "haute" && !isMyDay) bgClass = "bg-orange-50 border-orange-200 text-orange-900 hover:border-orange-400 cursor-pointer";
            if (isComplet && !isMyDay) bgClass = "bg-stone-100 border-stone-100 text-stone-400 cursor-not-allowed opacity-60 line-through";

            if (myPersonalStatus === "confirmé") {
              bgClass = "bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed";
              badgeColor = "bg-blue-500 shadow-sm";
            } else if (myPersonalStatus === "en_attente") {
              bgClass = "bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed";
              badgeColor = "bg-amber-400 shadow-sm";
            } else if (myPersonalStatus === "terminé") {
              bgClass = "bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed";
              badgeColor = "bg-stone-600 shadow-sm";
            }

            if (isPast) bgClass = "bg-transparent border border-transparent text-stone-300 cursor-not-allowed";
          }

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled}
              onClick={() => onDayClick(dateStr, selectedDogId === "all" ? undefined : selectedDogId)}
              className={`relative h-8 w-full rounded-lg flex flex-col items-center justify-center text-xs transition-all ${bgClass}`}
              title={isClosed ? "Pension fermée" : isDisabled ? "Indisponible" : "Cliquez pour réserver"}
            >
              <span>{day}</span>
              {badgeColor && <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${badgeColor}`}></span>}
            </button>
          );
        })}
      </div>
      
      <div className="mt-5 pt-3 border-t border-stone-200/60 flex flex-col gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
        <div className="flex justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div> Validé</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm"></div> Attente</span>
        </div>
        <div className="flex justify-center gap-4 flex-wrap mt-1">
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-orange-100 border border-orange-200"></div> Forte demande</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-[repeating-linear-gradient(45deg,#f5f5f4,#f5f5f4_2px,#ffffff_2px,#ffffff_4px)] border border-red-200"></div> Fermé</span>
        </div>
      </div>
    </div>
  );
}