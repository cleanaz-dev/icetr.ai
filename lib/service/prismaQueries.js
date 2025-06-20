"use server";
import prisma from "./prisma";

export async function getUserSettings(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organization: {
        include: {
          users: true, // <- include users inside organization
        },
      },
      userSettings: true,
    },
  });

  return user || null;
}

export async function getUserCampaigns(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  const campaigns = await prisma.campaign.findMany({
    where: {
      users: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      users: true,
      organization: true,
    },
  });

  return campaigns || null;
}

export async function getCampaign(campaignId) {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
    include: {
      users: {
        select: {
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
          users: {
            include: {
              user: true, // This gets the actual User data
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

export async function getLeadsForUser(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  const leads = await prisma.lead.findMany({
    where: { assignedUserId: user.id },
  });
  return leads;
}

export async function getCampaignDocuments(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  const campaigns = await prisma.campaign.findMany({
    where: {
      users: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      documents: {
        include: {
          uploader: {
            select: {
              firstname: true,
              lastname: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });
  return campaigns;
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

export async function getOrgUsers(userId, campaignId) {
  // Find the organization first
  const org = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { orgId: true },
  });

  if (!org) return [];

  // Get users not in campaign in one query
  return await prisma.user.findMany({
    where: {
      organizationId: org.organizationId,
      clerkId: { not: userId },
      NOT: {
        campaigns: {
          some: {
            id: campaignId,
          },
        },
      },
    },
    select: {
      id: true,
      clerkId: true,
      firstname: true,
      lastname: true,
      email: true,
      role: true,
      imageUrl: true,
    },
  });
}

export async function getCampaignUsers(campaignId) {
  const users = await prisma.user.findMany({
    where: {
      campaigns: {
        some: { campaignId },
      },
    },
  });

  return users;
}

export async function getAllRecentActivity() {
  const activities = await prisma.leadActivity.findMany({
    select: {
      id: true,
      type: true,
      content: true,
      createdAt: true,
      createdUser: {
        select: {
          id: true,
          firstname: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });
  return activities;
}

export async function getAllLeadsAndStatus() {
  const result = await prisma.lead.groupBy({
    by: ["status"],
    _count: {
      _all: true,
    },
  });

  // Default all counts to 0 and only override what exists in the result
  const counts = {
    newCount: 0,
    contactedCount: 0,
    qualifiedCount: 0,
    wonCount: 0,
    lostCount: 0,
    totalCount: 0,
  };

  result.forEach(({ status, _count }) => {
    switch (status) {
      case "New":
        counts.newCount = _count._all;
        break;
      case "Contacted":
        counts.contactedCount = _count._all;
        break;
      case "Qualified":
        counts.qualifiedCount = _count._all;
        break;
      case "Won":
        counts.wonCount = _count._all;
        break;
      case "Lost":
        counts.lostCount = _count._all;
        break;
    }
    counts.totalCount += _count._all; // Accumulate total count
  });

  return counts;
}

export async function getDashboardStats(orgId) {
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
  console.log(totalLeads);
  console.log(leadChange);
  console.log(conversionRate);
  console.log(totalMembers);
  console.log(memberChange);
  console.log(avgConversionTime);
  return {
    totalLeads,
    leadChange,
    conversionRate,
    totalMembers,
    memberChange,
    avgConversionTime: parseFloat(avgConversionTime.toFixed(1)),
  };
}

export async function getOrgId(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { orgId: true },
  });

  return user.orgId;
}

export async function getUserRole(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      role: true,
    },
  });
  return user.role.toLocaleLowerCase();
}

export async function getAgentDashboardStats(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      // Get count of assigned leads
      _count: {
        select: {
          assignedLeads: true,
        },
      },

      // Get today's call session only
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

      // Get recent activities across all leads
      activities: {
        orderBy: { timestamp: "desc" },
        take: 50, // Latest 50 activities
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

      // Get campaigns the user is part of
      campaigns: {
        include: {
          campaign: {
            include: {
              _count: {
                select: {
                  leads: true,
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

    // Campaign data
    campaigns: user.campaigns.map((cu) => ({
      ...cu.campaign,
      userRole: cu.role, // if you have role in CampaignUser
    })),

    // Quick metrics for dashboard cards
    dashboardMetrics: {
      assignedLeads: user._count.assignedLeads,
      callsToday: todaySession?.totalCalls || 0,
      successfulCallsToday: todaySession?.successfulCalls || 0,
      followUpsOverdue: overdueFollowUps,
      activeCampaigns: user.campaigns.length,
    },
  };
}
