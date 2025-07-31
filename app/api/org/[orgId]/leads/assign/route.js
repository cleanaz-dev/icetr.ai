//api/leads/assign

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/services/prisma";
import { validateHasPermission } from "@/lib/services/db/validations";
import { TrunkContextImpl } from "twilio/lib/rest/routes/v2/trunk";

export async function POST(request, { params }) {
  const { orgId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { leadIds, assignedToId } = await request.json();
    console.log("Assignment data:", leadIds, assignedToId);
    // return NextResponse.json(
    //   { message: "Assignment data received" },
    //   { status: 200 }
    // );

    // Validate required fields
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: "leadIds array is required" },
        { status: 400 }
      );
    }

    await validateHasPermission(clerkId, ["lead.assign"]);

    // Verify the assigned user exists
    const caller = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: {
        id: true,
      },
    });

    const assignedToUser = await prisma.user.findUnique({
      where: {
        id: assignedToId,
      },
      select: {
        id: true,
        firstname: true,
        fullname: true,
        imageUrl: true,
        lastname: true,
      },
    });
    console.log("assignedToUser", assignedToUser);

    // Update all leads with the assigned user
    const updatedLeads = await prisma.lead.updateMany({
      where: {
        orgId: orgId,
        id: { in: leadIds },
      },
      data: {
        assignedUserId: assignedToUser.id,
        updatedAt: new Date(),
      },
    });

    // Create activity records for each lead
    const activityPromises = leadIds.map((leadId) =>
      prisma.leadActivity.create({
        data: {
          leadId: leadId,
          type: "ASSIGNMENT",
          content: `Lead assigned to ${assignedToUser.firstname}`,
          createdBy: caller.id,
        },
      })
    );

    await Promise.all(activityPromises);

    return NextResponse.json({
      message: `Successfully assigned ${updatedLeads.count} leads`,
      assignedCount: updatedLeads.count,
      assignedUser: assignedToUser, // ← Add this
    });
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
