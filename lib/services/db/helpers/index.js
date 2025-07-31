"use server";
import prisma from "@/lib/services/prisma";
import { shuffleArray } from "@/lib/utils";



/**
 * Assigns all new leads for a given campaign and org to a team member with role 'LEAD' in a specific team.
 *
 * @param {string} orgId - Organization ID
 * @param {string} campaignId - Campaign ID
 * @param {string} teamId - Team ID
 * @returns {Promise<{ assignedTo: string, assignedCount: number, message: string }>}
 * @throws {Error} If no LEAD role team member is found
 */
export async function roleBasedLeadsMulti(orgId, campaignId, teamId) {
  // Find LEAD in the specified team
  const assignedTo = await prisma.teamMember.findFirst({
    where: {
      orgId,
      teamId,
      teamRole: "LEAD",
    },
    select: {
      user: {
        select: {
          id: true,
          fullname: true,
          email: true,
        },
      },
    },
  });

  if (!assignedTo) {
    throw new Error("No team member with role LEAD found in the specified team.");
  }

  // Fetch new leads for this campaign
  const leadsToAssign = await prisma.lead.findMany({
    where: {
      orgId,
      campaignId,
      status: "New",
      assignedTo: null,
    },
    select: {
      id: true,
    },
  });

  if (leadsToAssign.length === 0) {
    return {
      assignedTo: assignedTo.user.id,
      assignedCount: 0,
      message: "No new leads to assign.",
    };
  }

  // Assign all leads to the LEAD member
  await Promise.all(
    leadsToAssign.map((lead) =>
      prisma.lead.update({
        where: { id: lead.id },
        data: {
          assignedTo: assignedTo.user.id,
          status: "Assigned",
        },
      })
    )
  );

  return {
    assignedTo: assignedTo.user.id,
    assignedCount: leadsToAssign.length,
    message: `Assigned ${leadsToAssign.length} lead(s) to ${assignedTo.user.fullname}.`,
  };
}


/**
 * Assigns all unassigned leads of a campaign to team members in a round-robin fashion after randomizing the lead order.
 *
 * Fetches the team members for the specified team and organization,
 * then distributes the leads evenly among them in a randomized order.
 *
 * @param {string} teamId - The ID of the team to assign leads within.
 * @param {string} orgId - The ID of the organization the team belongs to.
 * @param {string} campaignId - The ID of the campaign whose leads will be assigned.
 *
 * @returns {Promise<{ message: string[] }>} An object containing a message array summarizing
 * the number of leads assigned to each team member in the format "Name: X lead(s)".
 *
 * @throws {Error} Throws an error if no team, no team members, or no unassigned leads are found.
 */
export async function roundRobinLeads(teamId, orgId, campaignId) {
  // Find the team and its members
  const team = await prisma.team.findFirst({
    where: { id: teamId, orgId },
    select: {
      members: {
        select: {
          user: {
            select: {
              id: true,
              fullname: true,
            },
          },
        },
      },
    },
  });

  if (!team || team.members.length === 0) {
    throw new Error("No team members found");
  }

  // Get all unassigned leads for this campaign
  const unassignedLeads = await prisma.lead.findMany({
    where: {
      campaignId,
      assignedTo: null,
      orgId,
    },
    select: { id: true },
  });

  if (unassignedLeads.length === 0) {
    throw new Error("No unassigned leads found for this campaign");
  }

  const memberUsers = team.members.map((m) => m.user);

  // Shuffle leads to randomize assignment order
  const shuffledLeadIds = shuffleArray(unassignedLeads.map((l) => l.id));

  const assignmentMap = new Map(); // userId -> { name, count }
  const updatePromises = [];

  for (const [index, leadId] of shuffledLeadIds.entries()) {
    const user = memberUsers[index % memberUsers.length];

    if (!assignmentMap.has(user.id)) {
      assignmentMap.set(user.id, { name: user.fullname, count: 1 });
    } else {
      assignmentMap.get(user.id).count++;
    }

    updatePromises.push(
      prisma.lead.update({
        where: { id: leadId },
        data: { assignedTo: user.id },
      })
    );
  }

  await Promise.all(updatePromises);

  const summary = Array.from(assignmentMap.values()).map(
    ({ name, count }) => `${name}: ${count} lead${count > 1 ? "s" : ""}`
  );

  return { message: summary };
}

/**
 * Seeds the public fields for a given integration type and integration record ID.
 * 
 * Creates one PublicField record per configured public field name,
 * linked to the specific integration instance by its ID.
 * 
 * @param {string} type - The integration model name. 
 *   Supported values: 'calendlyIntegration', 'blandAiIntegration', 'twilioIntegration'.
 * @param {string} id - The ID of the integration record to associate public fields with.
 * 
 * @returns {Promise<void>} Resolves when seeding is complete.
 */
export async function seedPublicFieldsForIntegration(type, id) {
  const map = {
    calendlyIntegration: ['enabled', 'orgUri', 'webhookUrl'],
    blandAiIntegration: ['phoneNumbers', 'voiceId'],
    twilioIntegration: ['enabled', 'phoneNumbers'],
  };

  const fields = map[type];
  if (!fields) return;

  await prisma.publicField.createMany({
    data: fields.map((fieldName) => ({
      fieldName,
      [`${type}Id`]: id,
    })),
  });
}

