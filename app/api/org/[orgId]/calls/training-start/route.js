// /api/org/[orgId]/calls/training-start/route.js
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { orgId } = await params;
  
  try {
    const { to, scenario, userId } = await request.json();
    
    console.log("Training call request:", {
      orgId,
      to,
      scenario,
      userId
    });

    // Validation
    if (!to) {
      return NextResponse.json({ error: "Missing phone number" }, { status: 400 });
    }
    
    if (!scenario) {
      return NextResponse.json({ error: "Missing scenario ID" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Tell Bland AI to call the user's phone number
    const blandResponse = await fetch(
      `https://icetr-ai.vercel.app/api/org/${orgId}/calls/training-bland`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scenarioId: scenario, 
          clerkId: userId,
          phoneNumberToCall: to
        }),
      }
    );

    if (!blandResponse.ok) {
      const errorText = await blandResponse.text();
      console.error("Bland API error:", blandResponse.status, errorText);
      return NextResponse.json(
        { error: "Failed to initiate training call" }, 
        { status: 500 }
      );
    }

    const blandResult = await blandResponse.json();
    console.log("Bland response:", blandResult);

    return NextResponse.json({ 
      success: true,
      message: `Training call initiated to ${to}`,
      blandCallId: blandResult.callId || null
    });

  } catch (error) {
    console.error("Training start error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}