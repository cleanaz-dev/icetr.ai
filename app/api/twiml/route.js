// api/twiml/route.js

import { NextResponse } from "next/server";
import twilio from "twilio";
import prisma from "@/lib/service/prisma";
import { transcribeRecording } from "@/lib/service/assembly-ai"; // Import your transcription function

// Database functions
async function checkIfLead(phoneNumber) {
  try {
    const lead = await prisma.lead.findFirst({
      where: { phoneNumber: phoneNumber },
      include: {
        assignedUser: true,
      },
    });
    return lead;
  } catch (error) {
    console.error("Error checking lead:", error);
    return null;
  }
}

async function createOrUpdateCall(
  callSid,
  leadId,
  callSessionId,
  fromNumber,
  to,
  direction = null,
  callStatus = null,
  userId,
  updates = {}
) {
  try {
    // Check if call already exists
    const existingCall = await prisma.call.findUnique({
      where: { callSid },
    });

    if (existingCall) {
      // Update existing call
      const updatedCall = await prisma.call.update({
        where: { callSid },
        data: {
          status: callStatus || existingCall.status,
          ...updates,
          updatedAt: new Date(),
        },
      });
      console.log("Call updated:", updatedCall);
      return updatedCall;
    } else {
      // Create new call - only when we have leadId and callSessionId
      if (!leadId || !callSessionId) {
        console.log(
          `Missing required data for call creation: leadId=${leadId}, callSessionId=${callSessionId}`
        );
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      const newCall = await prisma.call.create({
        data: {
          callSid,
          lead: { connect: { id: leadId } },
          callSession: { connect: { id: callSessionId } },
          direction: direction || "outbound",
          from: fromNumber,
          to,
          status: callStatus || "initiated",
          startTime: new Date(),
          createdUser: {connect: { id: user.id }},
          ...updates,
        },
      });

      console.log("New call created:", newCall);
      return newCall;
    }
  } catch (error) {
    console.error("Error creating/updating call:", error);
    throw error;
  }
}

async function updateCallWithRecording(
  callSid,
  recordingUrl,
  transcription = null,
  duration = null
) {
  try {
    const updatedCall = await prisma.call.update({
      where: { callSid },
      data: {
        recordingUrl,
        transcription,
        duration,
        status: "completed",
        endTime: new Date(),
        updatedAt: new Date(),
      },
    });
    
    console.log("Call updated with recording and transcription:", updatedCall);
    return updatedCall;
  } catch (error) {
    console.error("Error updating call with recording:", error);
    throw error;
  }
}

async function createFollowUp(leadId, callSid, from, to, reason = "voicemail") {
  try {
    const followUp = await prisma.followUp.create({
      data: {
        leadId,
        callSid,
        from,
        to,
        type: "call",
        reason,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        completed: false,
      },
    });
    console.log("Follow-up created:", followUp);
    return followUp;
  } catch (error) {
    console.error("Error creating follow-up:", error);
    throw error;
  }
}

async function createProspect(phoneNumber, callSid, source = "inbound_call") {
  try {
    const prospect = await prisma.prospect.create({
      data: {
        phoneNumber,
        callSid,
        source,
        status: "New",
        notes: `Inbound call received - CallSid: ${callSid}`,
      },
    });
    console.log("Prospect created:", prospect);
    return prospect;
  } catch (error) {
    console.error("Error creating prospect:", error);
    throw error;
  }
}

async function updateProspectWithRecording(
  callSid,
  recordingUrl,
  transcription = null
) {
  try {
    const updatedProspect = await prisma.prospect.update({
      where: { callSid },
      data: {
        recordingUrl,
        transcription,
        notes: transcription
          ? `Voicemail left: ${transcription}`
          : "Voicemail recording available",
      },
    });
    console.log("Prospect updated with recording:", updatedProspect);
    return updatedProspect;
  } catch (error) {
    console.error("Error updating prospect with recording:", error);
    throw error;
  }
}

async function updateFollowUpWithRecording(
  callSid,
  recordingUrl,
  transcription = null
) {
  try {
    const updatedFollowUp = await prisma.followUp.update({
      where: { callSid },
      data: {
        recordingUrl,
        transcription: transcription,
      },
    });
    console.log("Follow-up updated with recording:", updatedFollowUp);
    return updatedFollowUp;
  } catch (error) {
    console.error("Error updating follow-up with recording:", error);
    throw error;
  }
}

export async function POST(request) {
  const twiml = new twilio.twiml.VoiceResponse();

  try {
    // Parse form-encoded data
    const formData = await request.formData();
    console.log("formData", formData);

    // Get standard Twilio webhook parameters
    const from = formData.get("From");
    const to = formData.get("To");
    const callSid = formData.get("CallSid");
    const callStatus = formData.get("CallStatus");
    const direction = formData.get("Direction");
    const leadId = formData.get("leadId");
    const callSessionId = formData.get("callSessionId");
    const userId = formData.get("userId");

    // Recording callback parameters
    const recordingUrl = formData.get("RecordingUrl");
    const recordingStatus = formData.get("RecordingStatus");
    const transcriptionText = formData.get("TranscriptionText");
    const recordingDuration = formData.get("RecordingDuration");

    // Custom parameters (for outbound calls initiated by your app)
    const customFromNumber = formData.get("fromNumber");

    console.log(
      `Processing: CallSid: ${callSid}, From: ${from}, Direction: ${direction}, RecordingStatus: ${recordingStatus}`
    );

    // Handle recording callback - this happens after a call is recorded
    // ONLY process recordings when RecordingStatus is 'completed'
    if (recordingUrl && callSid && recordingStatus === 'completed') {
      console.log("Recording callback received with status 'completed'");

      const duration = parseInt(recordingDuration) || 0;
      console.log(`Recording duration: ${duration} seconds`);

      try {
        // For recording callbacks, we need to determine if this was inbound or outbound
        // Check if there's a followUp or prospect record (indicates inbound)
        // or a call record (indicates outbound)
        
        const followUp = await prisma.followUp.findFirst({
          where: { callSid },
          include: { lead: true }
        });
        
        const prospect = await prisma.prospect.findFirst({
          where: { callSid }
        });
        
        const call = await prisma.call.findFirst({
          where: { callSid }
        });

        if (followUp || prospect) {
          // This was an inbound call (voicemail)
          console.log("Inbound voicemail recording received");

          // Always transcribe inbound voicemails regardless of duration using Assembly AI
          let transcription = null;
          try {
            console.log("Transcribing inbound voicemail with Assembly AI...");
            transcription = await transcribeRecording(recordingUrl);
            console.log("Assembly AI transcription completed:", transcription ? "Success" : "Failed");
          } catch (transcriptionError) {
            console.error("Assembly AI transcription failed:", transcriptionError);
            // Fallback to Twilio transcription if available
            transcription = transcriptionText || null;
          }

          if (followUp) {
            console.log("Updating follow-up with recording for known lead");
            await updateFollowUpWithRecording(
              callSid,
              recordingUrl,
              transcription.text
            );
          } else if (prospect) {
            console.log("Updating prospect with recording for unknown caller");
            await updateProspectWithRecording(
              callSid,
              recordingUrl,
              transcription.text
            );
          }
        } else if (call) {
          // This is an outbound call recording
          console.log("Outbound call recording received");

          // Only save recordings and transcribe for calls >= 2 minutes
          if (duration >= 120) {
            console.log(
              `Outbound call >= 2 minutes (${duration}s) - saving recording and transcribing`
            );
            
            // Transcribe the recording using Assembly AI
            let transcription = null;
            try {
              console.log("Transcribing outbound call with Assembly AI...");
              transcription = await transcribeRecording(recordingUrl)
              console.log("Assembly AI transcription completed:", transcription ? "Success" : "Failed");
            } catch (transcriptionError) {
              console.error("Assembly AI transcription failed:", transcriptionError);
              // Fallback to Twilio transcription if available
              transcription = transcriptionText || null;
            }
            
            await updateCallWithRecording(
              callSid,
              recordingUrl,
              transcription.text,
              duration
            );
          } else {
            console.log(
              `Outbound call too short (${duration}s) - marking completed without saving recording`
            );
            // Update call status to completed without saving recording or transcription
            // This is needed to properly close the call record in the database
            await prisma.call.update({
              where: { callSid },
              data: {
                status: "completed",
                endTime: new Date(),
                duration: duration,
                updatedAt: new Date(),
              },
            });
          }
        } else {
          console.log("No matching record found for CallSid:", callSid);
        }
      } catch (error) {
        console.error("Error processing recording callback:", error);
      }

      // For recording callbacks, return success response (not TwiML)
      return new NextResponse("OK", { status: 200 });
    } else if (recordingUrl && recordingStatus !== 'completed') {
      // Log non-completed recording statuses for debugging
      console.log(`Recording callback received with status '${recordingStatus}' - skipping transcription`);
      return new NextResponse("OK", { status: 200 });
    }

    // Create Call record for outbound calls (when we have leadId and callSessionId)
    if (leadId && callSessionId && callSid) {
      try {
        const call = await createOrUpdateCall(
          callSid,
          leadId,
          callSessionId,
          from,
          to,
          direction,
          callStatus,
          userId
        );
        if (call) {
          console.log(`Call record created/updated for lead: ${leadId}`);
        }
      } catch (error) {
        console.error("Error creating/updating call:", error);
        // Continue processing even if save fails
      }
    }

    console.log(`Incoming call from ${from} to ${to}, Direction: ${direction}`);

    // Check if this is a client-initiated call (outbound through client)
    if (from && from.startsWith("client:")) {
      // This is a client calling out through your app
      const targetNumber = to;

      if (targetNumber) {
        console.log(
          `Client ${from} calling ${targetNumber} - recording enabled`
        );

        const dial = twiml.dial({
          callerId: customFromNumber || process.env.TWILIO_PHONE_NUMBER,
          timeout: 30,
          record: "record-from-answer-dual-channel",
          recordingStatusCallback: "/api/twiml",
        });

        dial.number(targetNumber);
      } else {
        twiml.say("Please provide a valid number to call");
      }
    } else if (direction === "inbound" && from && from.startsWith("+")) {
      // This is a real inbound call from a phone number - go straight to voicemail
      console.log(`Real inbound call from ${from} - sending to voicemail`);

      // Check if caller is a lead and create follow-up, or create prospect
      const lead = await checkIfLead(from);
      if (lead) {
        console.log(`Inbound call from known lead: ${lead.name || lead.id}`);
        try {
          await createFollowUp(lead.id, callSid, from, to, "inbound_voicemail");
        } catch (error) {
          console.error("Error creating follow-up for inbound call:", error);
        }
      } else {
        console.log(
          `Inbound call from unknown number: ${from} - creating prospect`
        );
        try {
          await createProspect(from, callSid, "inbound_call");
        } catch (error) {
          console.error("Error creating prospect for inbound call:", error);
        }
      }

      twiml.say(
        {
          voice: "Polly.Amy-Neural",
          language: "en-US",
        },
        "Hello! We are currently unavailable. Please leave a detailed message after the beep and we will get back to you soon."
      );

      twiml.record({
        timeout: 30,
        maxLength: 120,
        recordingStatusCallback: "/api/twiml",
      });
    } else if (direction === "outbound-api" || (leadId && callSessionId)) {
      // Handle outbound calls initiated by your application
      const targetNumber = to;

      if (targetNumber) {
        console.log(`Outbound call to ${targetNumber} - recording enabled`);

        const dial = twiml.dial({
          callerId: customFromNumber || process.env.TWILIO_PHONE_NUMBER,
          timeout: 30,
          record: "record-from-answer-dual-channel",
          recordingStatusCallback: "/api/twiml",
        });

        if (targetNumber.startsWith("client:")) {
          dial.client(targetNumber.replace("client:", ""));
        } else {
          dial.number(targetNumber);
        }
      } else {
        twiml.say("Please provide a valid number to call");
      }
    } else {
      // Fallback for any other scenarios
      console.log(
        `Unexpected call scenario - Direction: ${direction}, From: ${from}`
      );

      twiml.say("Thank you for calling. How can we help you today?");

      const gather = twiml.gather({
        numDigits: 1,
        action: "/api/handle-menu",
        timeout: 10,
      });
      gather.say(
        "Press 1 for sales, Press 2 for support, or stay on the line to speak with someone."
      );

      twiml.redirect("/api/twiml");
    }

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Error generating TwiML:", error);
    twiml.say(
      "An error occurred while processing the call. Please try again later."
    );
    return new NextResponse(twiml.toString(), {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}

// Optional: Handle GET requests for testing
export async function GET(request) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("This is a test TwiML response.");

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}