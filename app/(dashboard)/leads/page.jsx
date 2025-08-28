import LeadsPage from "@/components/pages/leads/LeadsPage";
import { auth } from "@clerk/nextjs/server";
import { getOrgId, getOrgTeamsAndMembers } from "@/lib/db/org";
import { notFound } from "next/navigation";
import { validateHasPermission, validateOrgAccess } from "@/lib/db/validations";

export default async function page() {
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/sign-in");
  const orgId = await getOrgId(clerkId);
  if (!orgId) redirect("/");



  try {
    await validateOrgAccess(clerkId, orgId);
    await validateHasPermission(clerkId, ["lead.create"]);
  } catch {
    notFound()
  }
  const { members, teams, teamCampaigns } = await getOrgTeamsAndMembers(orgId);

  // console.log("teams:", teams);
  // console.log("members:", members);
  // console.log("campaigns:", teamCampaigns);

  return (
    <>
      <LeadsPage
        members={members}
        teams={teams}
        orgId={orgId}
        teamCampaigns={teamCampaigns}
      />
    </>
  );
}
