"use server";
import prisma from "@/lib/services/prisma";

/**
 * Fetches campaigns for a given organization where the specified user is a team member,
 * including the associated training data, scenarios, and a count of training sessions
 * filtered by the same user.
 *
 * @param {string} userId - The Clerk ID of the user to filter team membership and training sessions.
 * @param {string} orgId - The ID of the organization to filter campaigns.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of campaign objects,
 * each containing the campaign's name, id, training details including scenarios,
 * and a count of training sessions associated with the specified user.
 */

export async function getTrainingData(userId, orgId) {
  const campaignTrainingData = await prisma.campaign.findMany({
    where: {
      orgId: orgId,
      team: {
        members: {
          some: {
            user: {
              clerkId: userId,
            },
          },
        },
      },
    },
    select: {
      name: true,
      id: true,
      training: {
        include: {
          scenarios: true,
        },
      },
    },
  });
  return campaignTrainingData.map((c) => ({
    campaignId: c.id,
    campaignName: c.name,
    trainings: c.training.map((t) => ({
      trainingId: t.id,
      trainingName: t.name,
      scenarios: t.scenarios,
    })),
  }));
}

/**
 * Returns the total number of training sessions completed by a specific user within a given organization.
 *
 * @param {string} userId - The Clerk user ID of the user.
 * @param {string} orgId - The organization ID the user belongs to.
 * @returns {Promise<number>} A promise that resolves to the number of training sessions.
 */
export async function getUserTrainingSessionCount(userId, orgId) {
  const count = await prisma.trainingSession.count({
    where: {
      user: {
        orgId: orgId,
        clerkId: userId,
      },
    },
  });
  return count;
}

/**
 * Calculates the average overall score and total count of training sessions
 * for a given user within a specific organization.
 *
 * @param {string} userId - The Clerk user ID of the user.
 * @param {string} orgId - The organization ID the user belongs to.
 * @returns {Promise<{ _avg: { overallScore: number | null }, _count: number }>}
 * An object containing the average score and the total count of sessions.
 */
export async function getTrainingAvgAndCount(userId, orgId) {
  const data = await prisma.trainingSession.aggregate({
    where: {
      user: {
        orgId: orgId,
        clerkId: userId,
      },
    },
    _avg: {
      overallScore: true,
    },
    _count: true,
  });

  return data;
}

export async function getCampaignTrainingSessios(teamId, userId, orgId) {
  const data = await prisma.campaign.findMany({
    where: {
      teamId: teamId,
      orgId: orgId,
      team: {
        members: {
          some: {
            user: {
              clerkId: userId,
            },
          },
        },
      },
    },
    select: {
      training: {
        include: {
          trainingSessions: true,
        },
      },
    },
  });

  return { teamTrainingSessions: data };
}
