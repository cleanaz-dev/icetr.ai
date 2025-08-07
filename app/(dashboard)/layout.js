// app/(dashboard)/layout.js
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getUserNotifications,
} from "@/lib/services/prismaQueries";
import RoleBasedDashboardLayout from "@/components/pages/dashboard/RoleBasedDashboardLayout";
import { getUserProfile, getUserPersmissions } from "@/lib/db/user";
import {
  getPhoneConfiguration,
  getPublicIntegrationsForOrg,
} from "@/lib/db/integrations";

import {
  getOrgTeamsMembersCampaings,
  getTeamId,
  getAssignedTeamsLeads,
} from "@/lib/db/team";
import { getAllOrgLeadsAndStatus } from "@/lib/db/leads";
import {
  getAllOrgLeads,
  getOrgDashboardStats,
  getOrgId,
  getOrgRecentActivity,
  getUserOrganization,
} from "@/lib/db/org";
import Providers from "./providers";
import UserOnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import { getOrgCallFlowConfig } from "@/lib/db/call-flow";

export default async function DashboardLayout({ children }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { imageUrl } = await getUserProfile(userId);
  const orgId = await getOrgId(userId);
  const { role, permissions } = await getUserPersmissions(userId);
  // const { teamId } = await getTeamId(userId, orgId);
  const notifications = await getUserNotifications(userId);
  const publicIntegrations = await getPublicIntegrationsForOrg(orgId);
  const { teams, teamMembers, orgMembers, orgCampaigns } =
    await getOrgTeamsMembersCampaings(userId, orgId);
  const activities = await getOrgRecentActivity(orgId);
  const leadCounts = await getAllOrgLeadsAndStatus(orgId);
  const dashboardStats = await getOrgDashboardStats(orgId);
  const leads = await getAllOrgLeads(orgId);
  const teamLeads = await getAssignedTeamsLeads(orgId);
  const callFlowConfiguration = await getOrgCallFlowConfig(orgId);
  const organization = await getUserOrganization(userId, orgId);

  console.log("LAYOUT_PAGE_OBJECT", callFlowConfiguration)


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
      coreValues={{ callFlowConfiguration, organization }}
    >
      <RoleBasedDashboardLayout
        imageUrl={imageUrl}
        userId={userId}
        notifications={notifications}
      >
        <UserOnboardingOverlay  />
        {children}
      </RoleBasedDashboardLayout>
    </Providers>
  );
}
