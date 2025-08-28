// /lib/services/team-service.js (updated)

import prisma from "@/lib/prisma";
import {
  teamMemberSelect,
  teamWithDetailsSelect,
  teamWithTeamMembersSelect,
  userProfileWithSettingsSelect,

} from "../db/selects";

export async function createTeam({ name, orgId, creatorClerkId, addSelf }) {
  if (addSelf) {
    return await createTeamWithCreator({ name, orgId, creatorClerkId });
  } else {
    return await createTeamOnly({ name, orgId });
  }
}

async function createTeamWithCreator({ name, orgId, creatorClerkId }) {
  const user = await prisma.user.findUnique({
    where: { clerkId: creatorClerkId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Look how clean this is now!
  const newTeam = await prisma.team.create({
    data: {
      name,
      organization: { connect: { id: orgId } },
      manager: { connect: { id: user.id } },
      members: {
        create: {
          user: { connect: { id: user.id } },
          teamRole: "MANAGER",
        },
      },
    },
    select: teamWithTeamMembersSelect,
  });

  return {
    team: newTeam,
    members: newTeam.members,
  };
}

async function createTeamOnly({ name, orgId }) {
  const newTeam = await prisma.team.create({
    data: {
      name,
      organization: { connect: { id: orgId } },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      manager: {
        select: userProfileWithSettingsSelect,
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    team: newTeam,
    members: [],
  };
}

export async function getTeamMemberUserId({ memberId }) {
  const teamMember = await prisma.teamMember.findUnique({
    where: {
      id: memberId,
    },
    select: {
      userId: true,
    },
  });
  return {
    userId: teamMember.userId,
  };
}
