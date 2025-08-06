"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, Phone, Clock, Target, TrendingUp } from 'lucide-react';
import { useTeamContext } from "@/context/TeamProvider";

export default function UnifiedStatusBar({ 
  callScriptData = null,
  data = null,
  session = null
}) {
  const { orgId } = useTeamContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSession, setCurrentSession] = useState(session);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize session
  useEffect(() => {
    if (!callScriptData || !data || currentSession) return;

    const initializeSession = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/org/${orgId}/calls/call-sessions/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: callScriptData?.id,
            campaignId: data[0]?.campaignId,
          }),
        });
        const sessionData = await response.json();
        setCurrentSession(sessionData);
      } catch (error) {
        console.error("Failed to initialize session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [callScriptData?.id, data, orgId, currentSession]);

  // Helper functions
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSuccessRate = (session) => {
    return session?.totalCalls > 0 
      ? Math.round((session.successfulCalls / session.totalCalls) * 100) 
      : 0;
  };

  // Loading State
  if (isLoading || !currentSession) {
    return (
      <div className="sticky bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="px-4 py-3 bg-muted/50 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm font-medium">Initializing call session...</span>
          </div>
          
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
    );
  }

  const successRate = getSuccessRate(currentSession);

  return (
    <div className="sticky bottom-0 left-0 right-0 z-50 bg-background border-t border-muted">
      {/* Collapsed Bar */}
      <div className="px-4 py-3 bg-muted/50 h-14">
        <div className="flex items-center justify-between">
          <Button
            variant="transparent"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:bg-muted/80"
          >
            <Phone className="h-4 w-4" />
            Call Session
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{currentSession.totalCalls}</span>
              <span className="text-muted-foreground">calls</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-green-600" />
              <span className="font-medium text-green-600">{currentSession.successfulCalls}</span>
              <span className="text-muted-foreground">successful</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{formatDuration(currentSession.totalDuration)}</span>
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
        <div className="px-4 pb-4 bg-background">
          <div className='px-2 md:px-10'>
            <div className="flex items-center justify-between py-4 border-b border-muted">
              <h2 className="text-lg font-semibold">Today's Call Session</h2>
              <div className="text-sm text-muted-foreground">
                Started: {new Date(currentSession.createdAt).toLocaleTimeString()}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
              {/* Total Calls */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Calls</p>
                  <p className="text-2xl font-bold">{currentSession.totalCalls}</p>
                </div>
              </div>

              {/* Successful Calls */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{currentSession.successfulCalls}</p>
                </div>
              </div>

              {/* Total Duration */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">{formatDuration(currentSession.totalDuration)}</p>
                </div>
              </div>

              {/* Success Rate */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{successRate}%</p>
                </div>
              </div>
            </div>

            {/* Session Info Footer */}
            <div className="pt-4 border-t border-muted">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Campaign: {data?.[0]?.campaignName || 'Unknown'}</span>
                  <span>Agent: {callScriptData?.name || 'Unknown'}</span>
                </div>
                <span>Last updated: {new Date(currentSession.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}