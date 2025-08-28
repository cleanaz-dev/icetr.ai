import { setCallStatus } from "@/lib/services/integrations/redis";
import { NextResponse } from "next/server";

export async function POST(req) {
  const form = await req.formData();
  const callSid = form.get("CallSid");
  const status = form.get("CallStatus");
  const duration = Number(form.get("CallDuration") ?? 0);

  await setCallStatus(callSid, status, duration);
  return NextResponse.json("OK");
}
