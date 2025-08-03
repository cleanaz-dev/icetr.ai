// /api/teams/[id]/assign-campaign

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const { id } = await params;
  console.log("params ID:", id);
  const teamId = id;
  const { campaignId } = await req.json();
  console.log("campaignId:", campaignId);
  const { userId: clerkId } = await auth();
  
  try {
    if (!clerkId) {
      return NextResponse.json({ message: "Invalid User" }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Connect the campaign to the team
    const updatedTeam = await prisma.team.update({
      where: {
        id: teamId
      },
      data: {
        campaigns: {
          connect: {
            id: campaignId
          }
        }
      },
      include: {
        campaigns: true
      }
    });

    return NextResponse.json({ 
      message: `Campaign assigned successfully to ${updatedTeam.name}`,
      team: updatedTeam 
    }, { status: 200 });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}