

import { getRedisClient, keys } from "@/lib/services/integrations/redis";
import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  const { callSid } = await params;
  const client = await getRedisClient();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sub = client.duplicate(); // separate connection for sub
      await sub.connect();

      await sub.subscribe(keys.callEvents(callSid), (msg) => {
        const { status, duration } = JSON.parse(msg);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ status, duration })}\n\n`)
        );
        const done = [
          "completed",
          "failed",
          "busy",
          "no-answer",
          "canceled",
        ].includes(status);
        if (done) {
          controller.close();
          sub.quit();
        }
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
