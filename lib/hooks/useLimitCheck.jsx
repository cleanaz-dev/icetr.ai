import { useCoreContext } from "@/context/CoreProvider";
import { useTeamContext } from "@/context/TeamProvider";
import { useLeads } from "@/context/LeadsProvider";
import { getLimitStatus } from "../services/tier-service";
import { getFeatureStatus } from "../services/tier-service";

export function useLimitCheck(check) {
  const { tierSettings } = useCoreContext();
  const { totalLeads } = useLeads();
  const { orgMembers, orgCampaigns, apiCallsCount } = useTeamContext();

  // 1.  Usage counts ----------------------------------------------------------
  const usageMap = {
    users: orgMembers?.length ?? 0,
    campaigns: orgCampaigns?.length ?? 0,
    leads: totalLeads ?? 0,
    scenarios:
      orgCampaigns
        ?.flatMap((c) => c.training ?? [])
        .flatMap((t) => t.scenarios ?? []).length ?? 0,
  };

  // 2.  Which bucket? --------------------------------------------------------
  // const isFeatureKey = ["scenarios"].includes(check);

  // 3.  Key mappings ----------------------------------------------------------
  const limitKeyMap = {
    users: "maxUsers",
    campaigns: "maxCampaigns",
    leads: "maxLeads",
    scenarios: "maxTrainingScenarios",
  };

  // 4.  Pick the right helper -------------------------------------------------
  const keyMap = limitKeyMap;
  const key = keyMap[check];
  const current = usageMap[check] ?? 0;

  return getLimitStatus(tierSettings, key, current);
}
