// OrgTab.jsx
"use client";
import { useState } from "react";
import OrganizationPlan from "./OrganizationPlan";
import ApiKeys from "./ApiKeys";
import { TabsContent } from "@/components/ui/tabs-og";
import PhoneConfiguration from "./PhoneConfiguration";
import ResearchOptions from "./ResearchOptions";
import AIAgentSettings from "./ai-agent-settings/AIAgentSettings";


export default function OrgTab({ organization, generateApiKey, newKey }) {
  // only UI toggles
  const [expandedSections, setExpandedSections] = useState({
    orgPlan: true,
    apiKeys: false,
    dangerZone: false,
  });
  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  // helpers
  const copyKey = (id, val) => navigator.clipboard.writeText(val);
  const revokeKey = async (keyId) =>
    await fetch(`/api/org/${organization.id}/keys/${keyId}`, {
      method: "DELETE",
    });

  return (
    <TabsContent value="organization">
      <div className="grid gap-4">
        <OrganizationPlan
          organization={organization}
          isExpanded={expandedSections.orgPlan}
          setIsExpanded={(v) => toggleSection("orgPlan")}
        />

        <PhoneConfiguration
          phoneConfiguration={organization.phoneConfiguration}
        />

        <ApiKeys
          campaigns={organization.campaigns ?? []}
          apiKeys={organization.apiKeys ?? []}
          newKey={newKey}
          orgId={organization.id}
          onGenerate={generateApiKey}
          onCopyKey={copyKey}
          onRevokeKey={revokeKey}
          isExpanded={expandedSections.apiKeys}
          setIsExpanded={(v) => toggleSection("apiKeys")}
        />

        <ResearchOptions 
          campaigns={organization.campaigns?? []}
          researchConfig={null}
          researches={[]}

        />

        <AIAgentSettings

        />
      </div>
    </TabsContent>
  );
}
