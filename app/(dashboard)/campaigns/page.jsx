import CampaingsPage from "@/components/pages/campaigns/main-page/CampaingsPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getUserCampaigns } from "@/lib/services/prismaQueries";
import { revalidatePath } from "next/cache";

export default async function page() {
  const { userId } = await auth();


  return (
    <div>
      <CampaingsPage />
    </div>
  );
}
