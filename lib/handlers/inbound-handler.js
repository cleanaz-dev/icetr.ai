// /lib/handlers/inbound-handler.js
import { NextResponse } from "next/server";
import { checkIfLead, createFollowUp, createProspect, isTrainingCall } from "../services/twilioCallService";



export async function handleInboundCall(twiml, webhookData, phoneConfig, orgId) {
  const { from, to, callSid } = webhookData;
  
  console.log(`Real inbound call from ${from} - flow: ${phoneConfig.inboundFlow}`);

  // Check if this is a training call
  const trainingCall = await isTrainingCall(from, callSid, orgId);
  if (trainingCall) {
    return handleTrainingCall(twiml, webhookData, phoneConfig, orgId);
  }

  // Handle lead/prospect creation
  await handleLeadCreation(from, callSid, to, phoneConfig);

  // Route based on inbound flow configuration
  switch (phoneConfig.inboundFlow) {
    case 'voicemail':
      return handleVoicemailFlow(twiml, phoneConfig, orgId);
      
    case 'forward':
      return handleForwardFlow(twiml, phoneConfig, orgId);
      
    case 'ivr':
      return handleIVRFlow(twiml, orgId);
      
    default:
      return handleVoicemailFlow(twiml, phoneConfig, orgId);
  }
}

export function handleTrainingCall(twiml, webhookData, phoneConfig, orgId) {
  console.log(`Training call from Bland AI detected: ${webhookData.from}`);

  const dial = twiml.dial({
    timeout: 30,
    record: phoneConfig.recordingEnabled ? "record-from-answer-dual-channel" : undefined,
    recordingStatusCallback: phoneConfig.recordingEnabled ? `/api/org/${orgId}/twiml` : undefined,
  });

  dial.client("user");

  twiml.say(
    {
      voice: "Polly.Amy-Neural",
      language: "en-US",
    },
    "Training session could not connect to your device. Please refresh your browser and try again."
  );

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}

async function handleLeadCreation(from, callSid, to, phoneConfig) {
  try {
    const lead = await checkIfLead(from);
    
    if (lead && phoneConfig.autoCreateFollowUps) {
      console.log(`Inbound call from known lead: ${lead.name || lead.id}`);
      await createFollowUp(lead.id, callSid, from, to, "inbound_voicemail");
    } else if (!lead && phoneConfig.autoCreateLeads) {
      console.log(`Inbound call from unknown number: ${from} - creating prospect`);
      await createProspect(from, callSid, "inbound_call");
    }
  } catch (error) {
    console.error("Error handling lead creation:", error);
  }
}

function handleVoicemailFlow(twiml, phoneConfig, orgId) {
  const voicemailMessage = phoneConfig.voicemailMessage || 
    "Hello! We are currently unavailable. Please leave a detailed message after the beep and we will get back to you soon.";

  twiml.say(
    {
      voice: "Polly.Amy-Neural",
      language: "en-US",
    },
    voicemailMessage
  );

  twiml.record({
    timeout: 30,
    maxLength: 120,
    recordingStatusCallback: phoneConfig.recordInboundCalls ? `/api/org/${orgId}/twiml` : undefined,
  });

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}

function handleForwardFlow(twiml, phoneConfig, orgId) {
  if (!phoneConfig.forwardToNumber) {
    console.log("Forward flow selected but no forward number configured - falling back to voicemail");
    return handleVoicemailFlow(twiml, phoneConfig, orgId);
  }

  console.log(`Forwarding call to ${phoneConfig.forwardToNumber}`);

  const dial = twiml.dial({
    timeout: 30,
    record: phoneConfig.recordInboundCalls ? "record-from-answer-dual-channel" : undefined,
    recordingStatusCallback: phoneConfig.recordInboundCalls ? `/api/org/${orgId}/twiml` : undefined,
  });

  dial.number(phoneConfig.forwardToNumber);

  // Fallback to voicemail if forward fails
  twiml.say(
    {
      voice: "Polly.Amy-Neural",
      language: "en-US",
    },
    "We're unable to take your call right now. Please leave a message after the beep."
  );

  twiml.record({
    timeout: 30,
    maxLength: 120,
    recordingStatusCallback: phoneConfig.recordInboundCalls ? `/api/org/${orgId}/twiml` : undefined,
  });

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}

function handleIVRFlow(twiml, orgId) {
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