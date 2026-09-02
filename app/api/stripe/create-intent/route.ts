import { NextResponse } from "next/server";
import Stripe from "stripe";

// On initialise Stripe avec votre clé secrète (invisible pour les clients)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20", 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, serviceName, clientEmail, dogName } = body;

    // Sécurité : Stripe gère toujours les montants en centimes (ex: 45€ = 4500)
    const amountInCents = Math.round(amount * 100);

    // On crée l'intention de paiement (l'empreinte)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      capture_method: "manual", // MAGIE : Demande une empreinte, pas un débit
      receipt_email: clientEmail || undefined,
      description: serviceName,
      metadata: {
        service: serviceName,
        dog: dogName || "Non spécifié",
      },
    });

    // On renvoie le sésame (client_secret) au navigateur pour afficher le formulaire de carte
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });
    
  } catch (error: any) {
    console.error("Erreur Stripe:", error);
    return NextResponse.json(
      { error: "Impossible d'initialiser le paiement sécurisé." },
      { status: 500 }
    );
  }
}