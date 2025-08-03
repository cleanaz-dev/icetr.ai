//api/leads/unassign

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { validateHasPermission } from "@/lib/db/validations";

export async function POST(request, { params }) {
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { leadIds } = await request.json();
    console.log("Unassignment data:", leadIds);

    // Validate required fields
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: "leadIds array is required" },
        { status: 400 }
      );
    }

    await validateHasPermission(clerkId, ["lead.assign"]); // Same permission for unassign

    // Get current user for activity logging
    const caller = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: {
        id: true,
      },
    });

    // Update all leads to remove assignment
    const updatedLeads = await prisma.lead.updateMany({
      where: {
        orgId: orgId,
        id: { in: leadIds },
      },
      data: {
        assignedUserId: null, // ← Remove assignment
        updatedAt: new Date(),
      },
    });

    // Create activity records for each lead
    const activityPromises = leadIds.map((leadId) =>
      prisma.leadActivity.create({
        data: {
          leadId: leadId,
          type: "UNASSIGNMENT",
          content: `Lead unassigned`,
          createdBy: caller.id,
        },
      })
    );

    await Promise.all(activityPromises);

    return NextResponse.json({
      message: `Successfully unassigned ${updatedLeads.count} leads`,
      unassignedCount: updatedLeads.count,
    });
  } catch (error) {
    console.error("Unassignment error:", error);
    return NextResponse.json(
      { error: "Failed to unassign leads: " + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
