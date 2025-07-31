"use server";

import prisma from "@/lib/services/prisma";

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
  return query.flatMap(o => o.campaigns);
}
