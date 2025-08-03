//api/org/[orgId]leads/[teamId]assign

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { validateHasPermission } from "@/lib/db/validations";
import { memberSelect, teamMemberSelect } from "@/lib/db/selects";

export async function POST(request, { params }) {
  try {
    const { orgId, teamId } = await params;
    if (!orgId || !teamId) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await validateHasPermission(clerkId, ["lead.assign"]);

    const { leadIds, assignToId, action } = await request.json();

    // Validate required fields
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: "leadIds array is required" },
        { status: 400 }
      );
    }

    // Verify the assigned user exists
    const caller = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: {
        id: true,
      },
    });

    const member = await prisma.teamMember.findUnique({
      where: {
        id: assignToId
      },
      select: memberSelect
      
    });

    console.log("member from assign route", member)

    // Update all leads with the assigned user
    const updatedLeads = await prisma.lead.updateMany({
      where: {
        orgId: orgId,
        id: { in: leadIds },
      },
      data: {
        assignedUserId: member.user.id,
        updatedAt: new Date(),
      },
    });

    // Create activity records for each lead
    const activityPromises = leadIds.map((leadId) =>
      prisma.leadActivity.create({
        data: {
          leadId: leadId,
          type: "ASSIGNMENT",
          content: `Lead assigned to ${member.user.fullname}`,
          createdBy: caller.id,
        },
      })
    );

    await Promise.all(activityPromises);

    return NextResponse.json({
      message: `Successfully assigned ${updatedLeads.count} leads`,
      assignedCount: updatedLeads.count,
      assignedMember: member 
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
