import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request, { params }) {
  const { callSid } = await params;
  const { muted } = await request.json();
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Twilio doesn’t expose “mute” on a live call; we’ll fake it
  // by updating our own flag.  Hook already flips isMuted.
  // If you want real muting you need Conference/participants.
  return NextResponse.json({ ok: true });
}