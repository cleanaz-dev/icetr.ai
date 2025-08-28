// training-queue.js
import { NextResponse } from "next/server";
import { enqueueTraining, getQueuePosition } from "@/lib/services/integrations/redis";

export async function POST(req, { params }) {
  const { orgId } = await params;
  const { scenarioId, clerkId, phoneNumberToCall } = await req.json();

  try {
    const position = await enqueueTraining(orgId, phoneNumberToCall, clerkId, scenarioId);
    
    return NextResponse.json({ 
      success: true,
      position,
      message: position === 0 ? "You're first in line!" : `Position ${position + 1} in queue`
    });
  } catch (error) {
    console.error("Queue enqueue error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to join queue" 
    }, { status: 500 });
  }
}