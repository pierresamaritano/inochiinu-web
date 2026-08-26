import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LiquidNavbar from "../components/LiquidNavbar";

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

  const isAdmin = profile?.role === "admin";

  return (
    <>
      <LiquidNavbar />
      
      <div className="min-h-screen bg-[#FDFCF8] text-stone-800 pt-32 px-4 sm:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-stone-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                {isAdmin ? "Tableau de Bord Administrateur" : "Espace Client"}
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

          {isAdmin ? (
            /* --- VUE ADMIN --- */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-8 rounded-[2rem] bg-stone-900 text-white border border-stone-800 shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform cursor-pointer">
                <span className="text-xs font-black uppercase tracking-wider text-orange-500">Pension</span>
                <h2 className="text-xl font-bold mt-2">Gestion des 12 Boxs</h2>
                <p className="text-sm text-stone-400 mt-2 mb-6">Aperçu du planning d'occupation et validation des demandes de séjours.</p>
                <div className="flex items-center gap-3 text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  0 / 12 boxs occupés
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white/70 border border-stone-200/80 shadow-sm hover:border-orange-200 transition-colors cursor-pointer">
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">Élevage</span>
                <h2 className="text-xl font-bold text-stone-900 mt-2">Les héritiers de Boshin</h2>
                <p className="text-sm text-stone-500 mt-2 mb-6">Gestion des portées Akita Inu, statuts de réservation et courbes de croissance.</p>
                <button className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
                  + Nouvelle portée
                </button>
              </div>

              <div className="p-8 rounded-[2rem] bg-white/70 border border-stone-200/80 shadow-sm hover:border-orange-200 transition-colors cursor-pointer">
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">Sellerie</span>
                <h2 className="text-xl font-bold text-stone-900 mt-2">Atelier & Expéditions</h2>
                <p className="text-sm text-stone-500 mt-2 mb-6">Commandes d'équipements tactiques, laisses modulaires et ajustements sur-mesure.</p>
                <div className="text-sm font-bold text-stone-400">0 commande en attente</div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white/70 border border-stone-200/80 shadow-sm hover:border-orange-200 transition-colors cursor-pointer">
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">Éducation</span>
                <h2 className="text-xl font-bold text-stone-900 mt-2">Calendrier des Séances</h2>
                <p className="text-sm text-stone-500 mt-2">Planning des rendez-vous clients et suivi des grilles d'évaluation comportementale.</p>
              </div>
            </div>
          ) : (
            /* --- VUE CLIENT --- */
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
          )}
        </div>
      </div>
    </>
  );
}



