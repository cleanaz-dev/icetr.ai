
import { setCallStatus } from "@/lib/services/integrations/redis";
import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request, { params }) {
  const { callSid, orgId } = await params;


  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.calls(callSid).update({ status: "completed" });

  // immediately cache the final state so the poll sees it
  await setCallStatus(callSid, "completed", 0); // 0 or actual duration if you have it

  return NextResponse.json({ ok: true });
}
