//api/org/[orgId]/teams/[teamId]/members/[memberId]
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  validateHasPermission,
  validateOrgAccess,
  validateTeamOrgAccess,
} from "@/lib/db/validations";
import { teamMemberSelect } from "@/lib/db/selects";
import { getTeamMemberUserId } from "@/lib/services/team-service";

export async function PATCH(req, { params }) {
  const { teamId, orgId, memberId } = await params;

  if (!orgId || !teamId || !memberId) {
    return NextResponse.json(
      { message: "Invalid Request - Missing required parameters" },
      { status: 400 }
    );
  }

  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);
    await validateTeamOrgAccess(clerkId, teamId, orgId);
    await validateHasPermission(clerkId, ["team.assign"]);

    const { action, teamRole } = await req.json();

    // Handle role editing
    if (action === "editRole" && teamRole) {
      // Validate team role
      const validRoles = ["MEMBER", "LEAD", "MANAGER", "SENIOR"];
      if (!validRoles.includes(teamRole)) {
        return NextResponse.json(
          { message: "Invalid team role" },
          { status: 400 }
        );
      }

      // Update the TeamMember record
      await prisma.teamMember.update({
        where: {
          id: memberId,
        },
        data: {
          teamRole: teamRole,
        },
        include: {
          user: {
            select: teamMemberSelect,
          },
        },
      });

      // Get updated team members
      const teamMembers = await prisma.team.findUnique({
        where: {
          id: teamId,
        },
        select: {
          members: {
            include: {
              user: {
                select: teamMemberSelect,
              },
            },
          },
        },
      });

      return NextResponse.json(
        {
          message: "Role updated successfully!",
          teamMembers: teamMembers?.members || [],
        },
        { status: 200 }
      );
    }

    // Handle adding members (existing functionality)
    if (!Array.isArray(users)) {
      return NextResponse.json(
        { message: "Invalid request: users array required for adding members" },
        { status: 400 }
      );
    }

    // Create team members in parallel
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

    return NextResponse.json({
      message: `${addedUsers} member(s) added successfully`,
      members: newMembers,
    });
  } catch (error) {
    console.error("Error in PATCH operation:", error);

    // Handle specific Prisma errors
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { teamId, orgId, memberId } = await params;

  // Fix: Use OR (||) instead of AND (&&) for validation
  if (!orgId || !teamId || !memberId) {
    return NextResponse.json(
      { message: "Invalid Request - Missing required parameters" },
      { status: 400 }
    );
  }

  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);
    await validateTeamOrgAccess(clerkId, teamId, orgId);
    await validateHasPermission(clerkId, ["team.assign"]);

    const { userId } = await getTeamMemberUserId({ memberId });

    await prisma.lead.updateMany({
      where: {
        assignedUserId: userId,
        campaign: {
          teamId: teamId,
        },
      },
      data: {
        assignedUserId: null,
      },
    });

    // Delete the TeamMember record using the memberId from URL params
    await prisma.teamMember.delete({
      where: {
        id: memberId, // Use the TeamMember ID directly from URL params
      },
    });

    // Get updated team members
    const teamMembers = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        members: {
          include: {
            user: {
              select: teamMemberSelect,
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Team member removed successfully!",
        teamMembers: teamMembers?.members || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing team member:", error);

    // Handle specific Prisma errors
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
