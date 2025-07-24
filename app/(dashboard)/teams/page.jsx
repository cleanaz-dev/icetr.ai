import TeamsPage from '@/components/pages/teams/TeamsPage'
import { getAllOrgLeads, getTeamData } from '@/lib/service/prismaQueries'
import { auth } from '@clerk/nextjs/server'
import React from 'react'

export default async function page() {
  const { userId } = await auth()
  const { user, teams, orgMembers } = await getTeamData(userId)
  const leads = await getAllOrgLeads(userId)
  // console.log("orgmembers:", orgMembers)
  return (
    <div><TeamsPage teams={teams} leads={leads} orgMembers={orgMembers}/></div>
  )
} 
