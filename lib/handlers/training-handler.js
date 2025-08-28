import { NextResponse } from "next/server";

export async function handleTrainingCall(twiml, orgId, scenarioId, clerkId) {
  // 1) log everything
  console.log("🎯 training handler", { orgId, scenarioId, clerkId });

  // 2) post to /training-bland (non-blocking fire & forget)
  fetch(
    `https://icetr-ai.vercel.app/api/org/${orgId}/calls/training-bland`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId, clerkId }),
    }
  ).catch((err) => console.error("training-bland fetch failed", err));

  // 3) keep caller engaged while Bland connects
  twiml.say("Starting your training call. Please hold while we connect you.");
  twiml.pause({ length: 2 });
  twiml.hangup()

  // 4) tell Twilio to wait (or you can <Dial> into your Bland SIP/WebRTC here)
  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "application/xml" },
  });
}
