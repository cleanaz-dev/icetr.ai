// app/(dashboard)/layout.js
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getAllRecentActivity,
  getUserNotifications,
} from "@/lib/services/prismaQueries";
import RoleBasedDashboardLayout from "@/components/pages/dashboard/RoleBasedDashboardLayout";
import { getUserProfile, getUserPersmissions } from "@/lib/services/db/user";
import { getPhoneConfiguration, getPublicIntegrationsForOrg } from "@/lib/services/db/integrations";

import {
  getOrgTeamsMembersCampaings,
  getTeamId,
  getAssignedTeamsLeads,
} from "@/lib/services/db/team";
import { getAllOrgLeadsAndStatus } from "@/lib/services/db/leads";
import {
  getAllOrgLeads,
  getOrgDashboardStats,
  getOrgId,
} from "@/lib/services/db/org";
import Providers from "./providers";


export default async function DashboardLayout({ children }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { imageUrl } = await getUserProfile(userId);
  const orgId = await getOrgId(userId);
  const { role, permissions } = await getUserPersmissions(userId);
  const { teamId } = await getTeamId(userId, orgId);
  const notifications = await getUserNotifications(userId);
  const publicIntegrations = await getPublicIntegrationsForOrg(orgId);
  const { teams, teamMembers, orgMembers, orgCampaigns } =
    await getOrgTeamsMembersCampaings(userId, orgId);
  const activities = await getAllRecentActivity();
  const leadCounts = await getAllOrgLeadsAndStatus(orgId);
  const dashboardStats = await getOrgDashboardStats(orgId);
  const leads = await getAllOrgLeads(orgId);
  const teamLeads = await getAssignedTeamsLeads(orgId);
  const phoneConfiguration = await getPhoneConfiguration(orgId)

  // console.log("orgcampaign", orgCampaigns)
  

  return (
    <Providers
      permissionValues={{ permissions, role, publicIntegrations }}
      teamValues={{
        teams,
        orgId,
        orgMembers,
        teamMembers,
        orgCampaigns,
        teamLeads,
      }}
      dashboardValues={{ activities, leadCounts, dashboardStats }}
      leadsValues={{ leads }}
      coreValues={{ phoneConfiguration }}
    >
      <RoleBasedDashboardLayout
        imageUrl={imageUrl}
        userId={userId}
        notifications={notifications}
      >
        {children}
      </RoleBasedDashboardLayout>
    </Providers>
  );
}
