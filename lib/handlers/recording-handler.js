// /lib/handlers/recording-handler.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleTranscription } from "@/lib/transcription";
import { isTrainingCall } from "@/lib/training-utils";
import { updateCallWithRecording, updateFollowUpWithRecording, updateProspectWithRecording } from "../services/twilioCallService";

export async function handleRecordingCallback(webhookData, phoneConfig, orgId) {
  const { 
    recordingUrl, 
    recordingStatus, 
    callSid, 
    from, 
    recordingDuration 
  } = webhookData;

  if (recordingStatus !== "completed") {
    console.log(`Recording callback received with status '${recordingStatus}' - skipping transcription`);
    return new NextResponse("OK", { status: 200 });
  }

  console.log("Recording callback received with status 'completed'");
  
  const duration = parseInt(recordingDuration) || 0;
  console.log(`Recording duration: ${duration} seconds`);

  try {
    // Check if this was a training call first
    const wasTrainingCall = await isTrainingCall(from, callSid);
    
    if (wasTrainingCall) {
      await handleTrainingRecording(webhookData, phoneConfig);
      return new NextResponse("OK", { status: 200 });
    }

    // Determine call type and handle accordingly
    const callRecord = await findCallRecord(callSid);
    
    if (callRecord.type === 'inbound') {
      await handleInboundRecording(callRecord, webhookData, phoneConfig);
    } else if (callRecord.type === 'outbound') {
      await handleOutboundRecording(callRecord, webhookData, phoneConfig, duration);
    } else {
      console.log("No matching record found for CallSid:", callSid);
    }

  } catch (error) {
    console.error("Error processing recording callback:", error);
  }

  return new NextResponse("OK", { status: 200 });
}

async function handleTrainingRecording(webhookData, phoneConfig) {
  console.log("Training call recording received");
  
  const transcription = await handleTranscription(
    webhookData.recordingUrl,
    webhookData.transcriptionText,
    {
      ...phoneConfig,
      transcribeInbound: true,
      transcriptionProvider: "assemblyai",
    },
    "inbound"
  );
  
  console.log("Training call processed successfully");
}

async function findCallRecord(callSid) {
  // Check different record types
  const followUp = await prisma.followUp.findFirst({
    where: { callSid },
    include: { lead: true },
  });

  const prospect = await prisma.prospect.findFirst({
    where: { callSid },
  });

  const call = await prisma.call.findFirst({
    where: { callSid },
  });

  if (followUp || prospect) {
    return { type: 'inbound', record: followUp || prospect };
  } else if (call) {
    return { type: 'outbound', record: call };
  }
  
  return { type: null, record: null };
}

async function handleInboundRecording(callRecord, webhookData, phoneConfig) {
  console.log("Inbound voicemail recording received");

  if (!phoneConfig.recordInboundCalls) {
    console.log("Inbound recording disabled - skipping recording save");
    return;
  }

  const transcription = await handleTranscription(
    webhookData.recordingUrl,
    webhookData.transcriptionText,
    phoneConfig,
    "inbound"
  );

  if (callRecord.record.leadId) {
    console.log("Updating follow-up with recording for known lead");
    await updateFollowUpWithRecording(
      webhookData.callSid,
      webhookData.recordingUrl,
      transcription
    );
  } else {
    console.log("Updating prospect with recording for unknown caller");
    await updateProspectWithRecording(
      webhookData.callSid,
      webhookData.recordingUrl,
      transcription
    );
  }
}

async function handleOutboundRecording(callRecord, webhookData, phoneConfig, duration) {
  console.log("Outbound call recording received");

  if (!phoneConfig.recordOutboundCalls || 
      !phoneConfig.recordingEnabled || 
      duration < phoneConfig.minOutboundDuration) {
    
    console.log(`Outbound call too short (${duration}s) or recording disabled - marking completed without saving recording`);
    
    await prisma.call.update({
      where: { callSid: webhookData.callSid },
      data: {
        status: "completed",
        endTime: new Date(),
        duration: duration,
        updatedAt: new Date(),
      },
    });
    return;
  }

  console.log(`Outbound call >= ${phoneConfig.minOutboundDuration}s (${duration}s) - saving recording and transcribing`);

  const transcription = await handleTranscription(
    webhookData.recordingUrl,
    webhookData.transcriptionText,
    phoneConfig,
    "outbound"
  );
  
  await updateCallWithRecording(
    webhookData.callSid,
    webhookData.recordingUrl,
    transcription,
    duration
  );
}



