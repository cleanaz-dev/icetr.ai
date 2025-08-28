// leave-queue.js
import { NextResponse } from "next/server";
import { leaveTrainingQueue } from "@/lib/services/integrations/redis";

export async function DELETE(req, { params }) {
  const { orgId } = await params;
  const { searchParams } = new URL(req.url);
  const clerkId = searchParams.get("userId");
  const trainingNumber = "+14374475892";

  await leaveTrainingQueue(orgId, trainingNumber, clerkId);
  return NextResponse.json({ ok: true });
}