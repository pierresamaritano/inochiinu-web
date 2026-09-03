"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";
import ClientDogSelector from "../components/ClientDogSelector";

// IMPORTS DES COMPOSANTS MAÎTRES
import AppleCarousel, { CarouselSlide } from "../components/AppleCarousel";
import ContactSection from "../components/ContactSection";

// CATALOGUE DE LA BOUTIQUE
const PRODUCTS = [
  { id: "col-bio", name: "Collier Biothane Sur-Mesure", price: "25€", type: "Collier", desc: "Ultra-résistant, waterproof et facile à nettoyer. Bouclerie en laiton inoxydable.", colors: ["Noir", "Fauve", "Kaki", "Bordeaux"] },
  { id: "lais-frog", name: "Laisse Bicolore Attache Frog", price: "55€", type: "Laisse Frog", desc: "Biothane bicolore et attache tactique Frog à libération rapide. Idéale pour les tractions fortes.", colors: ["Noir", "Fauve", "Kaki", "Bordeaux", "Beige", "Bleu Roi", "Bleu Ciel"] },
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
  
  // ÉTATS DU ZOOM INTERACTIF
  const [isZooming, setIsZooming] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: "center center", transform: "scale(1)" });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    dog_id: "",
    dogName: "",
    dogBreed: "",
    color: "",              
    mainColor: "",          
    attachmentColor: "",    
    hardware: "Laiton Doré",
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

  // FONCTION DE CALCUL DU ZOOM (Style Amazon - Tactile activé)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    // On calcule la position exacte de la souris ou du doigt dans le cadre fixe
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));

    // On déplace l'origine du zoom pour suivre le curseur
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.5)" // Puissance du zoom
    });
  };

  // On crée un pack d'événements à appliquer au conteneur sélectionné
  const zoomEvents = {
    ref: imageContainerRef,
    // Activation tactile et souris
    onPointerEnter: () => setIsZooming(true),
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        setIsZooming(true);
        handlePointerMove(e);
    },
    onPointerMove: handlePointerMove,
    onPointerLeave: () => {
        setIsZooming(false);
    },
    onPointerUp: () => {
        setIsZooming(false);
    }
  };

  const sellerieCarouselSlides: CarouselSlide[] = [
    { src: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=1080&auto=format&fit=crop", alt: "Matériel de sellerie", tag: "Fabrication Artisanale", caption: "Du matériel robuste et pensé pour durer en extérieur." },
    { src: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?q=80&w=1080&auto=format&fit=crop", alt: "Chien avec harnais", tag: "Confort & Maintien", caption: "Des coupes ergonomiques adaptées à la morphologie des chiens." },
    { src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1080&auto=format&fit=crop", alt: "Promenade en pleine nature", tag: "Sur-Mesure", caption: "Conçu pour résister aux balades les plus sportives." }
  ];

  const handleOpenProduct = (product: any) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedProduct(product);
    setFormData(prev => ({ 
      ...prev, 
      color: product.colors[0],
      mainColor: product.colors[0],
      attachmentColor: product.colors[1] || product.colors[0],
      hardware: "Laiton Doré"
    }));
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
    if (!formData.dog_id && selectedProduct.type === "Collier") {
      alert("Veuillez sélectionner un chien pour associer les mensurations.");
      return;
    }

    setSubmitting(true);
    const colorFinishString = selectedProduct.type === "Laisse Frog"
      ? `Base: ${formData.mainColor} | Attaches: ${formData.attachmentColor} | Rivets: ${formData.hardware}`
      : `${formData.color} - Mousquetons: ${formData.hardware}`;

    try {
      const { error } = await supabase.from("sellerie_orders").insert([{
        user_id: user.id,
        dog_id: formData.dog_id || null, 
        client_name: user.user_metadata?.full_name || "Client",
        client_email: user.email,
        client_phone: formData.clientPhone,
        item_type: selectedProduct.name,
        color_finish: colorFinishString,
        dog_size: formData.neckSize && selectedProduct.type === "Collier" ? `Tour de cou: ${formData.neckSize}cm` : "Standard",
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

  const colorMap: Record<string, string> = {
    "Noir": "bg-stone-900", "Fauve": "bg-amber-600", "Kaki": "bg-emerald-800", "Bordeaux": "bg-rose-900", "Beige": "bg-stone-200", "Vert Forêt": "bg-emerald-900", "Orange Fluo": "bg-orange-500", "Jaune Fluo": "bg-yellow-400", "Bleu Roi": "bg-blue-700", "Bleu Ciel": "bg-sky-300", "Personnalisé (Préciser en note)": "bg-gradient-to-r from-orange-400 to-amber-400"
  };

  // NOUVEAU NOIR : #111111 (Très profond, les reflets seront ajoutés par la couche Screen)
  const ropeHexMap: Record<string, string> = {
    "Noir": "#111111", 
    "Fauve": "#d97706", "Kaki": "#065f46", "Bordeaux": "#881337", "Beige": "#e7e5e4", "Vert Forêt": "#064e3b", "Orange Fluo": "#f97316", "Jaune Fluo": "#facc15", "Bleu Roi": "#1d4ed8", "Bleu Ciel": "#7dd3fc", "Personnalisé (Préciser en note)": "#a8a29e"
  };
  
  const ropeHex = ropeHexMap[formData.color] || "#111111";
  const mainHex = ropeHexMap[formData.mainColor] || "#111111";
  const attachmentHex = ropeHexMap[formData.attachmentColor] || "#111111";

  // Acier réglé sur un vrai Gris métallisé
  const hardwareOverlayHex = formData.hardware === "Laiton Doré" ? "#eab308" : "#94a3b8"; 
  const hardwareSvgHex = formData.hardware === "Laiton Doré" ? "#fbbf24" : "#94a3b8";

  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-stone-800 antialiased selection:bg-amber-200 selection:text-stone-900">
      
      <div className="absolute top-0 inset-x-0 h-[100vh] overflow-hidden pointer-events-none z-0 transform-gpu">
        <div className="absolute top-[10%] left-[-20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0) 70%)' }} />
        <div className="absolute top-[40%] right-[-20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0) 70%)' }} />
      </div>

      <LiquidNavbar />

      <section className="relative z-10 flex w-full flex-col items-center pt-36 pb-6 text-center px-4">
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

      <AppleCarousel slides={sellerieCarouselSlides} />

      <section className="relative z-10 max-w-6xl mx-auto px-6 my-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="group bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="h-40 w-full bg-stone-100 rounded-2xl mb-4 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">
                  {product.type === "Collier" ? "🐕" : product.type === "Laisse" || product.type === "Laisse Frog" ? "🦮" : "🔗"}
                </div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-black text-stone-900 text-lg leading-tight">{product.name}</h3>
                  <span className="font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-sm">{product.price}</span>
                </div>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">{product.desc}</p>
              </div>
              <button onClick={() => handleOpenProduct(product)} className="mt-6 w-full py-3 bg-stone-900 text-white font-bold text-xs uppercase tracking-wide rounded-full hover:bg-amber-600 transition-colors cursor-pointer">
                Personnaliser
              </button>
            </div>
          ))}
        </div>
      </section>

      <ContactSection />

      <footer className="relative z-10 border-t border-stone-200/60 bg-transparent py-12 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Inochi Inu — Les Héritiers de Boshin. Tous droits réservés.</p>
      </footer>

      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-white p-8 rounded-[2rem] text-center shadow-2xl">
            <h3 className="text-2xl font-black text-stone-900">Connexion requise</h3>
            <p className="text-sm text-stone-500 mt-2">Connectez-vous pour associer une commande au profil de votre chien.</p>
            <button onClick={handleGoogleLogin} className="mt-6 w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold rounded-full transition-all cursor-pointer">Continuer avec Google</button>
            <button onClick={() => setIsAuthOpen(false)} className="mt-4 text-xs font-bold text-stone-400 cursor-pointer">Annuler</button>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl h-[90vh] flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-50 flex items-center justify-center w-8 h-8 bg-white/50 backdrop-blur-md hover:bg-white text-stone-500 hover:text-stone-900 rounded-full cursor-pointer transition shadow-sm border border-stone-200">✕</button>
            
            {submitted ? (
              <div className="w-full flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6 text-3xl">✓</div>
                <h3 className="text-2xl font-black text-stone-900">Commande envoyée à l'atelier !</h3>
                <p className="text-sm text-stone-500 mt-3 max-w-md leading-relaxed">Nous préparons votre commande. Vous recevrez un lien de paiement Stripe par email une fois votre équipement prêt à être expédié.</p>
                <button onClick={() => setSelectedProduct(null)} className="mt-8 px-8 py-3 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer hover:bg-stone-800 transition">Fermer</button>
              </div>
            ) : (
              <>
                {/* COLONNE GAUCHE : APERÇU VISUEL */}
                <div className="w-full md:w-1/2 bg-stone-50/50 relative flex flex-col border-b md:border-b-0 md:border-r border-stone-200">
                  
                  <div className="p-6 shrink-0 z-10 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-100 px-3 py-1 rounded-full inline-block mb-2 shadow-sm border border-amber-200">Aperçu Dynamique</span>
                      <h3 className="text-2xl font-black text-stone-900 leading-tight">{selectedProduct.name}</h3>
                    </div>
                    {/* Petite instruction de zoom cachée sur mobile */}
                    <span className={`hidden md:inline-flex text-[10px] font-bold text-stone-400 items-center gap-1 transition-opacity duration-300 ${isZooming ? 'opacity-0' : 'opacity-100'}`}>
                      🔍 Survolez pour zoomer
                    </span>
                  </div>

                  <div className="flex-1 relative flex flex-col items-center justify-center p-8 min-h-[250px] overflow-hidden group">
                    
                    {/* --- APERÇU : LAISSE FROG --- */}
                    {selectedProduct.type === "Laisse Frog" && (
                      <div 
                        {...zoomEvents}
                        // touch-none empêche la page de scroller quand on "frotte" l'image sur iPad
                        className="relative w-full max-w-[700px] h-[300px] mx-auto cursor-crosshair touch-none z-20"
                      >
                        <div 
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={isZooming ? {
                            transformOrigin: zoomStyle.transformOrigin,
                            transform: zoomStyle.transform,
                            transition: "transform 0.1s linear"
                          } : {
                            transformOrigin: "center center",
                            transition: "transform 0.4s ease-out"
                          }}
                        >
                          <div className="absolute inset-0 w-full h-full scale-125 lg:scale-[1.5]">
                            {/* COUCHE -1 : L'Ombre portée */}
                            <img src="/laisse-frog-ombre.png" alt="Ombre" className="absolute inset-0 w-full h-full object-contain z-0 opacity-30 translate-y-2 pointer-events-none" />

                            {/* COUCHE 0 : La Base Noire (Bouche les micro-trous) */}
                            <img src="/laisse-frog-base.png" alt="Base" className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none" />

                            {/* SANGLE PRINCIPALE : SANDWICH 3 COUCHES */}
                            <div className="absolute inset-0 w-full h-full z-10 transition-colors duration-300 ease-in-out" style={{ backgroundColor: mainHex, maskImage: `url('/laisse-frog-sangle.png')`, WebkitMaskImage: `url('/laisse-frog-sangle.png')`, maskSize: "contain", WebkitMaskSize: "contain", maskPosition: "center", WebkitMaskPosition: "center", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }} />
                            <img src="/laisse-frog-sangle.png" alt="Sangle Ombres" className="absolute inset-0 w-full h-full object-contain z-10 mix-blend-multiply opacity-100 pointer-events-none" />
                            {/* CORRECTION : opacity réduite à 30 et ajout de contrast-125 pour ne pas délaver la couleur */}
                            <img src="/laisse-frog-sangle.png" alt="Sangle Reflets" className="absolute inset-0 w-full h-full object-contain z-10 mix-blend-screen opacity-30 contrast-125 pointer-events-none" />

                            {/* SANGLE ATTACHES : SANDWICH 3 COUCHES */}
                            <div className="absolute inset-0 w-full h-full z-20 transition-colors duration-300 ease-in-out" style={{ backgroundColor: attachmentHex, maskImage: `url('/laisse-frog-attaches.png')`, WebkitMaskImage: `url('/laisse-frog-attaches.png')`, maskSize: "contain", WebkitMaskSize: "contain", maskPosition: "center", WebkitMaskPosition: "center", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }} />
                            <img src="/laisse-frog-attaches.png" alt="Attaches Ombres" className="absolute inset-0 w-full h-full object-contain z-20 mix-blend-multiply opacity-100 pointer-events-none" />
                            {/* CORRECTION : opacity réduite à 30 et contrast-125 */}
                            <img src="/laisse-frog-attaches.png" alt="Attaches Reflets" className="absolute inset-0 w-full h-full object-contain z-20 mix-blend-screen opacity-30 contrast-125 pointer-events-none" />

                            {/* CLIP FROG ET RIVETS */}
                            <img src="/laisse-frog-clip.png" alt="Clip Frog" className="absolute inset-0 w-full h-full object-contain z-50 drop-shadow-sm pointer-events-none" />
                            <img src="/laisse-frog-rivets.png" alt="Rivets Texture" className="absolute inset-0 w-full h-full object-contain z-50 drop-shadow-sm pointer-events-none" />

                            {/* CORRECTION : mix-blend-color à la place de overlay pour le métal (évite le rendu terne) */}
                            <div className="absolute inset-0 w-full h-full z-50 transition-colors duration-500 ease-in-out mix-blend-color pointer-events-none"
                              style={{
                                backgroundColor: hardwareOverlayHex,
                                maskImage: `url('/laisse-frog-rivets.png')`, maskSize: "contain", maskPosition: "center", maskRepeat: "no-repeat",
                                WebkitMaskImage: `url('/laisse-frog-rivets.png')`, WebkitMaskSize: "contain", WebkitMaskPosition: "center", WebkitMaskRepeat: "no-repeat"
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* --- APERÇU : COLLIER --- */}
                    {selectedProduct.type === "Collier" && (
                      <div 
                        {...zoomEvents}
                        className="relative aspect-square w-full max-w-[320px] mx-auto cursor-crosshair touch-none z-20"
                      >
                        <div 
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={isZooming ? {
                            transformOrigin: zoomStyle.transformOrigin,
                            transform: zoomStyle.transform,
                            transition: "transform 0.1s linear"
                          } : {
                            transformOrigin: "center center",
                            transition: "transform 0.4s ease-out"
                          }}
                        >
                          <div className="absolute inset-0 w-full h-full scale-125 lg:scale-[1.5]">
                            {/* COUCHE -1 : L'Ombre portée */}
                            <img src="/collier-ombre.png" alt="Ombre" className="absolute inset-0 w-full h-full object-contain z-0 opacity-30 translate-y-2 pointer-events-none" />

                            {/* COUCHE 0 : La Base Noire */}
                            <img src="/collier-base.png" alt="Base" className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none" />

                            {/* COLLIER : SANDWICH 3 COUCHES */}
                            <div className="absolute inset-0 w-full h-full z-10 transition-colors duration-300 ease-in-out" style={{ backgroundColor: ropeHex, maskImage: `url('/collier-sangle.png')`, WebkitMaskImage: `url('/collier-sangle.png')`, maskSize: "contain", WebkitMaskSize: "contain", maskPosition: "center", WebkitMaskPosition: "center", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }} />
                            <img src="/collier-sangle.png" alt="Base Sangle Ombres" className="absolute inset-0 w-full h-full object-contain z-10 mix-blend-multiply opacity-100 pointer-events-none" />
                            {/* CORRECTION : opacity-30 et contrast-125 pour garder la saturation de la couleur */}
                            <img src="/collier-sangle.png" alt="Base Sangle Reflets" className="absolute inset-0 w-full h-full object-contain z-10 mix-blend-screen opacity-30 contrast-125 pointer-events-none" />
                            
                            {/* BOUCLERIE */}
                            <img src="/collier-bouclerie.png" alt="Texture Bouclerie" className="absolute inset-0 w-full h-full object-contain z-30 drop-shadow-sm pointer-events-none" />
                            
                            {/* CORRECTION : mix-blend-color pour ne pas brûler la couleur du métal */}
                            <div className="absolute inset-0 w-full h-full z-40 transition-colors duration-500 ease-in-out mix-blend-color pointer-events-none"
                              style={{
                                backgroundColor: hardwareOverlayHex,
                                maskImage: `url('/collier-bouclerie.png')`, maskSize: "contain", maskPosition: "center", maskRepeat: "no-repeat",
                                WebkitMaskImage: `url('/collier-bouclerie.png')`, WebkitMaskSize: "contain", WebkitMaskPosition: "center", WebkitMaskRepeat: "no-repeat"
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* --- APERÇU : LAISSE MULTIPOSITIONS --- */}
                    {selectedProduct.type === "Laisse" && (
                      <div className="w-full max-w-sm flex items-center justify-center scale-110 lg:scale-125 transition-transform duration-700">
                        <svg viewBox="0 0 400 150" className="w-full h-auto drop-shadow-xl p-2 transition-all duration-500 pointer-events-none">
                          <path d="M 50,75 Q 125,140 200,75 T 350,75" stroke={ropeHex} strokeWidth="12" fill="none" strokeLinecap="round" className="transition-colors duration-300" />
                          <circle cx="125" cy="107" r="10" stroke={hardwareSvgHex} strokeWidth="4" fill="none" className="transition-colors duration-300" />
                          <circle cx="200" cy="75" r="10" stroke={hardwareSvgHex} strokeWidth="4" fill="none" className="transition-colors duration-300" />
                          <circle cx="275" cy="42" r="10" stroke={hardwareSvgHex} strokeWidth="4" fill="none" className="transition-colors duration-300" />
                          <g transform="translate(15, 65)">
                            <rect x="15" y="0" width="20" height="20" rx="4" fill={hardwareSvgHex} className="transition-colors duration-300" />
                            <path d="M 15,10 C -5,10 -5,-5 10,-5 C 18,-5 20,5 20,5" stroke={hardwareSvgHex} strokeWidth="5" fill="none" strokeLinecap="round" className="transition-colors duration-300" />
                          </g>
                          <g transform="translate(345, 65)">
                            <rect x="0" y="0" width="20" height="20" rx="4" fill={hardwareSvgHex} className="transition-colors duration-300" />
                            <path d="M 20,10 C 40,10 40,-5 25,-5 C 17,-5 15,5 15,5" stroke={hardwareSvgHex} strokeWidth="5" fill="none" strokeLinecap="round" className="transition-colors duration-300" />
                          </g>
                        </svg>
                      </div>
                    )}

                    {/* --- AUTRES PRODUITS --- */}
                    {selectedProduct.type !== "Laisse" && selectedProduct.type !== "Collier" && selectedProduct.type !== "Laisse Frog" && (
                      <div className="text-center w-full max-w-sm pointer-events-none">
                        <div className={`w-32 h-32 mx-auto rounded-[2rem] ${colorMap[formData.color] || 'bg-stone-800'} shadow-lg transition-colors duration-300 flex items-center justify-center text-4xl`}>📦</div>
                      </div>
                    )}

                    {/* Étiquette du bas, disparaît pendant le zoom pour ne pas gêner la vue */}
                    <div className={`absolute bottom-6 inset-x-0 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-white/50 backdrop-blur-sm mx-auto w-max px-4 py-1.5 rounded-full border border-stone-200 shadow-sm z-50 transition-opacity duration-300 pointer-events-none ${isZooming ? 'opacity-0' : 'opacity-100'}`}>
                      {selectedProduct.type === "Laisse Frog" ? `${formData.mainColor} / ${formData.attachmentColor} • ${formData.hardware}` : `${formData.color} • ${formData.hardware}`}
                    </div>
                  </div>
                </div>

                {/* COLONNE DROITE : FORMULAIRE DE COMMANDE */}
                <div className="w-full md:w-1/2 flex flex-col h-full overflow-y-auto">
                  <div className="p-6 sm:p-8 flex-1">
                    <form id="order-form" onSubmit={handleOrder} className="space-y-8">
                      
                      {selectedProduct.type === "Laisse Frog" ? (
                        <>
                          <div>
                            <label className="block text-xs font-black uppercase text-stone-900 mb-3 tracking-wider">1. Couleur Principale (Sangle)</label>
                            <div className="flex flex-wrap gap-3">
                              {selectedProduct.colors.map((c: string) => (
                                <button key={`main-${c}`} type="button" onClick={() => setFormData({ ...formData, mainColor: c })} className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer ${formData.mainColor === c ? "border-stone-900 bg-white shadow-sm" : "border-transparent bg-stone-100 hover:bg-stone-200"}`}>
                                  <div className={`w-4 h-4 rounded-full shadow-inner border border-black/10 ${colorMap[c] || 'bg-stone-200'}`} />
                                  <span className={`text-xs font-bold ${formData.mainColor === c ? "text-stone-900" : "text-stone-600"}`}>{c}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-black uppercase text-stone-900 mb-3 tracking-wider">2. Couleur Secondaire (Attaches)</label>
                            <div className="flex flex-wrap gap-3">
                              {selectedProduct.colors.map((c: string) => (
                                <button key={`attach-${c}`} type="button" onClick={() => setFormData({ ...formData, attachmentColor: c })} className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer ${formData.attachmentColor === c ? "border-stone-900 bg-white shadow-sm" : "border-transparent bg-stone-100 hover:bg-stone-200"}`}>
                                  <div className={`w-4 h-4 rounded-full shadow-inner border border-black/10 ${colorMap[c] || 'bg-stone-200'}`} />
                                  <span className={`text-xs font-bold ${formData.attachmentColor === c ? "text-stone-900" : "text-stone-600"}`}>{c}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div>
                          <label className="block text-xs font-black uppercase text-stone-900 mb-3 tracking-wider">1. Couleur Principale</label>
                          <div className="flex flex-wrap gap-3">
                            {selectedProduct.colors.map((c: string) => (
                              <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })} className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer ${formData.color === c ? "border-stone-900 bg-white shadow-sm" : "border-transparent bg-stone-100 hover:bg-stone-200"}`}>
                                <div className={`w-4 h-4 rounded-full shadow-inner border border-black/10 ${colorMap[c] || 'bg-gradient-to-r from-orange-400 to-amber-400'}`} />
                                <span className={`text-xs font-bold ${formData.color === c ? "text-stone-900" : "text-stone-600"}`}>{c}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-black uppercase text-stone-900 mb-3 tracking-wider">
                          {selectedProduct.type === "Laisse Frog" ? "3. Finition des Rivets" : "2. Finition de la bouclerie"}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button type="button" onClick={() => setFormData({ ...formData, hardware: "Laiton Doré" })} className={`p-3 text-left rounded-xl border-2 transition-all cursor-pointer ${formData.hardware === "Laiton Doré" ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white hover:border-amber-200"}`}>
                            <span className="font-black text-sm text-stone-900 block">Laiton Inoxydable</span>
                            <span className="text-[10px] font-bold text-amber-600">Finition Dorée (+0€)</span>
                          </button>
                          <button type="button" onClick={() => setFormData({ ...formData, hardware: "Acier Gris" })} className={`p-3 text-left rounded-xl border-2 transition-all cursor-pointer ${formData.hardware === "Acier Gris" ? "border-stone-900 bg-stone-100" : "border-stone-200 bg-white hover:border-stone-300"}`}>
                            <span className="font-black text-sm text-stone-900 block">Acier Inoxydable</span>
                            <span className="text-[10px] font-bold text-stone-500">Finition Grise (+0€)</span>
                          </button>
                        </div>
                        {selectedProduct.type === "Laisse Frog" && (
                          <p className="text-[10px] text-stone-500 mt-2 font-medium">L'attache Frog reste en finition noire mate tactique de série.</p>
                        )}
                      </div>

                      <div className="border-t border-stone-200 pt-6 space-y-5">
                        <label className="block text-xs font-black uppercase text-stone-900 tracking-wider">
                          {selectedProduct.type === "Laisse Frog" ? "4. Sizing & Contact" : "3. Mensurations & Contact"}
                        </label>
                        
                        {selectedProduct.type === "Collier" ? (
                           <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                            <ClientDogSelector isAdmin={false} currentUserId={user?.id} onDogSelected={(dog) => setFormData({ ...formData, dog_id: dog.id, dogName: dog.name, dogBreed: dog.breed })} />
                            <div className="mt-4">
                              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Tour de cou exact (cm) *</label>
                              <input required type="text" placeholder="Ex: 42" value={formData.neckSize} onChange={(e) => setFormData({...formData, neckSize: e.target.value})} className="w-full p-3 rounded-xl bg-white border border-stone-200 text-xs font-bold focus:outline-none focus:border-amber-500 transition-colors" />
                            </div>
                           </div>
                        ) : (
                          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-xs text-stone-500 font-medium">
                            <span className="block mb-2">🐕 Ce produit taille de manière standard. Vous pouvez néanmoins associer la commande à un de vos chiens si vous le souhaitez (optionnel).</span>
                            <ClientDogSelector isAdmin={false} currentUserId={user?.id} onDogSelected={(dog) => setFormData({ ...formData, dog_id: dog.id, dogName: dog.name, dogBreed: dog.breed })} />
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Téléphone de contact *</label>
                          <input required type="tel" placeholder="06 12 34 56 78" value={formData.clientPhone} onChange={(e) => setFormData({...formData, clientPhone: e.target.value})} className="w-full p-3 rounded-xl bg-white border border-stone-200 text-xs font-bold focus:outline-none focus:border-amber-500 transition-colors" />
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="p-6 bg-stone-900 border-t border-stone-800 flex items-center justify-between shrink-0">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Total net</span>
                      <span className="text-2xl font-black text-white">{selectedProduct.price}</span>
                    </div>
                    <button form="order-form" type="submit" disabled={submitting || (selectedProduct.type === "Collier" && (!formData.dog_id || !formData.neckSize))} className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-full hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all cursor-pointer shadow-lg">
                      {submitting ? "..." : "Valider"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}