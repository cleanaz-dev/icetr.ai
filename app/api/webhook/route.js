// /app/api/webhook/route.js
import { NextResponse } from "next/server";
import {
  handleAddOnPurchase,
  normalizePurchaseData,
  saveBillingData,
  handleSubscriptionPaymentMethods
} from "@/lib/handlers/checkout-handler";
import prisma from "@/lib/prisma";
import stripe from "@/lib/services/integrations/stripe";

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text(); // Better for webhooks than Buffer

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const purchaseData = await normalizePurchaseData(session);

        console.log("Processing purchase:", purchaseData);

        // Handle different purchase types
        switch (purchaseData.metadata?.type) {
          case "addon":
            await handleAddOnPurchase(purchaseData);
            break;
            
          case "onboarding":
            const { customer } = await saveBillingData(purchaseData);
            if (session.customer) {
              await handleSubscriptionPaymentMethods(customer.id, session.customer);
            }
            break;
            
          default:
            console.warn("Unknown purchase type:", purchaseData.metadata?.type);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        await handleInvoicePaymentPaid(invoice);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object);
        break;
      }

      case "invoice.payment_failed": {
        await handlePaymentFailed(event.data.object.customer);
        break;
      }

      case "payment_method.attached": {
        await handlePaymentMethodAttached(event.data.object);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed", details: error.message },
      { status: 500 }
    );
  }
}

// Separate handler functions
async function handleInvoicePaymentPaid(invoice) {
  try {
    await prisma.invoice.updateMany({
      where: { stripeInvId: `pi_placeholder_${invoice.subscription}` },
      data: {
        stripeInvId: invoice.id,
        pdfUrl: invoice.invoice_pdf,
        hostedUrl: invoice.hosted_invoice_url,
        status: "PAID",
        amountDue: invoice.amount_due,
        currency: invoice.currency,
        paidAt: new Date()
      }
    });
    console.log("Invoice marked as paid:", invoice.id);
  } catch (error) {
    console.error("Failed to update invoice:", error);
    throw error;
  }
}

// TODO: Implement these handlers
async function handleSubscriptionDeleted(subscription) {
  /* Implementation */
}

async function handlePaymentFailed(customerId) {
  /* Implementation */ 
}

async function handlePaymentMethodAttached(paymentMethod) {
  /* Implementation */
}