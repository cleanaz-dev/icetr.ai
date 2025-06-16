import Dashboard from "@/components/pages/dashboard/Dashboard";
import { DashboardProvider } from "@/lib/context/DashboardProvider";
import {
  getAllRecentActivity,
  getAllLeadsAndStatus,
  getDashboardStats,
  getOrgId
} from "@/lib/service/prismaQueries";
import { auth } from "@clerk/nextjs/server";

export default async function page() {
  const { userId } = await auth()
  const activities = await getAllRecentActivity();
  const leadCounts = await getAllLeadsAndStatus();
  const orgId = await getOrgId(userId)
  const dashboardStats = await getDashboardStats(orgId)
  console.log("dashboard stats", dashboardStats)
  return (
    <div>
      <DashboardProvider data={{ activities, leadCounts, dashboardStats }}>
        <Dashboard />
      </DashboardProvider>
    </div>
  );
}
