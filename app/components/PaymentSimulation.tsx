"use client";

import { useState } from "react";

interface PaymentSimulationProps {
  amount: number;
  serviceName: string; 
  onSuccess: () => void; 
  onCancel: () => void; 
}

export default function PaymentSimulation({ amount, serviceName, onSuccess, onCancel }: PaymentSimulationProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    // On simule un délai de traitement bancaire de 2.5 secondes
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(); // On déclenche la sauvegarde en base de données chez le parent
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-2xl shadow-sm">
          💳
        </div>
        <h3 className="text-xl font-black text-stone-900">Paiement sécurisé</h3>
        <p className="text-xs text-stone-500 mt-1">
          Règlement pour : <strong className="text-stone-700">{serviceName}</strong>
        </p>
      </div>

      <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-200 shadow-inner text-center">
        <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Montant total</span>
        <div className="text-4xl font-black text-stone-900 mt-1">
          {amount}€
        </div>
      </div>

      {isProcessing ? (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="h-10 w-10 border-4 border-stone-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-bold text-orange-600 animate-pulse">Vérification bancaire en cours...</p>
          <p className="text-[10px] text-stone-400 mt-1">Veuillez ne pas fermer cette fenêtre.</p>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          <button 
            onClick={handleSimulatePayment}
            className="w-full py-3.5 bg-stone-900 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg hover:scale-105 transition-all cursor-pointer"
          >
            Payer {amount}€
          </button>
          
          <button 
            onClick={onCancel}
            className="w-full py-3 bg-white border border-stone-200 text-stone-500 hover:text-stone-900 font-bold text-xs rounded-full transition-all cursor-pointer"
          >
            Annuler et modifier la demande
          </button>
        </div>
      )}
    </div>
  );
}