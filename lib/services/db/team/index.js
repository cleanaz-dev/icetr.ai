"use server";
import prisma from "@/lib/services/prisma";

/**
 * Fetches all users who are members of a specific team within an organization.
 *
 * @param {string} teamId - The ID of the team to get members from.
 * @param {string} orgId - The ID of the organization the team belongs to.
 * @returns {Promise<{ members: Array<Object> }>} An object containing an array of member user objects,
 * each with selected user fields: id, firstname, lastname, fullname, imageUrl, and role type.
 *
 * @throws {Error} Throws if the team is not found or query fails.
 */
export async function getTeamMembersByTeamId(teamId, orgId) {
  const data = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      orgId: true,
      members: {
        select: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              fullname: true,
              imageUrl: true,
              role: {
                select: {
                  type: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!data || data.orgId !== orgId) {
    throw new Error(
      `Team not found or does not belong to organization ${orgId}`
    );
  }

  return {
    members: data.members.map((m) => m.user),
  };
}

export async function getOrgTeamsMembersCampaings(userId, orgId) {
  const orgQuery = await prisma.organization.findFirst({
    where: {
      id: orgId,
      users: {
        some: {
          clerkId: userId,
        },
      },
    },
    include: {
      campaigns: {
       select: {
        id: true,
        teamId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        team: true,
        type: true,
        assignmentStrategy: true,
        _count: {
          select: {
            leads: true,
            
          }
        }
       }
      },
      users: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          imageUrl: true,
          role: {
            select: {
              type: true,
            },
          },
          _count: {
            select: {
              assignedLeads: true,
            },
          },
        },
      },
      teams: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              members: true,
              campaigns: true,
            },
          },

          campaigns: {
            select: {
              id: true,
              name: true,
              type: true,
              teamId: true,
              _count: {
                select: {
                  leads: true,
                },
              },
            },
          },
          members: {
            select: {
              teamId: true,
              user: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  fullname: true,
                  email: true,
                  imageUrl: true,
                  role: {
                    select: { type: true },
                  },
                  teamMemberships: {
                    select: {
                      teamId: true,
                      teamRole: true,
                    },
                  },
                  _count: {
                    select: {
                      assignedLeads: true,
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

  if (!orgQuery) {
    throw new Error("No teams found for user");
  }

  return {
    teams: orgQuery.teams,
    teamMembers: orgQuery.teams.flatMap((t) => t.members),
    orgCampaigns: orgQuery.campaigns,
    orgMembers: orgQuery.users,
  };
}

export async function getAssignedTeamsLeads(orgId) {
  const leadsQuery = await prisma.lead.findMany({
    where: {
      // Since leads already have orgId, this is more efficient
      orgId: orgId,
      assignedUserId: { not: null }, // Only get leads that are assigned
    },
    include: {
      assignedUser: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          fullname: true,
          imageUrl: true,
          _count: {
            select:{
              assignedLeads: true,
              Call: true,
            }
          },
          activities: {
            take: 5
          },
          teamMemberships: {
            select: {
              teamId: true,
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return leadsQuery;
}

export async function getTeamId(clerkId, orgId) {
  const query = await prisma.team.findFirst({
    where: {
      orgId: orgId,
      members: {
        some: {
          user: {
            clerkId: clerkId,
          },
        },
      },
    },
    select: {
      id: true,
    },
  });
  return { teamId: query.id };
}
