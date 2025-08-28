import { NextResponse } from "next/server";

export function handleOutboundCall(twiml, webhookData, callFlowConfig, orgId) {
  const { from: callerId, to } = webhookData;

  if (!to) {
    twiml.say("Please provide a valid number to call");
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }

  const shouldRecord =
    callFlowConfig.recordingEnabled && callFlowConfig.recordOutboundCalls;

  console.log(
    `[Outbound] Dialing ${to} from ${callerId} | Recording: ${shouldRecord} | Org: ${orgId}`
  );

  const dial = twiml.dial({
    callerId,
    timeout: 30,
    record: shouldRecord ? "record-from-answer-dual-channel" : undefined,
    recordingStatusCallback: shouldRecord
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/org/${orgId}/twiml/recording`
      : undefined,
  });

  dial.number(to);

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}