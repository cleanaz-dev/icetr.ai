// lib/tier-check.js  (JS / JSX)

import { TIER_CONFIGS } from "../config/tier-config";
const tierRanks = { STARTER: 0, PROFESSIONAL: 1, ENTERPRISE: 2 };

export const tierCheck = {
  isAtLeast: (current, required) => tierRanks[current] >= tierRanks[required],
  // numeric limits
  limit: (org, key) =>
    TIER_CONFIGS[org?.tierSettings?.tier || "STARTER"]?.[key] ?? 0,

  // boolean flags
  feature: (org, key) =>
    TIER_CONFIGS[org?.tierSettings?.tier || "STARTER"]?.[key] ?? false,
};
