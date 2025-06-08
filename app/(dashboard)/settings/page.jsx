import SettingsPage from '@/components/pages/settings/SettingsPage'
import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { getUserSettings } from '@/lib/service/prismaQueries'
import { getAllInvitees } from '@/lib/service/redis'

export default async function page() {
  const { userId } = await auth()
  const settings = await getUserSettings(userId)
  const invitees = await getAllInvitees()
  console.log("invitees", invitees)

  return (
    <div><SettingsPage settings={settings} invitees={invitees} /></div>
  )
}
