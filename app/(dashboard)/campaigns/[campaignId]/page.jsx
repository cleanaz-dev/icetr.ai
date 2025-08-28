import SingleCampaignPage from "@/components/pages/campaigns/single-page/SingleCampaignPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import {
  getCampaignById,
  validateCampaignBelongsToOrg,
  validateCampaignExists,
} from "@/lib/db/campaigns";
import { getOrgId } from "@/lib/db/org";
import { notFound } from "next/navigation";

export default async function page({ params }) {
  const { userId } = await auth();
  const { campaignId } = await params;
  
  if (!userId) {
    redirect("/sign-in");
  }
  const orgId = await getOrgId(userId);

  // Validate the campaign ID
  try {
    await validateCampaignExists(campaignId);
    await validateOrgAccess(userId, orgId);
    await validateCampaignBelongsToOrg(campaignId, orgId);
    await validateHasPermission(userId, ["campaign.read"]);
  } catch {
    notFound();
  }

  const campaign = await getCampaignById(orgId, campaignId);

  return (
    <div>
      <SingleCampaignPage campaign={campaign} />
    </div>
  );
}
