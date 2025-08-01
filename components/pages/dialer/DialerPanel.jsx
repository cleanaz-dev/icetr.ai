"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/dialer-tabs";
import { cn } from "@/lib/utils";
import DialerTab from "./tabs/DialerTab";
import CallHistoryTab from "./tabs/CallHistoryTab";
import CallScriptTab from "./tabs/CallScriptTab";
import DocumentsTab from "./DocumentsTab";
import { BiDialpad } from "react-icons/bi";
import { CgTranscript } from "react-icons/cg";
import { FaReadme, FaRegCalendarAlt } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";
import CalendarTab from "./tabs/CalendarTab";
import FollowUpTab from "./tabs/FollowUpTab";
import { useTeamContext } from "@/context/TeamProvider";

export default function DialerPanel({
  showDialer,
  onHideDialer,
  selectedLead,
  calledLeadIds,
  sessionCalls,
  currentSession,
  status,
  call,
  onCall,
  onHangup,
  onRedial,
  formatDuration,
  callScriptData,
  campaignId,
  setLead,
}) {
  const { orgId } = useTeamContext();
  const [activeTab, setActiveTab] = useState("dialpad");

  return (
    <div
      className={cn(
        "w-full lg:w-96 border-l bg-muted/20 flex flex-col",
        "lg:relative fixed inset-0 lg:inset-auto z-40 lg:z-auto bg-background lg:bg-muted/20",
        showDialer ? "block" : "hidden lg:block"
      )}
    >
      <div className="p-5 flex justify-between items-center">
        <h3 className="text-lg font-semibold capitalize  underline decoration-primary">
          {activeTab}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onHideDialer}
          className="lg:hidden"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col"
      >
        <TabsList className=" flex justify-around w-full mt-2">
          <TabsTrigger value="dialpad" className="text-xs cursor-pointer">
            <BiDialpad className="text-primary " />
          </TabsTrigger>
          <TabsTrigger value="scripts" className="text-xs cursor-pointer">
            <CgTranscript className="text-primary" />
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs cursor-pointer">
            <FaReadme className="text-primary" />
          </TabsTrigger>
          <TabsTrigger value="followup" className="text-xs cursor-pointer">
            <FaHistory className="text-primary" />
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs cursor-pointer">
            <FaRegCalendarAlt className="text-primary" />
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="dialpad"
          className="flex-1 p-4 space-y-4 overflow-y-auto"
        >
          <DialerTab
            selectedLead={selectedLead}
            calledLeadIds={calledLeadIds}
            status={status}
            call={call}
            currentSession={currentSession}
            onCall={onCall}
            onHangup={onHangup}
            orgId={orgId}
          />
        </TabsContent>

        <TabsContent value="scripts" className="flex-1 p-4 overflow-y-auto">
          <CallScriptTab
            selectedLead={selectedLead}
            callScriptData={callScriptData}
            orgId={orgId}
          />
        </TabsContent>
        <TabsContent value="documents" className="flex-1 p-4 overflow-y-auto">
          <DocumentsTab campaignId={campaignId} orgId={orgId} />
        </TabsContent>

        <TabsContent value="followup" className="flex-1 p-4 overflow-y-auto">
          <FollowUpTab
            onLeadSelect={(lead) => {
              setLead(lead);
              setActiveTab("dialpad");
            }}
            orgId={orgId}
          />
        </TabsContent>

        <TabsContent value="calendar" className="flex-1 p-4 overflow-y-auto">
          <CalendarTab lead={selectedLead} orgId={orgId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
