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

  // --- SIMULATION DES DONNÉES CLIENT ---
  // Plus tard, ces booléens seront calculés via des requêtes Supabase 
  // (ex: vérifier s'il a une commande de sellerie en cours)
  const clientServices = {
    hasPension: false,
    hasEducation: false,
    hasElevage: false,
    hasSellerie: false,
  };

  // On vérifie si au moins un service est actif
  const hasActiveServices = Object.values(clientServices).some(value => value === true);

  return (
    <>
      <LiquidNavbar />
      
      <div className="min-h-screen bg-[#FDFCF8] text-stone-800 pt-32 px-4 sm:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-stone-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                {isAdmin ? "Tableau de Bord Administrateur" : "Espace Personnel"}
              </span>
              <h1 className="text-3xl font-black text-stone-900 mt-1">
                Bonjour, {profile?.full_name || user.email}
              </h1>
            </div>
          </div>

          {isAdmin ? (
            /* ==========================================
               VUE ADMINISTRATEUR 
               ========================================== */
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
            /* ==========================================
               VUE CLIENT (CONDITIONNELLE)
               ========================================== */
            <>
              {!hasActiveServices ? (
                /* --- ÉTAT VIDE (EMPTY STATE) --- */
                <div className="mt-12 p-10 sm:p-16 rounded-[2.5rem] bg-white/40 border border-stone-200 border-dashed text-center flex flex-col items-center justify-center max-w-3xl mx-auto shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600 mb-6 shadow-inner">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight">Votre espace est prêt</h2>
                  <p className="text-stone-500 mt-3 text-sm leading-relaxed max-w-lg">
                    Ce tableau de bord s'animera automatiquement dès que vous ferez appel à l'un de nos services. 
                    Vos séjours en pension, carnets de suivi éducatif, adoptions et commandes sur-mesure apparaîtront directement ici.
                  </p>
                  <a href="/#elevage" className="mt-8 px-8 py-3 bg-white border border-stone-200 text-stone-800 font-bold text-xs rounded-full hover:bg-stone-50 hover:shadow-md transition-all">
                    Découvrir nos services
                  </a>
                </div>
              ) : (
                /* --- MODULES ACTIFS --- */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {clientServices.hasPension && (
                    <div className="p-8 rounded-[2rem] bg-white/70 border border-stone-200/80 shadow-sm">
                      <span className="text-xs font-black uppercase tracking-wider text-orange-600">Pension</span>
                      <h2 className="text-xl font-bold text-stone-900 mt-2">Mes Séjours & Calendrier</h2>
                      <p className="text-sm text-stone-500 mt-2">Consultez les dates réservées et le journal de bord photo.</p>
                    </div>
                  )}

                  {clientServices.hasEducation && (
                    <div className="p-8 rounded-[2rem] bg-white/70 border border-stone-200/80 shadow-sm">
                      <span className="text-xs font-black uppercase tracking-wider text-orange-600">Éducation</span>
                      <h2 className="text-xl font-bold text-stone-900 mt-2">Suivi des Progrès</h2>
                      <p className="text-sm text-stone-500 mt-2">Grille des acquis comportementaux et devoirs de séances.</p>
                    </div>
                  )}

                  {clientServices.hasElevage && (
                    <div className="p-8 rounded-[2rem] bg-white/70 border border-stone-200/80 shadow-sm">
                      <span className="text-xs font-black uppercase tracking-wider text-orange-600">Élevage</span>
                      <h2 className="text-xl font-bold text-stone-900 mt-2">Croissance du Chiot</h2>
                      <p className="text-sm text-stone-500 mt-2">Courbe de poids interactive et timeline de développement.</p>
                    </div>
                  )}

                  {clientServices.hasSellerie && (
                    <div className="p-8 rounded-[2rem] bg-white/70 border border-stone-200/80 shadow-sm">
                      <span className="text-xs font-black uppercase tracking-wider text-orange-600">Sellerie</span>
                      <h2 className="text-xl font-bold text-stone-900 mt-2">Configurateur Sur-Mesure</h2>
                      <p className="text-sm text-stone-500 mt-2">Personnalisation de laisses et suivi de fabrication atelier.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
