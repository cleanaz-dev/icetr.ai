"use client";

import React, { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LeadsTable from "./LeadsTable";
import DialerPanel from "./DialerPanel";
import PostCallDialog from "./PostCallDialog";
import { useCallManagement, CALL_STATUS } from "@/lib/hooks/useCallManagement";
import { useLeadManagement } from "@/lib/hooks/useLeadManagement";
import UnifiedStatusBar from "./UnifiedStatusBar";
import { useCoreContext } from "@/context/CoreProvider";
import PageHeader from "@/components/ui/layout/PageHeader";
import { useTeamContext } from "@/context/TeamProvider";
import LeadResearcher from "../leads/LeadResearcher";
import { useCall } from "@/context/CallProvider";

export default function EnhancedDialer({ data, callScriptData, campaignId }) {
  const { phoneNumbers } = useCoreContext();
  const { orgId } = useTeamContext();
  const {
    currentSession,
    callDuration,
    callSid,
    callStatus,
  } = useCall();

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
  const [isSaving, setIsSaving] = useState(false);
  const [followUpTime, setFollowUpTime] = useState("");
  const [showResearcher, setShowResearcher] = useState(false);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const callEndedStates = [
      CALL_STATUS.ENDED,
      CALL_STATUS.CANCELLED,
      CALL_STATUS.FAILED,
    ];

    if (callEndedStates.includes(callStatus)) {
      setPostCallDialogOpen(true);
    }
  }, [callStatus]);

  const saveCallActivity = async (leadId, currentCallData, outcome, notes) => {
    try {
      const response = await fetch(
        `/api/org/${orgId}/leads/${leadId}/activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "call",
            outcome: outcome,
            notes: notes,
            duration: currentCallData?.duration || 0,
            timestamp: new Date().toISOString(),
            callStartTime: currentCallData?.startTime || new Date(),
            callEndTime: new Date(),
            sessionId: currentSession.id,
            followUpTime: followUpTime,
            leadActivityId: currentCallData.leadActivityId,
          }),
        }
      );

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
      await saveCallActivity(
        selectedLead.id,
        currentCallData,
        callOutcome,
        callNotes
      );

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
            <PageHeader
              title="Dialer"
              description="Call, book and track lead progress"
              icon="Phone"
            >
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    callStatus === CALL_STATUS.ACTIVE ? "default" : "secondary"
                  }
                >
                  {callStatus}
                  {callStatus === CALL_STATUS.ACTIVE &&
                    ` (${formatDuration(callDuration)})`}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDialer(!showDialer)}
                  className="lg:hidden"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </PageHeader>
          </div>

          <div className="flex-1 min-h-full z-20 shrink-0">
            <LeadsTable
              orgId={orgId}
              showResearcher={showResearcher}
              setShowResearcher={setShowResearcher}
              selectedLead={selectedLead}
            
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
              onUpdateLead={updateLead}
              onSaveLead={saveLead}
            />
          </div>
          {/* Bottom Status Bar */}
          <div className="sticky bottom-0 left-0 right-0 z-20 bg-background ">
            <LeadResearcher
              showResearcher={showResearcher}
              setShowResearcher={setShowResearcher}
              lead={selectedLead}
            />
            <UnifiedStatusBar mode="main" session={currentSession} />
          </div>
        </div>

        <DialerPanel
          showDialer={showDialer}
          onHideDialer={() => setShowDialer(false)}
          selectedLead={selectedLead}
          setLead={selectLead}
          formatDuration={formatDuration}
          campaignId={campaignId}
          phoneNumbers={phoneNumbers}
        />
      </div>

      <PostCallDialog
        orgId={orgId}
        open={postCallDialogOpen}
        callSid={callSid}
        onOpenChange={setPostCallDialogOpen}
        // currentCallData={currentCallData}
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
