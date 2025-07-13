import AgentDashboard from "@/components/pages/dashboard/AgentDashboard";
import Dashboard from "@/components/pages/dashboard/Dashboard";
import { DashboardProvider } from "@/lib/context/DashboardProvider";
import {
  getAllRecentActivity,
  getAllLeadsAndStatus,
  getDashboardStats,
  getOrgId,
  getUserRole,
  getAgentDashboardStats,
} from "@/lib/service/prismaQueries";
import { auth } from "@clerk/nextjs/server";

export default async function page() {
  const { userId } = await auth()
  const role = await getUserRole(userId)
  const activities = await getAllRecentActivity();
  const leadCounts = await getAllLeadsAndStatus();
  const orgId = await getOrgId(userId)
  const dashboardStats = await getDashboardStats(orgId)
  const agentData = await getAgentDashboardStats(userId)
  // console.log("agent data", agentData)
  
  // Prepare data for both dashboards
  const dashboardData = { activities, leadCounts, dashboardStats };

  if(!dashboardData) {
    return null
  }
  
  if (role === "admin") {
    return (
      <div>
        <DashboardProvider data={dashboardData}>
          <Dashboard />
        </DashboardProvider>
      </div>
    );
  } else {
    return (
      <div>
        <DashboardProvider data={dashboardData}>
          <AgentDashboard data={agentData} />
        </DashboardProvider>
      </div>
    );
  }
}