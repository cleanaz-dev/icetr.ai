//api/leads/assign

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { leadIds, memberId, assignerId } = await request.json();
    console.log("Assignment data:", leadIds, memberId, assignerId);
    // return NextResponse.json({ message: "Assignment data received" }, { status: 200 });

    // Validate required fields
    if (
      !leadIds ||
      !Array.isArray(leadIds) ||
      leadIds.length === 0
    ) {
      return NextResponse.json(
        { error: "leadIds array is required" },
        { status: 400 }
      );
    }

    // Handle bulk assignment to single user
    if (memberId) {
      // Verify the assigned user exists
      const assignedUser = await prisma.user.findUnique({
        where: { id: memberId },
      });

      if (!assignedUser) {
        return NextResponse.json(
          { error: "Assigned user not found" },
          { status: 404 }
        );
      }

      // Update all leads with the assigned user
      const updatedLeads = await prisma.lead.updateMany({
        where: {
          id: { in: leadIds },
        },
        data: {
          assignedUserId: memberId,
          updatedAt: new Date(),
        },
      });

      const assingerUser = await prisma.user.findUnique({
        where: { clerkId: assignerId },
      });

      // Create activity records for each lead
      const activityPromises = leadIds.map((leadId) =>
        prisma.leadActivity.create({
          data: {
            leadId: leadId,
            type: "ASSIGNMENT",
            content: `Lead assigned to ${
              assignedUser.firstname || assignedUser.email
            }`,
            createdBy: assingerUser.id,
          },
        })
      );

      await Promise.all(activityPromises);

      return NextResponse.json({
        message: `Successfully assigned ${updatedLeads.count} leads`,
        assignedCount: updatedLeads.count,
        assignedTo: {
          id: assignedUser.id,
          name: assignedUser.firstname || assignedUser.email,
        },
      });
    }

    return NextResponse.json(
      {
        error:
          "Invalid request format. Provide either assignedUserId or assignments array",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Assignment error:", error);
    return NextResponse.json(
      { error: "Failed to assign leads: " + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
