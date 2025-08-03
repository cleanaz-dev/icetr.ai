"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { getLimitStatus } from "@/lib/services/tier-service";
import { useCoreContext } from "@/context/CoreProvider";
import { useTeamContext } from "@/context/TeamProvider";
import { Users } from "lucide-react";
import { useLeads } from "@/context/LeadsProvider";

export function TierLimitBanner({ check }) {
  const { tierSettings, tier } = useCoreContext();
  const { totalLeads } = useLeads();
  const { orgMembers, orgCampaigns, apiCallsCount } = useTeamContext();

  // Map check key to current usage count
  const usageMap = {
    users: orgMembers?.length ?? 0,
    campaigns: orgCampaigns?.length ?? 0,
    apiCalls: apiCallsCount ?? 0,
    leads: totalLeads ?? 0,
    // trainings: orgCampaigns.training.length ?? 0
  };

  const limitKeyMap = {
    users: "maxUsers",
    campaigns: "maxCampaigns",
    apiCalls: "maxApiCalls",
    leads: "maxLeads",
    // trainings: "maxTrainingScenarios"
  };

  const limitKey = limitKeyMap[check];

  const currentValue = usageMap[check] ?? 0;

  const status = getLimitStatus(tierSettings, limitKey, currentValue);

  // Label mapping (optional)
  const labels = {
    users: "Team Members",
    campaigns: "Campaigns",
    apiCalls: "API Calls",
  };

  const label = labels[check] || check;

  return (
    <div className="space-y-2">
      {/* Count Display */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium capitalize">{label}</span>
        </div>
        <div className="text-sm">
          <span
            className={`font-medium ${
              status.isAtLimit
                ? "text-destructive"
                : status.isNearLimit
                ? "text-yellow-600"
                : "text-muted-foreground"
            }`}
          >
            {currentValue}
          </span>
          <span className="text-muted-foreground"> / </span>
          <span className="text-muted-foreground">
            {status.max === -1 ? "∞" : status.max}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {status.isAtLimit && (
        <Alert
          variant="destructive"
          className="flex flex-col items-center text-center mt-4"
        >
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="w-4 h-4 " />
            <AlertDescription className="flex flex-col items-center">
              You've reached the limit of {status.max} for {label}.
              {tier.current !== "ENTERPRISE" && (
                <span>
                  Upgrade to{" "}
                  <span className="font-bold">
                    {tier.current === "BASIC" ? "Professional" : "Enterprise"}
                  </span>{" "}
                  to increase your limit.
                </span>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {status.isNearLimit && !status.isAtLimit && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            You're approaching your limit: {status.remaining} remaining.
            {tier.current !== "ENTERPRISE" && (
              <> Consider upgrading to get more slots.</>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
