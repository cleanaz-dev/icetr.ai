import { NextResponse } from "next/server";
import twilio from "twilio";
import prisma from "@/lib/prisma";
import { transcribeRecording } from "@/lib/services/integrations/assembly-ai";
import {
  checkIfLead,
  isTrainingCall,
  createOrUpdateCall,
  createFollowUp,
  updateFollowUpWithRecording,
  createProspect,
  updateProspectWithRecording,
  updateCallWithRecording
} from "@/lib/services/twilioCallService";

// Helper function to get phone configuration
async function getPhoneConfig(orgId) {
  try {
    const phoneConfig = await prisma.phoneConfiguration.findUnique({
      where: { orgId },
    });

    if (!phoneConfig) {
      return {
        recordingEnabled: true,
        minOutboundDuration: 120,
        recordInboundCalls: true,
        recordOutboundCalls: true,
        transcriptionProvider: "assemblyai",
        transcribeInbound: true,
        transcribeOutbound: true,
        inboundFlow: "voicemail",
        voicemailMessage: null,
        forwardToNumber: null,
        autoCreateLeads: true,
        autoCreateFollowUps: true,
      };
    }

    return phoneConfig;
  } catch (error) {
    console.error("Error fetching phone config:", error);
    return null;
  }
}

// Helper to determine orgId for inbound calls
async function determineOrgId(to, formDataOrgId) {
  // If orgId is in formData (outbound calls), use it
  if (formDataOrgId) {
    return formDataOrgId;
  }

  // For inbound calls, determine org by the phone number called
  try {
    const organization = await prisma.organization.findFirst({
      where: {
        OR: [
          { twilioPhoneNumber: to },
          { phoneNumbers: { has: to } }, // If you store multiple numbers as array
        ]
      }
    });
    
    return organization?.id || null;
  } catch (error) {
    console.error("Error determining orgId:", error);
    return null;
  }
}

// Helper function to handle transcription based on config
async function handleTranscription(recordingUrl, transcriptionText, phoneConfig, callType) {
  const shouldTranscribe = callType === 'inbound' 
    ? phoneConfig.transcribeInbound 
    : phoneConfig.transcribeOutbound;

  if (!shouldTranscribe || phoneConfig.transcriptionProvider === 'none') {
    return transcriptionText || null;
  }

  let transcription = null;
  try {
    if (phoneConfig.transcriptionProvider === 'assemblyai') {
      console.log(`Transcribing ${callType} call with Assembly AI...`);
      transcription = await transcribeRecording(recordingUrl);
      console.log("Assembly AI transcription completed:", transcription ? "Success" : "Failed");
    } else {
      transcription = { text: transcriptionText };
    }
  } catch (transcriptionError) {
    console.error(`${phoneConfig.transcriptionProvider} transcription failed:`, transcriptionError);
    transcription = { text: transcriptionText || null };
  }

  return transcription?.text || transcriptionText;
}

// Separate function to handle recording callbacks
async function handleRecordingCallback(callSid, recordingUrl, transcriptionText, recordingDuration, orgId, phoneConfig) {
  const duration = parseInt(recordingDuration) || 0;
  console.log(`Recording duration: ${duration} seconds`);

  try {
    // Check if this was a training call first
    const wasTrainingCall = await isTrainingCall(callSid, orgId); // Pass orgId

    if (wasTrainingCall) {
      console.log("Training call recording received");
      // Always transcribe training calls (ignore config)
      const transcription = await handleTranscription(
        recordingUrl, 
        transcriptionText, 
        { ...phoneConfig, transcribeInbound: true, transcriptionProvider: 'assemblyai' }, 
        'inbound'
      );
      console.log("Training call processed successfully");
      return true;
    }

    // Check record types with orgId
    const followUp = await prisma.followUp.findFirst({
      where: { 
        callSid,
        lead: { organizationId: orgId } // Ensure org isolation
      },
      include: { lead: true },
    });

    const prospect = await prisma.prospect.findFirst({
      where: { 
        callSid,
        organizationId: orgId // Ensure org isolation
      },
    });

    const call = await prisma.call.findFirst({
      where: { 
        callSid,
        lead: { organizationId: orgId } // Ensure org isolation
      },
    });

    if (followUp || prospect) {
      // Inbound call handling
      console.log("Inbound voicemail recording received");

      if (phoneConfig.recordInboundCalls) {
        const transcription = await handleTranscription(recordingUrl, transcriptionText, phoneConfig, 'inbound');

        if (followUp) {
          console.log("Updating follow-up with recording for known lead");
          await updateFollowUpWithRecording(callSid, recordingUrl, transcription, orgId);
        } else if (prospect) {
          console.log("Updating prospect with recording for unknown caller");
          await updateProspectWithRecording(callSid, recordingUrl, transcription, orgId);
        }
      } else {
        console.log("Inbound recording disabled - skipping recording save");
      }

    } else if (call) {
      // Outbound call handling
      console.log("Outbound call recording received");

      if (phoneConfig.recordOutboundCalls && phoneConfig.recordingEnabled && 
          duration >= phoneConfig.minOutboundDuration) {
        
        console.log(`Outbound call >= ${phoneConfig.minOutboundDuration}s (${duration}s) - saving recording`);

        const transcription = await handleTranscription(recordingUrl, transcriptionText, phoneConfig, 'outbound');
        await updateCallWithRecording(callSid, recordingUrl, transcription, duration, orgId);
      } else {
        console.log(`Outbound call conditions not met - marking completed without recording`);
        
        await prisma.call.update({
          where: { 
            callSid,
            lead: { organizationId: orgId }
          },
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

    return true;
  } catch (error) {
    console.error("Error processing recording callback:", error);
    return false;
  }
}

// Handle inbound call flow
function handleInboundCallFlow(twiml, phoneConfig, orgId) {
  if (phoneConfig.inboundFlow === "voicemail") {
    const voicemailMessage = phoneConfig.voicemailMessage || 
      "Hello! We are currently unavailable. Please leave a detailed message after the beep and we will get back to you soon.";

    twiml.say({
      voice: "Polly.Amy-Neural",
      language: "en-US",
    }, voicemailMessage);

    twiml.record({
      timeout: 30,
      maxLength: 120,
      recordingStatusCallback: phoneConfig.recordInboundCalls ? `/api/org/${orgId}/twiml` : undefined,
    });
  } 
  else if (phoneConfig.inboundFlow === "forward" && phoneConfig.forwardToNumber) {
    console.log(`Forwarding call to ${phoneConfig.forwardToNumber}`);
    
    const dial = twiml.dial({
      timeout: 30,
      record: phoneConfig.recordInboundCalls ? "record-from-answer-dual-channel" : undefined,
      recordingStatusCallback: phoneConfig.recordInboundCalls ? `/api/org/${orgId}/twiml` : undefined,
    });
    
    dial.number(phoneConfig.forwardToNumber);
    
    // Fallback to voicemail
    twiml.say({
      voice: "Polly.Amy-Neural",
      language: "en-US",
    }, "We're unable to take your call right now. Please leave a message after the beep.");
    
    twiml.record({
      timeout: 30,
      maxLength: 120,
      recordingStatusCallback: phoneConfig.recordInboundCalls ? `/api/org/${orgId}/twiml` : undefined,
    });
  }
  else if (phoneConfig.inboundFlow === "ivr") {
    twiml.say("Thank you for calling. How can we help you today?");
    
    const gather = twiml.gather({
      numDigits: 1,
      action: `/api/org/${orgId}/handle-menu`,
      timeout: 10,
    });
    gather.say("Press 1 for sales, Press 2 for support, or stay on the line to speak with someone.");
    
    twiml.redirect(`/api/org/${orgId}/twiml`);
  }
}

// Main POST handler
export async function POST(request, {params}) {
  const { orgId: paramOrgId } = await params;
  const twiml = new twilio.twiml.VoiceResponse();

  try {
    // Parse form-encoded data
    const formData = await request.formData();
    console.log("formData", formData);

    // Get webhook parameters
    const from = formData.get("From");
    const to = formData.get("To");
    const callSid = formData.get("CallSid");
    const callStatus = formData.get("CallStatus");
    const direction = formData.get("Direction");
    const leadId = formData.get("leadId");
    const callSessionId = formData.get("callSessionId");
    const userId = formData.get("userId");
    const recordingUrl = formData.get("RecordingUrl");
    const recordingStatus = formData.get("RecordingStatus");
    const transcriptionText = formData.get("TranscriptionText");
    const recordingDuration = formData.get("RecordingDuration");
    const customFromNumber = formData.get("fromNumber");
    const formDataOrgId = formData.get("orgId"); // orgId from form data

    // Determine the actual orgId to use
    const orgId = paramOrgId || await determineOrgId(to, formDataOrgId);
    
    if (!orgId) {
      console.error("Could not determine orgId for call");
      return NextResponse.json({ message: "Invalid Request - No Organization Found" }, { status: 400 });
    }

    // Get phone configuration
    const phoneConfig = await getPhoneConfig(orgId);
    if (!phoneConfig) {
      console.error("Could not load phone configuration for org:", orgId);
      return NextResponse.json({ message: "Configuration Error" }, { status: 500 });
    }

    console.log(`Processing call for org ${orgId}: CallSid: ${callSid}, From: ${from}, Direction: ${direction}`);

    // Handle recording callbacks
    if (recordingUrl && callSid && recordingStatus === "completed") {
      console.log("Recording callback received with status 'completed'");
      
      await handleRecordingCallback(
        callSid, 
        recordingUrl, 
        transcriptionText, 
        recordingDuration, 
        orgId, 
        phoneConfig
      );

      return new NextResponse("OK", { status: 200 });
    } else if (recordingUrl && recordingStatus !== "completed") {
      console.log(`Recording callback received with status '${recordingStatus}' - skipping`);
      return new NextResponse("OK", { status: 200 });
    }

    // Create Call record for outbound calls
    if (leadId && callSessionId && callSid) {
      try {
        const call = await createOrUpdateCall(
          callSid, leadId, callSessionId, from, to, direction, callStatus, userId, orgId
        );
        if (call) {
          console.log(`Call record created/updated for lead: ${leadId}`);
        }
      } catch (error) {
        console.error("Error creating/updating call:", error);
      }
    }

    // Handle different call scenarios
    console.log(`Processing call: From: ${from}, Direction: ${direction}`);

    // Training calls
    const trainingCall = await isTrainingCall(from, callSid, orgId);
    if (trainingCall && direction === "inbound") {
      console.log(`Training call detected: ${from}`);

      const dial = twiml.dial({
        timeout: 30,
        record: phoneConfig.recordingEnabled ? "record-from-answer-dual-channel" : undefined,
        recordingStatusCallback: phoneConfig.recordingEnabled ? `/api/org/${orgId}/twiml` : undefined,
      });

      dial.client("user");
      twiml.say({
        voice: "Polly.Amy-Neural",
        language: "en-US",
      }, "Training session could not connect to your device. Please refresh your browser and try again.");

      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { "Content-Type": "application/xml" },
      });
    }

    // Client-initiated outbound calls
    if (from && from.startsWith("client:")) {
      const targetNumber = to;

      if (targetNumber) {
        console.log(`Client ${from} calling ${targetNumber}`);

        const dial = twiml.dial({
          callerId: customFromNumber || process.env.TWILIO_PHONE_NUMBER,
          timeout: 30,
          record: phoneConfig.recordingEnabled && phoneConfig.recordOutboundCalls ? "record-from-answer-dual-channel" : undefined,
          recordingStatusCallback: phoneConfig.recordingEnabled && phoneConfig.recordOutboundCalls ? `/api/org/${orgId}/twiml` : undefined,
        });

        dial.number(targetNumber);
      } else {
        twiml.say("Please provide a valid number to call");
      }
    } 
    // Inbound calls from phone numbers
    else if (direction === "inbound" && from && from.startsWith("+")) {
      console.log(`Inbound call from ${from} - flow: ${phoneConfig.inboundFlow}`);

      // Handle lead/prospect creation with orgId
      const lead = await checkIfLead(from, orgId);
      if (lead && phoneConfig.autoCreateFollowUps) {
        console.log(`Known lead calling: ${lead.name || lead.id}`);
        try {
          await createFollowUp(lead.id, callSid, from, to, "inbound_voicemail", orgId);
        } catch (error) {
          console.error("Error creating follow-up:", error);
        }
      } else if (!lead && phoneConfig.autoCreateLeads) {
        console.log(`Unknown caller: ${from} - creating prospect`);
        try {
          await createProspect(from, callSid, "inbound_call", orgId);
        } catch (error) {
          console.error("Error creating prospect:", error);
        }
      }

      // Handle the call flow
      handleInboundCallFlow(twiml, phoneConfig, orgId);
    } 
    // Application-initiated outbound calls
    else if (direction === "outbound-api" || (leadId && callSessionId)) {
      const targetNumber = to;

      if (targetNumber) {
        console.log(`Outbound call to ${targetNumber}`);

        const dial = twiml.dial({
          callerId: customFromNumber || process.env.TWILIO_PHONE_NUMBER,
          timeout: 30,
          record: phoneConfig.recordingEnabled && phoneConfig.recordOutboundCalls ? "record-from-answer-dual-channel" : undefined,
          recordingStatusCallback: phoneConfig.recordingEnabled && phoneConfig.recordOutboundCalls ? `/api/org/${orgId}/twiml` : undefined,
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
      // Fallback
      console.log(`Unexpected call scenario - Direction: ${direction}, From: ${from}`);
      
      twiml.say("Thank you for calling. How can we help you today?");
      
      const gather = twiml.gather({
        numDigits: 1,
        action: `/api/org/${orgId}/handle-menu`,
        timeout: 10,
      });
      gather.say("Press 1 for sales, Press 2 for support, or stay on the line to speak with someone.");
      
      twiml.redirect(`/api/org/${orgId}/twiml`);
    }

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });

  } catch (error) {
    console.error("Error generating TwiML:", error);
    twiml.say("An error occurred while processing the call. Please try again later.");
    return new NextResponse(twiml.toString(), {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}

export async function GET(request) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("This is a test TwiML response.");

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}