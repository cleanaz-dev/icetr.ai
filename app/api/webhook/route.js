// /app/api/webhook/route.js

import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

export async function POST(req) {
  const sig = req.headers.get('stripe-signature');
  const bodyBuffer = Buffer.from(await req.arrayBuffer());

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      bodyBuffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe signature failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`Stripe event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      // Get line items to see what was purchased
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      const purchaseData = {
        email: session.customer_details?.email,
        name: session.customer_details?.name,
        amount: session.amount_total,
        currency: session.currency,
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription,
        metadata: session.metadata,
        products: lineItems.data.map(item => ({
          priceId: item.price.id,
          productId: item.price.product,
          quantity: item.quantity,
          amount: item.amount_total
        }))
      };

      console.log('Purchase:', purchaseData);

      // TODO: Save to database
      // await savePurchase(purchaseData);

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      
      console.log('Subscription cancelled:', {
        subscriptionId: subscription.id,
        customerId: subscription.customer
      });

      // TODO: Update database
      // await cancelSubscription(subscription.id);

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      
      console.log('Payment failed:', {
        customerId: invoice.customer,
        subscriptionId: invoice.subscription,
        amount: invoice.amount_due
      });

      // TODO: Handle failed payment
      // await handleFailedPayment(invoice.customer);

      break;
    }
  }

  return NextResponse.json({ received: true });
}