"use server";
import prisma from "../prisma";

export async function getUserSettings(userId, orgId) {
  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
      orgId: orgId,
    },
    include: {
      organization: {
        include: {
          tierSettings: true,
          users: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              role: true,
              imageUrl: true,
              orgId: true,
              clerkId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          orgIntegrations: {
            include: {
              calendly: true,
              twilio: true,
              make: true,
              zoom: true,
              blandAi: true,
            },
          },
        },
      },
      userSettings: true,
      teamMemberships: {
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
              manager: true, // if you kept the manager relationship
            },
          },
        },
      },
      managedTeams: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true,
                  role: true,
                  imageUrl: true,
                  orgId: true,
                  clerkId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return user || null;
}

export async function getUserCampaigns(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return null;
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      orgId: user.orgId,
    },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true,
                  role: true,
                  imageUrl: true,
                },
              },
            },
          },
          manager: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      },
      organization: true,
    },
  });

  return campaigns;
}

export async function getAllCampaigns(userId) {
  const validatedUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      role: true,
    },
  });

  if (validatedUser.role === "Agent") {
    return;
  }

  const campaigns = await prisma.campaign.findMany({
    include: {
      team: true,
      leads: true,
    },
  });

  return campaigns;
}

export async function getCampaign(campaignId) {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          members: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true,
                  role: true,
                  imageUrl: true,
                  _count: {
                    select: {
                      assignedLeads: true,
                    },
                  },
                },
              },
            },
          },
          manager: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      },
      organization: true,
      leads: {
        include: {
          activities: true,
        },
      },
    },
  });
  return campaign;
}

export async function getAllLeads() {
  const leads = await prisma.lead.findMany({
    include: {
      campaign: {
        include: {
          team: {
            include: {
              members: true, // This gets the actual User data
            },
          },
        },
      },
      assignedUser: {
        select: {
          firstname: true,
          lastname: true,
          imageUrl: true,
        },
      },
    },
  });
  return leads;
}


export async function getTeamAndMembers(userId, teamId) {
  // First get the user's MongoDB ID using their clerkId (unchanged Clerk logic)
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify the user has access to this team
  const teamMembership = await prisma.teamMember.findFirst({
    where: {
      userId: user.id, // Using the MongoDB user ID
      teamId: teamId,
    },
  });

  if (!teamMembership) {
    throw new Error("User doesn't have access to this team");
  }

  // Get the team data
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      manager: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          imageUrl: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              role: true,
              imageUrl: true,
              _count: {
                select: {
                  assignedLeads: true,
                },
              },
            },
          },
        },
      },
      campaigns: {
        select: {
          id: true,
          name: true,
          updatedAt: true,
          createdAt: true,
          status: true,
          _count: {
            select: {
              leads: true,
            },
          },
        },
      },
    },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  // Alternative to members: undefined - create a new object without the members property
  const { members: _, ...teamData } = team;

  return {
    team: teamData, // team without members array
    members: team.members.map((member) => ({
      ...member.user,
      teamMemberId: member.id,
    })),
    campaigns: team.campaigns,
  };
}

export async function getUserTeamsWithMembers(userId) {
  // Get user with all their teams and members
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      teamMemberships: {
        include: {
          team: {
            include: {
              manager: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true,
                  imageUrl: true,
                },
              },
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstname: true,
                      lastname: true,
                      email: true,
                      role: true,
                      imageUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) throw new Error("User not found");
  if (!user.teamMemberships?.length) return [];

  // Transform each team
  return user.teamMemberships.map(({ team }) => {
    const { members, ...teamData } = team;

    return {
      team: teamData,
      members: members.map((member) => ({
        ...member.user,
        teamMemberId: member.id, // Include the junction table ID
      })),
    };
  });
}

export async function getCallScriptDetails(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      firstname: true,
      id: true,
      organization: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    firstName: user.firstname,
    organizationName: user.organization?.name,
    id: user.id,
  };
}

export async function getOrgUsers(userId) {
  // Find the user's organization
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { orgId: true },
  });

  if (!user) return null;

  // Get complete organization data with users and teams
  return await prisma.organization.findUnique({
    where: { id: user.orgId },
    select: {
      id: true,
      name: true,
      users: {
        select: {
          id: true,
          clerkId: true,
          firstname: true,
          lastname: true,
          email: true,
          role: true,
          imageUrl: true,
          createdAt: true,
          teamMemberships: {
            select: {
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          managedTeams: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ role: "asc" }, { firstname: "asc" }],
      },
      teams: {
        select: {
          id: true,
          name: true,
          manager: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function getCampaignUsers(campaignId) {
  const users = await prisma.user.findMany({
    where: {
      team: {
        campaigns: {
          some: {
            id: campaignId,
          },
        },
      },
    },
  });

  return users;
}






export async function getOrgAgentDashboardStats(userId, orgId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({
    where: { 
      clerkId: userId,
      orgId: orgId
     },
    include: {
      _count: {
        select: {
          assignedLeads: true,
        },
      },
      callSessions: {
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        select: {
          id: true,
          totalCalls: true,
          successfulCalls: true,
          createdAt: true,
        },
        take: 1,
      },
      activities: {
        orderBy: { timestamp: "desc" },
        take: 50,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              company: true,
              status: true,
            },
          },
          callSession: {
            select: {
              id: true,
            },
          },
        },
      },
      teamMemberships: {
        include: {
          team: {
            include: {
              campaigns: true,
              manager: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true,
                  imageUrl: true,
                },
              },
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstname: true,
                      lastname: true,
                      role: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Calculate stats from the fetched data
  const totalFollowUps = await prisma.followUp.count({
    where: {
      lead: {
        assignedUserId: user.id,
      },
    },
  });

  const overdueFollowUps = await prisma.followUp.count({
    where: {
      lead: {
        assignedUserId: user.id,
      },
      completed: false,
      dueDate: {
        lt: new Date(),
      },
    },
  });

  const followUpsDueToday = await prisma.followUp.count({
    where: {
      lead: {
        assignedUserId: user.id,
      },
      completed: false,
      dueDate: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  const todaySession = user.callSessions[0] || null;

  // Get the primary team (assuming first team or you can add logic to determine primary team)
  const primaryTeam = user.teamMemberships[0]?.team || null;

  // Get all teams the user is a member of
  const allTeams = user.teamMemberships.map((membership) => membership.team);

  return {
    // Lead data
    leads: {
      total: user._count.assignedLeads,
    },

    // Follow-up data
    followUps: {
      total: totalFollowUps,
      overdue: overdueFollowUps,
      dueToday: followUpsDueToday,
    },

    // Today's call session
    todayCallSession: todaySession,

    // Recent activities
    recentActivities: user.activities,

    // Primary team and campaign information
    team: primaryTeam,
    allTeams: allTeams,
    campaigns: primaryTeam?.campaigns || [],

    // Quick metrics for dashboard cards
    dashboardMetrics: {
      assignedLeads: user._count.assignedLeads,
      callsToday: todaySession?.totalCalls || 0,
      successfulCallsToday: todaySession?.successfulCalls || 0,
      followUpsOverdue: overdueFollowUps,
      teamInformation: {
        teamName: primaryTeam?.name,
        managerName: primaryTeam?.manager
          ? `${primaryTeam.manager.firstname} ${primaryTeam.manager.lastname}`
          : null,
        managerImageUrl: primaryTeam?.manager?.imageUrl || null,
        teamMemberCount: primaryTeam?.members?.length || 0,
        campaignCount: primaryTeam?.campaigns?.length || 0,
        totalTeams: allTeams.length,
      },
    },
  };
}

export async function getUserTrainingData(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  const training = await prisma.training.findMany({
    where: { user: { id: user.id } },
  });

  return {
    user: {
      id: user.id,
      clerkId: user.clerkId,
      imageUrl: user.imageUrl,
      firstname: user.firstname,
      // Add any other user fields you need
    },
    training,
  };
}

export async function getUserAvatar(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      firstname: true,
      imageUrl: true,
    },
  });
  return user;
}

export async function getUserNotifications(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
  });

  return notifications;
}

export async function getTeamData(userId) {
  // Get user (simple check)
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  // Get teams with members and campaigns
  const teams = await prisma.team.findMany({
    where: { managerId: user.id },
    include: {
      manager: true,
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              role: true,
              imageUrl: true,
              _count: { select: { assignedLeads: true } },
            },
          },
        },
      },
      campaigns: {
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          type: true,
          _count: { select: { leads: true } },
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          users: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              imageUrl: true,
              email: true,
              role: true,
              teamMemberships: {
                select: {
                  teamId: true,
                  userId: true,
                },
              },
              _count: { select: { assignedLeads: true } },
            },
          },
          campaigns: {
            select: {
              id: true,
              name: true,
              teamId: true,
            },
          },
        },
      },
    },
  });

  return {
    user,
    teams,
    orgMembers: teams[0]?.organization?.users || [], // Return all org members from first team
  };
}

export async function getAllOrgLeads(userId) {
  try {
    const userOrgId = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { orgId: true },
    });

    // Check if user exists and has an organization
    if (!userOrgId || !userOrgId.orgId) {
      return [];
    }

    const leads = await prisma.lead.findMany({
      where: { orgId: userOrgId.orgId },
      include: { assignedUser: true },
      orderBy: { createdAt: "desc" },
    });

    return leads;
  } catch (error) {
    console.error("Error fetching organization leads:", error);
    return []; // Return empty array on error
  }
}

export async function getTeamLeads(userId) {
  // First, get the user with their team memberships
  const userWithTeamMemberships = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      teamMemberships: {
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: true, // Include user details for each team member
                },
              },
            },
          },
        },
      },
    },
  });

  if (
    !userWithTeamMemberships ||
    !userWithTeamMemberships.teamMemberships.length
  ) {
    throw new Error("User or team not found");
  }

  // Extract all team member USER IDs from all teams the user belongs to
  const teamMemberIds = [];

  userWithTeamMemberships.teamMemberships.forEach((membership) => {
    membership.team.members.forEach((member) => {
      teamMemberIds.push(member.userId);
    });
  });

  // Remove duplicates in case user is in multiple teams with overlapping members
  const uniqueTeamMemberIds = [...new Set(teamMemberIds)];

  // Now fetch all leads assigned to any team member
  const teamLeads = await prisma.lead.findMany({
    where: {
      assignedUserId: {
        in: uniqueTeamMemberIds, // Leads assigned to any team member
      },
    },
    include: {
      assignedUser: true, // Include assignee details
      campaign: true, // Include campaign details if needed
    },
    orderBy: {
      createdAt: "desc", // Optional: order by creation date
    },
  });

  return { teamLeads: teamLeads };
}



export async function getUserCampaignTrainingData(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      orgId: true,
      teamMemberships: {
        select: {
          team: {
            select: {
              campaigns: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  training: {
                    include: {
                      scenarios: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  // flatten and dedupe by campaign.id
  const campaigns = [
    ...new Map(
      user.teamMemberships
        .flatMap((tm) => tm.team.campaigns)
        .map((c) => [c.id, c]) // Map key = campaign.id
    ).values(),
  ];

  return {
    orgId: user.orgId,
    campaigns, // [{ id, name, type }, …]
  };
}

export async function getCampaignTrainingData(userId) {
  const training = await prisma.campaign.findFirst({
    where: {
      team: {
        members: {
          some: {
            user: { clerkId: userId },
          },
        },
      },
    },
    select: {
      organization: {
        select: {
          campaigns: {
            select: {
              training: true,
            },
          },
        },
      },
      training: {
        select: {
          scenarios: true,
        },
      },
    },
  });

  return training;
}

export async function getBlandAiData(userId, orgId) {
  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
      orgId: orgId,
    },
    select: {
      organization: {
        select: {
          orgIntegrations: {
            select: {
              blandAi: true,
            },
          },
        },
      },
    },
  });
  return user.organization.orgIntegrations.blandAi || null;
}

export async function getTrainingById(trainingId, orgId) {
  const training = await prisma.campaignTraining.findFirst({
    where: {
      id: trainingId,
      campaign: {
        orgId: orgId,
      },
    },
    include: {
      campaign: {
        select: {
          name: true,
        },
      },
      scenarios: true,
      _count: {
        select: {
          trainingSessions: true,
        },
      },
    },
  });
  return training;
}
