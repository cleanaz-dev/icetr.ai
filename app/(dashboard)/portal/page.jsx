import AgentPortal from "@/components/pages/portal/AgentPortal";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getOrgId } from "@/lib/db/org";
import { validateOrgAccess } from "@/lib/db/validations";
import { getUserPersmissions } from "@/lib/db/user";
import {
  getAgentDashboardData,
  getTeamAndMembersAnnouncements,
} from "@/lib/db/admin";

export default async function page() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return redirect("/sign-in");

  const orgId = await getOrgId(clerkId);
  if (!orgId) return redirect("/");
  const { role } = await getUserPersmissions(clerkId);

  try {
    await validateOrgAccess(clerkId, orgId);
  } catch (error) {
    console.error("Error validating permissions:", error);
    notFound();
  }

  const agentData = await getAgentDashboardData(clerkId, orgId);
  const announcements = await getTeamAndMembersAnnouncements(clerkId, orgId);
  return (
    <div>
      <AgentPortal agentData={agentData} announcements={announcements} />
    </div>
  );
}
