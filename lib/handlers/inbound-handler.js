// /lib/handlers/inbound-handler.js
import { NextResponse } from "next/server";
import {
  checkIfLead,
  createFollowUp,
  createProspect,
} from "@/lib/services/twilioCallService";

export async function handleInboundCall(twiml, webhookData, callFlowConfig, orgId) {
  const { from, to, callSid } = webhookData;

  console.log(`[Inbound] ${from} → ${to} | flow: ${callFlowConfig.inboundFlow}`);

  // 1. Auto-create / attach lead
  await handleLeadCreation(from, callSid, to, callFlowConfig);

  // 2. Route by inboundFlow
  switch (callFlowConfig.inboundFlow) {
    case "voicemail":
      return handleVoicemailFlow(twiml, callFlowConfig, orgId);

    case "forward":
      return handleForwardFlow(twiml, callFlowConfig, orgId);

    // case "ivr":
    //   return handleIVRFlow(twiml, orgId);

    default:
      // safe fallback
      return handleVoicemailFlow(twiml, callFlowConfig, orgId);
  }
}

/* ---------- helpers ---------- */

async function handleLeadCreation(from, callSid, to, cfg) {
  try {
    const lead = await checkIfLead(from);
    if (lead && cfg.autoCreateFollowUps) {
      await createFollowUp(lead.id, callSid, from, to, "inbound_voicemail");
    } else if (!lead && cfg.autoCreateLeads) {
      await createProspect(from, callSid, "inbound_call");
    }
  } catch (e) {
    console.error("[Inbound] Lead creation error:", e);
  }
}

function handleVoicemailFlow(twiml, cfg, orgId) {
  const msg =
    cfg.voicemailMessage ||
    "Hi, we’re unavailable. Leave a message after the beep.";
  twiml.say({ voice: "Polly.Amy-Neural" }, msg);

  twiml.record({
    timeout: 5,
    maxLength: 120,
    recordingStatusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/org/${orgId}/twiml/recording`,
  });

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}

function handleForwardFlow(twiml, cfg, orgId) {
  if (!cfg.forwardToNumber) {
    console.warn("Forward missing number → fallback voicemail");
    return handleVoicemailFlow(twiml, cfg, orgId);
  }

  console.log(`[Inbound] Forwarding to ${cfg.forwardToNumber}`);

  const dial = twiml.dial({
    timeout: 25,
    record: cfg.recordInboundCalls ? "record-from-answer-dual-channel" : undefined,
    recordingStatusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/org/${orgId}/twiml/recording`,
  });
  dial.number(cfg.forwardToNumber);

  // fallback message if no pickup
  twiml.say({ voice: "Polly.Amy-Neural" }, "Unable to connect. Leave a message.");
  twiml.record({
    timeout: 5,
    maxLength: 120,
    recordingStatusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/org/${orgId}/twiml/recording`,
  });

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}

function handleIVRFlow(twiml, orgId) {
  const gather = twiml.gather({
    numDigits: 1,
    timeout: 10,
    action: `${process.env.NEXT_PUBLIC_BASE_URL}/api/org/${orgId}/twiml/ivr-action`,
  });
  gather.say(
    { voice: "Polly.Amy-Neural" },
    "Press 1 for sales, 2 for support, or stay on the line."
  );

  // fallback if no digit pressed
  twiml.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/api/org/${orgId}/twiml`);

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}