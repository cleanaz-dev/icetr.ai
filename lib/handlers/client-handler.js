// /lib/handlers/client-handler.js
import { NextResponse } from "next/server";

export function handleClientCall(twiml, webhookData, callFlowConfig, orgId) {
  const { from, to, customFromNumber } = webhookData;
  const targetNumber = to;

  if (!targetNumber) {
    twiml.say("Please provide a valid number to call");
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }

  console.log(
    `Client ${from} calling ${targetNumber} - recording: ${callFlowConfig.recordingEnabled}`
  );

  console.log("🟡 ADDING STREAM TO TWIML");

  const start = twiml.start();
  start.stream({ url: `wss://raccoon-credible-elephant.ngrok-free.app` });

  const dial = twiml.dial({
    callerId: customFromNumber || process.env.TWILIO_PHONE_NUMBER,
    timeout: 30,
    record:
      callFlowConfig.recordingEnabled && callFlowConfig.recordOutboundCalls
        ? "record-from-answer-dual-channel"
        : undefined,
    recordingStatusCallback:
      callFlowConfig.recordingEnabled && callFlowConfig.recordOutboundCalls
        ? `/api/org/${orgId}/twiml`
        : undefined,
  });

  dial.number(targetNumber);

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
