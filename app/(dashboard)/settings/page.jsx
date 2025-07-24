import SettingsPage from "@/components/pages/settings/SettingsPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getOrgId, getUserRole, getUserSettings } from "@/lib/service/prismaQueries";
import AgentSettingsPage from "@/components/pages/settings/AgentSettingsPage";

export default async function page() {
  const { userId } = await auth();
  const orgId = await getOrgId(userId)
  const settings = await getUserSettings(userId, orgId);
  const { userRole: role } = await getUserRole(userId);

  console.log("settings:",settings.organization.orgIntegrations)

  if (role === "admin") {
    return (
      <div>
        <SettingsPage settings={settings} />
      </div>
    );
  } else {
    return <AgentSettingsPage settings={settings} />;
  }
}
