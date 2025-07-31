import LeadsPage from "@/components/pages/leads/LeadsPage";
import { auth } from "@clerk/nextjs/server";
import {
  getOrgId,
  getOrgTeamsAndMembers,
} from "@/lib/services/db/org";


export default async function page() {
  const { userId } = await auth();
  const orgId = await getOrgId(userId);

  const { members, teams, teamCampaigns } = await getOrgTeamsAndMembers(orgId);


  // console.log("teams:", teams);
  // console.log("members:", members);
  // console.log("campaigns:", teamCampaigns);

  return (
    <div>
      <LeadsPage
        members={members}
        teams={teams}
        orgId={orgId}
        teamCampaigns={teamCampaigns}
      />
    </div>
  );
}
