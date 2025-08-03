const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();


const TIER_CONFIGS = {
  BASIC: {
    limits: {
      maxUsers: 3,
      maxCampaigns: 5,
      maxLeads: 1000,
      maxTrainingScenarios: 1,
   
    },
    features: {
      // Core Functionality
      recordCalls: true,          // New simple flag
      transcribeCalls: true,      // New simple flag
      aiTrainingEnabled: true,
      autoAssignmentEnabled: false,
      
      // Integrations
      automationConnections: false,
      apiAccessEnabled: false,
      calendlyIntegration: true,
      
      // Analytics
      callGradingEnabled: false,
      
      // Support
      prioritySupport: false
    },
    price: "$79/month"
  },
  PRO: {
    limits: {
      maxUsers: 10,
      maxCampaigns: 100,
      maxLeads: 10000,
      maxTrainingScenarios: 10,
     
    },
    features: {
      // Core (all enabled)
      recordCalls: true,
      transcribeCalls: true,
      aiTrainingEnabled: true,
      autoAssignmentEnabled: true,
      
      // Integrations
      automationConnections: true,
      apiAccessEnabled: false, // Still no full API
      calendlyIntegration: true,
      
      // Analytics
      callGradingEnabled: true,
      advancedAnalytics: true,
      
      // Support
      prioritySupport: false
    },
    price: "$399/month"
  },
  ENTERPRISE: {
    limits: {
      maxUsers: -1, // Unlimited
      maxCampaigns: -1,
      maxLeads: -1,
      maxTrainingScenarios: -1,

    },
    features: {
      // Everything enabled
      recordCalls: true,
      transcribeCalls: true,
      aiTrainingEnabled: true,
      autoAssignmentEnabled: true,
      
      // Full integrations
      automationConnections: true,
      apiAccessEnabled: true,
      calendlyIntegration: true,
      
      // Advanced analytics
      callGradingEnabled: true,
      advancedAnalytics: true,
      customReporting: true,
      
      // Premium support
      prioritySupport: true
    },
    price: "Custom"
  }
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
      const tier = targetTier || org.tier || "BASIC";
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
