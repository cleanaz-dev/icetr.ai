// app/api/org/[orgId]/twiml/route.js
import { NextResponse } from "next/server";
import twilio from "twilio";
import { handleInboundCall } from "@/lib/handlers/inbound-handler";
import { handleOutboundCall } from "@/lib/handlers/outbound-handler";
import {
  createOrUpdateCall,
  parseTwilioWebhook,
} from "@/lib/services/twilioCallService";
import { getOrgCallFlowConfig } from "@/lib/db/call-flow";
import {
  setUpNextTrainingCache,
  dequeueTraining,
  getCachedCallFlowConfig,
  peekTrainingQueue,
  setCallStatus,
  deleteUpNextTrainingCache,
} from "@/lib/services/integrations/redis";

/* --------------------------------------------------
   Queue-driven BlandAI inbound handler
-------------------------------------------------- */
async function handleBlandAIInbound(twiml, formData, orgId) {
  const trainingNumber = "+14374475892";
  const head = await peekTrainingQueue(orgId, trainingNumber);

  if (!head) {
    twiml.say("No active training session.");
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }

  const { clerkId } = head;
  const dial = twiml.dial({ timeout: 30, answerOnBridge: true });
  dial.client(clerkId);

  // clean-up both queue and cache
  await dequeueTraining(orgId, trainingNumber);
  await deleteUpNextTrainingCache(orgId);

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
/* --------------------------------------------------
   Recording callback placeholder
-------------------------------------------------- */
async function handleRecordingCallback(webhookData, callFlowConfig, orgId) {
  const twiml = new twilio.twiml.VoiceResponse();
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}

/* --------------------------------------------------
   Fallback handler
-------------------------------------------------- */
function handleFallback(twiml, orgId) {
  twiml.say("We could not determine your call type. Goodbye.");
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}

const inboundBlandAi = "+14372920555";

/* --------------------------------------------------
   Main POST handler
-------------------------------------------------- */
export async function POST(request, { params }) {
  const { orgId } = await params;

  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  const twiml = new twilio.twiml.VoiceResponse();

  try {
    const formData = await request.formData();
    console.log("📦 form data:", [...formData.entries()]);

    /* === TRAINING OUTBOUND LEG === */
    if (formData.get("callType") === "training") {
      const payload = {
        userId: formData.get("userId"),
        scenarioId: formData.get("scenarioId"),
        callSid: formData.get("CallSid"),
      };

      // cache hand-off ticket
      await setUpNextTrainingCache(orgId, payload);

      // fire-and-forget Bland call with the exact payload the UI already validated
      fetch(
        `https://icetr-ai.vercel.app/api/org/${orgId}/calls/training-bland`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: payload.scenarioId,
            clerkId: payload.userId,
            phoneNumberToCall: "+14374475892",
          }),
        }
      ).catch(console.error);

      twiml.hangup();
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { "Content-Type": "application/xml" },
      });
    }

    /* === 1. CHECK FOR BLANDAI INBOUND CALL === */
    const fromNumber = formData.get("From");
    const direction = formData.get("Direction");

    if (direction === "inbound" && fromNumber === inboundBlandAi) {
      console.log("🤖 BlandAI inbound call detected from:", fromNumber);
      return await handleBlandAIInbound(twiml, formData, orgId);
    }

    /* === ORIGINAL PIPELINE === */
    const webhookData = parseTwilioWebhook(
      formData,
      formData.get("leadId"),
      formData.get("callSessionId"),
      orgId,
      formData.get("clerkId")
    );

    await setCallStatus(
      webhookData.callSid,
      webhookData.callStatus,
      Number(webhookData.callDuration || 0)
    );

    let callFlowConfig = await getCachedCallFlowConfig(orgId);

    if (direction === "inbound") {
      return handleInboundCall(twiml, webhookData, callFlowConfig, orgId);
    } else if (direction === "outbound-dial") {
      return handleOutboundCall(twiml, webhookData, callFlowConfig, orgId);
    } else if (formData.get("RecordingUrl")) {
      return handleRecordingCallback(webhookData, callFlowConfig, orgId);
    }

    return handleFallback(twiml, orgId);
  } catch (err) {
    console.error("🚨 TwiML route error:", err);
    twiml.say("An unexpected error occurred. Please try again later.");
    return new NextResponse(twiml.toString(), {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
