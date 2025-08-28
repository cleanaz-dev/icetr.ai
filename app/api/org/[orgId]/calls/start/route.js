import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request, { params }) {
  const { orgId } = await params;
  const { to, from, leadId, callSessionId, clerkId } = await request.json();
  console.log("to:", to);
  console.log("from:", from);
  console.log("leadId:", leadId);
  console.log("callSessionId:", callSessionId);
  console.log("clerkId:", clerkId);

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const twimlUrl = `https://icetr-ai.vercel.app/api/org/${orgId}/twilio/twiml?leadId=${encodeURIComponent(
    leadId
  )}&callSessionId=${encodeURIComponent(
    callSessionId
  )}&clerkId=${encodeURIComponent(clerkId)}`;

  try {
    const call = await client.calls.create({
      to,
      from,
      url: twimlUrl,
      method: "POST",
      statusCallback: `https://icetr-ai.vercel.app/api/org/${orgId}/calls/events`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    });
    return NextResponse.json({ callSid: call.sid });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
