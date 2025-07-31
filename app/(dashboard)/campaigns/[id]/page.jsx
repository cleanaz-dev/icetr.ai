import SingleCampaignPage from "@/components/pages/campaigns/SingleCampaignPage";
import React from "react";
import { getCampaign, getCampaignUsers, getOrgUsers } from "@/lib/services/prismaQueries";
import { auth } from "@clerk/nextjs/server";

export default async function page({ params }) {
  const { userId } = await auth()
  const { id } = await params
  const campaign = await getCampaign(id)

  return (
    <div>
      <SingleCampaignPage campaign={campaign} />
    </div>
  );
}
