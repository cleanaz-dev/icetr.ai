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

export async function getAdminOrgSettings(clerkId, orgId) {
  const isUserAdmin = await isAdmin(clerkId);
  if (!isUserAdmin) return null;

  // Query 1: Fetch the org (with all relations)
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      customer: true,
      campaigns: {
        select: {
          id:true,
          name: true,
          status: true,
          type: true,
          training: {
            select: {
              scenarios: true,
              trainingSessions: true,
            }
          }
        }
      },
      tierSettings: true,
      callFlowConfiguration: true,
      owner: true,
      apiKeys: true,
      teams: true,
      orgIntegrations: true,
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

  // Query 2: Fetch the current user's profile
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: userProfileWithSettingsSelect, // Your custom select
  });

  // Attach the user to the org object (e.g., as `currentUser`)
  const orgWithUser = {
    ...org,
    currentUser: user, // Now org includes the user data!
  };

  return orgWithUser; // Return ONLY the org (now with user inside)
}