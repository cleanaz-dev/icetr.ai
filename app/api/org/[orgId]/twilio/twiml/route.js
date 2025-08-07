// /api/org/[orgId]/twiml/route.js
import { NextResponse } from "next/server";
import twilio from "twilio";
import { handleInboundCall } from "@/lib/handlers/inbound-handler";
import { handleOutboundCall } from "@/lib/handlers/outbound-handler";
import { handleClientCall } from "@/lib/handlers/client-handler";
import { createOrUpdateCall, parseTwilioWebhook } from "@/lib/services/twilioCallService";
import { shouldTranscribeCall } from "@/lib/services/integrations/assembly-ai";
import prisma from "@/lib/prisma";
import { getOrgCallFlowConfig } from "@/lib/db/call-flow";

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
    
    // Get call flow configuration (replaced phoneConfig)
    const callFlowConfig = await getOrgCallFlowConfig(orgId);
    console.log("callFlowConfig:", callFlowConfig);
    
    console.log("Webhook processed:", {
      callSid: webhookData.callSid,
      direction: webhookData.direction,
      from: webhookData.from,
      hasRecording: webhookData.hasRecording(),
      isCompleted: webhookData.isCompleted()
    });

    // Handle recording callbacks first
    if (webhookData.hasRecording()) {
      return await handleRecordingCallback(webhookData, callFlowConfig, orgId);
    }

    // Create/update call record for outbound calls
    await createCallRecord(webhookData);

    // Route to appropriate handler based on call type
    const callType = determineCallType(webhookData);
    
    switch (callType) {
      case 'training':
        return handleTrainingCall(twiml, webhookData, callFlowConfig, orgId);
        
      case 'client_outbound':
        return handleClientCall(twiml, webhookData, callFlowConfig, orgId);
        
      case 'inbound':
        return handleInboundCall(twiml, webhookData, callFlowConfig, orgId);
        
      case 'outbound_api':
        return handleOutboundCall(twiml, webhookData, callFlowConfig, orgId);
        
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


// NEW: Add media streams for live transcription
function addLiveTranscription(twiml, callSid, orgId, direction, callFlowConfig) {
  // Check if transcription is enabled for this call direction
  const shouldTranscribe = (direction === 'inbound' && callFlowConfig.transcribeInbound) ||
                          (direction === 'outbound-api' && callFlowConfig.transcribeOutbound) ||
                          (direction === 'outbound' && callFlowConfig.transcribeOutbound);

  if (shouldTranscribe) {
    // Start media stream to your WebSocket server
    const start = twiml.start();
    const stream = start.stream({
      name: 'transcription_stream',
      url: `wss://${process.env.DOMAIN}/api/org/${orgId}/transcription/stream?callSid=${callSid}`
    });
    
    console.log(`Live transcription started for call ${callSid}`);
  }
}

// Helper functions (updated to use callFlowConfig)
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

// UPDATED: Include transcription in fallback
function handleFallback(twiml, orgId) {
  // Add live transcription for unknown calls too
  addLiveTranscription(twiml, 'fallback', orgId, 'inbound', { transcribeInbound: true });
  
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