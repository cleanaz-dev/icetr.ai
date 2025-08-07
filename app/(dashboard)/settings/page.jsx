import SettingsPage from "@/components/pages/settings/SettingsPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getUserSettings } from "@/lib/services/prismaQueries";
import AgentSettingsPage from "@/components/pages/settings/AgentSettingsPage";
import { getAdminOrgSettings, getUserPersmissions } from "@/lib/db/user";
import { getOrgId } from "@/lib/db/org";


export default async function page() {
  const { userId } = await auth();
  const orgId = await getOrgId(userId)
  const adminSettings = await getAdminOrgSettings(userId, orgId);
  const settings = await getUserSettings(userId, orgId);
  const { role } = await getUserPersmissions(userId)
  console.log("adminSettings", adminSettings)

  if (role ===  "Admin" || role === "SuperAdmin") {
    return (
      <div>
        <SettingsPage settings={adminSettings} />
      </div>
    );
  } else {
    return <AgentSettingsPage settings={settings} />;
  }
}
