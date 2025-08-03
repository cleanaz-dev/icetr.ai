import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { id: teamId } = await params;
  console.log("teamId:", teamId);
  const { userId: clerkId } = await auth();

  // Check if user is authenticated
  if (!clerkId) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { campaignId } = await req.json();
    console.log("campaignId:", campaignId);

    // Validate required fields
    if (!campaignId) {
      return NextResponse.json(
        { message: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Find user and check authorization
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: {
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.role.toLowerCase() === "agent") {
      return NextResponse.json(
        { message: "Unauthorized User" },
        { status: 401 }
      );
    }

    // Find team with campaigns and members
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { 
        campaigns: true,
        members: {
          select: { id: true }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    const campaignExists = team.campaigns.some(campaign => campaign.id === campaignId);
    if (!campaignExists) {
      return NextResponse.json(
        { message: "Campaign not found in this team" },
        { status: 404 }
      );
    }

    // Get team member IDs
    const teamMemberIds = team.members.map(member => member.id);

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Only unassign leads from THIS team's members
      await tx.lead.updateMany({
        where: {
          campaignId: campaignId,
          assignedUserId: { in: teamMemberIds }
        },
        data: {
          assignedUserId: null
        }
      });

      // Unassign campaign from team
      await tx.team.update({
        where: { id: teamId },
        data: {
          campaigns: {
            disconnect: { id: campaignId }
          }
        }
      });
    });



    return NextResponse.json(
      { 
        message: `Campaign successfully unassigned from ${team.name}`,
        teamId: teamId,
        campaignId: campaignId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unassigning campaign:", error.message);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Record not found" },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: "Database constraint error" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}