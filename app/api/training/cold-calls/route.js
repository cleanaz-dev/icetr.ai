import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { scenarioPrompts } from "@/lib/constants/training";

export async function POST(request) {
  const { userId:clerkId } = await auth()
  if(!clerkId) {
    return NextResponse.json({ message: "Unauthorized User"}, { status: 401 })
  }
  try {
    const { scenario, phoneNumber, userId } = await request.json();
    
    console.log('Training call request:', { scenario, phoneNumber, userId });

    // Define scenario-specific prompts for Bland AI

    const selectedScenario = scenarioPrompts[scenario] || scenarioPrompts.introduction;

    // Make request to Bland AI to initiate the call
    const blandResponse = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BLAND_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        from: "+14372920555",
        task: selectedScenario.prompt,
        voice: selectedScenario.voice,
        background_track: "office",
        language: "en",
        model: "base",
        interruption_threshold: "100",
        temperature: selectedScenario.temperature,
        max_duration: 10, // 10 minutes max
        answered_by_enabled: false,
        wait_for_greeting: true,
        record: true,
        analysis_schema: {
          intro_quality_score: "string (grade letter A,B,C,D or F)",
          overall_score: "string (grade letter A,B,C,D or F)",
          discovery_quality_score: "string (grade letter A,B,C,D or F)",
          booked_meeting: "boolean",
          rapport_built: "boolean",
          objection_handled: "boolean",
          value_proposition_delivered: "boolean",
          user_cold_call_improvements: "string (detailed summary on how user could improve)",
          call_strengths: "string"
        },
        metadata: {
          type: "training",
          scenario: scenario,
          userId: userId,
          timestamp: new Date().toISOString()
        },
        webhook: "https://raccoon-credible-elephant.ngrok-free.app/api/training/cold-calls/webhook"
      })
    });

    if (!blandResponse.ok) {
      const errorData = await blandResponse.text();
      console.error('Bland AI API error:', errorData);
      throw new Error(`Bland AI API error: ${blandResponse.status}`);
    }

    const blandData = await blandResponse.json();
    console.log('Bland AI call initiated:', blandData);

    return NextResponse.json({
      success: true,
      callId: blandData.call_id,
      status: blandData.status,
      message: 'Training call initiated successfully'
    });

  } catch (error) {
    console.error('Training call error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate training call' },
      { status: 500 }
    );
  }
}