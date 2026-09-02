"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface EducationCalendarProps {
  location: "terrain" | "domicile";
  selectedDate: string;
  selectedTime: string;
  selectedDogId: string; 
  onChange: (date: string, time: string) => void;
}

interface ServiceClosure {
  id: string;
  start: string;
  end: string;
  services: string[]; 
}

export default function EducationCalendar({ location, selectedDate, selectedTime, selectedDogId, onChange }: EducationCalendarProps) {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentDate, setCurrentDate] = useState(initialDate);
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
        .from("education_requests")
        .select("user_id, dog_id, scheduled_date, preferred_slot, location_preference, status")
        .in("status", ["en_attente", "confirmé", "terminé"]); 
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

  const getDayInfo = (dateStr: string) => {
    const isClosed = closures.some(c => dateStr >= c.start && dateStr <= c.end && c.services.includes("education"));

    const myRes = reservations.find(r => 
      r.scheduled_date === dateStr && 
      r.user_id === currentUser && 
      r.dog_id === selectedDogId
    );

    return { myPersonalStatus: myRes ? myRes.status : null, isClosed };
  };

  const getAvailableSlotsForDay = (dateStr: string) => {
    const dayRes = reservations.filter((r) => r.scheduled_date === dateStr);
    
    let hasMorningDomicile = false;
    let hasAfternoonDomicile = false;
    let terrainMorningSlotsTaken: string[] = [];
    let terrainAfternoonSlotsTaken: string[] = [];

    dayRes.forEach((r) => {
      if (r.location_preference === "domicile") {
        if (r.preferred_slot === "Matinée") hasMorningDomicile = true;
        if (r.preferred_slot === "Après-midi") hasAfternoonDomicile = true;
      } else {
        const slot = r.preferred_slot || "";
        if (["09:00", "10:00", "11:00"].includes(slot)) terrainMorningSlotsTaken.push(slot);
        if (["14:00", "15:00", "16:00", "17:00"].includes(slot)) terrainAfternoonSlotsTaken.push(slot);
      }
    });

    let availableSlots: string[] = [];

    if (location === "domicile") {
      if (!hasMorningDomicile && terrainMorningSlotsTaken.length === 0) availableSlots.push("Matinée");
      if (!hasAfternoonDomicile && terrainAfternoonSlotsTaken.length === 0) availableSlots.push("Après-midi");
    } else {
      if (!hasMorningDomicile) {
        ["09:00", "10:00", "11:00"].forEach(h => {
          if (!terrainMorningSlotsTaken.includes(h)) availableSlots.push(h);
        });
      }
      if (!hasAfternoonDomicile) {
        ["14:00", "15:00", "16:00", "17:00"].forEach(h => {
          if (!terrainAfternoonSlotsTaken.includes(h)) availableSlots.push(h);
        });
      }
    }

    return {
      slots: availableSlots,
      isFull: availableSlots.length === 0,
    };
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    
    if (clickedDate <= today) return; 

    const { myPersonalStatus, isClosed } = getDayInfo(clickedDate);
    if (myPersonalStatus || isClosed) return;

    const { isFull } = getAvailableSlotsForDay(clickedDate);
    if (isFull) return;

    onChange(clickedDate, ""); 
  };

  const currentDaySlots = selectedDate ? getAvailableSlotsForDay(selectedDate).slots : [];

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
          const currentISODate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
          const today = new Date().toISOString().split("T")[0];
          
          const isPast = currentISODate <= today; 
          const { myPersonalStatus, isClosed } = getDayInfo(currentISODate);
          const { isFull } = getAvailableSlotsForDay(currentISODate);
          
          const isSelected = selectedDate === currentISODate;
          const isMyDay = !!myPersonalStatus;
          const isDisabled = isPast || isMyDay || isFull || isClosed;

          let bgClass = "bg-white border border-stone-200 hover:border-orange-400";
          let textClass = "text-stone-700 font-medium";
          let badgeColor = "";

          if (isClosed) {
            bgClass = "bg-[repeating-linear-gradient(45deg,#f5f5f4,#f5f5f4_4px,#ffffff_4px,#ffffff_8px)] border-red-200 opacity-80 cursor-not-allowed";
            textClass = "text-red-500 font-bold";
          } else {
            if (myPersonalStatus === "en_attente") badgeColor = "bg-amber-400 shadow-sm ring-1 ring-amber-200";
            if (myPersonalStatus === "confirmé") badgeColor = "bg-emerald-500 shadow-sm ring-1 ring-emerald-200";
            if (myPersonalStatus === "terminé") badgeColor = "bg-stone-600 shadow-sm ring-1 ring-stone-300";

            if (isDisabled) {
              if (isMyDay) {
                bgClass = "bg-stone-50 border border-stone-200 opacity-60 cursor-not-allowed";
                textClass = "text-stone-500 font-bold";
              } else {
                bgClass = "bg-stone-50 border border-stone-100 opacity-50 cursor-not-allowed";
                textClass = "text-stone-400 line-through";
              }
            } else if (isSelected) {
              bgClass = "bg-orange-600 border border-orange-600 shadow-md";
              textClass = "text-white font-black";
            }
          }

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled}
              onClick={() => handleDayClick(day)}
              className={`relative h-12 w-full rounded-xl flex flex-col items-center justify-center transition-all ${!isDisabled && "cursor-pointer"} ${bgClass}`}
              title={isClosed ? "Fermé" : ""}
            >
              <span className={`text-xs ${textClass}`}>{day}</span>
              {badgeColor && <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${badgeColor}`}></span>}
              {isSelected && !badgeColor && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white"></span>}
              {isClosed && <span className="absolute bottom-1 text-[7px] font-black text-red-600 uppercase tracking-tighter">Fermé</span>}
            </button>
          );
        })}
      </div>

      {selectedDate && !closures.some(c => selectedDate >= c.start && selectedDate <= c.end && c.services.includes("education")) && (
        <div className="mt-6 animate-in slide-in-from-top-2">
          <label className="block text-[10px] font-black uppercase text-stone-400 mb-3 tracking-wider text-center border-t border-stone-100 pt-4">
            Créneaux disponibles le {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </label>
          <div className="flex flex-wrap justify-center gap-2">
            {currentDaySlots.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => onChange(selectedDate, slot)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedTime === slot 
                    ? "bg-stone-900 text-white shadow-md scale-105" 
                    : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}