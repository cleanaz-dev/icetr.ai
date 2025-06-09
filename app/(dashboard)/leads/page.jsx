import LeadsPage from "@/components/pages/leads/LeadsPage";
import React from "react";
import { getAllLeads, getOrgUsers } from "@/lib/service/prismaQueries";
import { auth } from "@clerk/nextjs/server";

export default async function page() {
  const { userId } = await auth()
  const leads = await getAllLeads();
  
  // Extract unique users from all campaigns
  const campaignUsers = leads.reduce((acc, lead) => {
    if (lead.campaign?.users) {
      lead.campaign.users.forEach(campaignUser => {
        // Avoid duplicates by checking if user already exists
        if (!acc.find(u => u.id === campaignUser.user.id)) {
          acc.push(campaignUser.user);
        }
      });
    }
    return acc;
  }, []);

  // console.log("campaignusers", campaignUsers)

  return (
    <div>
      <LeadsPage data={leads} users={campaignUsers} />
    </div>
  );
}