"use client";

import { createContext, useContext, useMemo, useState } from "react";

// 1. Default context shape (useful for autocomplete and safety)
const TeamContext = createContext({
  teams: [],
  orgId: null,
  orgMembers: [],
  teamMembers: [],
  orgCampaigns: [],
  teamLeads: [],
  setTeams: () => {},
  editTeam: () => {},
  editMemberRole: () => {},
  addMemberToTeam: () => {},
  assignCampaign: () => {},
  unassignCampaign: () => {},
  updateTeam: () => {},
  deleteTeam: () => {},
  createTeam: () => {},
  removeMember: () => {},
  getTeamByTeamId: () => [],
  getTeamMembersByTeamId: () => [],
  getLeadsByTeamId: () => [],
  getTeamRole: () => [],
  filterLeadsByTeamId: () => [],
  filterCampaignsByTeamId: () => [],
  assignLeadsToTeamMember: () => {},
});

// 2. Provider with memoized value
export const TeamProvider = ({ children, initialData = {} }) => {
  const {
    initialTeams = [],
    orgId = null,
    orgMembers = [],
    initialTeamMembers = [],
    orgCampaigns = [],
    teamLeads = [],
  } = initialData;

  const [teams, setTeams] = useState(initialTeams);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);

  const unassignCampaign = async (teamId, campaignId, orgId) => {
    try {
      const result = await fetch(
        `/api/org/${orgId}/teams/${teamId}/unassign-campaign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            campaignId: campaignId,
          }),
        }
      );

      if (!result.ok) {
        const { message } = await result.json();
        throw new Error(message || "Failed to unassign campaign");
      }

      const { message, campaignId: unassignedCampaignId } = await result.json();

      // Update the teams state to remove the campaign from the team
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === teamId
            ? {
                ...team,
                campaigns:
                  team.campaigns?.filter(
                    (c) => c.id !== unassignedCampaignId
                  ) ?? [],
              }
            : team
        )
      );

      return { success: true, message };
    } catch (error) {
      throw new Error(
        error.message || "An error occurred while unassigning campaign"
      );
    }
  };

  const assignCampaign = async (teamId, campaignId, orgId) => {
    try {
      const result = await fetch(
        `/api/org/${orgId}/teams/${teamId}/assign-campaign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            campaignId: campaignId,
          }),
        }
      );

      if (!result.ok) {
        const { message } = await result.json();
        throw new Error(message || "Failed to unassign campaign");
      }

      const { message, campaign: newCampaign } = await result.json();

      // Update the teams state to remove the campaign from the team
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === teamId
            ? {
                ...team,
                campaigns: [...(team.campaigns || []), newCampaign],
              }
            : team
        )
      );

      return { success: true, message };
    } catch (error) {
      throw new Error(
        error.message || "An error occurred while unassigning campaign"
      );
    }
  };

  const editTeam = (updatedTeam) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
    );
  };

  const addMemberToTeam = async (orgId, teamId, selectedMembers) => {
    const response = await fetch(`/api/org/${orgId}/teams/${teamId}/members`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        users: selectedMembers,
        teamId: teamId,
      }),
    });

    const { teamMembers } = await response.json();

    // 1. update the global teamMembers array
    setTeamMembers((prev) =>
      prev.filter((m) => m.teamId !== teamId).concat(teamMembers)
    );

    // 2. (optional) also update the teams array so each team has the latest members
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, members: teamMembers } : t))
    );
  };

  const updateTeam = async (teamId, updateData, orgId) => {
    try {
      const response = await fetch(`/api/org/${orgId}/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const { message, updatedTeam } = await response.json();

      if (!response.ok) {
        throw new Error(message || "Failed to update team");
      }

      // Update the teams state with the updated team data
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === teamId ? { ...team, ...updatedTeam } : team
        )
      );

      return { success: true, message, updatedTeam };
    } catch (error) {
      throw new Error(error.message || "An unexpected error occurred");
    }
  };

  const deleteTeam = async (teamId, orgId) => {
    try {
      const response = await fetch(`/api/org/${orgId}/teams/${teamId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { message } = await response.json();

      if (!response.ok) {
        throw new Error(message || "Failed to delete team");
      }
      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
      return { success: true, message };
    } catch (error) {
      throw new Error(error.message || "An error occurred while deleting team");
    }
  };

  const createTeam = async (teamData, orgId) => {
    try {
      const response = await fetch(`/api/org/${orgId}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamData),
      });

      const {
        message,
        team: newTeam,
        members: newTeamMembers = [],
      } = await response.json();

      if (!response.ok) {
        throw new Error(message || "Failed to create team");
      }

      setTeams((prevTeams) => [...prevTeams, newTeam]);
      setTeamMembers((prev) => [...prev, ...newTeamMembers]);

      return { success: true, message, team: newTeam };
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const editMemberRole = async (orgId, teamId, memberId, selectedRole) => {
    const response = await fetch(
      `/api/org/${orgId}/teams/${teamId}/members/${memberId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "editRole",
          teamRole: selectedRole,
        }),
      }
    );

    const { teamMembers, message } = await response.json();

    setTeamMembers((prev) =>
      prev.filter((m) => m.teamId !== teamId).concat(teamMembers)
    );

    // 2. (optional) also update the teams array so each team has the latest members
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, members: teamMembers } : t))
    );

    return { message };
  };

  const assignLeadsToTeamMember = async ({
    leadIds,
    assignToId,
    orgId,
    teamId,
    action,
  }) => {
    const res = await fetch(`/api/org/${orgId}/leads/teams/${teamId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadIds, assignToId, action }),
    });
    const { assignedMember, message } = await res.json();

    const freshTeam = await fetch(`/api/org/${orgId}/teams/${teamId}`).then(
      (r) => r.json()
    );
    setTeams((prev) => prev.map((t) => (t.id === teamId ? freshTeam : t)));

    return { assignedMember, message };
  };

const getTeamRole = (member) =>
  member?.teamMemberships?.[0]?.teamRole?.toLowerCase() || null;

  // inside TeamProvider
  const removeMember = async (orgId, teamId, memberId) => {
    const res = await fetch(
      `/api/org/${orgId}/teams/${teamId}/members/${memberId}`,
      {
        method: "DELETE",
      }
    );
    const { teamMembers } = await res.json();

    // 1. update the global teamMembers array
    setTeamMembers((prev) =>
      prev.filter((m) => m.teamId !== teamId).concat(teamMembers)
    );

    // 2. (optional) also update the teams array so each team has the latest members
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, members: teamMembers } : t))
    );
  };

  const getTeamMembersByTeamId = (teamId) => {
    return teamMembers.filter((tm) => tm.teamId === teamId);
  };

  const getTeamByTeamId = (teamId) => {
    return teams.find((t) => t.id === teamId);
  };

  const filterLeadsByTeamId = (leads, teamId) => {
    if (!teamId || !leads) return leads;

    return leads.filter((lead) => {
      // Check if the assigned user has team memberships
      if (!lead.assignedUser?.teamMemberships) return false;

      // Check if any of the user's team memberships match the teamId
      return lead.assignedUser.teamMemberships.some(
        (membership) => membership.teamId === teamId
      );
    });
  };
  const filterCampaignsByTeamId = (teamId) => {
    return orgCampaigns.filter((c) => c.teamId === teamId);
  };

  const value = useMemo(
    () => ({
      teams,
      orgId,
      orgMembers,
      teamMembers,
      setTeams,
      editTeam,
      assignLeadsToTeamMember,
      addMemberToTeam,
      editMemberRole,
      assignCampaign,
      unassignCampaign,
      updateTeam,
      deleteTeam,
      createTeam,
      removeMember,
      getTeamByTeamId,
      getTeamMembersByTeamId,
      getTeamRole,
      orgCampaigns,
      teamLeads,
      filterLeadsByTeamId,
      filterCampaignsByTeamId,
    }),
    [teams, orgId, orgMembers, teamMembers, orgCampaigns, teamLeads]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

// 3. Hook for using context
export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeamContext must be used within a TeamProvider");
  }
  return context;
};
