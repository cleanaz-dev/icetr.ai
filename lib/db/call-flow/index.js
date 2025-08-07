"use server";
import prisma from "@/lib/prisma";

export async function getCallFlowConfiguration(orgId) {
  try {
    const config = await prisma.callFlowConfiguration.findUnique({
      where: { orgId }
    });

    // Return defaults if no config exists (backward compatibility)
    if (!config) {
      return {
        recordingEnabled: true,
        minOutboundDuration: 120,
        recordInboundCalls: true,
        recordOutboundCalls: true,
        transcriptionProvider: "assemblyai",
        transcribeInbound: true,
        transcribeOutbound: true,
        inboundFlow: "voicemail",
        voicemailMessage: "",
        forwardToNumber: null,
        autoCreateLeads: true,
        autoCreateFollowUps: true,
        minCallDurationForRecording: 30,
        enableFlowLogging: true,
        flowSteps: [
          {"id": "call-start", "enabled": true, "order": 1},
          {"id": "call-active", "enabled": true, "order": 2}, 
          {"id": "call-complete", "enabled": true, "order": 3},
          {"id": "recording-check", "enabled": true, "order": 4},
          {"id": "lead-update", "enabled": true, "order": 5}
        ]
      };
    }

    return config;
  } catch (error) {
    console.error("Error fetching call flow config:", error);
    throw error;
  }
}

export async function getOrgCallFlowConfig(orgId) {
  const config = await prisma.organization.findUnique({
    where: {id: orgId},
    select: {
      callFlowConfiguration: true,
    }
  })

  return config?.callFlowConfiguration;
}