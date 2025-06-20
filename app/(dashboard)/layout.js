// app/(dashboard)/layout.js
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/service/prismaQueries";
import RoleBasedDashboardLayout from "@/components/pages/dashboard/RoleBasedDashboardLayout";

export default async function DashboardLayout({ children }) {
  // Get the authenticated user
  const { userId } = await auth();
  
  // Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user role from database
  let userRole = null;
  try {
    userRole = await getUserRole(userId);
    if (!userRole) {
      console.error("No role found for user:", userId);
      // You might want to redirect to a setup page or show an error
      return <div>Error: User role not found. Please contact support.</div>;
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return <div>Error loading user data. Please try again.</div>;
  }

  return (
    <RoleBasedDashboardLayout userRole={userRole} userId={userId}>
      {children}
    </RoleBasedDashboardLayout>
  );
}