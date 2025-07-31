//api/leads/unassign

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/services/prisma";

export async function PATCH(request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("Assignment data:", data);
    // return NextResponse.json({ message: "Data received "})
    // Validate required fields
    if (
      !data.leadIds ||
      !Array.isArray(data.leadIds) ||
      data.leadIds.length === 0
    ) {
      return NextResponse.json(
        { error: "leadIds array is required" },
        { status: 400 }
      );
    }

    // Handle bulk assignment to single user
    if (data.assignedUserId) {
      // Verify the assigned user exists
      const assignedUser = await prisma.user.findUnique({
        where: { id: data.assignedUserId }
      });

      if (!assignedUser) {
        return NextResponse.json(
          { error: "Assigned user not found" }, 
          { status: 404 }
        );
      }

      // Update all leads of assigned user to null
      const updatedLeads = await prisma.lead.updateMany({
        where: {
          id: { in: data.leadIds }
        },
        data: {
          
          assignedUserId: null,
          updatedAt: new Date()
        }
     })


     const assingerUser = await prisma.user.findUnique({
      where: {clerkId: clerkUserId}
     })

     

      // Create activity records for each lead
      const activityPromises = data.leadIds.map(leadId => 
        prisma.leadActivity.create({
          data: {
            leadId: leadId,
            type: "ASSIGNMENT",
            content: `Lead Unassigned`,
            createdBy: assingerUser.id
          }
        })
      );

      await Promise.all(activityPromises);

      return NextResponse.json({
        message: `Successfully unassigned ${updatedLeads.count} leads`,
        unassignedCount: updatedLeads.count,
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
