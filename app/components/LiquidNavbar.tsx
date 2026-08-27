"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { usePathname } from "next/navigation";

// --- COMPOSANT MODALE D'AUTHENTIFICATION INTÉGRÉ ---
function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/auth/callback?next=/espace-membre`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Erreur de connexion Google :", error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/90 p-8 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,1)] backdrop-blur-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-stone-600 hover:bg-black/10 hover:text-stone-900 transition-all"
          aria-label="Fermer"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
            犬
          </div>
          <h3 className="text-2xl font-black tracking-tight text-stone-900">
            Espace Membre
          </h3>
          <p className="mt-2 text-sm text-stone-500 font-medium">
            Accédez à vos suivis d'éducation, réservations de pension, commandes et chiots réservés.
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group flex h-13 w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white px-6 font-bold text-stone-800 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-stone-400 active:scale-95 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>{loading ? "Connexion en cours..." : "Continuer avec Google"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- NAVBAR PRINCIPALE ---
export default function LiquidNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [bubbleStyle, setBubbleStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [user, setUser] = useState<any>(null);
  
  const pathname = usePathname();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    setBubbleStyle({
      left: target.offsetLeft,
      width: target.offsetWidth,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setBubbleStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  // Liens pointant vers les vraies pages dédiées
  const navItems = [
    { label: "Élevage", href: "/elevage" },
    { label: "Pension", href: "/pension" },
    { label: "Éducation", href: "/education" },
    { label: "Sellerie", href: "/sellerie" },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex flex-col items-center pt-4 transition-all duration-300">
        <nav
          className={`flex items-center justify-between gap-4 px-5 py-3 rounded-full transition-all duration-300 ease-out z-50 ${
            scrolled || isMobileMenuOpen
              ? "w-[92%] max-w-4xl bg-white/50 backdrop-blur-2xl backdrop-saturate-[1.5] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(255,255,255,1)] border border-white ring-1 ring-black/5"
              : "w-[96%] max-w-5xl bg-white/30 backdrop-blur-2xl backdrop-saturate-[2] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,1)] border border-white/70"
          }`}
        >
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-stone-900 font-black text-xs shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_2px_4px_rgba(249,115,22,0.3)]">
              犬
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-stone-900 group-hover:text-orange-600 transition-colors">
                INOCHI INU
              </span>
              <span className="text-[10px] text-stone-500 font-bold tracking-widest -mt-1 hidden sm:block">
                命犬 • CANIN
              </span>
            </div>
          </a>

          <div 
            className="hidden md:flex items-center relative rounded-full bg-black/[0.04] p-1 border border-black/[0.05] shadow-[inset_0_1px_4px_rgba(0,0,0,0.08)]"
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="absolute top-1 bottom-1 rounded-full bg-white/[0.04] backdrop-blur-md backdrop-saturate-[3] shadow-[0_2px_12px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(0,0,0,0.05)] border border-white/70 transition-all duration-300 ease-out pointer-events-none"
              style={bubbleStyle}
            />

            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onMouseEnter={handleMouseEnter}
                className={`relative z-10 px-4 py-1.5 text-xs font-bold transition-colors duration-200 ${
                  pathname === item.href ? "text-orange-600" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* BOUTON DYNAMIQUE DESKTOP */}
            {user ? (
              pathname === "/espace-membre" ? (
                <form action="/auth/signout" method="post" className="hidden sm:flex">
                  <button
                    type="submit"
                    className="relative items-center justify-center px-5 py-2 text-xs font-bold text-stone-600 bg-black/5 hover:bg-black/10 active:scale-95 rounded-full transition-all duration-200"
                  >
                    Déconnexion
                  </button>
                </form>
              ) : (
                <a
                  href="/espace-membre"
                  className="hidden sm:inline-flex relative items-center justify-center px-5 py-2 text-xs font-bold text-white rounded-full bg-gradient-to-b from-stone-700 to-stone-900 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:brightness-110 active:scale-95 transition-all duration-200"
                >
                  Mon Espace
                </a>
              )
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hidden sm:inline-flex relative items-center justify-center px-5 py-2 text-xs font-bold text-white rounded-full bg-gradient-to-b from-orange-400 to-orange-500 shadow-[0_4px_12px_rgba(249,115,22,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:brightness-105 active:scale-95 transition-all duration-200"
              >
                Connexion
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-full bg-black/5 border border-black/10 text-stone-800 hover:bg-black/10 active:bg-black/15 active:scale-95 transition-all shadow-sm"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* MENU MOBILE DÉROULANT */}
        <div
          className={`md:hidden absolute top-[76px] mt-2 w-[92%] max-w-4xl flex flex-col gap-2 p-4 origin-top transform-gpu transition-all duration-200 ease-out rounded-[2rem] bg-white/40 backdrop-blur-2xl backdrop-saturate-[2] border border-white ring-1 ring-black/5 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,1)] ${
            isMobileMenuOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 text-sm font-bold active:bg-white/40 hover:bg-white/40 rounded-2xl transition-all ${
                pathname === item.href ? "text-orange-600 bg-white/30" : "text-stone-700 hover:text-stone-900"
              }`}
            >
              {item.label}
            </a>
          ))}
          <div className="h-px w-full bg-black/5 my-1" />
          
          {user ? (
            pathname === "/espace-membre" ? (
              <form action="/auth/signout" method="post" className="w-full">
                <button
                  type="submit"
                  className="w-full px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all text-center block"
                >
                  Déconnexion
                </button>
              </form>
            ) : (
              <a
                href="/espace-membre"
                className="px-4 py-3 text-sm font-bold text-white bg-stone-800 active:bg-stone-700 hover:bg-stone-700 rounded-2xl transition-all text-center block"
              >
                Mon Espace
              </a>
            )
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAuthOpen(true);
              }}
              className="px-4 py-3 text-sm font-bold text-orange-600 active:bg-orange-100/50 hover:bg-orange-100/50 rounded-2xl transition-all text-center w-full"
            >
              Connexion
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
