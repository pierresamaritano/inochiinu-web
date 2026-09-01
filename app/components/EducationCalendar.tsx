"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface EducationCalendarProps {
  location: "terrain" | "domicile";
  selectedDate: string;
  selectedTime: string;
  onChange: (date: string, time: string) => void;
}

export default function EducationCalendar({ location, selectedDate, selectedTime, onChange }: EducationCalendarProps) {
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
  // RÉCUPÉRATION SUPABASE (Global + Utilisateur)
  // =========================================================================
  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id || null;
      setCurrentUser(userId);

      const { data } = await supabase
        .from("education_requests")
        .select("user_id, scheduled_date, preferred_slot, location_preference, status")
        .in("status", ["en_attente", "confirmé"]);
      
      setReservations(data || []);
    };
    fetchData();
  }, [month, year, supabase]);

  // =========================================================================
  // LOGIQUE DES CRÉNEAUX ET STATUTS
  // =========================================================================
  const getMyStatus = (dateStr: string) => {
    const myRes = reservations.find(r => r.scheduled_date === dateStr && r.user_id === currentUser);
    return myRes ? myRes.status : null;
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
    
    if (clickedDate < today) return; 

    const myPersonalStatus = getMyStatus(clickedDate);
    if (myPersonalStatus) return; // On ne peut pas réserver si on a déjà une séance ce jour-là

    const { isFull } = getAvailableSlotsForDay(clickedDate);
    if (isFull) return;

    onChange(clickedDate, ""); 
  };

  const currentDaySlots = selectedDate ? getAvailableSlotsForDay(selectedDate).slots : [];

  const getLegendText = () => {
    const hasMyPending = reservations.some(r => r.user_id === currentUser && r.status === "en_attente");
    const hasMyConfirmed = reservations.some(r => r.user_id === currentUser && r.status === "confirmé");

    if (!hasMyPending && !hasMyConfirmed) return null;

    return (
      <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
        <p className="font-black text-stone-900 uppercase text-[10px] tracking-wider mb-2">Vos séances</p>
        {hasMyPending && (
          <div className="flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-0.5 shadow-sm ring-1 ring-amber-200"></span>
            <p><strong>En attente :</strong> Séance en cours de validation.</p>
          </div>
        )}
        {hasMyConfirmed && (
          <div className="flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-0.5 shadow-sm ring-1 ring-emerald-200"></span>
            <p><strong>Validée :</strong> Votre séance est confirmée.</p>
          </div>
        )}
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
          const currentISODate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
          const today = new Date().toISOString().split("T")[0];
          
          const isPast = currentISODate < today;
          const myPersonalStatus = getMyStatus(currentISODate);
          const { isFull } = getAvailableSlotsForDay(currentISODate);
          
          const isSelected = selectedDate === currentISODate;
          const isMyDay = !!myPersonalStatus;
          const isDisabled = isPast || isMyDay || isFull;

          let bgClass = "bg-white border border-stone-200 hover:border-orange-400";
          let textClass = "text-stone-700 font-medium";
          let badgeColor = "";

          if (myPersonalStatus === "en_attente") badgeColor = "bg-amber-400 shadow-sm ring-1 ring-amber-200";
          if (myPersonalStatus === "confirmé") badgeColor = "bg-emerald-500 shadow-sm ring-1 ring-emerald-200";

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

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled}
              onClick={() => handleDayClick(day)}
              className={`relative h-12 w-full rounded-xl flex flex-col items-center justify-center transition-all ${!isDisabled && "cursor-pointer"} ${bgClass}`}
            >
              <span className={`text-xs ${textClass}`}>{day}</span>
              {badgeColor && <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${badgeColor}`}></span>}
              {isSelected && !badgeColor && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white"></span>}
            </button>
          );
        })}
      </div>

      {getLegendText()}

      {/* SÉLECTION DES HORAIRES */}
      {selectedDate && (
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