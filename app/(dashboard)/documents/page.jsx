import DocumentsPage from '@/components/pages/documents/DocumentsPage'
import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { getCampaignDocuments } from '@/lib/service/prismaQueries'

export default async function page() {
  const { userId } = await auth()
  const campaigns = await getCampaignDocuments(userId)
  console.log("campaigns", campaigns[0].documents[0]);

  return (
    <div><DocumentsPage campaigns={campaigns}/></div>
  )
}
