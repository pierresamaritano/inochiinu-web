import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const { paymentIntentId } = await req.json();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-02-24.acacia" });
    
    // On annule et on libère les fonds du client
    const intent = await stripe.paymentIntents.cancel(paymentIntentId);
    return NextResponse.json({ success: true, intent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}