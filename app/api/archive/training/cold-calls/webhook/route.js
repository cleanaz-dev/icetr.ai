import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { transcribePracticeCall } from "@/lib/services/integrations/assembly-ai";

export async function POST(request) {
  try {
    const { userId: clerkId } = await auth();
    const body = await request.json();
    console.log("blandAI webhook:", body)
    return NextResponse({ message: "Data Received"})
    const { recording_url, metadata, analysis } = body;

    const {
      overall_score,
      rapport_score,
      objection_score,
      closing_score,
      rapport_built,
      objection_handled,
      intro_quality_score,
      booked_meeting,
      discovery_quality_score,
      value_proposition_delivered,
      user_cold_call_improvements,
      call_strengths,
    } = analysis;

    const { userId, scenario, timestamp } = metadata;

    if (!recording_url || typeof recording_url !== "string") {
      return NextResponse.json(
        { message: "Invalid recording URL" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId in metadata" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      return NextResponse.json({ message: "Invalid User" }, { status: 400 });
    }

    const response = await transcribePracticeCall(recording_url);

    // console.log("AssemblyAI response:", response);
    // console.log("Metadata:", metadata);
    // console.log("Summary:", summary);
    // console.log("Analysis Schema:", analysis_schema);
    // console.log("Analysis:", analysis);

    // TODO: Save to DB if needed
    const training = await prisma.training.create({
      data: {
        user: { connect: { id: user.id } },
        introQualityScore: intro_quality_score || null,
        bookedMeeting: booked_meeting,
        discoveryScore: discovery_quality_score,
        closingScore: closing_score,
        objectScore: objection_score,
        overallScore: overall_score,
        valuePropositionDelivered: value_proposition_delivered,
        objectionHandled: objection_handled,
        rapportBuilt: rapport_built,
        recordingUrl: recording_url,
        improvements: user_cold_call_improvements,
        scenario: scenario,
        transcript: JSON.stringify(response.speakers),
        type: "CALLS",
      },
    });
    return NextResponse.json({
      message: "Training data saved successfully",
      trainingId: training.id,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
