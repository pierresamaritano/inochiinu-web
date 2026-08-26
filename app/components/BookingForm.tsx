"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BookingForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    dog_name: "",
    dog_breed: "",
    start_date: "",
    end_date: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("pension_bookings")
      .insert([formData]);

    if (insertError) {
      setError("Une erreur est survenue lors de l'enregistrement. Réessayez.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center text-zinc-100">
        <h3 className="text-lg font-bold text-amber-400">Demande envoyée avec succès !</h3>
        <p className="mt-2 text-sm text-zinc-300">
          Nous vous recontacterons rapidement pour confirmer la disponibilité et les modalités d'accueil.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6">
      <h3 className="text-xl font-bold text-zinc-100">Réserver un séjour en pension</h3>
      
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-zinc-400">Nom & Prénom</label>
          <input
            required
            type="text"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            value={formData.owner_name}
            onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400">Téléphone</label>
          <input
            required
            type="tel"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            value={formData.owner_phone}
            onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400">Adresse e-mail</label>
        <input
          required
          type="email"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          value={formData.owner_email}
          onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-zinc-400">Nom du chien</label>
          <input
            required
            type="text"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            value={formData.dog_name}
            onChange={(e) => setFormData({ ...formData, dog_name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400">Race</label>
          <input
            required
            type="text"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            value={formData.dog_breed}
            onChange={(e) => setFormData({ ...formData, dog_breed: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-zinc-400">Date d'arrivée</label>
          <input
            required
            type="date"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400">Date de départ</label>
          <input
            required
            type="date"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400">Remarques ou besoins particuliers</label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
      >
        {loading ? "Envoi en cours..." : "Soumettre la demande"}
      </button>
    </form>
  );
}
