

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { scenarioPrompts } from "@/lib/constants/training";
import { decryptIntegrationData } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { getBlandAiEncryptedKey } from "@/lib/db/integrations";
import { validateOrgAccess } from "@/lib/db/validations";

export async function POST(request, { params }) {
  const { userId: clerkId } = await auth();
  const { orgId } = await params;
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }
  try {
    
    
     await validateOrgAccess(clerkId, orgId);

    const { scenario, phoneNumber, userId, blandAiSettings } =
      await request.json();

    console.log("Training call request:", {
      scenario,
      phoneNumber,
      userId,
      orgId,
      blandAiSettings,
    });

   

    const encryptedKey = await getBlandAiEncryptedKey(
      userId,
      orgId,
      blandAiSettings.id
    );
    console.log(" encrytped key:", encryptedKey);

    const { apiKey: decryptedKey } = await decryptIntegrationData(
      encryptedKey,
      orgId
    );

    console.log("decryptedKey:", decryptedKey);

    // return NextResponse.json({ mesasge: "Working on it!" }, { status: 200 });

    // Define scenario-specific prompts for Bland AI

    const selectedScenario =
      scenarioPrompts[scenario] || scenarioPrompts.introduction;

    // Make request to Bland AI to initiate the call
    const blandResponse = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BLAND_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        from: blandAiSettings.phoneNumbers[0],
        task: scenario.prompt,
        voice: scenario.voiceId,
        background_track: "office",
        temperature: blandAiSettings.temperature,
        language: "en",
        model: blandAiSettings.model,
        interruption_threshold: "100",
        max_duration: 10, // 10 minutes max
        answered_by_enabled: false,
        wait_for_greeting: true,
        record: blandAiSettings.record,
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
          userId: userId,
          orgId: orgId,
          campaignTrainingId: scenario.trainingId,
          timestamp: new Date().toISOString(),
        },
        webhook: blandAiSettings.webhook,
      }),
    });

    if (!blandResponse.ok) {
      const errorData = await blandResponse.text();
      console.error("Bland AI API error:", errorData);
      throw new Error(`Bland AI API error: ${blandResponse.status}`);
    }

    const blandData = await blandResponse.json();
    console.log("Bland AI call initiated:", blandData);

    return NextResponse.json({
      success: true,
      callId: blandData.call_id,
      status: blandData.status,
      message: "Training call initiated successfully",
    });
  } catch (error) {
    console.error("Training call error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate training call" },
      { status: 500 }
    );
  }
}
