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
  // RÉCUPÉRATION SUPABASE
  // =========================================================================
  useEffect(() => {
    const fetchReservations = async () => {
      const { data } = await supabase
        .from("education_requests")
        .select("scheduled_date, preferred_slot, location_preference")
        .in("status", ["en_attente", "confirmé"]);
      
      setReservations(data || []);
    };
    fetchReservations();
  }, [month, year, supabase]);

  // =========================================================================
  // LOGIQUE INTELLIGENTE DES CRÉNEAUX (TERRAIN VS DOMICILE)
  // =========================================================================
  const getAvailableSlotsForDay = (dateStr: string) => {
    // 1. Isoler les réservations de ce jour précis
    const dayRes = reservations.filter((r) => r.scheduled_date === dateStr);
    
    let hasMorningDomicile = false;
    let hasAfternoonDomicile = false;
    let terrainMorningSlotsTaken: string[] = [];
    let terrainAfternoonSlotsTaken: string[] = [];

    // 2. Analyser l'occupation existante
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

    // 3. Générer les créneaux proposés selon le CHOIX DU CLIENT (Terrain ou Domicile)
    if (location === "domicile") {
      // Pour un déplacement, la demi-journée doit être TOTALEMENT libre
      if (!hasMorningDomicile && terrainMorningSlotsTaken.length === 0) availableSlots.push("Matinée");
      if (!hasAfternoonDomicile && terrainAfternoonSlotsTaken.length === 0) availableSlots.push("Après-midi");
    } else {
      // Pour le terrain, on propose à l'heure, sauf si un déplacement est déjà prévu sur cette demi-journée
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
    
    if (clickedDate <= today) return; // On empêche de réserver le jour même ou dans le passé

    const { isFull } = getAvailableSlotsForDay(clickedDate);
    if (isFull) return;

    onChange(clickedDate, ""); // On reset l'heure quand on change de jour
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
          <div key={`empty-${i}`} className="h-10 rounded-xl bg-transparent" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const currentISODate = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
          const today = new Date().toISOString().split("T")[0];
          const isPastOrToday = currentISODate <= today;
          
          const { isFull } = getAvailableSlotsForDay(currentISODate);
          const isSelected = selectedDate === currentISODate;
          const isDisabled = isPastOrToday || isFull;

          let bgClass = "bg-white border border-stone-200 hover:border-orange-400";
          let textClass = "text-stone-700 font-medium";

          if (isDisabled) {
            bgClass = "bg-stone-50 border border-stone-100 opacity-50 cursor-not-allowed";
            textClass = "text-stone-400 line-through";
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
              className={`relative h-10 w-full rounded-xl flex items-center justify-center transition-all ${!isDisabled && "cursor-pointer"} ${bgClass}`}
            >
              <span className={`text-xs ${textClass}`}>{day}</span>
              {isSelected && <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white"></span>}
            </button>
          );
        })}
      </div>

      {/* SÉLECTION DES HORAIRES (S'affiche uniquement si un jour est sélectionné) */}
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