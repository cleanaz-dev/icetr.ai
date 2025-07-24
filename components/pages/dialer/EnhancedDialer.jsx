"use client";

import React, { useState, useEffect } from "react";

import { Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import LeadsTable from "./LeadsTable";
import DialerPanel from "./DialerPanel";
import PostCallDialog from "./PostCallDialog";
import { useTwilioDevice } from "@/lib/hooks/useTwilioDevice";
import { useCallManagement, CALL_STATUS } from "@/lib/hooks/useCallManagement";
import { useLeadManagement } from "@/lib/hooks/useLeadManagement";
import CallSession from "./CallSession";

export default function EnhancedDialer({ data, callScriptData, campaignId }) {
  // Custom hooks for state management
  const { device, status, error } = useTwilioDevice();
  const {
    call,
    callStartTime,
    callDuration,
    sessionCalls,
    callStatus,
    currentCallData,
    isCallActive,
    handleCall,
    handleCallEnd,
    handleHangup,
    redialNumber,
  } = useCallManagement(device);
  const {
    leads,
    filteredLeads,
    selectedLead,
    calledLeadIds,
    selectLead,
    updateLeadStatus,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    updateLead,
    saveLead,
  } = useLeadManagement(data);

  // UI state
  const [showDialer, setShowDialer] = useState(false);
  const [postCallDialogOpen, setPostCallDialogOpen] = useState(false);
  const [callOutcome, setCallOutcome] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [currentSession, setCurrentSession] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [followUpTime, setFollowUpTime] = useState("");
  const [callData, setCallData] = useState(null);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await fetch("/api/leads/call-sessions/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: callScriptData?.id, // Make sure you have this in your data prop
            campaignId: data[0]?.campaignId, // Make sure you have this in your data prop
          }),
        });
        const sessionData = await response.json();
        setCurrentSession(sessionData);
      } catch (error) {
        console.error("Failed to initialize session:", error);
      }
    };

    initializeSession();
  }, [callScriptData.id, data]);

  useEffect(() => {
    const callEndedStates = [
      CALL_STATUS.ENDED,
      CALL_STATUS.CANCELLED,
      CALL_STATUS.FAILED,
    ];

    if (callEndedStates.includes(callStatus)) {
      console.log("Call ended, local data:", callData);
      setPostCallDialogOpen(true);
    }
  }, [callStatus]);

  useEffect(() => {
    if (currentCallData) {
      console.log("Storing call data locally:", currentCallData);
      setCallData(currentCallData);
    }
  }, [currentCallData]);

  const saveCallActivity = async (leadId, callData, outcome, notes) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "call",
          outcome: outcome,
          notes: notes,
          duration: callData?.duration || 0,
          timestamp: new Date().toISOString(),
          callStartTime: callData?.startTime || new Date(),
          callEndTime: new Date(),
          sessionId: currentSession.id,
          followUpTime: followUpTime,
          leadActivityId: callData.leadActivityId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error saving call activity:", error);
      throw error;
    }
  };

  const handleSaveCall = async () => {
    setIsSaving(true);
    try {
      await saveCallActivity(selectedLead.id, callData, callOutcome, callNotes);

      setPostCallDialogOpen(false);
      setCallOutcome("");
      setCallNotes("");

      // Optional: Show success message
      console.log("Call activity saved successfully");
    } catch (error) {
      console.error("Failed to save call activity:", error);
      // Optional: Show error message to user
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3rem)] lg:h-screen overflow-y-auto md:overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left Side - Leads Table */}
        <div
          className={cn(
            "flex-1 flex flex-col ",
            showDialer ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="border p-2 border-primary rounded-full">
                  <Phone className="w-6 h-6 text-transparent fill-primary" />
                </div>
                <h1 className="text-2xl font-bold">Dialer</h1>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant={status === "Ready" ? "default" : "secondary"}>
                  {status}
                  {status === "Connected" &&
                    ` (${formatDuration(callDuration)})`}
                </Badge>

                {error && <Badge variant="destructive">{error}</Badge>}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDialer(!showDialer)}
                  className="lg:hidden"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <LeadsTable
              leads={filteredLeads}
              selectedLead={selectedLead}
              calledLeadIds={calledLeadIds}
              onSelectLead={selectLead}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={(field) => {
                if (sortField === field) {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                } else {
                  setSortField(field);
                  setSortDirection("asc");
                }
              }}
              onShowDialer={() => setShowDialer(true)}
              onUpdateLead={updateLead} // Pass the update function
              onSaveLead={saveLead}
            />
          </div>
          <div className="sticky bottom-0 left-0 right-0 z-50 bg-background ">
            <CallSession session={currentSession} />
          </div>
        </div>

        {/* Right Side - Dialer */}
        <DialerPanel
          showDialer={showDialer}
          onHideDialer={() => setShowDialer(false)}
          selectedLead={selectedLead}
          setLead={selectLead}
          calledLeadIds={calledLeadIds}
          sessionCalls={sessionCalls}
          currentSession={currentSession}
          status={status}
          call={call}
          callStatus={callStatus}
          onCall={handleCall}
          onHangup={handleHangup}
          onRedial={redialNumber}
          formatDuration={formatDuration}
          callScriptData={callScriptData}
          campaignId={campaignId}
          isCallActive={isCallActive}
        />
      </div>
      <PostCallDialog
        open={postCallDialogOpen}
        onOpenChange={setPostCallDialogOpen}
        currentCallData={callData}
        callOutcome={callOutcome}
        onCallOutcomeChange={setCallOutcome}
        callNotes={callNotes}
        onCallNotesChange={setCallNotes}
        followUpTime={setFollowUpTime}
        selectedLead={selectedLead}
        formatDuration={formatDuration}
        isSaving={isSaving}
        onSave={async () => {
          try {
            await handleSaveCall();
            setPostCallDialogOpen(false);
            setCallOutcome("");
            setCallNotes("");
          } catch (error) {
            // Handle error - maybe show a toast notification
            console.error("Failed to save call:", error);
          }
        }}
      />
    </div>
  );
}
