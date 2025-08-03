"use server";
import prisma from "@/lib/prisma";

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
  const role = await getUserRole(userId);
  return role === "Admin";
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

export async function getUserOrgTeamUserId() {

}