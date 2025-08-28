"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users2 } from "lucide-react";
import { EnhancedLeadsTableTanStack } from "./EnhancedLeadsTableTanStack";
import LeadsStatCards from "./LeadsStatCards";
// Provider
import { useLeads } from "@/context/LeadsProvider";
import { useTeamContext } from "@/context/TeamProvider";
import PageHeader from "@/components/ui/layout/PageHeader";

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
    <div className="space-y-6 px-4 py-6">
      {/* Header */}
      <PageHeader 
        title="Leads"
        description="Manage, import and track your sales leads"
        icon="Users2"
      />
     

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
