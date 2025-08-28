import TeamsPage from "@/components/pages/teams/main-page/TeamsPage";
import { getOrgId } from "@/lib/db/org";
import { validateHasPermission, validateOrgAccess } from "@/lib/db/validations";
import { auth } from "@clerk/nextjs/server";
import React from "react";

export default async function page() {
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/sign-in");
  
  const orgId = await getOrgId(clerkId);

  if (!orgId) redirect("/"); 

  try {
    await validateOrgAccess(clerkId, orgId);
    await validateHasPermission(clerkId, ["team.read"]);
  } catch {
    notFound();
  }

  return (
    <div>
      <TeamsPage />
    </div>
  );
}
