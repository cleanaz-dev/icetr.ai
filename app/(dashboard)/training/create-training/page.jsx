import React from "react";
import { auth } from "@clerk/nextjs/server";
import CreateTrainingPage from "@/components/pages/training/create-training/CreateTrainingPage";
import { redirect } from "next/navigation";
import {
  getBlandAiData,
  getUserCampaignTrainingData,
} from "@/lib/services/prismaQueries";
import { validateHasPermission } from "@/lib/db/validations";

export default async function page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  try {
    await validateHasPermission(userId, ["training.create"]);
  } catch (error) {
    redirect("/403");
  }

  const { campaigns, orgId } = await getUserCampaignTrainingData(userId);
  const blandAiData = await getBlandAiData(userId, orgId);
  // console.log("object", campaigns)

  return (
    <div>
      <CreateTrainingPage
        campaigns={campaigns}
        orgId={orgId}
        blandAi={blandAiData}
      />
    </div>
  );
}
