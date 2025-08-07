import { SubscriptionStatus, BillingCycle } from "../generated/prisma";
import prisma from "../prisma";
import { TIER_CONFIGS } from "../config/tier-config";

// Updated helper function - ONLY changed to return billing cycle
function getTierFromPriceId(priceId) {
  for (const [tierName, tierConfig] of Object.entries(TIER_CONFIGS)) {
    if (tierConfig.plans?.MONTHLY?.stripePriceId === priceId) {
      return {
        tier: tierName,
        billingCycle: BillingCycle.MONTHLY,
      };
    }
    if (tierConfig.plans?.ANNUAL?.stripePriceId === priceId) {
      return {
        tier: tierName,
        billingCycle: BillingCycle.ANNUAL,
      };
    }
  }
  return {
    tier: "STARTER",
    billingCycle: BillingCycle.MONTHLY,
  };
}

export async function saveBillingData(p) {
  return await prisma.$transaction(async (tx) => {
    /* -------------------------------------------------
     * 1. Grab first product and determine tier - ONLY updated this part
     * ------------------------------------------------- */
    const firstProduct = p.products[0];
    const { tier, billingCycle } = getTierFromPriceId(firstProduct.priceId);
    const tierConfig = TIER_CONFIGS[tier];

    /* -------------------------------------------------
     * 2. Upsert the Stripe customer - ONLY added billingCycle
     * ------------------------------------------------- */
    const customer = await tx.customer.upsert({
      where: { stripeCusId: p.customerId },
      update: {
        billingEmail: p.email,
        billingCycle: billingCycle, // ONLY added this
      },
      create: {
        stripeCusId: p.customerId,
        billingEmail: p.email,
        billingCycle: billingCycle, // ONLY added this
      },
    });

    /* -------------------------------------------------
     * 3. Create/Update tier settings - NO CHANGES
     * ------------------------------------------------- */
    const tierSettings = await tx.tierSettings.create({
      data: {
        tier: tier,
        limits: tierConfig.limits,
        features: tierConfig.features,
      },
    });

    /* -------------------------------------------------
     * 4. Create/Update tier settings - NO CHANGES
     * ------------------------------------------------- */
    const callFlowConfiguration = await tx.callFlowConfiguration.create({});

    /* -------------------------------------------------
     * 5. Upsert the subscription - NO CHANGES
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
     * 6. Create the invoice - NO CHANGES
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
     * 7. Return customer data with tier settings ID - NO CHANGES
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
