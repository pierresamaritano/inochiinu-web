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

  useEffect(() => {
    const fetchReservations = async () => {
      const { data } = await supabase
        .from("education_requests")
        .select("scheduled_date, preferred_slot")
        .in("status", ["en_attente", "confirmé"]);
      
      setReservations(data || []);
    };
    fetchReservations();
  }, [month, year, supabase]);

  // LOGIQUE DE CALCUL DES CRÉNEAUX
  const getAvailableSlotsForDay = (dateStr: string) => {
    const dayRes = reservations.filter(r => r.scheduled_date === dateStr);
    
    let morningBooked = false;
    let afternoonBooked = false;
    let morningSlotsTaken = 0;
    let afternoonSlotsTaken = 0;

    dayRes.forEach(r => {
      const slot = r.preferred_slot || "";
      if (slot.includes("09:00 - 12:00") || slot.toLowerCase().includes("matinée")) morningBooked = true;
      else if (slot.includes("14:00 - 17:00") || slot.toLowerCase().includes("après-midi")) afternoonBooked = true;
      else if (["09:00", "10:00", "11:00"].includes(slot)) morningSlotsTaken++;
      else if (["14:00", "15:00", "16:00"].includes(slot)) afternoonSlotsTaken++;
    });

    // Si on a 3 chiens le matin sur terrain, la matinée est pleine
    if (morningSlotsTaken >= 3) morningBooked = true;
    if (afternoonSlotsTaken >= 3) afternoonBooked = true;

    let availableSlots: string[] = [];

    if (location === "domicile") {
      // Pour un déplacement, il faut que TOUTE la demi-journée soit vide (0 chien sur terrain)
      if (!morningBooked && morningSlotsTaken === 0) availableSlots.push("09:00 - 12:00");
      if (!afternoonBooked && afternoonSlotsTaken === 0) availableSlots.push("14:00 - 17:00");
    } else {
      // Pour le terrain, on propose les créneaux d'1h non occupés
      if (!morningBooked) {
        if (!dayRes.some(r => r.preferred_slot === "09:00")) availableSlots.push("09:00");
        if (!dayRes.some(r => r.preferred_slot === "10:00")) availableSlots.push("10:00");
        if (!dayRes.some(r => r.preferred_slot === "11:00")) availableSlots.push("11:00");
      }
      if (!afternoonBooked) {
        if (!dayRes.some(r => r.preferred_slot === "14:00")) availableSlots.push("14:00");
        if (!dayRes.some(r => r.preferred_slot === "15:00")) availableSlots.push("15:00");
        if (!dayRes.some(r => r.preferred_slot === "16:00")) availableSlots.push("16:00");
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
    
    if (clickedDate < today) return; // Empêcher la sélection dans le passé

    const { isFull } = getAvailableSlotsForDay(clickedDate);
    if (isFull) return;

    onChange(clickedDate, ""); // On reset l'heure si on change de jour
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
          const isPast = currentISODate < today;
          
          const { isFull } = getAvailableSlotsForDay(currentISODate);
          const isSelected = selectedDate === currentISODate;
          const isDisabled = isPast || isFull;

          let bgClass = "bg-white border border-stone-200 hover:border-orange-400";
          let textClass = "text-stone-700";

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

      {/* SÉLECTION DES HORAIRES */}
      {selectedDate && (
        <div className="mt-6 animate-in slide-in-from-top-2">
          <label className="block text-[10px] font-black uppercase text-stone-400 mb-3 tracking-wider text-center">
            Horaires disponibles le {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </label>
          <div className="flex flex-wrap justify-center gap-2">
            {currentDaySlots.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => onChange(selectedDate, slot)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTime === slot 
                    ? "bg-stone-900 text-white shadow-md scale-105" 
                    : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"
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