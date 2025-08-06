// /app/api/webhook/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { saveBillingData } from "@/lib/handlers/checkout-handler";
import { onboardingCache } from "@/lib/services/integrations/redis";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const body = Buffer.from(await req.arrayBuffer());

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

  switch (event.type) {
    case "checkout.session.completed": {
      try {
        const session = event.data.object;

        // line items
        const { data } = await stripe.checkout.sessions.listLineItems(
          session.id
        );

        const purchaseData = {
          email: session.customer_details?.email,
          name: session.customer_details?.name,
          amount: session.amount_total,
          currency: session.currency,
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
          metadata: session.metadata,
          products: data.map((item) => ({
            priceId: item.price.id,
            productId: item.price.product,
            quantity: item.quantity,
            amount: item.amount_total,
          })),
        };
        console.log("purchase Data", purchaseData);

        // 1. Persist customer + subscription
        const { customer, tierSettingsId } = await saveBillingData(
          purchaseData
        );

        const cache = await onboardingCache({
          sessionId: purchaseData.sessionId,
          fullname: purchaseData.name,
          email: customer.billingEmail,
          tierSettingsId: tierSettingsId,
          customerId: customer.id,
        });

        if (session.customer) {
          // Retrieve customer's payment methods
          const paymentMethods = await stripe.paymentMethods.list({
            customer: session.customer,
            type: "card",
          });

          // Save payment method data as JSON array
          const paymentMethodsData = paymentMethods.data.map((pm) => ({
            id: pm.id,
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
            funding: pm.card.funding,
            isDefault:
              pm.id === customer.invoice_settings?.default_payment_method,
          }));

          await prisma.customer.update({
            where: {
              id: customer.id,
            },
            data: {
              paymentMethod: paymentMethodsData,
            },
          });
        }

        console.log(
          "✅ User data cached for onboarding:",
          purchaseData.sessionId
        );
        console.log("oCache", cache);

        break;
      } catch (error) {
        console.error("Error processing checkout.session.completed:", error);
        // Still return 200 to Stripe so it doesn't retry
        // You might want to implement retry logic or dead letter queue here
        break;
      }
    }

    case "invoice.payment_paid": {
      try {
        const invoice = event.data.object;

        await prisma.invoice.updateMany({
          where: {
            stripeInvId: `pi_placeholder_${invoice.subscription}`,
          },
          data: {
            stripeInvId: invoice.id,
            pdfUrl: invoice.invoice_pdf, // Add PDF URL
            hostedUrl: invoice.hosted_invoice_url, // Add hosted URL
            status: "PAID",
            amountDue: invoice.amount_due,
            currency: invoice.currency,
          },
        });
        console.log("Invoice updated with real Stripe ID");
      } catch (error) {
        console.error("Error processing invoice.payment_paid:", error);
      }
      break;
    }

    case "customer.subscription.deleted": {
      // TODO: await cancelSubscription(event.data.object.id);
      break;
    }

    case "invoice.payment_failed": {
      // TODO: await handleFailedPayment(event.data.object.customer);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
