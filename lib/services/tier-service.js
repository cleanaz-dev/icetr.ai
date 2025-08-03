//lib/services/tier-service.js
import { TIER_CONFIGS } from "../config/tier-config";

const tierRanks = { BASIC: 0, PROFESSIONAL: 1, ENTERPRISE: 2 };

// Logging utilities
const logTierEvent = async (orgId, event, data = {}) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[TIER-${event}]`, { orgId, ...data });
  }

  // Send to analytics service (PostHog, Mixpanel, etc.)
  try {
    // Example: await analytics.track(event, { orgId, ...data });
  } catch (error) {
    console.error("Failed to log tier event:", error);
  }
};

const logLimitHit = async (orgId, tier, limitType, currentValue, maxValue) => {
  await logTierEvent(orgId, "LIMIT_HIT", {
    tier,
    limitType,
    currentValue,
    maxValue,
    timestamp: new Date().toISOString(),
  });
};

const logFeatureBlocked = async (orgId, tier, feature) => {
  await logTierEvent(orgId, "FEATURE_BLOCKED", {
    tier,
    feature,
    timestamp: new Date().toISOString(),
  });
};

const logUpgradePrompt = async (orgId, currentTier, suggestedTier, context) => {
  await logTierEvent(orgId, "UPGRADE_PROMPT_SHOWN", {
    currentTier,
    suggestedTier,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Core tier checking functions
export const TierService = {
  // Basic tier utilities
  getCurrentTier: (tierSettings) => {
    return tierSettings?.tier || "BASIC";
  },

  getTierConfig: (tier) => {
    return TIER_CONFIGS[tier] || TIER_CONFIGS.BASIC;
  },

  isAtLeast: (currentTier, requiredTier) => {
    return tierRanks[currentTier] >= tierRanks[requiredTier];
  },

  checkLimit: async (tierSettings, limitKey, currentValue, context = "") => {
    const currentTier = tierSettings?.tier || "BASIC";
    const maxValue = tierSettings?.limits?.[limitKey] ?? 0;
    const orgId = tierSettings?.orgId || null; // if you want to log org id, add it here

    const isUnlimited = maxValue === -1;
    const isWithinLimit = isUnlimited || currentValue < maxValue;
    const isAtLimit = !isUnlimited && currentValue >= maxValue;

    const result = {
      allowed: isWithinLimit,
      isAtLimit,
      isUnlimited,
      currentValue,
      maxValue,
      remaining: isUnlimited ? Infinity : Math.max(0, maxValue - currentValue),
      tier: currentTier,
      limitKey,
    };

    if (isAtLimit) {
      await logLimitHit(orgId, currentTier, limitKey, currentValue, maxValue);
    }

    if (
      !isUnlimited &&
      currentValue >= maxValue * 0.8 &&
      currentValue < maxValue
    ) {
      await logTierEvent(orgId, "APPROACHING_LIMIT", {
        tier: currentTier,
        limitType: limitKey,
        currentValue,
        maxValue,
        percentUsed: Math.round((currentValue / maxValue) * 100),
        context,
      });
    }

    return result;
  },

  // Feature checking with logging
  checkFeature: async (tierSettings, featureKey, context = "") => {
    const orgId = tierSettings?.orgId || null;
    const currentTier = TierService.getCurrentTier(tierSettings);
    const tierConfig = TierService.getTierConfig(currentTier);
    const hasFeature = tierConfig[featureKey] ?? false;

    if (!hasFeature) {
      await logFeatureBlocked(orgId, currentTier, featureKey);
    }

    return {
      allowed: hasFeature,
      tier: currentTier,
      featureKey,
    };
  },

  // User limit specific helpers
  checkUserLimit: async (
    tierSettings,
    currentUserCount,
    context = "user_management"
  ) => {
    return await TierService.checkLimit(
      tierSettings,
      "maxUsers",
      currentUserCount,
      context
    );
  },

  checkCampaignLimit: async (
    tierSettings,
    currentCampaignCount,
    context = "campaign_creation"
  ) => {
    return await TierService.checkLimit(
      tierSettings,
      "maxCampaigns",
      currentCampaignCount,
      context
    );
  },

  checkApiCallsLimit: async (
    tierSettings,
    currentApiCalls,
    context = "api_usage"
  ) => {
    return await TierService.checkLimit(
      tierSettings,
      "maxApiCalls",
      currentApiCalls,
      context
    );
  },

  // Upgrade suggestion logic
  suggestUpgrade: async (tierSettings, blockedFeature, context = "") => {
    const currentTier = TierService.getCurrentTier(tierSettings);
    const orgId = tierSettings?.orgId;

    let suggestedTier;
    if (currentTier === "BASIC") {
      suggestedTier = "PROFESSIONAL";
    } else if (currentTier === "PROFESSIONAL") {
      suggestedTier = "ENTERPRISE";
    } else {
      return null; // Already at highest tier
    }

    await logUpgradePrompt(orgId, currentTier, suggestedTier, context);

    return {
      currentTier,
      suggestedTier,
      benefits: TierService.getUpgradeBenefits(currentTier, suggestedTier),
      blockedFeature,
    };
  },

  // Get benefits of upgrading
  getUpgradeBenefits: (currentTier, targetTier) => {
    const currentConfig = TierService.getTierConfig(currentTier);
    const targetConfig = TierService.getTierConfig(targetTier);

    const benefits = [];

    // Compare limits
    Object.keys(targetConfig).forEach((key) => {
      if (
        typeof targetConfig[key] === "number" &&
        targetConfig[key] > (currentConfig[key] || 0)
      ) {
        if (targetConfig[key] === -1) {
          benefits.push(`Unlimited ${key.replace("max", "").toLowerCase()}`);
        } else {
          benefits.push(
            `${targetConfig[key]} ${key.replace("max", "").toLowerCase()} (vs ${
              currentConfig[key] || 0
            })`
          );
        }
      }

      // Compare features
      if (
        typeof targetConfig[key] === "boolean" &&
        targetConfig[key] &&
        !currentConfig[key]
      ) {
        benefits.push(key.replace(/([A-Z])/g, " $1").toLowerCase());
      }
    });

    return benefits;
  },

  getLimitStatus: (tierSettings, limitKey, currentValue) => {
    const currentTier = tierSettings?.tier || "BASIC";
    const maxValue = tierSettings?.limits?.[limitKey] ?? 0;

    const isUnlimited = maxValue === -1;
    const remaining = isUnlimited
      ? Infinity
      : Math.max(0, maxValue - currentValue);

    return {
      tier: currentTier,
      limitKey,
      max: maxValue,
      current: currentValue,
      remaining,
      isUnlimited,
      isAtLimit: !isUnlimited && remaining <= 0,
      isNearLimit: !isUnlimited && remaining > 0 && remaining <= 2,
    };
  },

getFeatureStatus(
  tierSettings,
  featureKey,      // e.g. "transcriptionMinutesLimit"
  currentValue = 0
) {
  const currentTier = tierSettings?.tier || "BASIC";
  const max = tierSettings?.features?.[featureKey] ?? 0;

  // Unlimited (Enterprise) guard
  if (max === -1) {
    return { isAtLimit: false, isNearLimit: false, current: currentValue, max, remaining: Infinity };
  }

  const remaining = Math.max(0, max - currentValue);
  const threshold = Math.ceil(max * 0.8); // 80 % warning

  return {
    isAtLimit: remaining === 0,
    isNearLimit: currentValue >= threshold && currentValue < max,
    current: currentValue,
    max,
    remaining,
  };
},
  // Usage analytics
  getUsageAnalytics: async (tierSettings) => {
    const currentTier = TierService.getCurrentTier(tierSettings);
    const tierConfig = TierService.getTierConfig(currentTier);

    return {
      tier: currentTier,
      usage: {
        users: {
          current: 0, // fetch this count externally if needed
          max: tierConfig.maxUsers,
          percentage: 0,
        },
        campaigns: {
          current: 0,
          max: tierConfig.maxCampaigns,
          percentage: 0,
        },
        apiCalls: {
          current: 0,
          max: tierConfig.maxApiCalls,
          percentage: 0,
        },
      },
      features: Object.keys(tierConfig)
        .filter((key) => typeof tierConfig[key] === "boolean")
        .reduce((acc, key) => ({ ...acc, [key]: tierConfig[key] }), {}),
    };
  },

  checkMultipleLimits: async (tierSettings, checks, context = "") => {
    const results = {};

    for (const [limitKey, currentValue] of Object.entries(checks)) {
      results[limitKey] = await TierService.checkLimit(
        tierSettings,
        limitKey,
        currentValue,
        context
      );
    }

    return results;
  },

  canPerformAction: async (tierSettings, action, currentCounts = {}) => {
    const actionLimits = {
      invite_user: "maxUsers",
      create_campaign: "maxCampaigns",
      api_call: "maxApiCalls",
    };

    const limitKey = actionLimits[action];
    if (!limitKey) {
      return { allowed: true, reason: "No limit defined for this action" };
    }

    const currentValue = currentCounts[limitKey] || 0;
    const result = await TierService.checkLimit(
      tierSettings,
      limitKey,
      currentValue + 1,
      action
    );

    return {
      allowed: result.allowed,
      reason: result.allowed ? null : `${limitKey} limit exceeded`,
      ...result,
    };
  },

  getLimit: (tierSettings, limitKey) => {
  const currentTier = tierSettings?.tier || "BASIC";
  const limits = tierSettings?.limits || {};

  const usageMap = {
    maxUsers: tierSettings?.usage?.users ?? 0,
    maxCampaigns: tierSettings?.usage?.campaigns ?? 0,
    maxLeads: tierSettings?.usage?.leads ?? 0,
    maxApiCalls: tierSettings?.usage?.apiCalls ?? 0,
  };

  const current = usageMap[limitKey] ?? 0;
  const max = limits?.[limitKey] ?? 0;

  const isUnlimited = max === -1;
  const remaining = isUnlimited ? Infinity : Math.max(0, max - current);

  return {
    tier: currentTier,
    limitKey,
    max,
    current,
    remaining,
    isUnlimited,
    isAtLimit: !isUnlimited && remaining <= 0,
    isNearLimit: !isUnlimited && remaining > 0 && remaining <= 2,
  };
}
};



// Export individual functions for convenience
export const {
  getCurrentTier,
  getFeatureStatus,
  getTierConfig,
  isAtLeast,
  checkLimit,
  checkFeature,
  checkUserLimit,
  checkCampaignLimit,
  checkApiCallsLimit,
  suggestUpgrade,
  getUpgradeBenefits,
  getUsageAnalytics,
  checkMultipleLimits,
  canPerformAction,
  getLimitStatus,
  getLimit
} = TierService;
