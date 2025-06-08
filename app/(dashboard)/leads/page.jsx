import LeadsPage from "@/components/pages/leads/LeadsPage";
import React from "react";
import { getAllLeads } from "@/lib/service/prismaQueries";

export default async function page() {
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

  return (
    <div>
      <LeadsPage data={leads} users={campaignUsers} />
    </div>
  );
}