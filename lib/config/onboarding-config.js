export const TIER_CONFIGS = {
  BASIC: {
    limits: {
      maxUsers: 3,
      maxCampaigns: 5,
      maxLeads: 1000,
      maxTrainingScenarios: 1,
    },
    features: {
      // Core Functionality
      recordCalls: true, // New simple flag
      transcribeCalls: true, // New simple flag
      aiTrainingEnabled: true,
      autoAssignmentEnabled: false,
      inboundCallHandling: false,

      // Integrations
      automationConnections: false,
      apiAccessEnabled: false,
      calendlyIntegration: true,

      // Analytics
      callGradingEnabled: false,

      // Support
      prioritySupport: false,
    },
    price: "$79/month",
    stripePriceId: "price_1RrpQyLHmVqPdFvXsc4WT2s7",
    cycle: "MONTHLY",
    phoneConfiguration: {},
  },

  GROWTH: {
    limits: {
      maxUsers: 10,
      maxCampaigns: 25,
      maxLeads: 10000,
      maxTrainingScenarios: 10,
    },
    features: {
      recordCalls: true, // New simple flag
      transcribeCalls: true, // New simple flag
      aiTrainingEnabled: true,
      autoAssignmentEnabled: true,
      inboundCallHandling: true,

      // Integrations
      automationConnections: true,
      apiAccessEnabled: false,
      calendlyIntegration: true,

      // Analytics
      callGradingEnabled: true,

      // Support
      prioritySupport: false,
    },
    price: "249/month",
    stripePriceId: "price_1RrrssLHmVqPdFvXLkBzejjI",
    cycle: "MONTHLY",
    phoneConfiguration: {},
  },

  PRO: {
    limits: {
      maxUsers: 20,
      maxCampaigns: 50,
      maxLeads: 10000,
      maxTrainingScenarios: 25,
    },
    features: {
      // Core (all enabled)
      recordCalls: true,
      transcribeCalls: true,
      aiTrainingEnabled: true,
      autoAssignmentEnabled: true,
      inboundCallHandling: true,

      // Integrations
      automationConnections: true,
      apiAccessEnabled: true, // Still no full API
      calendlyIntegration: true,

      // Analytics
      callGradingEnabled: true,
      advancedAnalytics: true,

      // Support
      prioritySupport: true,
    },
    price: "$599/month",
    stripePriceId: "price_1RrpSNLHmVqPdFvXmABY4gv0",
    cycle: "MONTHLY",
    phoneConfiguration: {},
  },
};
