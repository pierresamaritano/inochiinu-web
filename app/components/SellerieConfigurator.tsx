"use client";

import { useState } from "react";

// Notre palette de couleurs Biothane
const BIOTHANE_COLORS = [
  { id: "noir", name: "Noir Intense", hex: "#1c1917" },
  { id: "sapin", name: "Vert Sapin", hex: "#166534" },
  { id: "bordeaux", name: "Rouge Bordeaux", hex: "#831843" },
  { id: "cognac", name: "Brun Cognac", hex: "#b45309" },
  { id: "bleu", name: "Bleu Nuit", hex: "#1e3a8a" },
  { id: "moutarde", name: "Jaune Moutarde", hex: "#ca8a04" },
];

export default function SellerieConfigurator() {
  const [selectedColor, setSelectedColor] = useState(BIOTHANE_COLORS[1]); // Vert sapin par défaut

  // REMPLACEZ CECI par l'URL de votre image test transparente
  const baseImageUrl = "/collier-base.png"; 

  return (
    <div className="max-w-4xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12 bg-[#FDFCF8] rounded-[3rem] shadow-xl border border-stone-200">
      
      {/* LA ZONE DE RENDU VISUEL */}
      <div className="relative aspect-square w-full bg-stone-100 rounded-[2rem] flex items-center justify-center overflow-hidden shadow-inner">
        
        {/* COUCHE 1 : La Couleur découpée à la forme de l'image (Mask) */}
        <div 
          className="absolute inset-0 w-full h-full z-10 transition-colors duration-300 ease-in-out"
          style={{
            backgroundColor: selectedColor.hex,
            WebkitMaskImage: `url(${baseImageUrl})`,
            WebkitMaskSize: "contain",
            WebkitMaskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
            maskImage: `url(${baseImageUrl})`,
            maskSize: "contain",
            maskPosition: "center",
            maskRepeat: "no-repeat",
          }}
        />

        {/* COUCHE 2 : L'image originale avec les ombres/lumières (Multiply) */}
        <img 
          src={baseImageUrl} 
          alt="Base Collier" 
          className="absolute inset-0 w-full h-full object-contain z-20 mix-blend-multiply opacity-90"
        />

      </div>

      {/* LES CONTRÔLES */}
      <div className="flex flex-col justify-center space-y-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Atelier Inochi Inu</span>
          <h2 className="text-3xl font-black text-stone-900 mt-4">Collier Classique</h2>
          <p className="text-stone-500 mt-2 text-sm">Sangle Biothane imperméable, bouclerie en laiton massif. Entièrement personnalisable.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Couleur de la sangle</h3>
            <span className="text-sm font-black text-stone-900">{selectedColor.name}</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {BIOTHANE_COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color)}
                className={`w-12 h-12 rounded-full cursor-pointer transition-all duration-200 border-4 shadow-sm hover:scale-110 ${
                  selectedColor.id === color.id ? "border-amber-400 scale-110 ring-4 ring-amber-100" : "border-white"
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <button className="w-full py-4 bg-stone-900 text-white font-black text-xs uppercase tracking-wider rounded-full hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          Ajouter au panier — 35€
        </button>
      </div>

    </div>
  );
}