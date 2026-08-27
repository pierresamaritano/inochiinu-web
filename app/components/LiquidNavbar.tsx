"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { usePathname } from "next/navigation";

// --- MODALE AUTHENTIFICATION MULTI-MODE (GOOGLE + EMAIL/MDP) ---
function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (!isOpen) return null;

  // Traduction et contextualisation explicite des erreurs Supabase
  const formatAuthError = (err: any, signingUp: boolean): string => {
    const message = err?.message?.toLowerCase() || "";
    const code = err?.code?.toLowerCase() || "";

    if (
      message.includes("user already registered") ||
      message.includes("already been registered") ||
      message.includes("identity already exists") ||
      code === "user_already_exists"
    ) {
      return "Cette adresse email est déjà associée à un compte (probablement créé avec Google). Veuillez cliquer sur « Continuer avec Google » ou basculer sur « Se connecter ».";
    }

    if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
      return "Adresse email ou mot de passe incorrect. Si vous vous êtes inscrit avec Google, utilisez le bouton Google ci-dessus.";
    }

    if (message.includes("email not confirmed")) {
      return "Votre adresse email n'est pas encore confirmée. Vérifiez vos emails ou connectez-vous avec Google.";
    }

    if (message.includes("password should be at least")) {
      return "Le mot de passe doit contenir au moins 6 caractères.";
    }

    if (message.includes("over_email_send_rate_limit") || message.includes("rate limit")) {
      return "Trop de demandes consécutives. Veuillez patienter 1 à 2 minutes avant de réessayer.";
    }

    if (message.includes("invalid email")) {
      return "Veuillez saisir une adresse email valide.";
    }

    return err.message || "Une erreur inattendue est survenue. Veuillez réessayer.";
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const redirectUrl = `${window.location.origin}/auth/callback?next=/espace-membre`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(formatAuthError(err, false));
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/espace-membre`,
          },
        });

        if (error) throw error;

        // Cas où Supabase bloque la création sans lever d'exception (utilisateur Google déjà existant)
        if (data?.user && data.user.identities && data.user.identities.length === 0) {
          setErrorMsg(
            "Cette adresse est déjà liée à une connexion Google. Veuillez utiliser le bouton « Continuer avec Google » ci-dessus."
          );
          setLoading(false);
          return;
        }

        setSuccessMsg("Votre compte a bien été créé ! Vous pouvez maintenant vous connecter.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/espace-membre";
      }
    } catch (err: any) {
      setErrorMsg(formatAuthError(err, isSignUp));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/80 bg-[#FDFCF8]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-stone-600 hover:bg-black/10 transition-all cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-sm shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
            犬
          </div>
          <h3 className="text-2xl font-black text-stone-900">
            {isSignUp ? "Créer un compte" : "Espace Membre"}
          </h3>
          <p className="mt-1 text-xs text-stone-500 font-medium">
            {isSignUp
              ? "Rejoignez Inochi Inu pour gérer vos réservations et suivis."
              : "Accédez à vos carnets de suivi et vos réservations."}
          </p>
        </div>

        {/* BOUTON GOOGLE */}
        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group flex h-12 w-full items-center justify-center gap-3 rounded-full border border-stone-300 bg-white px-6 font-bold text-xs text-stone-800 shadow-sm transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>Continuer avec Google</span>
          </button>
        </div>

        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <span className="relative bg-[#FDFCF8] px-3 text-[10px] font-black uppercase tracking-wider text-stone-400">
            ou par email
          </span>
        </div>

        {/* FORMULAIRE EMAIL / MDP */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && (
            <div>
              <input
                type="text"
                required
                placeholder="Votre nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          <div>
            <input
              type="email"
              required
              placeholder="Adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Mot de passe (6 caractères min)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* BANDEAU D'ERREUR OU DE SUCCÈS EXPLICITE */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 text-[11px] font-bold leading-snug">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold leading-snug">
              ✓ {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-900 text-white font-bold text-xs rounded-full hover:bg-stone-800 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          >
            {loading ? "Chargement..." : isSignUp ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
          >
            {isSignUp ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20 || document.documentElement.scrollTop > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
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

  const navItems = [
    { label: "Élevage", href: "/elevage" },
    { label: "Pension", href: "/pension" },
    { label: "Éducation", href: "/education" },
    { label: "Sellerie", href: "/sellerie" },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex flex-col items-center pt-4 transition-all duration-300 pointer-events-none">
        <nav
          className={`pointer-events-auto flex items-center justify-between gap-4 px-5 py-3 rounded-full transition-all duration-500 ease-out ${
            scrolled || isMobileMenuOpen
              ? "w-[92%] max-w-5xl bg-white/50 backdrop-blur-2xl backdrop-saturate-[1.5] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(255,255,255,1)] border border-white ring-1 ring-black/5"
              : "w-[94%] max-w-[calc(64rem+20vw)] xl:max-w-7xl bg-white/30 backdrop-blur-2xl backdrop-saturate-[2] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,1)] border border-white/70"
          }`}
        >
          <a href="/" className="flex items-center gap-2.5 group shrink-0">
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
                  pathname === item.href ? "text-orange-600 font-black" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              pathname === "/espace-membre" ? (
                <form action="/auth/signout" method="post" className="hidden sm:flex">
                  <button
                    type="submit"
                    className="relative items-center justify-center px-5 py-2 text-xs font-bold text-stone-600 bg-black/5 hover:bg-black/10 active:scale-95 rounded-full transition-all duration-200 cursor-pointer"
                  >
                    Déconnexion
                  </button>
                </form>
              ) : (
                <a
                  href="/espace-membre"
                  className="hidden sm:inline-flex relative items-center justify-center px-5 py-2 text-xs font-bold text-white rounded-full bg-gradient-to-b from-stone-700 to-stone-900 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Mon Espace
                </a>
              )
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hidden sm:inline-flex relative items-center justify-center px-5 py-2 text-xs font-bold text-white rounded-full bg-gradient-to-b from-orange-400 to-orange-500 shadow-[0_4px_12px_rgba(249,115,22,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Connexion
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-full bg-black/5 border border-black/10 text-stone-800 hover:bg-black/10 active:bg-black/15 active:scale-95 transition-all shadow-sm cursor-pointer"
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
          className={`pointer-events-auto md:hidden absolute top-[76px] mt-2 w-[92%] max-w-5xl flex flex-col gap-2 p-4 origin-top transform-gpu transition-all duration-200 ease-out rounded-[2rem] bg-white/40 backdrop-blur-2xl backdrop-saturate-[2] border border-white ring-1 ring-black/5 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,1)] ${
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
                  className="w-full px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all text-center block cursor-pointer"
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
              className="px-4 py-3 text-sm font-bold text-orange-600 active:bg-orange-100/50 hover:bg-orange-100/50 rounded-2xl transition-all text-center w-full cursor-pointer"
            >
              Connexion / Inscription
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
