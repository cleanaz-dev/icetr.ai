import React from 'react'
import { auth } from '@clerk/nextjs/server' 
import CreateTrainingPage from '@/components/pages/training/create-training/CreateTrainingPage';
import { getBlandAiData, getUserCampaignTrainingData } from '@/lib/services/prismaQueries';

export default async function page() {
  const { userId } = await auth()
  const { campaigns, orgId } = await getUserCampaignTrainingData(userId);
  const blandAiData = await getBlandAiData(userId, orgId)
  // console.log("object", campaigns)

  return (
    <div>
      <CreateTrainingPage 
        campaigns={campaigns}
        orgId={orgId}
        blandAi={blandAiData}
      />
    </div>
  )
}
