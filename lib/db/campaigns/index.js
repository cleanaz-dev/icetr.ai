"use server";

import prisma from "@/lib/prisma";

export async function getOrgCampaignDocuments(clerkId, orgId) {
  const query = await prisma.organization.findMany({
    where: {
      id: orgId,
      users: {
        some: {
          clerkId: clerkId,
        },
      },
    },
    select: {
      campaigns: {
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
      },
    },
  });
  return query.flatMap((o) => o.campaigns);
}

export async function getCampaignById(orgId, campaignId) {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
      orgId: orgId,
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          members: {
            select: {
              id: true,
              teamRole: true,
              user: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  fullname: true,
                  imageUrl: true,
                  email: true,
                  activities: true,
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
      leads: {
        select: {
          assignedUserId: true,
          activities: {
            select: {
              id: true,
              type: true,
              content: true,
              timestamp: true,
              createdUser: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  fullname: true,
                  imageUrl: true,
                  email: true,
                  activities: true,
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
      training: true,
      callSessions: true,
      _count: {
        select: {
          leads: true,
        },
      },
    },
  });
  return campaign;
}

export async function validateCampaignExists(campaignId) {
  await prisma.campaign.findUniqueOrThrow({
    where: {
      id: campaignId,
    },
  });
}


export async function  validateCampaignBelongsToOrg(campaignId, orgId) {
  await prisma.campaign.findUniqueOrThrow({
    where: {
      id: campaignId,
      orgId: orgId,
    },
  });
}