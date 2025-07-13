import CampaingsPage from '@/components/pages/campaigns/CampaingsPage'
import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { getUserCampaigns } from '@/lib/service/prismaQueries'

export default async function page() {
  const { userId } = await auth()
  const campaigns = await getUserCampaigns(userId)
  // console.log("campaigns", campaigns)
  return (
    <div><CampaingsPage campaigns={campaigns}/></div>
  )
}
