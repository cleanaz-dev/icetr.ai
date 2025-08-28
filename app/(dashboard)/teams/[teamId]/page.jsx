import React from "react";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import SingleTeamPage from "@/components/pages/teams/SingleTeamPage";
import { validateTeamId } from "@/lib/db/team";
import { validateHasPermission, validateOrgAccess, validateTeamOrgAccess } from "@/lib/db/validations";
import { getOrgId } from "@/lib/db/org";

export default async function page({ params }) {
  const { teamId } = await params;
  const { userId } = await auth();
  const orgId = await getOrgId(userId);

  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/");
  
  try {
    await validateTeamId(teamId);
    await validateOrgAccess(userId, orgId);
    await validateTeamOrgAccess(userId, teamId, orgId);
    await validateHasPermission(userId, ["team.read"])
  } catch {
    notFound()
  }

  return (
    <div>
      <SingleTeamPage teamId={teamId} />
    </div>
  );
}
