"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";
import ClientDogSelector from "../components/ClientDogSelector";

// CATALOGUE DE LA BOUTIQUE
const PRODUCTS = [
  { id: "col-bio", name: "Collier Biothane Sur-Mesure", price: "25€", type: "Collier", desc: "Ultra-résistant, waterproof et facile à nettoyer. Bouclerie en laiton inoxydable.", colors: ["Noir", "Fauve", "Kaki", "Bordeaux"] },
  { id: "lais-multi", name: "Laisse Multipositions (2m)", price: "35€", type: "Laisse", desc: "3 points de réglage pour s'adapter à toutes vos promenades. Corde marine ultra-solide.", colors: ["Noir", "Beige", "Vert Forêt"] },
  { id: "harn-para", name: "Collier Paracorde Tressé", price: "30€", type: "Collier", desc: "Tressage artisanal à la main, idéal pour les races primitives. Sur-mesure exact.", colors: ["Personnalisé (Préciser en note)"] },
  { id: "longe-bio", name: "Longe d'apprentissage (5m/10m)", price: "45€", type: "Longe", desc: "Longe en biothane sans poignée pour ne pas s'accrocher dans les broussailles.", colors: ["Orange Fluo", "Jaune Fluo", "Noir"] }
];

export default function SelleriePage() {
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  
  // États de la boutique
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    dog_id: "",
    dogName: "",
    dogBreed: "",
    color: "",
    neckSize: "",
    clientPhone: "",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    fetchUser();
  }, [supabase]);

  const handleOpenProduct = (product: any) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedProduct(product);
    setFormData(prev => ({ ...prev, color: product.colors[0] })); // Couleur par défaut
    setSubmitted(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const redirectUrl = `${window.location.origin}/auth/callback?next=/sellerie`;
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectUrl } });
    } catch (err) {
      console.error(err);
      setAuthLoading(false);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dog_id) {
      alert("Veuillez sélectionner un chien pour associer les mensurations.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("sellerie_orders").insert([{
        user_id: user.id,
        dog_id: formData.dog_id,
        client_name: user.user_metadata?.full_name || "Client",
        client_email: user.email,
        client_phone: formData.clientPhone,
        item_type: selectedProduct.name,
        color_finish: formData.color,
        dog_size: `Tour de cou: ${formData.neckSize}cm`,
        status: "en_attente",
      }]);
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-amber-200 selection:text-stone-900">
      <LiquidNavbar />

      {/* HERO SECTION */}
      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-12 text-center px-4">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/70 backdrop-blur-md px-4 py-1 text-xs font-bold text-amber-700 shadow-sm">
          <span>Fait Main en France</span>
        </div>
        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          Boutique & <span className="bg-gradient-to-r from-amber-600 to-orange-400 bg-clip-text text-transparent">Sellerie Artisanale</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-stone-600 sm:text-base">
          Des équipements sur-mesure, pensés pour le confort de votre chien et la résistance aux balades les plus intenses.
        </p>
      </section>

      {/* GRILLE DE LA BOUTIQUE (E-COMMERCE) */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="group bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="h-40 w-full bg-stone-100 rounded-2xl mb-4 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">
                  {product.type === "Collier" ? "🐕" : product.type === "Laisse" ? "🦮" : "🔗"}
                </div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-black text-stone-900 text-lg leading-tight">{product.name}</h3>
                  <span className="font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-sm">{product.price}</span>
                </div>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">{product.desc}</p>
              </div>
              
              <button 
                onClick={() => handleOpenProduct(product)}
                className="mt-6 w-full py-3 bg-stone-900 text-white font-bold text-xs uppercase tracking-wide rounded-full hover:bg-amber-600 transition-colors cursor-pointer"
              >
                Personnaliser
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* MODALE CONNEXION */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white p-8 rounded-[2rem] text-center shadow-2xl">
            <h3 className="text-2xl font-black text-stone-900">Connexion requise</h3>
            <p className="text-sm text-stone-500 mt-2">Connectez-vous pour associer une commande au profil de votre chien.</p>
            <button onClick={handleGoogleLogin} className="mt-6 w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold rounded-full transition-all">Continuer avec Google</button>
            <button onClick={() => setIsAuthOpen(false)} className="mt-4 text-xs font-bold text-stone-400">Annuler</button>
          </div>
        </div>
      )}

      {/* MODALE COMMANDE PRODUIT */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white p-8 rounded-[2.5rem] shadow-2xl">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800">✕</button>
            
            {submitted ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4 text-2xl">✓</div>
                <h3 className="text-xl font-black text-stone-900">Commande envoyée à l'atelier !</h3>
                <p className="text-xs text-stone-500 mt-2">Nous préparons votre {selectedProduct.name}. Vous recevrez un lien de paiement par email prochainement.</p>
                <button onClick={() => setSelectedProduct(null)} className="mt-6 px-6 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-full">Retour à la boutique</button>
              </div>
            ) : (
              <form onSubmit={handleOrder} className="space-y-5">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Sur-mesure</span>
                  <h3 className="text-2xl font-black text-stone-900 mt-2">{selectedProduct.name}</h3>
                  <p className="text-sm font-black text-stone-500 mt-1">{selectedProduct.price}</p>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-4">
                  {/* SÉLECTEUR DE CHIEN */}
                  <ClientDogSelector
                    isAdmin={false}
                    currentUserId={user.id}
                    onDogSelected={(dog) => setFormData({ ...formData, dog_id: dog.id, dogName: dog.name, dogBreed: dog.breed })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200">
                    <div className="w-full min-w-0">
                      <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Couleur</label>
                      <select value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none">
                        {selectedProduct.colors.map((c: string) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="w-full min-w-0">
                      <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Tour de cou exact (cm) *</label>
                      <input required type="text" placeholder="Ex: 42" value={formData.neckSize} onChange={(e) => setFormData({...formData, neckSize: e.target.value})} className="w-full p-2.5 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-600 mb-1">Téléphone de contact *</label>
                  <input required type="tel" placeholder="06 12 34 56 78" value={formData.clientPhone} onChange={(e) => setFormData({...formData, clientPhone: e.target.value})} className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none" />
                </div>

                <button type="submit" disabled={submitting || !formData.dog_id} className="w-full py-3.5 bg-stone-900 text-white font-bold text-xs uppercase rounded-full hover:bg-stone-800 disabled:opacity-50 transition-all cursor-pointer shadow-md">
                  {submitting ? "Validation..." : "Valider ma commande"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
