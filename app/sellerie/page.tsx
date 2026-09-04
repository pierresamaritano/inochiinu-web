"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import LiquidNavbar from "../components/LiquidNavbar";
import ClientDogSelector from "../components/ClientDogSelector";
import PaymentSimulation from "../components/PaymentSimulation";

// IMPORTS DES COMPOSANTS MAÎTRES
import AppleCarousel, { CarouselSlide } from "../components/AppleCarousel";
import ContactSection from "../components/ContactSection";

const BUCKET_URL = "https://qvybupsibujplkykufja.supabase.co/storage/v1/object/public/media";

// CATALOGUE DE LA BOUTIQUE UNIFORMISÉ
const PRODUCTS = [
  { 
    id: "col-bio", name: "Collier Biothane Sur-Mesure", price: "25€", type: "Collier", 
    desc: "Ultra-résistant, waterproof et facile à nettoyer. Bouclerie en laiton inoxydable.", 
    colors: ["Noir", "Fauve", "Kaki", "Bordeaux"], 
    imagePath: "collier/collier.png",
    hasSecondaryColor: false 
  },
  { 
    id: "lais-frog", name: "Laisse Bicolore Attache Frog", price: "55€", type: "Laisse Frog", 
    desc: "Biothane bicolore et attache tactique Frog à libération rapide. Idéale pour les tractions fortes.", 
    colors: ["Noir", "Fauve", "Kaki", "Bordeaux", "Beige", "Bleu Roi", "Bleu Ciel"], 
    imagePath: "laisse-frog/laisse-frog.png",
    hasSecondaryColor: true,
    secondaryColorLabel: "Attaches"
  },
  { 
    id: "longe-bio", name: "Longe d'apprentissage (5m/10m)", price: "45€", type: "Longe", 
    desc: "Longe en biothane sans poignée pour ne pas s'accrocher dans les broussailles.", 
    colors: ["Orange Fluo", "Jaune Fluo", "Noir"], 
    imagePath: "longe/longe.png",
    hasSecondaryColor: false 
  }
];

export default function SelleriePage() {
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [step, setStep] = useState(1); 
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [isZooming, setIsZooming] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: "center center", transform: "scale(1)" });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // ÉTAT UNIFORMISÉ (mainColor et secondaryColor)
  const [formData, setFormData] = useState({
    dog_id: "",
    dogName: "",
    dogBreed: "",           
    mainColor: "",          
    secondaryColor: "",    
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2.5)" });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const touch = e.touches[0];
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - top) / height) * 100));
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2.5)" });
  };

  const zoomEvents = {
    onMouseEnter: () => setIsZooming(true),
    onMouseMove: handleMouseMove,
    onMouseLeave: () => setIsZooming(false),
    onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => {
        setIsZooming(true);
        handleTouchMove(e);
    },
    onTouchMove: handleTouchMove,
    onTouchEnd: () => setIsZooming(false),
    onTouchCancel: () => setIsZooming(false),
  };

  const sellerieCarouselSlides: CarouselSlide[] = [
    { src: `${BUCKET_URL}/sellerie/carrousel-1.jpeg`, type: "image", alt: "Matériel de sellerie", tag: "Fabrication Artisanale", caption: "Du matériel robuste et pensé pour durer en extérieur." },
    { src: `${BUCKET_URL}/sellerie/carrousel-2.jpeg`, type: "image", alt: "Chien avec harnais", tag: "Confort & Maintien", caption: "Des coupes ergonomiques adaptées à la morphologie des chiens." },
    { src: `${BUCKET_URL}/sellerie/carrousel-3.jpeg`, type: "image", alt: "Promenade en pleine nature", tag: "Sur-Mesure", caption: "Conçu pour résister aux balades les plus sportives." }
  ];

  const handleOpenProduct = (product: any) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedProduct(product);
    setFormData(prev => ({ 
      ...prev, 
      mainColor: product.colors[0],
      secondaryColor: product.hasSecondaryColor ? (product.colors[1] || product.colors[0]) : "",
      hardware: "Laiton Doré"
    }));
    setSubmitted(false);
    setStep(1); 
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

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dog_id && selectedProduct.type === "Collier") {
      alert("Veuillez sélectionner un chien pour associer les mensurations.");
      return;
    }
    setStep(2);
  };

  const handleFinalOrder = async (stripePaymentId: string) => {
    setSubmitting(true);
    const colorFinishString = selectedProduct.hasSecondaryColor
      ? `Base: ${formData.mainColor} | Secondaire: ${formData.secondaryColor} | Rivets/Boucles: ${formData.hardware}`
      : `${formData.mainColor} - Mousquetons/Boucles: ${formData.hardware}`;

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
        stripe_payment_id: stripePaymentId, 
      }]);
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      alert("Erreur de sauvegarde Supabase : " + (err?.message || "La base de données a rejeté la commande."));
    } finally {
      setSubmitting(false);
    }
  };

  const colorMap: Record<string, string> = {
    "Noir": "bg-stone-900", "Fauve": "bg-amber-600", "Kaki": "bg-emerald-800", "Bordeaux": "bg-rose-900", "Beige": "bg-stone-200", "Vert Forêt": "bg-emerald-900", "Orange Fluo": "bg-orange-500", "Jaune Fluo": "bg-yellow-400", "Bleu Roi": "bg-blue-700", "Bleu Ciel": "bg-sky-300", "Personnalisé (Préciser en note)": "bg-gradient-to-r from-orange-400 to-amber-400"
  };

  const ropeHexMap: Record<string, string> = {
    "Noir": "#2b2b2b", "Fauve": "#d97706", "Kaki": "#065f46", "Bordeaux": "#881337", "Beige": "#e7e5e4", "Vert Forêt": "#064e3b", "Orange Fluo": "#f97316", "Jaune Fluo": "#facc15", "Bleu Roi": "#1d4ed8", "Bleu Ciel": "#7dd3fc", "Personnalisé (Préciser en note)": "#a8a29e"
  };
  
  // VARIABLES DE COULEURS UNIFORMISÉES
  const mainHex = ropeHexMap[formData.mainColor] || "#2b2b2b";
  const secondaryHex = ropeHexMap[formData.secondaryColor] || "#2b2b2b";
  const hardwareOverlayHex = formData.hardware === "Laiton Doré" ? "#d4af37" : "#71797E"; 

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="group bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="h-48 w-full bg-stone-100 rounded-2xl mb-4 flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-300">
                  <img src={`${BUCKET_URL}/sellerie/${product.imagePath}`} alt={product.name} className="w-full h-full object-contain drop-shadow-sm mix-blend-multiply" />
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
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-white p-8 rounded-[2rem] text-center shadow-2xl">
            <h3 className="text-2xl font-black text-stone-900">Connexion requise</h3>
            <p className="text-sm text-stone-500 mt-2">Connectez-vous pour associer une commande au profil de votre chien.</p>
            <button onClick={handleGoogleLogin} className="mt-6 w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold rounded-full transition-all cursor-pointer">Continuer avec Google</button>
            <button onClick={() => setIsAuthOpen(false)} className="mt-4 text-xs font-bold text-stone-400 cursor-pointer">Annuler</button>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl h-[90vh] flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-50 flex items-center justify-center w-8 h-8 bg-white/50 backdrop-blur-md hover:bg-white text-stone-500 hover:text-stone-900 rounded-full cursor-pointer transition shadow-sm border border-stone-200">✕</button>
            
            {submitted ? (
              <div className="w-full flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6 text-3xl">✓</div>
                <h3 className="text-2xl font-black text-stone-900">Commande envoyée à l'atelier !</h3>
                <p className="text-sm text-stone-500 mt-3 max-w-md leading-relaxed">Nous préparons votre commande. Vous recevrez très bientôt un email de confirmation avec le récapitulatif.</p>
                <button onClick={() => setSelectedProduct(null)} className="mt-8 px-8 py-3 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer hover:bg-stone-800 transition">Fermer</button>
              </div>
            ) : (
              <>
                {/* COLONNE GAUCHE : APERÇU VISUEL */}
                <div className="w-full md:w-1/2 bg-stone-50/50 relative flex flex-col border-b md:border-b-0 md:border-r border-stone-200">
                  
                  <div className="p-4 md:p-6 shrink-0 z-10 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-100 px-3 py-1 rounded-full inline-block mb-1 md:mb-2 shadow-sm border border-amber-200">Aperçu Dynamique</span>
                      <h3 className="text-xl md:text-2xl font-black text-stone-900 leading-tight">{selectedProduct.name}</h3>
                    </div>
                    {selectedProduct.type !== "Longe" && (
                      <span className={`hidden md:inline-flex text-[10px] font-bold text-stone-400 items-center gap-1 transition-opacity duration-300 ${isZooming ? 'opacity-0' : 'opacity-100'}`}>
                        🔍 Survolez pour zoomer
                      </span>
                    )}
                  </div>

                  <div className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-8 min-h-[180px] md:min-h-[250px] overflow-hidden group">
                    
                    {/* --- APERÇU : LAISSE FROG --- */}
                    {selectedProduct.type === "Laisse Frog" && (
                      <div ref={imageContainerRef} {...zoomEvents} className="relative w-full max-w-[700px] h-[160px] md:h-[300px] mx-auto cursor-crosshair touch-none z-20">
                        <div className="absolute inset-0 w-full h-full pointer-events-none" style={isZooming ? { transformOrigin: zoomStyle.transformOrigin, transform: zoomStyle.transform, transition: "transform 0.1s linear" } : { transformOrigin: "center center", transition: "transform 0.4s ease-out" }}>
                          <div className="absolute inset-0 w-full h-full scale-125 lg:scale-[1.5]">
                            <img src={`${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-ombre.png`} alt="Ombre" className="absolute inset-0 w-full h-full object-contain z-0 opacity-30 translate-y-2 pointer-events-none" />
                            <img src={`${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-base.png`} alt="Base" className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none" />

                            {/* COULEUR PRINCIPALE */}
                            <div className="absolute inset-0 w-full h-full z-10 transition-colors duration-300 ease-in-out" style={{ backgroundColor: mainHex, maskImage: `url('${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-sangle.png')`, WebkitMaskImage: `url('${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-sangle.png')`, maskSize: "contain", WebkitMaskSize: "contain", maskPosition: "center", WebkitMaskPosition: "center", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }} />
                            <img src={`${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-sangle.png`} alt="Sangle Ombres" className="absolute inset-0 w-full h-full object-contain z-20 mix-blend-multiply opacity-100 pointer-events-none" />

                            {/* COULEUR SECONDAIRE */}
                            <div className="absolute inset-0 w-full h-full z-30 transition-colors duration-300 ease-in-out" style={{ backgroundColor: secondaryHex, maskImage: `url('${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-attaches.png')`, WebkitMaskImage: `url('${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-attaches.png')`, maskSize: "contain", WebkitMaskSize: "contain", maskPosition: "center", WebkitMaskPosition: "center", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }} />
                            <img src={`${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-attaches.png`} alt="Attaches Ombres" className="absolute inset-0 w-full h-full object-contain z-40 mix-blend-multiply opacity-100 pointer-events-none" />

                            {/* QUINCAILLERIE */}
                            <img src={`${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-clip.png`} alt="Clip Frog" className="absolute inset-0 w-full h-full object-contain z-50 drop-shadow-sm pointer-events-none" />
                            <img src={`${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-rivets.png`} alt="Rivets Texture" className="absolute inset-0 w-full h-full object-contain z-50 drop-shadow-sm pointer-events-none" />
                            <div className="absolute inset-0 w-full h-full z-50 transition-colors duration-500 ease-in-out mix-blend-overlay pointer-events-none"
                              style={{
                                backgroundColor: hardwareOverlayHex,
                                maskImage: `url('${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-rivets.png')`, maskSize: "contain", maskPosition: "center", maskRepeat: "no-repeat",
                                WebkitMaskImage: `url('${BUCKET_URL}/sellerie/laisse-frog/laisse-frog-rivets.png')`, WebkitMaskSize: "contain", WebkitMaskPosition: "center", WebkitMaskRepeat: "no-repeat"
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* --- APERÇU : COLLIER --- */}
                    {selectedProduct.type === "Collier" && (
                      <div ref={imageContainerRef} {...zoomEvents} className="relative aspect-square w-full max-w-[200px] md:max-w-[320px] mx-auto cursor-crosshair touch-none z-20">
                        <div className="absolute inset-0 w-full h-full pointer-events-none" style={isZooming ? { transformOrigin: zoomStyle.transformOrigin, transform: zoomStyle.transform, transition: "transform 0.1s linear" } : { transformOrigin: "center center", transition: "transform 0.4s ease-out" }}>
                          <div className="absolute inset-0 w-full h-full scale-125 lg:scale-[1.5]">
                            <img src={`${BUCKET_URL}/sellerie/collier/collier-ombre.png`} alt="Ombre" className="absolute inset-0 w-full h-full object-contain z-0 opacity-30 translate-y-2 pointer-events-none" />
                            <img src={`${BUCKET_URL}/sellerie/collier/collier-base.png`} alt="Base" className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none" />

                            {/* COULEUR PRINCIPALE */}
                            <div className="absolute inset-0 w-full h-full z-10 transition-colors duration-300 ease-in-out" style={{ backgroundColor: mainHex, maskImage: `url('${BUCKET_URL}/sellerie/collier/collier-sangle.png')`, WebkitMaskImage: `url('${BUCKET_URL}/sellerie/collier/collier-sangle.png')`, maskSize: "contain", WebkitMaskSize: "contain", maskPosition: "center", WebkitMaskPosition: "center", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }} />
                            <img src={`${BUCKET_URL}/sellerie/collier/collier-sangle.png`} alt="Base Sangle Ombres" className="absolute inset-0 w-full h-full object-contain z-20 mix-blend-multiply opacity-100 pointer-events-none" />
                            
                            {/* QUINCAILLERIE */}
                            <img src={`${BUCKET_URL}/sellerie/collier/collier-bouclerie.png`} alt="Texture Bouclerie" className="absolute inset-0 w-full h-full object-contain z-30 drop-shadow-sm pointer-events-none" />
                            <div className="absolute inset-0 w-full h-full z-40 transition-colors duration-500 ease-in-out mix-blend-overlay pointer-events-none"
                              style={{
                                backgroundColor: hardwareOverlayHex,
                                maskImage: `url('${BUCKET_URL}/sellerie/collier/collier-bouclerie.png')`, maskSize: "contain", maskPosition: "center", maskRepeat: "no-repeat",
                                WebkitMaskImage: `url('${BUCKET_URL}/sellerie/collier/collier-bouclerie.png')`, WebkitMaskSize: "contain", WebkitMaskPosition: "center", WebkitMaskRepeat: "no-repeat"
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* --- APERÇU : LONGE --- */}
                    {selectedProduct.type === "Longe" && (
                      <div className="text-center w-full max-w-sm pointer-events-none flex flex-col items-center justify-center">
                        <img src={`${BUCKET_URL}/sellerie/${selectedProduct.imagePath}`} alt={selectedProduct.name} className="w-48 h-48 object-contain drop-shadow-xl" />
                      </div>
                    )}

                    <div className={`absolute bottom-2 md:bottom-6 inset-x-0 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-white/50 backdrop-blur-sm mx-auto w-max px-4 py-1.5 rounded-full border border-stone-200 shadow-sm z-50 transition-opacity duration-300 pointer-events-none ${isZooming ? 'opacity-0' : 'opacity-100'}`}>
                      {selectedProduct.hasSecondaryColor 
                        ? `${formData.mainColor} / ${formData.secondaryColor} • ${formData.hardware}` 
                        : `${formData.mainColor} • ${formData.hardware}`}
                    </div>
                  </div>
                </div>

                {/* COLONNE DROITE : FORMULAIRE ET PAIEMENT */}
                <div className="w-full md:w-1/2 flex flex-col h-full overflow-y-auto">
                  
                  {step === 2 ? (
                    <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center animate-in slide-in-from-right-4">
                      <div className="mb-6">
                        <button onClick={() => setStep(1)} className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer mb-4 inline-block">← Modifier ma configuration</button>
                        <h3 className="text-2xl font-black text-stone-900 tracking-tight">Finaliser la commande</h3>
                        <p className="text-sm text-stone-500 mt-1">Équipement fait main en France.</p>
                      </div>
                      
                      <div className="bg-white rounded-3xl p-1">
                        <PaymentSimulation 
                          amount={parseInt(selectedProduct.price.replace('€', ''))} 
                          serviceName={selectedProduct.name}
                          onSuccess={(stripeId) => handleFinalOrder(stripeId)} 
                          onCancel={() => setStep(1)}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-6 sm:p-8 flex-1">
                        <form id="order-form" onSubmit={handleProceedToPayment} className="space-y-8">
                          
                          {/* CHOIX COULEUR PRINCIPALE (Tous produits configurables) */}
                          <div>
                            <label className="block text-xs font-black uppercase text-stone-900 mb-3 tracking-wider">
                              1. Couleur Principale {selectedProduct.hasSecondaryColor && "(Sangle)"}
                            </label>
                            <div className="flex flex-wrap gap-3">
                              {selectedProduct.colors.map((c: string) => (
                                <button key={`main-${c}`} type="button" onClick={() => setFormData({ ...formData, mainColor: c })} className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer ${formData.mainColor === c ? "border-stone-900 bg-white shadow-sm" : "border-transparent bg-stone-100 hover:bg-stone-200"}`}>
                                  <div className={`w-4 h-4 rounded-full shadow-inner border border-black/10 ${colorMap[c] || 'bg-stone-200'}`} />
                                  <span className={`text-xs font-bold ${formData.mainColor === c ? "text-stone-900" : "text-stone-600"}`}>{c}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* CHOIX COULEUR SECONDAIRE (Si produit compatible, ex: Laisse Frog) */}
                          {selectedProduct.hasSecondaryColor && (
                            <div>
                              <label className="block text-xs font-black uppercase text-stone-900 mb-3 tracking-wider">
                                2. Couleur Secondaire ({selectedProduct.secondaryColorLabel})
                              </label>
                              <div className="flex flex-wrap gap-3">
                                {selectedProduct.colors.map((c: string) => (
                                  <button key={`sec-${c}`} type="button" onClick={() => setFormData({ ...formData, secondaryColor: c })} className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer ${formData.secondaryColor === c ? "border-stone-900 bg-white shadow-sm" : "border-transparent bg-stone-100 hover:bg-stone-200"}`}>
                                    <div className={`w-4 h-4 rounded-full shadow-inner border border-black/10 ${colorMap[c] || 'bg-stone-200'}`} />
                                    <span className={`text-xs font-bold ${formData.secondaryColor === c ? "text-stone-900" : "text-stone-600"}`}>{c}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CHOIX QUINCAILLERIE */}
                          <div>
                            <label className="block text-xs font-black uppercase text-stone-900 mb-3 tracking-wider">
                              {selectedProduct.hasSecondaryColor ? "3. Finition des Rivets" : "2. Finition de la bouclerie"}
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

                          {/* SIZING ET CONTACT */}
                          <div className="border-t border-stone-200 pt-6 space-y-5">
                            <label className="block text-xs font-black uppercase text-stone-900 tracking-wider">
                              {selectedProduct.hasSecondaryColor ? "4. Sizing & Contact" : "3. Mensurations & Contact"}
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
                          Valider
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}