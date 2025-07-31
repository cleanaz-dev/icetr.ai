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
  addMemberToTeam: () => {},
  assignCampaign: () => {},
  unassignCampaign: () => {},
  updateTeam: () => {},
  deleteTeam: () => {},
  createTeam: () => {},
  getTeamByTeamId: () => [],
  getTeamMembersByTeamId: () => [],
  getLeadsByTeamId: () => [],
  filterLeadsByTeamId: () => [],
  filterCampaignsByTeamId: () => []
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

  const addMemberToTeam = (teamId, newMember) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? { ...team, members: [...team.members, newMember] }
          : team
      )
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

      const { message, newTeam, newTeamMembers } = await response.json();

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

  const getTeamMembersByTeamId = (teamId) => {
    return teamMembers.filter((tm) => tm.teamId === teamId);
  };

  const getTeamByTeamId = (teamId) => {
    return teams.find(t => t.id === teamId);
  };

const filterLeadsByTeamId = (leads, teamId) => {
  if (!teamId || !leads) return leads;
  
  return leads.filter(lead => {
    // Check if the assigned user has team memberships
    if (!lead.assignedUser?.teamMemberships) return false;
    
    // Check if any of the user's team memberships match the teamId
    return lead.assignedUser.teamMemberships.some(
      membership => membership.teamId === teamId
    );
  });
}
const filterCampaignsByTeamId = (teamId) => {
  return orgCampaigns.filter(c => c.teamId === teamId)
}
 
  const value = useMemo(
    () => ({
      teams,
      orgId,
      orgMembers,
      teamMembers,
      setTeams,
      editTeam,
      addMemberToTeam,
      assignCampaign,
      unassignCampaign,
      updateTeam,
      deleteTeam,
      createTeam,
      getTeamByTeamId,
      getTeamMembersByTeamId,
      orgCampaigns,
      teamLeads,
      filterLeadsByTeamId,
      filterCampaignsByTeamId
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
