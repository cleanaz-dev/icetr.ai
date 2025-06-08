//api/leads/[id]/activities

import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing leadId" }, { status: 400 });
    }

    const activities = await prisma.leadActivity.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching lead activities:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to calculate follow-up date
const getFollowUpDate = (timeframe) => {
  const now = new Date();
  switch(timeframe) {
    case '1_hour': return new Date(now.getTime() + 60 * 60 * 1000);
    case '2_hours': return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    case 'tomorrow': return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '3_days': return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case '1_week': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to tomorrow
  }
};

export async function POST(request, { params }) {
  const { id } = await params;
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (data.type === "call") {
      // Define the mapping between frontend values and database enum values
      const OUTCOME_MAPPING = {
        answered: "ANSWERED",
        voicemail: "VOICEMAIL",
        busy: "BUSY",
        no_answer: "NO_ANSWER",
        disconnected: "DISCONNECTED",
        invalid_number: "INVALID_NUMBER",
        do_not_call: "DO_NOT_CALL",
        not_interested: "NOT_INTERESTED",
        interested: "INTERESTED",
        callback: "CALLBACK", 
      };

      // Map the outcome to the database enum value
      const mappedOutcome = OUTCOME_MAPPING[data.outcome];

      if (!mappedOutcome) {
        return NextResponse.json(
          {
            error: `Invalid outcome value: ${
              data.outcome
            }. Allowed values: ${Object.keys(OUTCOME_MAPPING).join(", ")}`,
          },
          { status: 400 }
        );
      }
      const user = await prisma.user.findUnique({
        where: {clerkId: userId}
      })

      // Use a transaction to ensure all operations succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Get the lead to extract campaignId
        const lead = await tx.lead.findUnique({
          where: { id: id },
          select: { campaignId: true },
        });

        // Create the lead activity
        await tx.leadActivity.create({
          data: {
            lead: { connect: { id: id } },
            callSession: { connect: { id: data.sessionId } },
            content: data.notes,
            type: "CALL",
            outcome: mappedOutcome,
            duration: data.duration,
            createdBy: user.id,
          },
        });

        // Create follow-up if needed
        const followUpOutcomes = ["BUSY", "SCHEDULED_CALLBACK", "VOICEMAIL", "NO_ANSWER"];
        if (followUpOutcomes.includes(mappedOutcome) && data.followUpTime) {
          await tx.followUp.create({
            data: {
              leadId: id,
              dueDate: getFollowUpDate(data.followUpTime),
              type: "call",
              reason: data.outcome,
              completed: false,
            },
          });
        }

        // Update lead status based on outcome
        let newLeadStatus = null;
        switch (mappedOutcome) {
          case "ANSWERED":
            newLeadStatus = "Contacted";
            break;
          case "INTERESTED":
            newLeadStatus = "Qualified";
            break;
          case "NOT_INTERESTED":
          case "DO_NOT_CALL":
            newLeadStatus = "Lost";
            break;
          case "SCHEDULED_CALLBACK":
            newLeadStatus = "Follow-up Scheduled";
            break;
        }

        if (newLeadStatus) {
          await tx.lead.update({
            where: { id: id },
            data: {
              status: newLeadStatus,
            },
          });
        }

        // Update the call session statistics and campaignId
        const isSuccessfulCall = ["ANSWERED", "INTERESTED"].includes(
          mappedOutcome
        );

        await tx.callSession.update({
          where: { id: data.sessionId },
          data: {
            campaignId: lead?.campaignId,
            totalCalls: { increment: 1 },
            successfulCalls: isSuccessfulCall ? { increment: 1 } : undefined,
            totalDuration: { increment: data.duration },
          },
        });
      });
    }

    console.log("request data", data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating lead activity:", error);

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate entry" }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Failed to update activities" },
      { status: 500 }
    );
  }
}