import LeadsPage from "@/components/pages/leads/LeadsPage";
import React from "react";
import { getAllLeads, getTeamAndMembers } from "@/lib/service/prismaQueries";
import { auth } from "@clerk/nextjs/server";

export default async function page() {
  const { userId } = await auth()
  const leads = await getAllLeads();
  const { team, members } = await getTeamAndMembers(userId)
 
  
  // Extract unique members from all campaigns


  // console.log("campaignusers", campaignUsers)

  return (
    <div>
      <LeadsPage data={leads} members={members} team={team}/>
    </div>
  );
}