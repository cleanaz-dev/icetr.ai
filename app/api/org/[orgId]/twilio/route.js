import twilio from "twilio";
import prisma from "@/lib/services/prisma";
import { transcribeRecording } from "@/lib/services/assembly-ai"; // Import your transcription function
import {
  checkIfLead,
  isTrainingCall,
  createOrUpdateCall,
  createFollowUp,
  updateFollowUpWithRecording,
  createProspect,
  updateProspectWithRecording,
  updateCallWithRecording,
} from "@/lib/services/twilioCallService";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { orgId } = await params;
  try {
    const twiml = new twilio.twiml.VoiceResponse();

    const formData = await req.formData();
    console.log("formData", formData);

    // Get standard Twilio webhook parameters
    const from = formData.get("From");
    const to = formData.get("To");
    const callSid = formData.get("CallSid");
    const callStatus = formData.get("CallStatus");
    const direction = formData.get("Direction");
    const leadId = formData.get("leadId");
    const callSessionId = formData.get("callSessionId");
    const userId = formData.get("userId");

    // Recording callback parameters
    const recordingUrl = formData.get("RecordingUrl");
    const recordingStatus = formData.get("RecordingStatus");
    const transcriptionText = formData.get("TranscriptionText");
    const recordingDuration = formData.get("RecordingDuration");

    // Custom parameters (for outbound calls initiated by your app)
    const customFromNumber = formData.get("fromNumber");

    console.log(
      `Processing: CallSid: ${callSid}, From: ${from}, Direction: ${direction}, RecordingStatus: ${recordingStatus}`
    );

    return NextResponse.json({ message: "Copy That!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
