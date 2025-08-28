"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import LeadDistributionChart from "./LeadDistributionChart";
import DashboardStatsCard from "./DashboardStatsCard";
import { useDashboard } from "@/context/DashboardProvider";
import PageHeader from "@/components/ui/layout/PageHeader";
import CreateBroadcastDialog from "./CreateBroadcastDialog";
import { UserRoundPlus } from "lucide-react";
import DashboardTeamPerfomance from "./admin-page/DashboardTeamPerfomance";
import DashboardRecentActivities from "./admin-page/DashboardRecentActivities";
import MonthlyTarget from "./admin-page/MonthlyTarget";
import TeamBroadCasts from "./admin-page/TeamBroadCasts";
import { useEffect } from "react";
import { useTeamContext } from "@/context/TeamProvider";
import useSWR, { mutate } from "swr";
import InviteUserDialog from "./admin-page/InviteUserDiaglog";
import { UserRoundCog } from "lucide-react";

export default function Dashboard() {
  const { activities, leadCounts, adminDashboardStats } = useDashboard();
  const { orgId } = useTeamContext();
  const [showDialog, setShowDialog] = useState(false);
  const [teams, setTeams] = useState(adminDashboardStats?.teams || []);
  const [selectedTeam, setSelectedTeam] = useState("");

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data: broadcasts } = useSWR(
    orgId ? `/api/org/${orgId}/broadcasts` : null,
    fetcher
  );

  const handleSend = async (payload) => {
    try {
      await fetch(`/api/org/${orgId}/broadcasts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      mutate(`/api/org/${orgId}/broadcasts`); // Re-fetch the broadcasts
    } catch (error) {
      console.error("Error sending broadcast:", error);
    }
  };
  //  console.log("teams", teams);
  // console.log("broadcasts", broadcasts);
  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex justify-between">
        <PageHeader
          title="Dashboard"
          description="Track and manage your leads and team performance"
          icon="LayoutDashboard"
        />
        <div className="flex gap-2 ">
          <Button onClick={() => setShowDialog(true)}>
            <Send /> Send Broadcast
          </Button>
          <InviteUserDialog
            teams={teams}
            orgId={orgId}
            trigger={
              <Button size="icon">
                <UserRoundPlus className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>
      <div className="space-y-6">
        {/* Stats Cards */}
        <DashboardStatsCard />
        {/* Main Content - Restructured Layout */}
        <div className="grid gap-6">
          {/* Team Performance (2 spans) and Side Components (1 span) */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Team Performance - Takes 2 columns */}
            <div className="md:col-span-2 space-y-6">
              <DashboardTeamPerfomance
                teams={teams}
                onSelectTeam={setSelectedTeam}
                setShowDialog={setShowDialog}
              />
              <TeamBroadCasts
                broadcasts={broadcasts}
                setShowDialog={setShowDialog}
              />
            </div>
            {/* Right sidebar - Takes 1 column */}
            <div className="space-y-6">
              <LeadDistributionChart leadCounts={leadCounts} />
              <DashboardRecentActivities activities={activities} />
              {/* <MonthlyTarget /> */}
            </div>
          </div>
        </div>
      </div>
      <CreateBroadcastDialog
        isOpen={showDialog}
        onClose={() => {
          setShowDialog(false);
          setSelectedTeam(null); // single source of truth
        }}
        onSend={handleSend}
        teams={teams}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
      />
    </div>
  );
}
