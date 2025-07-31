"use client";

import React, { useState } from "react";
import {
  Users,
  Crown,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Target,
  Calendar,
  TrendingUp,
  Flag,
  Handshake,
  ExternalLink,
  User,
  ContactRound,
  Phone,
} from "lucide-react";
import CreateTeamDialog from "./CreateTeamDialog";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import AddTeamMemberDialog from "./AddTeamMemberDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AssignCampaignDialog from "./AssignCampaignDialog";
import UnassignCampaignDialog from "./UnassignCampaignDialog";
import EditTeamDialog from "./EditTeamDialog";
import Link from "next/link";
import DeleteTeamDialog from "./DeleteTeamDialog";
import { BatchAssignTeamLeads } from "./BatchAssignTeamLeads";
import PermissionGate from "@/components/auth/PermissionGate";
import { getRoleIcon, getCampaignType } from "@/lib/utils";
import { toast } from "sonner";
// Context/Providers
import { useTeamContext } from "@/context/TeamProvider";
import { useLeads } from "@/context/LeadsProvider";

export default function TeamsPage() {
  const {
    teams,
    orgMembers,
    orgId,
    assignCampaign,
    unassignCampaign,
    setTeams,
    updateTeam,
    deleteTeam,
    createTeam,
    orgCampaigns,
  } = useTeamContext();
  const { leads } = useLeads();

  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [selectedTeam, setSelectedTeam] = useState(null);

  const { user } = useUser();

  const toggleTeamExpansion = (teamId) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const handleAssignLeads = async (leadIds, memberId, assignerId) => {
    const response = await fetch(`/api/org/${orgId}/leads/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadIds, memberId, assignerId }),
    });

    if (!response.ok) {
      throw new Error("Failed to assign leads");
    }

    return response.json();
  };

  const unassignedLeads = leads.filter((lead) => !lead.assignedUser);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl md:text-3xl font-bold text-foreground">
                <span>
                  <Handshake className="text-primary" />
                </span>
                Teams
              </h1>
              <p className="text-muted-foreground">
                Manage your teams, members, and campaigns
              </p>
            </div>
            {teams.length > 0 && (
              <CreateTeamDialog orgId={orgId} onCreate={createTeam} />
            )}
          </div>
        </div>

        {/* Teams List */}
        <div className="space-y-6">
          {teams.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border-2 border-dashed border-primary">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No teams yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first team to get started with organizing your
                campaigns and members.
              </p>
              <PermissionGate permission="team.create">
                <CreateTeamDialog orgId={orgId} onCreate={createTeam} />
              </PermissionGate>
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className="bg-card rounded-lg border overflow-hidden"
              >
                {/* Team Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleTeamExpansion(team.id)}
                        className="flex items-center gap-3 group"
                      >
                        {expandedTeams.has(team.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                        )}

                        <div className="text-left">
                          <h3 className="text-xl font-semibold text-primary group-hover:text-blue-600 transition-colors">
                            {team.name}
                          </h3>
                          <p className="text-muted-foreground text-xs sm:text-sm">
                            {team.description}
                          </p>
                        </div>
                      </button>
                      <Link href={`/teams/${team.id}`}>
                        <ExternalLink className="size-4 -mr-1 text-muted-foreground hover:text-primary hover:scale-105 transition-all duration-200" />
                      </Link>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span className="text-foreground">
                              {team.members?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span className="text-foreground">
                              {team.campaigns?.length || 0}{" "}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <PermissionGate permission="lead.assign">
                          <BatchAssignTeamLeads
                            teamId={team.id}
                            leads={unassignedLeads}
                            onAssign={handleAssignLeads}
                          />
                        </PermissionGate>
                        <PermissionGate permission="team.assign">
                          <AddTeamMemberDialog
                            onClose={() => setIsDialogOpen(false)}
                            team={team}
                            members={orgMembers}
                            orgId={orgId}
                            onAddMember={(newMembers) =>
                              setOrgMembers((prev) => [...prev, ...newMembers])
                            }
                          />
                        </PermissionGate>
                        <PermissionGate permission="team.update">
                          <EditTeamDialog
                            onEdit={updateTeam}
                            team={team}
                            orgId={orgId}
                          />
                        </PermissionGate>
                        <PermissionGate permission="team.delete">
                          <DeleteTeamDialog
                            team={team}
                            orgId={orgId}
                            onDelete={deleteTeam}
                          />
                        </PermissionGate>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedTeams.has(team.id) && (
                  <div className="overflow-hidden transition-all duration-500 ease-in-out animate-in slide-in-from-top">
                    <div className="p-6 bg-muted">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Team Members */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              Team Members ({team.members?.length || 0})
                            </h4>
                          </div>

                          <div className="space-y-2">
                            {team.members?.length > 0 ? (
                              team.members.map(({ id, user }, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-card rounded-lg border"
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage src={user?.imageUrl} />
                                      <AvatarFallback>
                                        {(user?.firstname?.[0] || "") +
                                          (user?.lastname?.[0] || "") || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="flex gap-2 items-center text-sm font-medium text-foreground">
                                        {`${user?.firstname || ""} ${
                                          user?.lastname || ""
                                        }`.trim() || user?.email}
                                        {getRoleIcon(user?.role.type)}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {user?.email}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Leads: {user?._count?.assignedLeads || 0}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 rounded-lg border-2 border-dashed border-muted-foreground">
                                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-muted-foreground text-sm">
                                  No members yet
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Associated Campaigns */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                              <Target className="w-5 h-5" />
                              Assigned Campaigns ({team.campaigns?.length || 0})
                            </h4>
                            {/* Add campaign assignment button */}
                            <PermissionGate permission="campaign.update">
                              <AssignCampaignDialog
                                teamId={team.id}
                                campaigns={orgCampaigns}
                                orgId={orgId}
                                handleAssign={assignCampaign}
                                onSuccess={() =>
                                  toast.success("Campaign Assigned")
                                }
                              />
                            </PermissionGate>
                          </div>

                          <div className="space-y-3">
                            {team.campaigns?.length > 0 ? (
                              team.campaigns.map((campaign) => (
                                <div
                                  key={campaign.id}
                                  className="p-4 bg-card rounded-lg border"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-2 items-center">
                                      {" "}
                                      <h5 className="font-medium decoration-1.5 underline decoration-primary">
                                        {campaign.name}
                                      </h5>
                                      <Link href={`/campaigns/${campaign.id}`}>
                                        <ExternalLink className="size-4" />
                                      </Link>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Unassign button */}
                                      <PermissionGate permission="campaign.update">
                                        <UnassignCampaignDialog
                                          teamId={team.id}
                                          campaign={campaign}
                                          handleUnassign={unassignCampaign}
                                          onSuccess={() =>
                                            toast.success("Campaign Unassigned")
                                          }
                                          orgId={orgId}
                                        />
                                      </PermissionGate>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {campaign.description}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-primary" />
                                      <span>
                                        Created{" "}
                                        {campaign.createdAt
                                          ? new Date(
                                              campaign.createdAt
                                            ).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                            })
                                          : "Unknown"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="w-3 h-3 text-primary" />
                                      <span>
                                        {campaign._count.leads || 0} leads
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {getCampaignType(campaign.type)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Flag className="w-3 h-3 text-primary" />
                                      <span>{campaign.status}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 rounded-lg border-2 border-dashed border-muted-foreground">
                                <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-muted-foreground text-sm mb-3">
                                  No campaigns assigned to this team
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
