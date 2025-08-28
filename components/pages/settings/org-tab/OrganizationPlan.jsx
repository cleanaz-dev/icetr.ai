import { useState } from "react";
import {
  Building2,
  Sparkles,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Save,
  Copy,
  Check,
  Settings,
  Phone,
  FileText,
  Activity,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TIER_INFO, TIER_FEATURES } from "@/lib/config/tier-config";
import { useTeamContext } from "@/context/TeamProvider";
import { useLeads } from "@/context/LeadsProvider";
import { CircleCheckBig } from "lucide-react";
import { CircleCheck } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { BarChart3 } from "lucide-react";
import { Package } from "lucide-react";
import { Plus } from "lucide-react";
import PlanCard from "./PlanCard";
import FeatureCapabilities from "./FeatureCapabilities";

export default function OrganizationPlan({
  organization = {},
  orgName,
  setOrgName,
  onSave,
  savingSettings,
}) {
  const { orgMembers } = useTeamContext();
  const { totalLeads } = useLeads();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedOrgId, setCopiedOrgId] = useState(false);

  const tierSettings = organization.tierSettings || {};
  const campaigns = organization.campaigns || [];
  const currentTier = tierSettings.tier || "BASIC";
  const tierInfo = TIER_INFO[currentTier];
  const TierIcon = tierInfo?.icon || Building2;
  const aiCreditsTotal = organization.aiCreditTotals || {};

  console.log("AI credits total", aiCreditsTotal);
  // Format numbers for display
  const formatNumber = (num) =>
    num >= 999999 ? "Unlimited" : num?.toLocaleString() || "N/A";

  // Calculate campaign stats
  const getCampaignStats = () => ({
    callCampaigns: campaigns.filter((c) => c.type === "CALLS").length,
    formCampaigns: campaigns.filter((c) => c.type === "FORMS").length,
    activeCampaigns: campaigns.filter((c) => c.status === "Active").length,
    total: campaigns.length,
    scenarios:
      campaigns
        ?.flatMap((c) => c.training ?? [])
        .flatMap((t) => t.scenarios ?? []).length ?? 0,
  });

  const campaignStats = getCampaignStats();

  
  const handleCopyOrgId = async () => {
    try {
      await navigator.clipboard.writeText(
        tierSettings.orgId || organization.id
      );
      setCopiedOrgId(true);
      setTimeout(() => setCopiedOrgId(false), 2000);
    } catch (error) {
      console.error("Failed to copy org ID:", error);
    }
  };

  // Usage stats for progress bars
  const usageStats = {
    users: {
      current: orgMembers.length,
      max: tierSettings.limits?.maxUsers || 10,
    },
    campaigns: {
      current: campaignStats.total,
      max: tierSettings.limits?.maxCampaigns || 50,
    },
    leads: {
      current: totalLeads,
      max: tierSettings.limits?.maxLeads || 5000,
    },
    TrainingScenarios: {
      current: campaignStats.scenarios,
      max: tierSettings.limits?.maxTrainingScenarios,
    },
    aiCredits: {
      current: tierSettings.usage?.aiCredits || 0,
      max: tierSettings.limits?.maxAiCredits || 5,
    },
    voiceMins: {
      current: tierSettings.usage?.voiceMins || 0,
      max: tierSettings.limits?.maxVoiceMins || 1000,
    },
    aiCreditAddOns: {
      current: aiCreditsTotal.consumend || 0,
      max: aiCreditsTotal.total || 0,
    },
  };



  return (
    <Card className="w-full overflow-hidden hover:border-primary transition-all duration-300">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">Organization & Plan</CardTitle>
              <CardDescription>
                {organization.name || orgName || "My Organization"} •{" "}
                {campaignStats.total} campaigns
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={tierInfo.color}>
              <TierIcon className="w-3 h-3 mr-1" />
              {tierInfo.name}
            </Badge>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          <div className="p-6 space-y-6">
            {/* Organization Details */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Settings className="w-4 h-4" />
                <h3 className="font-semibold">Organization Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={orgName || organization.name || "My Organization"}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgId">Organization ID</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2 rounded-md border bg-muted">
                      <code className="text-sm">
                        {tierSettings.orgId ||
                          organization.id ||
                          "org_123456789"}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyOrgId}
                    >
                      {copiedOrgId ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Created</Label>
                  <div className="px-3 py-2 rounded-md border bg-muted text-sm">
                    {new Date(
                      organization.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <div className="px-3 py-2 rounded-md border bg-muted text-sm">
                    {new Date(
                      tierSettings.updatedAt || Date.now()
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Plan & Usage */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Plan */}
              <PlanCard
              tierInfo={tierInfo}
              TierIcon={TierIcon}
              usageStats={usageStats}
              formatNumber={formatNumber}

              />


              {/* Features */}
             <FeatureCapabilities 
              tierFeatures={TIER_FEATURES}
              tierSettings={tierSettings}
             />
            </section>

           
          </div>

          <CardFooter className="border-t p-6">
            <Button
              onClick={onSave}
              disabled={savingSettings}
              className="w-full md:w-auto"
            >
              {savingSettings ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </CardContent>
      )}
    </Card>
  );
}
