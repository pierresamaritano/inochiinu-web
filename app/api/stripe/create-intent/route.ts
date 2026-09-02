import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    // L'initialisation se fait ICI, à l'intérieur de la fonction
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-02-24.acacia", 
    });

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Clé Stripe manquante dans l'environnement.");
    }

    const body = await req.json();
    const { amount, serviceName, clientEmail, dogName } = body;

    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      capture_method: "manual", 
      receipt_email: clientEmail || undefined,
      description: serviceName,
      metadata: {
        service: serviceName,
        dog: dogName || "Non spécifié",
      },
    });

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