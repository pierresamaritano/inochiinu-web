import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function EspaceMembre() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 pt-32 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-stone-200">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">
              {profile?.role === "admin" ? "Tableau de Bord Administrateur" : "Espace Client"}
            </span>
            <h1 className="text-3xl font-black text-stone-900 mt-1">
              Bonjour, {profile?.full_name || user.email}
            </h1>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-200/60 hover:bg-stone-200 rounded-full transition-all"
            >
              Se déconnecter
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-8 rounded-[2rem] bg-white/70 border border-stone-200/80 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">Pension</span>
            <h2 className="text-xl font-bold text-stone-900 mt-2">Mes Séjours & Calendrier</h2>
            <p className="text-sm text-stone-500 mt-2">Consultez les dates réservées et le journal de bord photo.</p>
          </div>

          <div className="p-8 rounded-[2rem] bg-white/70 border border-stone-200/80 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">Éducation</span>
            <h2 className="text-xl font-bold text-stone-900 mt-2">Suivi des Progrès</h2>
            <p className="text-sm text-stone-500 mt-2">Grille des acquis comportementaux et devoirs de séances.</p>
          </div>

          <div className="p-8 rounded-[2rem] bg-white/70 border border-stone-200/80 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">Élevage</span>
            <h2 className="text-xl font-bold text-stone-900 mt-2">Croissance du Chiot</h2>
            <p className="text-sm text-stone-500 mt-2">Courbe de poids interactive et timeline de développement.</p>
          </div>

          <div className="p-8 rounded-[2rem] bg-white/70 border border-stone-200/80 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600">Sellerie</span>
            <h2 className="text-xl font-bold text-stone-900 mt-2">Configurateur Sur-Mesure</h2>
            <p className="text-sm text-stone-500 mt-2">Personnalisation de laisses et suivi de fabrication atelier.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
