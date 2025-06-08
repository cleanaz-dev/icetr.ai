import SingleCampaignPage from "@/components/pages/campaigns/SingleCampaignPage";
import React from "react";
import { getCampaign } from "@/lib/service/prismaQueries";

export default async function page({ params }) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  // console.log("campaign data:", campaign);
  return (
    <div>
      <SingleCampaignPage campaign={campaign} />
    </div>
  );
}
