import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  validateHasPermission,
  validateOrgAccess,
  validateTeamOrgAccess,
} from "@/lib/db/validations";

export async function PATCH(req, { params }) {
  const { teamId, orgId } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }

  try {
    // Validate user belongs to org
    await validateOrgAccess(clerkId, orgId);

    // Validate user is member of the team in the org
    await validateTeamOrgAccess(clerkId, teamId, orgId);
    await validateHasPermission(clerkId, ["team.update"]);

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Get the new team name from request body
    const { teamName, action = null } = await req.json();

    // Validate team name
    if (!teamName || teamName.trim() === "") {
      return NextResponse.json(
        { message: "Team name is required" },
        { status: 400 }
      );
    }

    console.log("Team Name:", teamName);
    console.log("Team ID:", teamId);

    // Update the team
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { name: teamName.trim() },
    });

    return NextResponse.json({
      message: "Team name changed successfully!",
      updatedTeam: updatedTeam,
    });
  } catch (error) {
    console.error("Error updating team:", error);

    // Handle specific Prisma errors
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { teamId, orgId } = await params;
  const { userId: clerkId } = await auth();
  if (!teamId && !orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  if (!clerkId) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }
  try {
    await validateHasPermission(clerkId, ["team.delete"]);
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true },
    });

    if (!existingTeam) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Remove team members first, then delete team
    await prisma.team.delete({
      where: { id: existingTeam.id },
    });

    return NextResponse.json(
      { message: `${existingTeam.name} has been successfully deleted` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  const { teamId, orgId } = await params;
  const { userId: clerkId } = await auth();
  if (!teamId || !orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  if (!clerkId) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }
  try {
    await validateHasPermission(clerkId, ["team.read"]);

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                fullname: true,
                imageUrl: true,
                _count: { select: { assignedLeads: true } },
                teamMemberships: {
                  select: {
                    teamRole: true,
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
            type:true,
            _count: {
              select: {
                leads: true,
              },
            },
          },
        }, // if you need them
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
