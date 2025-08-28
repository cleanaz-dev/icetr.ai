// queue-position.js
import { NextResponse } from "next/server";
import { getQueuePosition } from "@/lib/services/integrations/redis";

export async function GET(req, { params }) {
  const { orgId } = await params;
  const { searchParams } = new URL(req.url);
  const clerkId = searchParams.get("userId");
  const trainingNumber = "+14374475892";

  try {
    const position = await getQueuePosition(orgId, trainingNumber, clerkId);
    
    return NextResponse.json({ 
      position: position >= 0 ? position : null,
      inQueue: position >= 0
    });
  } catch (error) {
    console.error("Queue position error:", error);
    return NextResponse.json({ position: null, inQueue: false });
  }
}
