//api/org/[orgId]/calls/training-bland/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getTrainingScenarioById } from "@/lib/db/training";

export async function POST(req, { params }) {
  const { orgId } = await params;
  if (!orgId)
    return NextResponse.json(
      { message: "Missing required parameters" },
      { status: 400 }
    );

  try {
    const { scenarioId, clerkId, phoneNumberToCall } = await req.json();
    // log payload
    console.log("payload:", { scenarioId, clerkId, phoneNumberToCall });

    const scenario = await getTrainingScenarioById(scenarioId);
    if (!scenario)
      return NextResponse.json(
        { message: "Training scenario not found" },
        { status: 404 }
      );
    // console.log("training scenario:", scenario);
    // Make request to Bland AI to initiate the call
    const blandResponse = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BLAND_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: phoneNumberToCall,
        from: "+14372920555",
        task: scenario.prompt,
        voice: "ee4c4bb7-08f6-48c5-aaac-bf7a36d3fa51",
        background_track: "office",
        temperature: 0.7,
        language: "en",
        model: "turbo",
        interruption_threshold: "70",
        max_duration: 5, // 10 minutes max
        answered_by_enabled: false,
        wait_for_greeting: true,
        record: true,
        analysis_schema: {
          intro_quality_score: "string (grade letter A,B,C,D or F)",
          rapport_score: "string (grade letter A,B,C,D or F)",
          objection_score: "string (grade letter A,B,C,D or F)",
          closing_score: "string (grade letter A,B,C,D or F)",
          overall_score: "string (grade letter A,B,C,D or F)",
          discovery_quality_score: "string (grade letter A,B,C,D or F)",
          booked_meeting: "boolean",
          rapport_built: "boolean",
          objection_handled: "boolean",
          value_proposition_delivered: "boolean",
          user_cold_call_improvements:
            "string (detailed summary on how user could improve)",
          call_strengths: "string",
        },
        metadata: {
          type: "training-call",
          scenarioId: scenario.id,
          userId: clerkId,
          orgId: orgId,
          campaignTrainingId: scenario.trainingId,
          timestamp: new Date().toISOString(),
        },
        webhook: `https://icetr-ai.vercel.app/api/org/${orgId}/calls/training-webhook`,
      }),
    });

    if (!blandResponse.ok) {
      const errorData = await blandResponse.text();
      console.error("Bland AI API error:", errorData);
      throw new Error(`Bland AI API error: ${blandResponse.status}`);
    }

    const blandData = await blandResponse.json();
    console.log("Bland AI call initiated:", blandData);

    return NextResponse.json({ message: "Data Received" }, { status: 201 });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
