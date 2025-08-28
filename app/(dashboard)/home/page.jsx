import Dashboard from "@/components/pages/dashboard/Dashboard";
import AgentPortal from "@/components/pages/portal/AgentPortal";

import { getAgentDashboardData, getTeamAndMembersAnnouncements } from "@/lib/db/admin";
import { getOrgId } from "@/lib/db/org";
import { getUserPersmissions } from "@/lib/db/user";
import { validateOrgAccess } from "@/lib/db/validations";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export default async function Page() {
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/sign-in");
  const orgId = await getOrgId(clerkId);
  if (!orgId) redirect("/");

  try {
    await validateOrgAccess(clerkId, orgId);
  } catch {
    notFound();
  }

  const { role } = await getUserPersmissions(clerkId);

  // Define admin roles upfront for cleaner conditionals
  const isAdmin = ["Admin", "SuperAdmin", "Manager"].includes(role);

  if (isAdmin) {
    return (
      <div>
        <Dashboard />
      </div>
    );
  } else {
    // Only fetch agent data when user is actually an agent
    const [agentData, announcements] = await Promise.all([
      getAgentDashboardData(clerkId, orgId),
      getTeamAndMembersAnnouncements(clerkId, orgId)
    ]);
    
    return (
      <div>
        <AgentPortal agentData={agentData} announcements={announcements} />
      </div>
    );
  }
}