const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();


const TIER_CONFIGS = {
  STARTER: {
    limits: {
      maxUsers: 3,
      maxCampaigns: 5,
      maxLeads: 1000,
      maxTrainingScenarios: 1,
      maxAiCredits: 10,
      maxVoiceMins: 100,
    },
    features: {
      // Core Functionality
      recordingEnabled: true,
      transcribeEnabled: true,
      aiTrainingEnabled: true,
      autoAssignmentEnabled: false,
      inboundCallHandling: false,

      // Integrations
      automationConnections: false,
      apiAccessEnabled: false,
      calendlyIntegration: true,

      // Analytics
      aiLeadResearchEnabled: true,
      aiCallGradingEnabled: false,

      // Support
      prioritySupport: false,
    },
    plans: {
      MONTHLY: {
        price: "$79/month",
        stripePriceId: "price_1RrpQyLHmVqPdFvXsc4WT2s7",
      },
      ANNUAL: {
        price: "$63/month",
        yearlyPrice: "$756/year",
        stripePriceId: "price_1RsyusLHmVqPdFvXo5o96kCL",
        discount: 0.2,
      },
    },
  },

  GROWTH: {
    limits: {
      maxUsers: 10,
      maxCampaigns: 25,
      maxLeads: 10000,
      maxTrainingScenarios: 10,
      maxAiCredits: 60,
      maxVoiceMins: 300,
    },
    features: {
      recordingEnabled: true,
      transcribeEnabled: true,
      aiTrainingEnabled: true,
      autoAssignmentEnabled: true,
      inboundCallHandling: true,

      // Integrations
      automationConnections: true,
      apiAccessEnabled: false,
      calendlyIntegration: true,

      // Analytics
      aiLeadResearchEnabled: true,
      aiCallGradingEnabled: false,

      // Support
      prioritySupport: false,
    },
    plans: {
      MONTHLY: {
        price: "$249/month",
        stripePriceId: "price_1RrrssLHmVqPdFvXLkBzejjI",
      },
      ANNUAL: {
        price: "$199/month",
        yearlyPrice: "$2388/year",
        stripePriceId: "price_1RsyvtLHmVqPdFvXJY0IRs5v",
        discount: 0.2,
      },
    },
  },

  PRO: {
    limits: {
      maxUsers: 25,
      maxCampaigns: -1,
      maxLeads: -1,
      maxTrainingScenarios: 25,
      maxAiCredits: 200,
      maxVoiceMins: 1000,
    },
    features: {
      // Core (all enabled)
      recordingEnabled: true,
      transcribeEnabled: true,
      aiTrainingEnabled: true,
      autoAssignmentEnabled: true,
      inboundCallHandling: true,

      // Integrations
      automationConnections: true,
      apiAccessEnabled: true,
      calendlyIntegration: true,

      // Analytics
      aiLeadResearchEnabled: true,
      aiCallGradingEnabled: false,
      advancedAnalytics: true,

      // Support
      prioritySupport: true,
    },
    plans: {
      MONTHLY: {
        price: "$599/month",
        stripePriceId: "price_1RrpSNLHmVqPdFvXmABY4gv0",
      },
      ANNUAL: {
        price: "$479/month",
        yearlyPrice: "$5748/year",
        stripePriceId: "price_1RsywvLHmVqPdFvXIdAE8tdL",
        discount: 0.2,
      },
    },
  },
};


async function seedtierSettings(tierArg) {
  try {
    // Get tier from argument or use null for all
    const targetTier = tierArg ? tierArg.toUpperCase() : null;

    if (targetTier && !TIER_CONFIGS[targetTier]) {
      throw new Error(
        `Invalid tier: ${targetTier}. Valid tiers are: ${Object.keys(
          TIER_CONFIGS
        ).join(", ")}`
      );
    }

 

    const organizations = await prisma.organization.findMany()
  

    // Create settings for each org
    for (const org of organizations) {
      const tier = targetTier || org.tier || "STARTER";
      const config = TIER_CONFIGS[tier];

      await prisma.tierSettings.upsert({
        where: { orgId: org.id }, // Unique identifier
        create: {
          orgId: org.id,
          tier: tier,
          limits: config.limits,
          features: config.features,
        },
        update: {
          tier: tier,
          limits: config.limits,
          features: config.features,
          updatedAt: new Date(), // Explicitly update the timestamp
        },
      });
    }

    console.log(
      `Seeded org settings for ${organizations.length} organizations`
    );
  } catch (error) {
    console.error("Error seeding org settings:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get tier from command line argument
const tierArg = process.argv[2];
seedtierSettings(tierArg);
