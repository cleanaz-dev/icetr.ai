import CampaingsPage from "@/components/pages/campaigns/CampaingsPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getUserCampaigns } from "@/lib/services/prismaQueries";
import { revalidatePath } from "next/cache";

export default async function page() {
  const { userId } = await auth();
  const campaigns = await getUserCampaigns(userId);
  // console.log("campaigns", campaigns)

  async function revalidateCampaigns() {
    "use server";
    revalidatePath("/campaigns"); // or whatever your campaigns path is
  }
  return (
    <div>
      <CampaingsPage campaigns={campaigns} revalidate={revalidateCampaigns} />
    </div>
  );
}
