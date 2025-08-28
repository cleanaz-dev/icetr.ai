import { SubscriptionStatus, BillingCycle } from "../generated/prisma";
import prisma from "../prisma";
import { TIER_CONFIGS } from "../config/tier-config";
import {
  sendAddOnPurchaseEmail,
  sendPreOnboardingEmail,
} from "../services/integrations/resend";
import { addOnCache, onboardingCache } from "../services/integrations/redis";
import stripe from "@/lib/services/integrations/stripe";

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
      },
      create: {
        stripeCusId: p.customerId,
        billingEmail: p.email,
      },
    });

    /* -------------------------------------------------
     * 3. Create organization with integrations
     * ------------------------------------------------- */

    const org = await tx.organization.create({
      data: {
        name: "My Organization",
        customer: { connect: { id: customer.id } },
        orgIntegrations: {
          create: {
            calendly: {
              create: {
                enabled: false,
              },
            },
            blandAi: {
              create: {
                enabled: false,
              },
            },
            twilio: {
              create: {
                enabled: false,
              },
            },
          },
        },
      },
      select: { id: true },
    });

    /* -------------------------------------------------
     * 4. Create/Update tier settings and get tier template
     * ------------------------------------------------- */
    const tierSettings = await tx.tierSettings.create({
      data: {
        tier: tier,
        limits: tierConfig.limits,
        features: tierConfig.features,
      },
    });
    const tierTemplate = await tx.tierTemplate.findUnique({
      where: { tier: tier },
      select: { id: true, config: true },
    });

    if (!tierTemplate) {
      throw new Error(`No TierTemplate found for tier ${tier}`);
    }

    /* -------------------------------------------------
     * 5. Create CallFlowConfiguration with null orgId
     * ------------------------------------------------- */
    await tx.callFlowConfiguration.create({
      data: {
        organization: { connect: { id: org.id } },
        tier: tier,
        ...tierTemplate.config,
      },
    });

    /* -------------------------------------------------
     * 6. Upsert the subscription
     * ------------------------------------------------- */
    await tx.subscription.upsert({
      where: { stripeSubId: p.subscriptionId },
      update: {
        status: SubscriptionStatus.ACTIVE,
        priceId: firstProduct.priceId,
        productId: firstProduct.productId,
        quantity: firstProduct.quantity,
        billingCycle: billingCycle,
        metadata: p.metadata ?? {},
      },
      create: {
        stripeSubId: p.subscriptionId,
        customerId: customer.id,
        priceId: firstProduct.priceId,
        productId: firstProduct.productId,
        quantity: firstProduct.quantity,
        billingCycle: billingCycle,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: p.metadata ?? {},
      },
    });

    /* -------------------------------------------------
     * 7. Create the invoice
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
     * 8. update the organization with the tier settings  and return customer data
     * ------------------------------------------------- */
    const finalOrg = await tx.organization.update({
      where: { id: org.id },
      data: {
        tierSettings: { connect: { id: tierSettings.id } },
      },
      select: { id: true, name: true },
    });
    const finalCustomer = await tx.customer.findUnique({
      where: { id: customer.id },
      include: { subscription: true },
    });

    /*--------------------------------------------------
     * 9. Send preOnboarding email
     *-------------------------------------------------- */
    const onboardingUrl = `/onboarding?session_id=${p.sessionId}`;
    await sendPreOnboardingEmail(p.email, p.name, onboardingUrl);

    /*--------------------------------------------------
     * 10. cache onboarding data
     *-------------------------------------------------- */
    await onboardingCache({
      sessionId: p.sessionId,
      fullname: p.name,
      email: customer.billingEmail,
      orgId: org.id,
      orgName: org.name,
      customerId: customer.id,
    });

    return {
      customer: finalCustomer,
    };
  });
}

export async function handleAddOnPurchase(p) {
  console.log("data in handle on purchase:", p);

  try {
    // Get add-on details
    const { priceId, description, quantity, totalAmount, unitPrice, currency } =
      p.items[0];

    const addOns = await prisma.addOn.findUnique({
      where: { priceId: priceId },
    });

    if (!addOns) {
      throw new Error(`Add-on not found for priceId: ${priceId}`);
    }

    // Find customer

    const customer = await prisma.customer.findFirst({
      where: { stripeCusId: p.customerId },
      select: {
        id: true,
        user: {
          select: {
            firstname: true,
            email: true,
          },
        },
      },
    });

    console.log("customer:", customer);

    if (!customer) {
      throw new Error(`Customer not found: ${p.customerId}`);
    }

    // Find subscription

    const subscription = await prisma.subscription.findUnique({
      where: { customerId: customer.id },
      select: {
        id: true,
        subcriptionAddOnId: true,
      },
    });

    console.log("subscriptionAddOnId:", subscription.subcriptionAddOnId);

    if (subscription.subcriptionAddOnId === null) {
      throw new Error(
        `SubscriptionAddOn not found for customer ${p.customerId}`
      );
    }

    const subscriptionAddOn = await prisma.subscriptionAddOn.update({
      where: { id: subscription.subcriptionAddOnId }, // Use this instead of subscriptionId
      data: {
        addOns: {
          connect: { id: addOns.id },
        },
      },
    });
    if (!subscriptionAddOn) {
      throw new Error(
        `SubscriptionAddOn not found for subscription ${subscription.id}`
      );
    }

    await prisma.invoice.create({
      data: {
        stripeInvId: `addon_${p.sessionId}`, // Use session ID as temporary identifier
        customerId: customer.id,
        amountDue: totalAmount,
        amountPaid: totalAmount,
        status: "PAID",
        currency: currency.toUpperCase(),
        paidAt: new Date(),
  
      },
    });


    await addOnCache({
      sessionId: p.sessionId,
      unitsAdded: addOns.units,
      type: addOns.type,
      title: addOns.title,
    });
    try {
      await sendAddOnPurchaseEmail({
        email: customer.user.email,
        name: customer.user.firstname,
        addOnDescription: addOns.title,
        purchaseDate: new Date(p.processedAt).toLocaleString(),
        purchasePrice: convertAmountToDollars(totalAmount),
      });
    } catch (error) {
      console.error("Failed to send add-on purchase email:", error);
      throw new Error("Failed to send add-on purchase email");
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    // Return error details or monitoring
    return {
      success: false,
      error: error.message,
      sessionId: p.sessionId,
    };
  }
}
/**
 * Normalizes Stripe checkout session into standardized purchase data format
 * @param {Object} session - Raw Stripe checkout session
 * @returns {Promise<Object>} - Standardized purchase data object
 */
export async function normalizePurchaseData(session) {
  const { data: lineItems = [] } = session.line_items
    ? { data: session.line_items }
    : await stripe.checkout.sessions.listLineItems(session.id);

  return {
    // Customer Info
    email: session.customer_details?.email,
    name: session.customer_details?.name,

    // Payment Info
    amount: session.amount_total,
    currency: session.currency,

    // Stripe References
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription,

    // Metadata
    purchaseType: session.metadata?.type || "standard", // Better than just "type"
    metadata: session.metadata || {},

    // Line Items
    items: lineItems.map((item) => ({
      // "items" clearer than "products"
      priceId: item.price.id,
      productId: item.price.product,
      description: item.description,
      quantity: item.quantity,
      totalAmount: item.amount_total,
      unitPrice: item.price.unit_amount,
      currency: item.currency,
    })),

    // Timestamps
    processedAt: new Date().toISOString(),
  };
}

export async function handleSubscriptionPaymentMethods(
  customerId,
  stripeCustomerId
) {
  try {
    // 1. Get customer and payment methods in parallel
    const [customer, paymentMethods] = await Promise.all([
      stripe.customers.retrieve(stripeCustomerId),
      stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: "card",
        limit: 100, // Stripe's max
      }),
    ]);

    // 2. Format essential payment data
    const paymentData = paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
      isDefault: pm.id === customer.invoice_settings?.default_payment_method,
      created: new Date(pm.created * 1000).toISOString(),
    }));

    // 3. Update only if changed
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        paymentMethods: paymentData,
        paymentMethodsUpdatedAt: new Date().toISOString(),
      },
    });

    console.log(
      `Updated ${paymentData.length} payment methods for customer ${customerId}`
    );
  } catch (error) {
    console.error("Payment method update failed:", error);
    // Fail silently - we'll retry next webhook
  }
}

function convertAmountToDollars(amount) {
  const dollars = amount / 100;
  return dollars.toFixed(2);
}
