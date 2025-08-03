// /api/org/[orgId]/twiml/route.js
import { NextResponse } from "next/server";
import twilio from "twilio";
import { handleInboundCall } from "@/lib/handlers/inbound-handler";
import { handleOutboundCall } from "@/lib/handlers/outbound-handler";
import { handleClientCall } from "@/lib/handlers/client-handler";
import { createOrUpdateCall, parseTwilioWebhook } from "@/lib/services/twilioCallService";
import { getPhoneConfiguration } from "@/lib/db/integrations";


export async function POST(request, { params }) {
  const { orgId } = await params;

  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  const twiml = new twilio.twiml.VoiceResponse();

  try {
    // Parse webhook data
    const formData = await request.formData();
    const webhookData = parseTwilioWebhook(formData);
    
    // Get phone configuration
    const phoneConfig = await getPhoneConfiguration(orgId);
    
    console.log("Webhook processed:", {
      callSid: webhookData.callSid,
      direction: webhookData.direction,
      from: webhookData.from,
      hasRecording: webhookData.hasRecording(),
      isCompleted: webhookData.isCompleted()
    });

    // Handle recording callbacks first
    if (webhookData.hasRecording()) {
      return await handleRecordingCallback(webhookData, phoneConfig, orgId);
    }

    // Create/update call record for outbound calls
    await createCallRecord(webhookData);

    // Route to appropriate handler based on call type
    const callType = determineCallType(webhookData);
    
    switch (callType) {
      case 'training':
        return handleTrainingCall(twiml, webhookData, phoneConfig, orgId);
        
      case 'client_outbound':
        return handleClientCall(twiml, webhookData, phoneConfig, orgId);
        
      case 'inbound':
        return handleInboundCall(twiml, webhookData, phoneConfig, orgId);
        
      case 'outbound_api':
        return handleOutboundCall(twiml, webhookData, phoneConfig, orgId);
        
      default:
        return handleFallback(twiml, orgId);
    }

  } catch (error) {
    console.error("Error in TwiML route:", error);
    twiml.say("An error occurred while processing the call. Please try again later.");
    return new NextResponse(twiml.toString(), {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}

// Helper functions
function determineCallType(webhookData) {
  const { from, direction, leadId, callSessionId } = webhookData;
  
  if (from?.startsWith("client:")) {
    return 'client_outbound';
  }
  
  if (direction === "inbound" && from?.startsWith("+")) {
    return 'inbound';
  }
  
  if (direction === "outbound-api" || (leadId && callSessionId)) {
    return 'outbound_api';
  }
  
  return 'unknown';
}

async function createCallRecord(webhookData) {
  const { leadId, callSessionId, callSid } = webhookData;
  
  if (leadId && callSessionId && callSid) {
    try {
      const call = await createOrUpdateCall({
        callSid: webhookData.callSid,
        leadId: webhookData.leadId,
        callSessionId: webhookData.callSessionId,
        fromNumber: webhookData.from,
        to: webhookData.to,
        direction: webhookData.direction,
        callStatus: webhookData.callStatus,
        userId: webhookData.userId,
        orgId: webhookData.orgId,
        updates: {},
      });
      
      if (call) {
        console.log(`Call record created/updated for lead: ${leadId}`);
      }
    } catch (error) {
      console.error("Error creating/updating call:", error);
    }
  }
}

function handleFallback(twiml, orgId) {
  twiml.say("Thank you for calling. How can we help you today?");
  
  const gather = twiml.gather({
    numDigits: 1,
    action: `/api/org/${orgId}/handle-menu`,
    timeout: 10,
  });
  
  gather.say("Press 1 for sales, Press 2 for support, or stay on the line to speak with someone.");
  twiml.redirect(`/api/org/${orgId}/twiml`);
  
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}

export async function GET(request) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("This is a test TwiML response.");

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}

// Helper function to get phone configuration
async function getPhoneConfig(orgId) {
  try {
    const phoneConfig = await prisma.phoneConfiguration.findUnique({
      where: { orgId },
    });

    // Return defaults if no config exists
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
    // Return safe defaults on error
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
}

// Helper function to handle transcription based on config
async function handleTranscription(
  recordingUrl,
  transcriptionText,
  phoneConfig,
  callType
) {
  // Check if transcription is enabled for this call type
  const shouldTranscribe =
    callType === "inbound"
      ? phoneConfig.transcribeInbound
      : phoneConfig.transcribeOutbound;

  if (!shouldTranscribe || phoneConfig.transcriptionProvider === "none") {
    return transcriptionText || null;
  }

  let transcription = null;
  try {
    if (phoneConfig.transcriptionProvider === "assemblyai") {
      console.log(`Transcribing ${callType} call with Assembly AI...`);
      transcription = await transcribeRecording(recordingUrl);
      console.log(
        "Assembly AI transcription completed:",
        transcription ? "Success" : "Failed"
      );
    } else {
      // Use Twilio transcription
      transcription = { text: transcriptionText };
    }
  } catch (transcriptionError) {
    console.error(
      `${phoneConfig.transcriptionProvider} transcription failed:`,
      transcriptionError
    );
    // Fallback to Twilio transcription if available
    transcription = { text: transcriptionText || null };
  }

  return transcription?.text || transcriptionText;
}
