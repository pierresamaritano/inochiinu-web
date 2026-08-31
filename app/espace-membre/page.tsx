import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LiquidNavbar from "../components/LiquidNavbar";
import ClientDashboardHub from "../components/ClientDashboardHub";
import AdminManagerView from "../components/AdminManagerView";

const BUCKET_URL = "https://qvybupsibujplkykufja.supabase.co/storage/v1/object/public/media";

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
                {isAdmin ? "Tableau de Bord Administrateur" : "Espace Personnel"}
              </span>
              <h1 className="text-3xl font-black text-stone-900 mt-1">
                Bonjour, {profile?.full_name || user.email}
              </h1>
            </div>
          </div>

          {isAdmin ? (
            <AdminManagerView />
          ) : (
            <ClientDashboardHub />
          )}
        </div>
      </div>
    </>
  );
}
