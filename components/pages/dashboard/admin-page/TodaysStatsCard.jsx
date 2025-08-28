import { Card, CardHeader, CardFooter,  CardContent, CardTitle } from '@/components/ui/card'
import React from 'react'

export default function TodaysStatsCard() {
  return (
    // stats card for today's stats shows successful calls and active agents

    <Card>
      <CardHeader>
        <CardTitle>Today's Stats</CardTitle> 
      </CardHeader>
      <CardContent>
        <p>Successful Calls: 100</p>
        <p>Active Agents: 50</p>
      </CardContent>
    </Card>
  )
}
