"use client";

import { useState } from "react";

interface MiniEducationCalendarProps {
  eduRequests: any[];
  onDayClick: (dateStr: string) => void;
}

export default function MiniEducationCalendar({ eduRequests, onDayClick }: MiniEducationCalendarProps) {
  const [miniCalDate, setMiniCalDate] = useState(new Date());

  const year = miniCalDate.getFullYear();
  const month = miniCalDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay() === 0 ? 6 : new Date(year, month, 1).getDay() - 1;
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const getDayStatus = (dateStr: string) => {
    const req = eduRequests.find(r => r.scheduled_date === dateStr && r.status !== 'annulé');
    return req ? req.status : null; // 'en_attente' ou 'confirmé'
  };

  return (
    <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMiniCalDate(new Date(year, month - 1, 1))} className="text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer">←</button>
        <span className="text-[10px] font-black uppercase tracking-wider text-stone-800">{monthNames[month]} {year}</span>
        <button onClick={() => setMiniCalDate(new Date(year, month + 1, 1))} className="text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} className="text-center text-[9px] font-black text-stone-400">{d}</div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
          const today = new Date().toISOString().split("T")[0];
          const status = getDayStatus(dateStr);
          const isPast = dateStr < today;
          
          let bgClass = "bg-white border border-stone-200 hover:border-orange-400 text-stone-700 cursor-pointer";
          if (status === "confirmé") bgClass = "bg-emerald-500 text-white shadow-sm font-bold cursor-not-allowed";
          else if (status === "en_attente") bgClass = "bg-amber-400 text-white shadow-sm font-bold cursor-not-allowed";
          else if (isPast) bgClass = "bg-transparent text-stone-300 cursor-not-allowed";

          return (
            <button
              key={day}
              type="button"
              disabled={isPast || !!status}
              onClick={() => onDayClick(dateStr)}
              className={`h-7 w-full rounded-md flex items-center justify-center text-[10px] transition-all ${bgClass}`}
              title={!isPast && !status ? "Cliquez pour réserver à cette date" : ""}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex justify-center gap-3 text-[9px] font-bold text-stone-500">
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Validé</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> En attente</span>
      </div>
    </div>
  );
}