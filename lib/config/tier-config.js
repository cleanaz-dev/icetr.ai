//tier-config.js

import { Mic } from "lucide-react";
import {
  Building2,
  Star,
  Crown,
  Brain,
  Webhook,
  Calendar,
  TrendingUp,
  Sparkles,
  Shield,
  Zap,
  Globe,
  Code,
  FileText,
} from "lucide-react";
import { Montaga } from "next/font/google";

export const TIER_INFO = {
  BASIC: {
    name: "BASIC",
    icon: Building2,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    price: "$79/month",
  },
  PRO: {
    name: "GROWTH",
    icon: Star,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    price: "$249/month",
  },
  ENTERPRISE: {
    name: "PRO",
    icon: Crown,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    price: "$599/month",
  },
};

export const TIER_FEATURES = [
  // Core Call Features (NEW)
  {
    name: "Call Recording",
    configName: "recordCalls",
    icon: Mic, // From lucide-react
    color: "text-blue-500",
    description: "Automatic call recording storage",
    category: "core",
    allTiers: true, // Available in all tiers
  },
  {
    name: "Call Transcription",
    configName: "transcribeCalls",
    icon: FileText, // From lucide-react
    color: "text-purple-500",
    description: "Call transcriptions",
    category: "core",
    allTiers: true,
  },
  // AI Features
  {
    name: "AI Training",
    configName: "aiTrainingEnabled",
    icon: Brain,
    color: "text-emerald-600",
    description: "Base AI model training",
    category: "ai",
  },
  {
    name: "AI Call Grading",
    configName: "callGradingEnabled",
    icon: Star,
    color: "text-amber-500",
    description: "Automatic call quality scoring",
    category: "ai",
  },

  // Integration Features
  {
    name: "Automation Connections",
    configName: "automationConnections",
    icon: Zap,
    color: "text-orange-500",
    description: "Make/Zapier webhooks",
    category: "integrations",
  },
  {
    name: "Full API Access",
    configName: "apiAccessEnabled",
    icon: Code,
    color: "text-purple-500",
    description: "Developer API access",
    category: "integrations",
    enterpriseOnly: true,
  },
  {
    name: "Calendly Integration",
    configName: "calendlyIntegration",
    icon: Calendar,
    color: "text-blue-500",
    description: "Meeting scheduling",
    category: "integrations",
  },

  // Business Features
  {
    name: "Advanced Analytics",
    configName: "advancedAnalytics",
    icon: TrendingUp,
    color: "text-indigo-600",
    description: "Performance dashboards",
    category: "business",
  },
  {
    name: "Priority Support",
    configName: "prioritySupportEnabled",
    icon: Shield,
    color: "text-red-500",
    description: "24/7 support",
    category: "operations",
  },
];

export const TIER_CONFIGS = {
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
      callGradingEnabled: false,

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
      callGradingEnabled: true,

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
      callGradingEnabled: true,
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

const ENTERPRISE = {
  limits: {
    maxUsers: -1, // Unlimited
    maxCampaigns: -1,
    maxLeads: -1,
    maxTrainingScenarios: -1,
    maxAutomations: -1,
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
    prioritySupport: true,
  },
  price: "Custom",
};
