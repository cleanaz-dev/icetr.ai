// app/api/transcription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WebSocketServer, WebSocket } from 'ws';

let wss

export async function GET(req) {
  if (wss) return NextResponse.json({ ok: true });

  wss = new WebSocketServer({ port: 0 }); // pick any free port
  console.log(`🔄 Transcription bridge on ws://localhost:${wss.address().port}`);

  // Connect to your **existing** relay
  const relay = new WebSocket('ws://localhost:8080');

  relay.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.type === 'final' || data.type === 'partial') {
      wss.clients.forEach((c) =>
        c.readyState === 1 && c.send(JSON.stringify(data))
      );
    }
  });

  return NextResponse.json({ ok: true });
}