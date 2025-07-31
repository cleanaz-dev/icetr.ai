"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users2 } from "lucide-react";
import { EnhancedLeadsTableTanStack } from "./EnhancedLeadsTableTanStack";
import LeadsStatCards from "./LeadsStatCards";
// Provider
import { useLeads } from "@/context/LeadsProvider";
import { useTeamContext } from "@/context/TeamProvider";

export default function LeadsPage({
  members = [],
  teams,
  orgId,
}) {
  const { leads, addLead, deleteLead, updateLead, unassignLeads, assignLeads, importLeads } =
    useLeads();

  const { orgCampaigns: teamCampaigns } = useTeamContext();

  const [selectedLead, setSelectedLead] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);


  return (
    <div className="space-y-6 px-4 py-6 overflow-hidden">
      {/* Header */}
      <header className="">
        <div className="flex items-center gap-2">
          <div className="border-2 p-2 border-primary rounded-full">
            <Users2 className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        </div>
        <p className="text-muted-foreground">
          Manage and track your sales leads
        </p>
      </header>

      {/* Stats Cards */}
      <LeadsStatCards leads={leads} />

      <EnhancedLeadsTableTanStack
        leads={leads}
        teams={teams}
        members={members}
        teamCampaigns={teamCampaigns}
        orgId={orgId}
        assignLeads={assignLeads}
        unassignLeads={unassignLeads}
        importLeads={importLeads}
        deleteLead={deleteLead}
      />
    </div>
  );
}
