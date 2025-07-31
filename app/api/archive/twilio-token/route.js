import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

  try {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;
    const accessToken = new AccessToken(
      accountSid,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity: 'user' }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    });

    accessToken.addGrant(voiceGrant);
    const token = accessToken.toJwt();

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}