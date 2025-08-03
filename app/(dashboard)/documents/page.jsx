
import { auth } from '@clerk/nextjs/server'
import { getOrgId } from '@/lib/db/org'
import DocumentsPage from '@/components/pages/documents/DocumentsPage'
import { getOrgCampaignDocuments } from '@/lib/db/campaigns'


export default async function page() {
  const { userId } = await auth()
  const orgId = await getOrgId(userId)
  const campaigns = await getOrgCampaignDocuments(userId, orgId)
  // console.log("campaigns", campaigns[0]?.documents[0]);
 console.log("campaigns", campaigns)
  return (
    <div><DocumentsPage campaigns={campaigns} orgId={orgId}/></div>
  )
}
