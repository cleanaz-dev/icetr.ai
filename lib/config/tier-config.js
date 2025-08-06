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
