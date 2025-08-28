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
      maxVoiceMins: 60,
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
      maxVoiceMins: 220,
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
      maxUsers: 50,
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

const DEFAULT_CALL_FLOW_CONFIGS = {
  STARTER: {
    tier: "STARTER",
    recordingEnabled: TIER_CONFIGS.STARTER.features.recordingEnabled,
    minDurationForRecording: 120,
    recordInboundCalls: TIER_CONFIGS.STARTER.features.recordingEnabled,
    recordOutboundCalls: TIER_CONFIGS.STARTER.features.recordingEnabled,
    transcribeInbound: TIER_CONFIGS.STARTER.features.transcribeEnabled,
    transcribeOutbound: TIER_CONFIGS.STARTER.features.transcribeEnabled,
    aiCallGrading: TIER_CONFIGS.STARTER.features.aiCallGradingEnabled, // Fixed typo
    aiLeadResearch:
      TIER_CONFIGS.STARTER.features.aiLeadResearchEnabled || false, // Fallback if not defined
    inboundFlow: TIER_CONFIGS.STARTER.features.inboundCallHandling
      ? "voicemail"
      : "voicemail",
    voicemailMessage: TIER_CONFIGS.STARTER.features.inboundCallHandling
      ? "Thank you for calling. Please leave a message."
      : null,
    forwardToNumber: null,
    flowSteps: JSON.stringify([
      { id: "call-start", enabled: true, order: 1 },
      { id: "call-active", enabled: true, order: 2 },
      { id: "call-complete", enabled: true, order: 3 },
      {
        id: "recording-check",
        enabled: TIER_CONFIGS.STARTER.features.recordingEnabled,
        order: 4,
      },
      { id: "lead-update", enabled: true, order: 5 },
    ]),
    enableFlowLogging: true,
    customFlowRules: null,
    webhookEndpoints: null,
  },
  GROWTH: {
    tier: "GROWTH",
    recordingEnabled: TIER_CONFIGS.GROWTH.features.recordingEnabled,
    minDurationForRecording: 120,
    recordInboundCalls: TIER_CONFIGS.GROWTH.features.recordingEnabled,
    recordOutboundCalls: TIER_CONFIGS.GROWTH.features.recordingEnabled,
    transcribeInbound: TIER_CONFIGS.GROWTH.features.transcribeEnabled,
    transcribeOutbound: TIER_CONFIGS.GROWTH.features.transcribeEnabled,
    aiCallGrading: TIER_CONFIGS.GROWTH.features.aiCallGradingEnabled,
    aiLeadResearch: TIER_CONFIGS.GROWTH.features.aiLeadResearchEnabled || false,
    inboundFlow: TIER_CONFIGS.GROWTH.features.inboundCallHandling
      ? "voicemail"
      : "voicemail",
    voicemailMessage: TIER_CONFIGS.GROWTH.features.inboundCallHandling
      ? "Thank you for calling. Please leave a message."
      : null,
    forwardToNumber: null,
    flowSteps: JSON.stringify([
      { id: "call-start", enabled: true, order: 1 },
      { id: "call-active", enabled: true, order: 2 },
      { id: "call-complete", enabled: true, order: 3 },
      {
        id: "recording-check",
        enabled: TIER_CONFIGS.GROWTH.features.recordingEnabled,
        order: 4,
      },
      { id: "lead-update", enabled: true, order: 5 },
    ]),
    enableFlowLogging: true,
    customFlowRules: TIER_CONFIGS.GROWTH.features.apiAccessEnabled ? {} : null,
    webhookEndpoints: TIER_CONFIGS.GROWTH.features.automationConnections
      ? {}
      : null,
  },
  PRO: {
    tier: "PRO",
    recordingEnabled: TIER_CONFIGS.PRO.features.recordingEnabled,
    minDurationForRecording: 120,
    recordInboundCalls: TIER_CONFIGS.PRO.features.recordingEnabled,
    recordOutboundCalls: TIER_CONFIGS.PRO.features.recordingEnabled,
    transcribeInbound: TIER_CONFIGS.PRO.features.transcribeEnabled,
    transcribeOutbound: TIER_CONFIGS.PRO.features.transcribeEnabled,
    aiCallGrading: TIER_CONFIGS.PRO.features.aiCallGradingEnabled,
    aiLeadResearch: TIER_CONFIGS.PRO.features.aiLeadResearchEnabled || false,
    inboundFlow: TIER_CONFIGS.PRO.features.inboundCallHandling
      ? "voicemail"
      : "voicemail",
    voicemailMessage: TIER_CONFIGS.PRO.features.inboundCallHandling
      ? "Thank you for calling. Please leave a message."
      : null,
    forwardToNumber: null,
    flowSteps: JSON.stringify([
      { id: "call-start", enabled: true, order: 1 },
      { id: "call-active", enabled: true, order: 2 },
      { id: "call-complete", enabled: true, order: 3 },
      {
        id: "recording-check",
        enabled: TIER_CONFIGS.PRO.features.recordingEnabled,
        order: 4,
      },
      { id: "lead-update", enabled: true, order: 5 },
    ]),
    enableFlowLogging: true,
    customFlowRules: TIER_CONFIGS.PRO.features.apiAccessEnabled ? {} : null,
    webhookEndpoints: TIER_CONFIGS.PRO.features.automationConnections
      ? {}
      : null,
  },
};

async function seedCallConfig() {
  try {
    // Step 1: Seed TierTemplate table
    for (const [tier, config] of Object.entries(DEFAULT_CALL_FLOW_CONFIGS)) {
      await prisma.tierTemplate.upsert({
        where: { tier: tier },
        update: { config },
        create: { tier, config },
      });
      console.log(`Seeded TierTemplate for ${tier}`);
    }

    // Step 2: Seed CallFlowConfiguration for organizations without one
    const orgs = await prisma.organization.findMany({
      include: {
        customer: {
          select: {
            subscription: {
              select: {
                tier: true,
              },
            },
          },
        },
      },
    });

    for (const org of orgs) {
      if (!org.callFlow) {
        const template = await prisma.tierTemplate.findUnique({
          where: { tier: org.customer.subscription.tier || "STARTER" },
        });

        if (template) {
          await prisma.callFlowConfiguration.create({
            data: {
              organization: { connect: { id: org.id } },
              tier: org.customer.subscription.tier || "STARTER",
              ...template.config,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          console.log(
            `Created CallFlowConfiguration for org ${org.id} (tier: ${org.customer.subscription.tier})`
          );
        } else {
          console.warn(`No template found for tier ${org.tier}`);
        }
      }
    }

    console.log(`Seeded call configs for ${orgs.length} organizations`);
  } catch (e) {
    console.error("Seed failed:", e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

seedCallConfig().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
