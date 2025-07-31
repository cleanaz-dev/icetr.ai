import AgentDashboard from "@/components/pages/dashboard/AgentDashboard";
import Dashboard from "@/components/pages/dashboard/Dashboard";
import { DashboardProvider } from "@/context/DashboardProvider";
import { getAllOrgLeadsAndStatus } from "@/lib/services/db/leads";
import { getOrgDashboardStats, getOrgId } from "@/lib/services/db/org";
import { getUserPersmissions } from "@/lib/services/db/user";
import {
  getAllRecentActivity,
  getOrgAgentDashboardStats,
} from "@/lib/services/prismaQueries";
import { auth } from "@clerk/nextjs/server";
import { CloudHail } from "lucide-react";

export default async function page() {
  const { userId } = await auth();
  const orgId = await getOrgId(userId);
  const { role } = await getUserPersmissions(userId);
  const agentData = await getOrgAgentDashboardStats(userId, orgId);



  if (role === "Admin" || role === "SuperAdmin" || role === "Manager") {
    // ← Fixed the comparison
    return (
      <div>
        <Dashboard />
      </div>
    );
  } else {
    return (
      <div>
        <AgentDashboard data={agentData} />
      </div>
    );
  }
}
