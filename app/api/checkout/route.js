import { NextResponse } from "next/server";
import stripe from "@/lib/services/integrations/stripe"


export async function POST(req) {
  try {
    const { priceId, mode, customerId, type } = await req.json();

    // Validate inputs
    if (!priceId || !mode || !["payment", "subscription"].includes(mode)) {
      return NextResponse.json({ error: "Invalid priceId or mode" }, { status: 400 });
    }

    // Validate environment variable
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
    }

    // Determine success URL based on mode
    const successUrl = mode === "payment"
      ? `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`
      : `${baseUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/cancel`;

    // Prepare session config
    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { type: type }, 
      invoice_creation: {
        enabled: true,
      }
    };

    // Include customer ID only if provided and valid
    if (customerId) {
      sessionConfig.customer = customerId;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err.message);
    return NextResponse.json({ error: `Failed to create checkout session: ${err.message}` }, { status: 500 });
  }
}