// /api/org/[orgId]/calls/training-twiml/route.js
import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request, { params }) {
  const { orgId } = await params;
  const url = new URL(request.url);
  const scenarioId = url.searchParams.get("scenario");
  const clerkId = url.searchParams.get("clerkId");

  console.log("🎯 TRAINING TWIML HIT!");

  console.log("🎯 Training TwiML handler", { orgId, scenarioId, clerkId });

  const twiml = new twilio.twiml.VoiceResponse();

  try {
    // 1) Fire off the training call setup (non-blocking)
    fetch(
      `https://icetr-ai.vercel.app/api/org/${orgId}/calls/training-bland`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, clerkId }),
      }
    ).catch((err) => console.error("training-bland fetch failed", err));

    // 2) Keep the caller engaged
    twiml.say("Starting your training call. Please hold while we connect you to the AI agent.");
    
    // 3) Add a longer pause to give Bland time to connect, then redirect or hangup
    twiml.pause({ length: 5 });
    
    // Option A: Hangup after the pause
    twiml.hangup();
    
    // Option B: If you want to redirect back for status checking, use this instead:
    // twiml.redirect(`https://icetr-ai.vercel.app/api/org/${orgId}/training-status?scenario=${scenarioId}&clerkId=${clerkId}`);

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "application/xml" },
    });

  } catch (error) {
    console.error("❌ Training TwiML error:", error.message);
    
    twiml.say("Sorry, there was an error starting your training call. Please try again later.");
    twiml.hangup();
    
    return new NextResponse(twiml.toString(), {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}