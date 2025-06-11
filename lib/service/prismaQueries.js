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
    select: { orgId: true }
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
            id: campaignId
          }
        }
      }
    },
    select: {
      id: true,
      clerkId: true,
      firstname: true,
      lastname: true,
      email: true,
      role: true,
      imageUrl: true
    }
  });
}

export async function getCampaignUsers(campaignId) {
const users = await prisma.user.findMany({
  where: {
    campaigns: {
      some: { campaignId }
    }
  },
});

  return users
}