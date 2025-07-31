import SettingsPage from "@/components/pages/settings/SettingsPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getUserSettings } from "@/lib/services/prismaQueries";
import AgentSettingsPage from "@/components/pages/settings/AgentSettingsPage";
import { getUserPersmissions } from "@/lib/services/db/user";
import { getOrgId } from "@/lib/services/db/org";


export default async function page() {
  const { userId } = await auth();
  const orgId = await getOrgId(userId)
  const settings = await getUserSettings(userId, orgId);
  const { role } = await getUserPersmissions(userId)

  // console.log("settings:",settings.organization)

  if (role ===  "Admin" || role === "SuperAdmin") {
    return (
      <div>
        <SettingsPage settings={settings} />
      </div>
    );
  } else {
    return <AgentSettingsPage settings={settings} />;
  }
}
