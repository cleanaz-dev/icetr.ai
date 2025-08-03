"use server";
import prisma from "@/lib/prisma";

/**
 * Validates that a lead belongs to the specified organization.
 *
 * @param {string} leadId - The ID of the lead to check.
 * @param {string} orgId - The ID of the organization expected to own the lead.
 * @returns {Promise<Object>} The lead object if access is valid.
 * @throws {Error} If the lead is not found or does not belong to the organization.
 */
export async function validateLeadOrgAccess(leadId, orgId) {
  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      orgId: orgId,
    },
  });

  if (!lead) {
    throw new Error("Lead not found or does not belong to your organization.");
  }

  return lead;
}


/**
 * Validates that a Clerk user (identified by Clerk's userId) belongs to the specified organization.
 *
 * @param {string} userId - The Clerk user ID (from `auth().userId`).
 * @param {string} orgId - The organization ID the user should belong to.
 * @returns {Promise<Object>} The user object if validation passes.
 * @throws {Error} If the user is not found in the specified organization.
 */
export async function validateOrgAccess(clerkId, orgId) {
  const user = await prisma.user.findFirst({
    where: {
      clerkId: clerkId, // Clerk userId maps to clerkId in your DB
      orgId,
    },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User is not part of this organization.");
  }

  return user;
}

/**
 * Validates that a user belongs to the specified organization and is a member of the given team.
 *
 * @param {string} userId - The Clerk user ID (maps to `clerkId` in your DB).
 * @param {string} teamId - The ID of the team to check membership in.
 * @param {string} orgId - The organization ID the user and team must belong to.
 * @throws {Error} If the user is not part of the organization or not in the team.
 * @returns {Promise<void>} Resolves if validation passes, otherwise throws an error.
 */
export async function validateTeamOrgAccess(userId, teamId, orgId) {
  const user = await prisma.user.findFirst({
    where: {
      clerkId: userId,
      orgId,
      teamMemberships: {
        some: {
          teamId: teamId,
        },
      },
    },
    select: { id: true }, // Keeps query lightweight
  });

  if (!user) {
    throw new Error("User is not part of this organization or team.");
  }
}

/**
 * Validates that a user has permission based on their role.
 *
 * @param {string} clerkId - The Clerk user ID.
 * @param {string[]} allowedRoles - Array of roles that are permitted.
 * @returns {Promise<void>} Resolves if valid, otherwise throws error.
 */
export async function validateHasPermission(clerkId, requiredPermissions) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { 
      role: {
        select: {
          type: true,
          permissionIDs: true
        }
      }
    },
  });

  if (!user || !user.role) {
    throw new Error("User not found");
  }

  // Get the actual permissions for this user's role
  const permissions = await prisma.permission.findMany({
    where: { id: { in: user.role.permissionIDs } },
    select: { name: true }
  });

  const userPermissions = permissions.map(p => p.name);
  
  // Check if user has all required permissions
  const hasAllPermissions = requiredPermissions.every(perm => 
    userPermissions.includes(perm)
  );

  if (!hasAllPermissions) {
    throw new Error("Access denied: insufficient permissions.");
  }

  return true; // Optional: return true on success
}
