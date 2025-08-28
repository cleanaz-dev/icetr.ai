import SingleLeadsPage from "@/components/pages/leads/SingleLeadsPage";
import {
  assertLeadExists,
  validateHasPermission,
  validateLeadOrgAccess,
  validateOrgAccess,
} from "@/lib/db/validations";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export default async function page({ params }) {
  const { userId: clerkId } = await auth();
  const { leadId } = await params;

  if (!clerkId) redirect("/sign-in");

  const orgId = await getOrgId(clerkId);

  if (!orgId) redirect("/");

  try {

    await Promise.all([
      assertLeadExists(leadId),
      validateOrgAccess(clerkId, orgId),
      validateHasPermission(clerkId, ["lead.read"]),
      validateLeadOrgAccess(leadId, orgId),
    ]);

  } catch (error) {
    
    console.error("Error:", error);
    notFound();
  }

  return (
    <div>
      <SingleLeadsPage />
    </div>
  );
}
