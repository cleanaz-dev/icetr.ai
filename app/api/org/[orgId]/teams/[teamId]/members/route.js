import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  validateHasPermission,
  validateOrgAccess,
  validateTeamOrgAccess,
} from "@/lib/db/validations";
import { getOrgMembers } from "@/lib/db/org";
import { teamMemberSelect } from "@/lib/db/selects";

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
    // Get updated team members
    const teamMembers = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        members: {
          include: {
            user: {
              select: teamMemberSelect
            },
          },
        },
      },
    });





    return NextResponse.json({
      message: `Member(s) added successfully`,
      teamMembers: teamMembers?.members || [],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to add members" },
      { status: 500 }
    );
  }
}
