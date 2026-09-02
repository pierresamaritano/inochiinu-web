"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialisation de Stripe (hors du composant pour éviter les re-rendus)
// On utilise la clé publique (NEXT_PUBLIC_) qui ne craint rien côté client
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface PaymentSimulationProps {
  amount: number;
  serviceName: string;
  onSuccess: (paymentIntentId: string) => void; // MODIFICATION: On passe l'ID Stripe !
  onCancel: () => void;
  clientEmail?: string;
  dogName?: string;
}

// ============================================================================
// 1. LE FORMULAIRE DE SAISIE (Composant interne)
// ============================================================================
function CheckoutForm({ amount, paymentIntentId, onSuccess, onCancel }: { amount: number, paymentIntentId: string, onSuccess: (id: string) => void, onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    // On confirme la prise d'empreinte sans rediriger la page
    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Pas de return_url car on gère la réussite en direct avec redirect: "if_required"
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message || "La vérification de la carte a échoué.");
      setIsLoading(false);
    } else if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "requires_capture")) {
      // requires_capture est le statut normal puisque nous sommes en "manual" !
      // MODIFICATION : On transmet l'ID secret Stripe au parent
      onSuccess(paymentIntentId);
    } else {
      setError("Le statut de la transaction est inattendu.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in">
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 text-center shadow-sm">
          {error}
        </div>
      )}

      <div className="pt-4 flex justify-between items-center border-t border-stone-100 mt-4">
        <button type="button" onClick={onCancel} disabled={isLoading} className="text-xs font-bold text-stone-500 cursor-pointer hover:text-stone-900 disabled:opacity-50 transition-colors">
          ← Retour
        </button>
        <button type="submit" disabled={!stripe || isLoading} className="px-8 py-3.5 bg-gradient-to-tr from-orange-600 to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-full cursor-pointer shadow-lg disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100 flex items-center gap-2">
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Vérification...
            </>
          ) : (
            `Sécuriser ${amount}€`
          )}
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// 2. LE CONTENEUR PRINCIPAL (Gère la connexion à l'API)
// ============================================================================
export default function PaymentSimulation({ amount, serviceName, onSuccess, onCancel, clientEmail, dogName }: PaymentSimulationProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null); // NOUVEAU
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stripe/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, serviceName, clientEmail, dogName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret && data.paymentIntentId) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId); // NOUVEAU : On stocke l'ID
        } else {
          setInitError(data.error || "Erreur d'initialisation Stripe.");
        }
      })
      .catch(() => setInitError("Problème de connexion avec le serveur de paiement."));
  }, [amount, serviceName, clientEmail, dogName]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div>
          <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">Paiement sécurisé</span>
          <h3 className="text-lg font-black text-stone-900 mt-1">Empreinte Bancaire</h3>
          <p className="text-xs text-stone-500 mt-1">Vous ne serez débité qu'à la validation de votre demande par Inochi Inu.</p>
        </div>
        <div className="h-10 w-10 bg-stone-100 rounded-full flex items-center justify-center text-lg shadow-inner">
          🔒
        </div>
      </div>

      {!clientSecret && !initError && (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
           <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
           <span className="text-xs font-bold text-stone-400">Connexion bancaire sécurisée en cours...</span>
        </div>
      )}

      {initError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center shadow-sm">
          <span className="text-2xl mb-2 block">⚠️</span>
          <p className="text-xs font-bold text-red-600 mb-4 leading-relaxed">{initError}</p>
          <button onClick={onCancel} className="text-xs font-bold text-stone-600 hover:text-stone-900 border border-stone-300 hover:bg-stone-100 transition-colors px-6 py-2.5 rounded-full cursor-pointer">
            Annuler et Retourner
          </button>
        </div>
      )}

      {clientSecret && paymentIntentId && (
        <Elements stripe={stripePromise} options={{ 
          clientSecret, 
          appearance: { 
            theme: 'stripe',
            variables: {
              colorPrimary: '#ea580c', 
              colorBackground: '#ffffff',
              colorText: '#1c1917',
              colorDanger: '#ef4444',
              fontFamily: 'system-ui, sans-serif',
              borderRadius: '12px',
            }
          } 
        }}>
          <CheckoutForm amount={amount} paymentIntentId={paymentIntentId} onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
      )}
    </div>
  );
}