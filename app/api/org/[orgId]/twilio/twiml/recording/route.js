// /api/org/[orgId]/twiml/recording/route.js
import { NextResponse } from "next/server";
import { parseTwilioWebhook } from "@/lib/services/twilioCallService";
import prisma from "@/lib/prisma";
import { getCachedCallFlowConfig } from "@/lib/services/integrations/redis";
import { getOrgCallFlowConfig } from "@/lib/db/call-flow";
import { transcribeRecording } from "@/lib/services/integrations/assembly-ai";

export async function POST(request, { params }) {
  const { orgId } = await params;

  if (!orgId) return NextResponse(null, { status: 400 });

  // 1️⃣ Parse Twilio payload
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  const {
    CallSid: callSid,
    RecordingUrl: recordingUrl,
    RecordingDuration: recordingDuration,
    RecordingStatus: recordingStatus,
  } = body;

  if (recordingStatus !== "completed" || !recordingUrl) {
    // Twilio retries; we only care about completed recordings
    return NextResponse(null, { status: 204 });
  }

  // 2️⃣ Load config (cache-first)
  let cfg = await getCachedCallFlowConfig(orgId);
  if (!cfg) cfg = await getOrgCallFlowConfig(orgId);
  if (!cfg?.recordingEnabled) return new NextResponse(null, { status: 204 });

  // 3️⃣ Enforce minimum duration
  const duration = parseInt(recordingDuration, 10) || 0;
  if (duration < cfg.minDurationForRecording) {
    console.warn(
      `[Recording] Skipped: ${duration}s < ${cfg.minDurationForRecording}s`
    );
    return NextResponse(null, { status: 204 });
  }

  // 4️⃣ Persist
  await prisma.call.updateMany({
    where: { callSid },
    data: {
      recordingUrl,
      duration,
    },
  });

  console.log(`[Recording] Saved ${recordingUrl} for ${callSid}`);


  // 5️⃣ Transcribe if enabled
  const call = await prisma.call.findFirst({ where: { callSid } });
  if (call) {
    const shouldTranscribe =
      (call.direction === "inbound" && cfg.transcribeInbound) ||
      (call.direction === "outbound" && cfg.transcribeOutbound);

    if (shouldTranscribe && recordingUrl) {
      const result = await transcribeRecording(recordingUrl);
      if (result?.text) {
        await prisma.call.update({
          where: { id: call.id },
          data: { transcription: result.text },
        });
      }
    }
  }
  return NextResponse(null, { status: 204 });
}
