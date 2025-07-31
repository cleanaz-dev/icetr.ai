import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  validateHasPermission,
  validateOrgAccess,
  validateTeamOrgAccess,
} from "@/lib/services/db/validations";
import { getOrgMembers } from "@/lib/services/db/org";

export async function PATCH(req, { params }) {
  const { teamId, orgId } = await params;
  if (!orgId && teamId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);
    await validateTeamOrgAccess(clerkId, teamId, orgId);
    await validateHasPermission(clerkId, ["team.assign"]);

    const { users } = await req.json();

    if (!Array.isArray(users)) {
      return NextResponse.json(
        { message: "Invalid request: users array required" },
        { status: 400 }
      );
    }

    // Create team members in parallel (optional optimization)
    await Promise.all(
      users.map((user) =>
        prisma.teamMember.create({
          data: {
            userId: user.id,
            teamId: teamId,
          },
        })
      )
    );
    const addedUsers = users.length;

    const { members: newMembers } = await getOrgMembers(clerkId, orgId);
    console.log("new members", newMembers);

    return NextResponse.json({
      message: `${addedUsers} member(s) added successfully`,
      members: newMembers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to add members" },
      { status: 500 }
    );
  }
}
