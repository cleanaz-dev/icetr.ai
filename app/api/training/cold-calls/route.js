import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  const { userId:clerkId } = await auth()
  if(!clerkId) {
    return NextResponse.json({ message: "Unauthorized User"}, { status: 401 })
  }
  try {
    const { scenario, phoneNumber, userId } = await request.json();
    
    console.log('Training call request:', { scenario, phoneNumber, userId });

    // Define scenario-specific prompts for Bland AI
    const scenarioPrompts = {
      introduction: {
        prompt: `You are a potential customer receiving a cold call. You are moderately interested but cautious. Ask basic questions about the product/service, express some mild skepticism, but remain polite and engaged. End the call after 2-3 minutes of conversation.`,
        voice: "maya",
        temperature: 0.7
      },
      objection: {
        prompt: `You are a busy potential customer who has several objections to any sales pitch. Common objections you should raise: "I don't have time", "It's too expensive", "I need to think about it", "I'm happy with my current solution". Be challenging but not rude. Give the caller opportunities to overcome your objections.`,
        voice: "ryan",
        temperature: 0.8
      },
      hostile: {
        prompt: `You are an irritated potential customer who doesn't want to be bothered by sales calls. Start somewhat hostile but allow the caller to potentially turn the conversation around if they handle you well. Use phrases like "I'm not interested", "Take me off your list", but give them a chance to recover if they're skilled. END CALL when appropriate.`,
        voice: "sarah",
        temperature: 0.9
      },
      busy: {
        prompt: `You are an extremely busy professional who has no time for sales calls. Keep responses very short initially - "I'm in a meeting", "Can you call back later", "I only have 30 seconds". Only engage more if the caller provides immediate, compelling value. END CALL randomly.`,
        voice: "6a63d109-aa30-470c-ab56-a4c1447c4a4c",
        temperature: 0.6
      }
    };

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
        interruption_threshold: "50",
        temperature: selectedScenario.temperature,
        max_duration: 10, // 10 minutes max
        answered_by_enabled: false,
        wait_for_greeting: true,
        record: true,
        analysis_schema: {
          intro_quality_score: "integer (1-10)",
          rapport_built: "boolean",
          objection_handled: "boolean",
          training_feedback_notes: "string"
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