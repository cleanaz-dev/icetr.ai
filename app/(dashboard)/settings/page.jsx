import SettingsPage from '@/components/pages/settings/SettingsPage'
import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { getUserRole, getUserSettings } from '@/lib/service/prismaQueries'
import { getAllInvitees } from '@/lib/service/redis'
import AgentSettingsPage from '@/components/pages/settings/AgentSettingsPage'

export default async function page() {
  const { userId } = await auth()
  const settings = await getUserSettings(userId)
  const invitees = await getAllInvitees()
  const role = await getUserRole(userId)
  console.log("invitees", invitees)
  console.log("role", role)
  
  if(role === "admin") {
    return (
      <div><SettingsPage settings={settings} invitees={invitees} /></div>
    )
  } else {
    return <AgentSettingsPage settings={settings} />
  }
}