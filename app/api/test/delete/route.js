import { NextResponse } from "next/server";
import redis from "@/lib/services/integrations/redis";

export async function DELETE() {
  try {
    // This deletes all keys in the **current** selected DB.
    await redis.flushDb();

    return NextResponse.json({ success: true, message: "All Redis keys deleted." });
  } catch (error) {
    console.error("Failed to flush Redis DB:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
