import { SubscriptionStatus, BillingCycle } from "../generated/prisma";
import prisma from "../prisma";
import { TIER_CONFIGS } from "../config/tier-config";

// Helper function to determine tier from price ID
function getTierFromPriceId(priceId) {
  for (const [tierName, config] of Object.entries(TIER_CONFIGS)) {
    if (config.stripePriceId === priceId) {
      return tierName;
    }
  }
  return "BASIC"; // Default fallback
}

export async function saveBillingData(p) {
  return await prisma.$transaction(async (tx) => {
    /* -------------------------------------------------
     * 1. Upsert the Stripe customer
     * ------------------------------------------------- */
    const customer = await tx.customer.upsert({
      where: { stripeCusId: p.customerId },
      update: { billingEmail: p.email },
      create: {
        stripeCusId: p.customerId,
        billingEmail: p.email,
        billingCycle: BillingCycle.MONTHLY,
      },
    });

    /* -------------------------------------------------
     * 2. Grab first product and determine tier
     * ------------------------------------------------- */
    const firstProduct = p.products[0];
    const tierName = getTierFromPriceId(firstProduct.priceId);
    const tierConfig = TIER_CONFIGS[tierName];

    /* -------------------------------------------------
     * 3. Create/Update tier settings
     * ------------------------------------------------- */
    const tierSettings = await tx.tierSettings.create({
      data: {
        tier: tierName,
        limits: tierConfig.limits,
        features: tierConfig.features,
      },
    });

    /* -------------------------------------------------
     * 4. Upsert the subscription
     * ------------------------------------------------- */
    await tx.subscription.upsert({
      where: { stripeSubId: p.subscriptionId },
      update: {
        status: SubscriptionStatus.ACTIVE,
        priceId: firstProduct.priceId,
        productId: firstProduct.productId,
        quantity: firstProduct.quantity,
        metadata: p.metadata ?? {},
      },
      create: {
        stripeSubId: p.subscriptionId,
        customerId: customer.id,
        priceId: firstProduct.priceId,
        productId: firstProduct.productId,
        quantity: firstProduct.quantity,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: p.metadata ?? {},
      },
    });

    /* -------------------------------------------------
     * 5. Create the invoice
     * ------------------------------------------------- */
    await tx.invoice.create({
      data: {
        stripeInvId: `pi_placeholder_${p.subscriptionId}`,
        customerId: customer.id,
        amountDue: p.amount,
        amountPaid: p.amount,
        status: "PAID",
        currency: p.currency.toUpperCase(),
        paidAt: new Date(),
      },
    });

    /* -------------------------------------------------
     * 6. Return customer data with tier settings ID
     * ------------------------------------------------- */
    const finalCustomer = await tx.customer.findUnique({
      where: { id: customer.id },
      include: { subscriptions: true },
    });

    return {
      customer: finalCustomer,
      tierSettingsId: tierSettings.id,
    };
  });
}
