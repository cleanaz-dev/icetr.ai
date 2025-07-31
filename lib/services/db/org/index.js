"use server";
import prisma from "@/lib/services/prisma";
import { TrunkContextImpl } from "twilio/lib/rest/routes/v2/trunk";

/**
 * Returns the organization ID associated with a given user.
 * @param {string} userId - Clerk user ID.
 * @returns {Promise<string|null>} Organization ID if found, otherwise null.
 */
export async function getOrgId(userId) {
  const orgId = await prisma.organization.findFirst({
    where: {
      users: {
        some: {
          clerkId: userId,
        },
      },
    },
    select: {
      id: true,
    },
  });

  return orgId?.id ?? null;
}

/**
 * Returns an organization if the user is a member.
 * @param {string} userId - Clerk user ID.
 * @param {string} orgId - Organization ID to retrieve.
 * @returns {Promise<Object|null>} Organization object or null.
 */
export async function getAllOrgData(userId, orgId) {
  const org = await prisma.organization.findUnique({
    where: {
      id: orgId,
      users: {
        some: {
          clerkId: userId,
        },
      },
    },
  });
  return org;
}

/**
 * Returns all leads for the given organization.
 * @param {string} orgId - Organization ID.
 * @returns {Promise<Array>} Array of lead objects.
 */
export async function getAllOrgLeads(orgId) {
  const leads = await prisma.lead.findMany({
    where: {
      orgId: orgId,
    },
    include: {
      campaign: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedUser: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          fullname: true,
          imageUrl: true,
          email: true,
        }
      }
    },
  });
  return leads;
}

/**
 * Returns all teams in an organization and a flat array of their members.
 *
 * Each team includes its associated campaigns, but members are excluded from
 * the team objects and returned separately as a flat array of user objects.
 *
 * @param {string} orgId - Organization ID.
 * @returns {Promise<{
 *   teams: Array<Object>,
 *   members: Array<{
 *     id: string,
 *     firstname: string,
 *     lastname: string,
 *     email: string,
 *     imageUrl: string,
 *     teamMemberships: Array<{ teamId: string }>,
 *     role: { type: string }
 *   }>
 * }>} Teams and their members.
 */
export async function getOrgTeamsAndMembers(orgId) {
  const data = await prisma.team.findMany({
    where: {
      orgId: orgId,
    },
    include: {
      members: {
        select: {
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              imageUrl: true,
              teamMemberships: {
                select: {
                  teamId: true,
                },
              },
              role: {
                select: {
                  type: true,
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
          assignmentStrategy: true,
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return {
    teams: data.map(({ campaigns, ...rest }) => rest),
    members: data.flatMap((t) => t.members.map((u) => u.user)),
    teamCampaigns: data.flatMap((t) => t.campaigns),
  };
}

/**
 * Returns dashboard statistics for a given organization.
 *
 * Calculates key metrics including:
 * - Total number of leads
 * - Conversion rate (percentage of leads with status "Won")
 * - Total number of members (users)
 * - Average time to convert a lead (in days)
 * - Week-over-week change in lead count and member count
 *
 * @param {string} orgId - The ID of the organization to fetch stats for.
 * @returns {Promise<{
 *   totalLeads: number,
 *   leadChange: number,
 *   conversionRate: number,
 *   totalMembers: number,
 *   memberChange: number,
 *   avgConversionTime: number
 * }>} An object containing the organization's dashboard metrics.
 */

export async function getOrgDashboardStats(orgId) {
  // Get current time and calculate time ranges
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  // 1. Total Leads
  const totalLeads = await prisma.lead.count({
    where: { campaign: { organization: { id: orgId } } },
  });

  // 2. Conversion Rate
  const wonLeads = await prisma.lead.count({
    where: {
      status: "Won",
      campaign: { organization: { id: orgId } },
    },
  });
  const conversionRate =
    totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  // 3. Members (Users)
  const totalMembers = await prisma.user.count({
    where: { organization: { id: orgId } },
  });

  // 4. Average Time to Convert
  const convertedLeads = await prisma.lead.findMany({
    where: {
      status: "Won",
      campaign: { organization: { id: orgId } },
    },
    select: { createdAt: true, updatedAt: true },
  });

  let avgConversionTime = 0;
  if (convertedLeads.length > 0) {
    const totalDays = convertedLeads.reduce((sum, lead) => {
      const created = lead.createdAt;
      const converted = lead.updatedAt;
      const diffInMs = converted.getTime() - created.getTime();
      return sum + diffInMs / (1000 * 60 * 60 * 24);
    }, 0);
    avgConversionTime = totalDays / convertedLeads.length;
  }

  // 5. Week-over-week changes
  const lastWeekLeads = await prisma.lead.count({
    where: {
      campaign: { organization: { id: orgId } },
      createdAt: { lt: oneWeekAgo },
    },
  });

  const lastWeekMembers = await prisma.user.count({
    where: {
      organization: { id: orgId },
      createdAt: { lt: oneWeekAgo },
    },
  });

  // Calculate changes
  const leadChange =
    lastWeekLeads > 0
      ? Math.round(((totalLeads - lastWeekLeads) / lastWeekLeads) * 100)
      : 0;

  const memberChange = totalMembers - lastWeekMembers;

  return {
    totalLeads,
    leadChange,
    conversionRate,
    totalMembers,
    memberChange,
    avgConversionTime: parseFloat(avgConversionTime.toFixed(1)),
  };
}

/**
 * Fetches organization team data for a given user and organization.
 *
 * @param {string} userId - The Clerk user ID of the authenticated user.
 * @param {string} orgId - The organization ID to fetch teams and members from.
 * @returns {Promise<Object>} An object containing:
 *   - user: The user record with internal Prisma ID.
 *   - teams: An array of teams within the organization, including managers, members, campaigns, and organization info.
 *   - orgMembers: The list of all users in the organization (from the first team's organization).
 *
 * @throws {Error} Throws an error if the user is not found.
 */

export async function getOrgDataAndTeamData(userId, orgId) {
  // Validate user exists (or for permission)
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  // Fetch all teams for the org (no manager filter)
  const teams = await prisma.team.findMany({
    where: { orgId: orgId },
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
    orgMembers: teams[0]?.organization?.users || [],
  };
}


/**
 * Fetches all members (users) of a specific organization that the given user is part of.
 *
 * @param {string} userId - The Clerk user ID of the requesting user.
 * @param {string} orgId - The ID of the organization to fetch members from.
 * @returns {Promise<{ members: Array<Object> }>} An object containing an array of organization member objects.
 * Each member includes: id, firstname, lastname, imageUrl, email, role, team memberships, and assignedLeads count.
 *
 * @throws {Error} Throws if the organization is not found or the user is not part of it.
 */

export async function getOrgMembers(userId, orgId) {
  const data = await prisma.organization.findFirst({
    where: {
      id: orgId,
      users: {
        some: {
          clerkId: userId,
        },
      },
    },
    select: {
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
    },
  });

  if (!data) {
    throw new Error("Organization not found or user is not a member");
  }

  return {
    members: data.users,
  };
}