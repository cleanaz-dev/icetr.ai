import SingleTrainingPage from "@/components/pages/training/single-page/SingleTrainingPage";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import {
  getBlandAiData,
  getTrainingById,
} from "@/lib/services/prismaQueries";
import { getOrgId } from "@/lib/db/org";

export default async function page({ params }) {
  const { userId } = await auth();
  const { trainingId } = await params;
  const orgId = await getOrgId(userId);
  const [trainingData, blandAiData] = await Promise.all([
    getTrainingById(trainingId, orgId),
    getBlandAiData(userId, orgId),
  ]);
  // console.log("trainingData:", trainingData)
 
  return (
    <div>
      <SingleTrainingPage
        training={trainingData}
        orgId={orgId}
        blandAiVoiceIds={blandAiData.voiceId}
      />
    </div>
  );
}
