// api/leads/[id]/activities

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
      include: {
        call: {
          select: {
            callSid: true,
            direction: true,
            outcome: true,
            duration: true,
            recordingUrl: true,
          }
        },
        createdUser: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
          }
        }
      },
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
  switch (timeframe) {
    case "1_hour":
      return new Date(now.getTime() + 60 * 60 * 1000);
    case "2_hours":
      return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    case "tomorrow":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "3_days":
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case "1_week":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to tomorrow
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
    console.log("data from activity route", data);
    
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
        scheduled_callback: "SCHEDULED_CALLBACK",
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

      // Define which outcomes are considered "unsuccessful contact attempts"
      const unsuccessfulOutcomes = [
        "BUSY",
        "NO_ANSWER", 
        "VOICEMAIL",
        "DISCONNECTED",
        "INVALID_NUMBER"
      ];

      // Define which outcomes are considered "successful contact"
      const successfulOutcomes = [
        "ANSWERED",
        "INTERESTED", 
        "NOT_INTERESTED",
        "CALLBACK",
        "SCHEDULED_CALLBACK",
        "DO_NOT_CALL"
      ];

      const isUnsuccessfulAttempt = unsuccessfulOutcomes.includes(mappedOutcome);
      const isSuccessfulContact = successfulOutcomes.includes(mappedOutcome);

      // Use a transaction to ensure all operations succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Get the lead to extract campaignId
        const lead = await tx.lead.findUnique({
          where: { id: id },
          select: { campaignId: true },
        });

        // Find the existing Call record by session + lead (most recent active call)
        const call = await tx.call.findFirst({
          where: { 
            leadId: id,
            callSessionId: data.sessionId,
            status: { not: "completed" } // Find the active call
          },
          orderBy: { createdAt: "desc" }
        });

        if (!call) {
          console.warn(`No active call found for leadId: ${id} and sessionId: ${data.sessionId}. This might indicate the call wasn't properly created in TwiML route.`);
          return NextResponse.json(
            { error: "Active call record not found. Ensure call was initiated properly." },
            { status: 404 }
          );
        }

        // Update the existing Call record with completion details
        const updatedCall = await tx.call.update({
          where: { id: call.id },
          data: {
            status: "completed",
            outcome: mappedOutcome,
            duration: data.duration || 0,
            endTime: data.callEndTime ? new Date(data.callEndTime) : new Date(),
            startTime: data.callStartTime ? new Date(data.callStartTime) : call.startTime,
            notes: data.notes,
          },
        });

        let activity;

        if (isUnsuccessfulAttempt) {
          // Check for existing CONTACT_ATTEMPTS activity
          const existingAttempts = await tx.leadActivity.findFirst({
            where: { 
              leadId: id, 
              type: "CONTACT_ATTEMPTS"
            },
            orderBy: { updatedAt: "desc" }
          });

          if (existingAttempts) {
            // Update existing contact attempts activity
            activity = await tx.leadActivity.update({
              where: { id: existingAttempts.id },
              data: {
                callId: call.id, // Link to most recent call
                callSessionId: data.sessionId,
                content: `${existingAttempts.callAttemptCount + 1} contact attempts - Latest: ${data.outcome}`,
                outcome: mappedOutcome,
                duration: (existingAttempts.duration || 0) + (data.duration || 0),
                callAttemptCount: (existingAttempts.callAttemptCount || 1) + 1,
                updatedAt: new Date(),
              },
            });
          } else {
            // Create new CONTACT_ATTEMPTS activity
            activity = await tx.leadActivity.create({
              data: {
                leadId: id,
                callId: call.id,
                callSessionId: data.sessionId,
                content: `1 contact attempt - ${data.outcome}`,
                type: "CONTACT_ATTEMPTS",
                outcome: mappedOutcome,
                duration: data.duration || 0,
                callAttemptCount: 1,
                createdBy: user.id,
              },
            });
          }
        } else if (isSuccessfulContact) {
          // Create new CONTACTED activity for successful contact
          activity = await tx.leadActivity.create({
            data: {
              leadId: id,
              callId: call.id,
              callSessionId: data.sessionId,
              content: data.notes || `Contact established - ${data.outcome}`,
              type: "CONTACTED",
              outcome: mappedOutcome,
              duration: data.duration || 0,
              callAttemptCount: 1,
              createdBy: user.id,
            },
          });
        }

        // Create follow-up if needed
        const followUpOutcomes = [
          "SCHEDULED_CALLBACK",
          "CALLBACK" 
        ];
        
        if (followUpOutcomes.includes(mappedOutcome) && data.followUpTime) {
          await tx.followUp.create({
            data: {
              leadId: id,
              callId: call.id,
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
          case "INTERESTED":
            newLeadStatus = "Contacted";
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

        // Update the call session statistics
        const isSuccessfulCall = ["ANSWERED", "INTERESTED"].includes(
          mappedOutcome
        );

        await tx.callSession.update({
          where: { id: data.sessionId },
          data: {
            campaignId: lead?.campaignId,
            totalCalls: { increment: 1 },
            successfulCalls: isSuccessfulCall ? { increment: 1 } : undefined,
            totalDuration: { increment: data.duration || 0 },
          },
        });

        console.log(`Call completed successfully: ${call.callSid}, Outcome: ${mappedOutcome}`);
      });

      return NextResponse.json({ success: true });
    }

    // Handle other activity types (non-call activities)
    if (data.type === "note" || data.type === "email" || data.type === "meeting") {
      const activity = await prisma.leadActivity.create({
        data: {
          leadId: id,
          content: data.content,
          type: data.type.toUpperCase(),
          createdBy: user.id,
          callSessionId: data.sessionId, // Optional: link to session if provided
        },
      });

      return NextResponse.json({ success: true, activity });
    }

    return NextResponse.json(
      { error: "Invalid activity type" },
      { status: 400 }
    );

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