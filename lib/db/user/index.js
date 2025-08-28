"use server";
import prisma from "@/lib/prisma";
import { userProfileWithSettingsSelect } from "../selects";

/**
 * Fetches full user data including related user settings.
 * @param userId - Clerk user ID
 * @returns User with userSettings or null if not found
 */

export async function getUserData(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      userSettings: true,
    },
  });
  return user;
}

/**
 * Fetches a lightweight user profile for display purposes.
 * @param userId - Clerk user ID
 * @returns User profile fields or null if not found
 */

export async function getUserProfile(userId) {
  const userProfile = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      imageUrl: true,
      email: true,
    },
  });
  return userProfile;
}

/**
 * Returns the role of the user.
 * @param userId - Clerk user ID
 * @returns Role string or null if not found
 */

export async function getUserRole(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });
  return user?.role ?? null;
}

/**
 * Returns whether the user is an admin.
 * @param userId - Clerk user ID
 * @returns true if admin, false otherwise
 */
export async function isAdmin(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      role: {
        select: {
          type: true,
        },
      },
    },
  });

  const role = user?.role.type;
  return role === "Admin" || role === "SuperAdmin";
}
/**
 * Returns the user’s role and permissions.
 * @param userId - Clerk user ID
 * @returns Object with role and permissions
 */

export async function getUserPersmissions(userId) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      role: {
        select: {
          type: true,
          permissions: true,
        },
      },
    },
  });
  return {
    role: user.role.type,
    permissions: user.role.permissions,
  };
}

/**
 * Fetches detailed organization settings for an admin, along with the current user's profile.
 *
 * @async
 * @function getAdminOrgSettings
 * @param {string} clerkId - The Clerk ID of the requesting user.
 * @param {string} orgId - The ID of the organization to retrieve.
 * @returns {Promise<Object|null>} Returns the organization object with related entities and the current user data,
 *                                 or `null` if the requesting user is not an admin.
 */
export async function getAdminOrgSettings(clerkId, orgId) {
  const isUserAdmin = await isAdmin(clerkId);
  if (!isUserAdmin) return null;

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      customer: {
        include: {
          subscription: {
            include: {
              subcriptionAddOn: {
                include: {
                  addOns: true,
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
          status: true,
          type: true,
          training: {
            select: {
              scenarios: true,
              trainingSessions: true,
            },
          },
        },
      },
      tierSettings: true,
      callFlowConfiguration: true,
      owner: true,
      apiKeys: true,
      teams: true,
      orgIntegrations: {
        select: {
          id: true,
          blandAi: true,
          twilio: true,
          calendly: true,
          make: true,
          zoom: true,
        },
      },
      users: {
        select: {
          id: true,
          clerkId: true,
          firstname: true,
          lastname: true,
          fullname: true,
          imageUrl: true,
          email: true,
          role: { select: { type: true } },
          teamMemberships: true,
          createdAt: true,
        },
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: userProfileWithSettingsSelect,
  });
  const addOns = org?.customer?.subscription?.subcriptionAddOn?.addOns;

  const aiCreditTotals = addOns.reduce(
    (acc, addOn) => {
      if (addOn.type === "AI_CREDITS") {
        acc.total = acc.total + addOn.units;
        acc.consumed = acc.consumed + addOn.unitsConsumed;
      }
      return acc;
    },
    { total: 0, consumed: 0 }
  );

  return {
    ...org,
    currentUser: user,
    aiCreditTotals: aiCreditTotals,
  };
}

/**
 * Retrieves all leads assigned to a given user within a specific organization.
 *
 * @async
 * @function getLeadsForUser
 * @param {string} userId - The Clerk ID of the user whose leads are being fetched.
 * @param {string} orgId - The ID of the organization the user belongs to.
 * @returns {Promise<Array<Object>>} An array of lead objects assigned to the user, including campaign details.
 */
export async function getLeadsForUser(userId, orgId) {
  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
      orgId: orgId,
    },
  });

  const leads = await prisma.lead.findMany({
    where: { assignedUserId: user.id },
    include: {
      campaign: {
        select: {
          id: true,
          name: true,
          status: true,
          type: true,
          scripts: true,
          researchConfig: {
            select: {
              isPremium: true,
              services: true,
              techStackFocus: true,
              socials: true,
            },
          },
        },
      },
    },
  });

  return leads;
}
