import InvitePage from '@/components/pages/invite/InvitePage'
import React from 'react'
import redis from '@/lib/services/integrations/redis'
import { Logo } from '@/lib/hooks/useLogo'
import { notFound } from 'next/navigation'

export default async function page({params}) {
  const {id} = await params
  const userData = await redis.json.get(`invitee:${id}`)
  const combinedData = {
    ...userData,
    id,
  }
  
  if(!userData){
    notFound()
  }
  return (
      <div className="flex flex-col items-center justify-center pt-4 md:pt-10">
      <Logo />
      <InvitePage userData={combinedData} />
      </div>
  )
}
