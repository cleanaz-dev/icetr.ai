//api/leads/assign

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/service/prisma";

export async function POST(request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    // console.log("Assignment data:", data);

    // Validate required fields
    if (!data.leadIds || !Array.isArray(data.leadIds) || data.leadIds.length === 0) {
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

      // Update all leads with the assigned user
      const updatedLeads = await prisma.lead.updateMany({
        where: {
          id: { in: data.leadIds }
        },
        data: {
          assignedUserId: data.assignedUserId,
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
            content: `Lead assigned to ${assignedUser.firstname || assignedUser.email}`,
            createdBy: assingerUser.id
          }
        })
      );

      await Promise.all(activityPromises);

      return NextResponse.json({
        message: `Successfully assigned ${updatedLeads.count} leads`,
        assignedCount: updatedLeads.count,
        assignedTo: {
          id: assignedUser.id,
          name: assignedUser.firstname || assignedUser.email
        }
      });
    }

    // Handle individual assignments (bulk assignment to different users)
    if (data.assignments && Array.isArray(data.assignments)) {
      const results = [];
      
      for (const assignment of data.assignments) {
        if (!assignment.leadId || !assignment.assignedUserId) {
          continue; // Skip invalid assignments
        }

        // Verify the assigned user exists
        const assignedUser = await prisma.user.findUnique({
          where: { id: assignment.assignedUserId }
        });

        if (!assignedUser) {
          results.push({
            leadId: assignment.leadId,
            success: false,
            error: "Assigned user not found"
          });
          continue;
        }

        try {
          // Update the lead
          const updatedLead = await prisma.lead.update({
            where: { id: assignment.leadId },
            data: {
              assignedUserId: assignment.assignedUserId,
              updatedAt: new Date()
            }
          });

          // Create activity record
          await prisma.leadActivity.create({
            data: {
              leadId: assignment.leadId,
              type: "assignment",
              content: `Lead assigned to ${assignedUser.firstName || assignedUser.email}`,
              createdBy: clerkUserId
            }
          });

          results.push({
            leadId: assignment.leadId,
            success: true,
            assignedTo: {
              id: assignedUser.id,
              name: assignedUser.firstName || assignedUser.email
            }
          });
        } catch (error) {
          results.push({
            leadId: assignment.leadId,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      
      return NextResponse.json({
        message: `Successfully assigned ${successCount} of ${results.length} leads`,
        results: results
      });
    }

    // Handle unassignment (remove assignments)
    if (data.unassign === true) {
      const updatedLeads = await prisma.lead.updateMany({
        where: {
          id: { in: data.leadIds }
        },
        data: {
          assignedUserId: null,
          updatedAt: new Date()
        }
      });

      // Create activity records for unassignment
      const activityPromises = data.leadIds.map(leadId => 
        prisma.leadActivity.create({
          data: {
            leadId: leadId,
            type: "assignment",
            content: "Lead unassigned",
            createdBy: clerkUserId
          }
        })
      );

      await Promise.all(activityPromises);

      return NextResponse.json({
        message: `Successfully unassigned ${updatedLeads.count} leads`,
        unassignedCount: updatedLeads.count
      });
    }

    return NextResponse.json(
      { error: "Invalid request format. Provide either assignedUserId or assignments array" }, 
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
