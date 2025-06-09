import SingleCampaignPage from "@/components/pages/campaigns/SingleCampaignPage";
import React from "react";
import { getCampaign, getOrgUsers } from "@/lib/service/prismaQueries";
import { auth } from "@clerk/nextjs/server";

export default async function page({ params }) {
  const { userId } = await auth()
  const { id } = await params;
  const campaign = await getCampaign(id);
  const orgUsers = await getOrgUsers(userId, campaign.id)
  // console.log("users", orgUsers)
  return (
    <div>
      <SingleCampaignPage campaign={campaign} orgUsers={orgUsers} />
    </div>
  );
}
