import SingleCampaignPage from "@/components/pages/campaigns/single-page/SingleCampaignPage";
import React from "react";
import {
  getCampaign,
  getCampaignUsers,
  getOrgUsers,
} from "@/lib/services/prismaQueries";
import { auth } from "@clerk/nextjs/server";
import { getCampaignById } from "@/lib/db/campaigns";
import { getOrgId } from "@/lib/db/org";

export default async function page({ params }) {
  const { userId } = await auth();
  const { campaignId } = await params;
  const orgId = await getOrgId(userId);
  const campaign = await getCampaignById(orgId, campaignId);

  return (
    <div>
      <SingleCampaignPage campaign={campaign} />
    </div>
  );
}
