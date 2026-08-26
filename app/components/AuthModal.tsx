"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function AuthModal({ isOpen, onClose, redirectTo = "/espace-membre" }: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  console.log("Supabase Init");
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );


  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
      
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
      {/* Arrière-plan flouté */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Boîte Liquid Glass */}
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
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loading ? "Connexion en cours..." : "Continuer avec Google"}</span>
          </button>
        </div>

        <p className="mt-8 text-center text-[11px] text-stone-400 font-medium">
          Authentification sécurisée sans mot de passe via votre compte Google.
          <br /><br />
          <span className="text-red-500 font-bold border border-red-200 p-2 rounded bg-red-50">
          <div className="mt-8 text-left text-[10px] text-red-500 font-bold border border-red-200 p-3 rounded bg-red-50 break-all leading-relaxed">
            🔍 DÉBOGAGE :<br/>
            URL : [{process.env.NEXT_PUBLIC_SUPABASE_URL}]<br/>
            CLÉ : [{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...]
          </div>
          </span>
        </p>

      </div>
    </div>
  );
}
