// app/(dashboard)/layout.js
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole, getUserNotifications } from "@/lib/service/prismaQueries";
import RoleBasedDashboardLayout from "@/components/pages/dashboard/RoleBasedDashboardLayout";

export default async function DashboardLayout({ children }) {
  // Get the authenticated user
  const { userId } = await auth();
  
  // Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // These should always succeed under normal circumstances
  const userRole = await getUserRole(userId);
  const notifications = await getUserNotifications(userId);

  return (
    <RoleBasedDashboardLayout userRole={userRole} userId={userId} notifications={notifications}>
      {children}
    </RoleBasedDashboardLayout>
  );
}