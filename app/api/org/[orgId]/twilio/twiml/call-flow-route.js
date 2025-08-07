// /api/org/[orgId]/twiml/route.js
import { NextResponse } from "next/server";
import twilio from "twilio";
import { handleInboundCall } from "@/lib/handlers/inbound-handler";
import { handleOutboundCall } from "@/lib/handlers/outbound-handler";
import { handleClientCall } from "@/lib/handlers/client-handler";
import { createOrUpdateCall, parseTwilioWebhook } from "@/lib/services/twilioCallService";
import { FlowEngine } from "@/lib/services/call-flow-service"; // NEW IMPORT
import prisma from "@/lib/prisma";

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
    
    // Initialize Flow Engine - replaces getPhoneConfiguration
    const flowEngine = new FlowEngine(orgId);
    const flowConfig = await flowEngine.loadFlowConfig(); // This is your new "phone config"
    
    console.log("Webhook processed:", {
      callSid: webhookData.callSid,
      direction: webhookData.direction,
      from: webhookData.from,
      hasRecording: webhookData.hasRecording(),
      isCompleted: webhookData.isCompleted()
    });

    // Execute the flow engine for data operations
    const flowResult = await flowEngine.executeFlow(webhookData, flowConfig);
    
    if (flowConfig.enableFlowLogging) {
      console.log("Flow execution result:", flowResult);
    }

    // Handle recording callbacks first (unchanged logic)
    if (webhookData.hasRecording()) {
      return await handleRecordingCallback(webhookData, flowConfig, orgId);
    }

    // Route to appropriate handler based on call type
    const callType = determineCallType(webhookData);
    
    switch (callType) {
      case 'training':
        return handleTrainingCall(twiml, webhookData, flowConfig, orgId);
        
      case 'client_outbound':
        return handleClientCall(twiml, webhookData, flowConfig, orgId);
        
      case 'inbound':
        return handleInboundCall(twiml, webhookData, flowConfig, orgId);
        
      case 'outbound_api':
        return handleOutboundCall(twiml, webhookData, flowConfig, orgId);
        
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

// Helper functions (mostly unchanged)
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

// REMOVED: createCallRecord() - now handled by FlowEngine

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

// REMOVED: getPhoneConfig() - replaced by FlowEngine.loadFlowConfig()
// REMOVED: handleTranscription() - now handled by FlowEngine

// Updated recording callback to use flow config
async function handleRecordingCallback(webhookData, flowConfig, orgId) {
  try {
    const { recordingUrl, transcriptionText, callSid } = webhookData;
    
    // Use flow config instead of phone config
    const shouldTranscribe = webhookData.direction === "inbound" 
      ? flowConfig.transcribeInbound 
      : flowConfig.transcribeOutbound;

    let finalTranscription = null;
    
    if (shouldTranscribe && flowConfig.transcriptionProvider !== "none") {
      finalTranscription = await handleTranscription(
        recordingUrl,
        transcriptionText,
        flowConfig,
        webhookData.direction === "inbound" ? "inbound" : "outbound"
      );
    }

    // Update call with recording info (this could also be moved to FlowEngine)
    await prisma.call.updateMany({
      where: { callSid },
      data: {
        recordingUrl,
        transcription: finalTranscription,
        recordingProcessedAt: new Date(),
      },
    });

    return new NextResponse("Recording processed", { status: 200 });
    
  } catch (error) {
    console.error("Recording callback error:", error);
    return new NextResponse("Recording processing failed", { status: 500 });
  }
}

// Keep transcription helper (or move to FlowEngine)
async function handleTranscription(recordingUrl, transcriptionText, flowConfig, callType) {
  const shouldTranscribe = callType === "inbound"
    ? flowConfig.transcribeInbound
    : flowConfig.transcribeOutbound;

  if (!shouldTranscribe || flowConfig.transcriptionProvider === "none") {
    return transcriptionText || null;
  }

  let transcription = null;
  try {
    if (flowConfig.transcriptionProvider === "assemblyai") {
      console.log(`Transcribing ${callType} call with Assembly AI...`);
      transcription = await transcribeRecording(recordingUrl);
      console.log("Assembly AI transcription completed:", transcription ? "Success" : "Failed");
    } else {
      transcription = { text: transcriptionText };
    }
  } catch (transcriptionError) {
    console.error(`${flowConfig.transcriptionProvider} transcription failed:`, transcriptionError);
    transcription = { text: transcriptionText || null };
  }

  return transcription?.text || transcriptionText;
}