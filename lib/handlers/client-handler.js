// /lib/handlers/client-handler.js
import { NextResponse } from "next/server";

export function handleClientCall(twiml, webhookData, phoneConfig, orgId) {
  const { from, to, customFromNumber } = webhookData;
  const targetNumber = to;

  if (!targetNumber) {
    twiml.say("Please provide a valid number to call");
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }

  console.log(`Client ${from} calling ${targetNumber} - recording: ${phoneConfig.recordingEnabled}`);

  const dial = twiml.dial({
    callerId: customFromNumber || process.env.TWILIO_PHONE_NUMBER,
    timeout: 30,
    record: (phoneConfig.recordingEnabled && phoneConfig.recordOutboundCalls) 
      ? "record-from-answer-dual-channel" 
      : undefined,
    recordingStatusCallback: (phoneConfig.recordingEnabled && phoneConfig.recordOutboundCalls) 
      ? `/api/org/${orgId}/twiml` 
      : undefined,
  });

  dial.number(targetNumber);

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}

