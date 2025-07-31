"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronUp, ChevronDown, Phone, Clock, Target, TrendingUp } from 'lucide-react'

export default function CallSession({ session }) {
  const [isExpanded, setIsExpanded] = useState(false)

if (!session) return (
  <div className="sticky bottom-0 left-0 right-0 z-50 bg-background border-t">
    <div className="px-4 py-3 bg-muted/50 h-14 flex items-center justify-between">
      {/* Left side - Loading indicator */}
      <div className="flex items-center gap-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
        <span className="text-sm font-medium">Initializing call session...</span>
      </div>
      
      {/* Right side - Skeleton stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-muted-foreground/30 rounded animate-pulse"></div>
          <div className="w-8 h-4 bg-muted-foreground/30 rounded animate-pulse"></div>
          <span className="text-xs text-muted-foreground">calls</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-muted-foreground/30 rounded animate-pulse"></div>
          <div className="w-8 h-4 bg-muted-foreground/30 rounded animate-pulse"></div>
          <span className="text-xs text-muted-foreground">successful</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-muted-foreground/30 rounded animate-pulse"></div>
          <div className="w-12 h-4 bg-muted-foreground/30 rounded animate-pulse"></div>
        </div>
        <div className="w-12 h-5 bg-muted-foreground/30 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
)

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const successRate = session.totalCalls > 0 
    ? Math.round((session.successfulCalls / session.totalCalls) * 100) 
    : 0

  return (
    <div className="sticky bottom-0 left-0 right-0 z-50 bg-background border-t border-muted">
      {/* Collapsed Bar with Stats */}
      <div className="px-4 py-3 bg-muted/50 h-14">
        <div className="flex items-center justify-between">
          {/* Left side - Session title and toggle */}
          <Button
            variant="transparent"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 "
          >
            <Phone className="h-4 w-4" />
            Call Session
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>

          {/* Right side - Quick stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{session.totalCalls}</span>
              <span className="text-muted-foreground">calls</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-green-600" />
              <span className="font-medium text-green-600">{session.successfulCalls}</span>
              <span className="text-muted-foreground">successful</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{formatDuration(session.totalDuration)}</span>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className='px-2 md:px-10'>
        
              <h1 className="flex items-center justify-between py-4">
                <span>Today's Call Session</span>
               
              </h1>
        
        
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Calls */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Calls</p>
                    <p className="text-2xl font-bold">{session.totalCalls}</p>
                  </div>
                </div>

                {/* Successful Calls */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{session.successfulCalls}</p>
                  </div>
                </div>

                {/* Total Duration */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-2xl font-bold">{formatDuration(session.totalDuration)}</p>
                  </div>
                </div>

                {/* Success Rate */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{successRate}%</p>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Session started: {new Date(session.createdAt).toLocaleTimeString()}</span>
                  <span>Last updated: {new Date(session.updatedAt).toLocaleTimeString()}</span>
                </div>
              </div>
          
          </div>
        </div>
      )}
    </div>
  )
}