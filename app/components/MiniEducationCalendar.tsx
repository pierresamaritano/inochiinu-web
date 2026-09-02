"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface MiniEducationCalendarProps {
  eduRequests: any[];
  userDogs?: any[]; 
  onDayClick: (dateStr: string, dogId?: string) => void;
}

interface ServiceClosure {
  id: string;
  start: string;
  end: string;
  services: string[]; 
}

export default function MiniEducationCalendar({ eduRequests, userDogs = [], onDayClick }: MiniEducationCalendarProps) {
  const [miniCalDate, setMiniCalDate] = useState(new Date());
  const [selectedDogId, setSelectedDogId] = useState<string>("all");
  const [closures, setClosures] = useState<ServiceClosure[]>([]);

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
    const fetchSettings = async () => {
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
    fetchSettings();
  }, [supabase]);

  const getDayStatus = (dateStr: string) => {
    const isClosed = closures.some(c => dateStr >= c.start && dateStr <= c.end && c.services.includes("education"));

    const req = eduRequests.find(r => 
      r.scheduled_date === dateStr && 
      r.status !== 'annulé' &&
      (selectedDogId === "all" || r.dog_id === selectedDogId)
    );

    return { status: req ? req.status : null, isClosed }; 
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
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${selectedDogId === d.id ? "bg-orange-600 text-white shadow-md" : "bg-white border border-stone-200 text-stone-500 hover:border-orange-300"}`}
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
          const { status, isClosed } = getDayStatus(dateStr);
          const isPast = dateStr <= today; 

          let bgClass = "bg-white border border-stone-200 hover:border-orange-400 text-stone-700 cursor-pointer shadow-sm";

          if (isClosed) {
            bgClass = "bg-[repeating-linear-gradient(45deg,#f5f5f4,#f5f5f4_3px,#ffffff_3px,#ffffff_6px)] border-red-200 opacity-70 text-red-500 cursor-not-allowed";
          } else if (status === "confirmé") {
            bgClass = "bg-emerald-500 border-emerald-500 text-white shadow-md font-bold cursor-not-allowed";
          } else if (status === "en_attente") {
            bgClass = "bg-amber-400 border-amber-400 text-white shadow-md font-bold cursor-not-allowed";
          } else if (status === "terminé") {
            bgClass = "bg-stone-600 border-stone-600 text-white shadow-md font-bold cursor-not-allowed";
          } else if (isPast) {
            bgClass = "bg-transparent border border-transparent text-stone-300 cursor-not-allowed";
          }

          return (
            <button
              key={day}
              type="button"
              disabled={isPast || !!status || isClosed}
              onClick={() => onDayClick(dateStr, selectedDogId === "all" ? undefined : selectedDogId)}
              className={`h-8 w-full rounded-lg flex items-center justify-center text-xs transition-all ${bgClass}`}
              title={isClosed ? "Éducation fermée" : !isPast && !status ? "Cliquez pour réserver à cette date" : ""}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-5 pt-3 border-t border-stone-200/60 flex justify-center flex-wrap gap-4 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div> Validé</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm"></div> Attente</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-[repeating-linear-gradient(45deg,#f5f5f4,#f5f5f4_2px,#ffffff_2px,#ffffff_4px)] border border-red-200"></div> Fermé</span>
      </div>
    </div>
  );
}