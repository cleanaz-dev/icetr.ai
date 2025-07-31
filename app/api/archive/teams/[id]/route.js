import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/services/prisma";

export async function PATCH(req, { params }) {
  const { id: teamId } = await params;
  const { userId: clerkId } = await auth();
  
  try {
    // Check if user is authenticated
    if (!clerkId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Find user and check authorization
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: { 
        id: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is authorized (not an agent)
    if (user.role.toLowerCase() === "agent") {
      return NextResponse.json(
        { message: "Unauthorized User" },
        { status: 401 }
      );
    }

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!existingTeam) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    // Get the new team name from request body
    const { teamName } = await req.json();

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
      data: { name: teamName.trim() }
    });

    return NextResponse.json({ 
      message: "Team name changed successfully!",
      team: updatedTeam
    });

  } catch (error) {
    console.error("Error updating team:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id: teamId } = await params;
  const { userId: clerkId } = await auth();
  
  try {
    if (!clerkId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: { id: true, role: true }
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
        { status: 403 }
      );
    }

    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!existingTeam) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    // Remove team members first, then delete team
    await prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        where: { teamId: teamId },
        data: { teamId: null }
      });
      
      await tx.team.delete({
        where: { id: teamId }
      });
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