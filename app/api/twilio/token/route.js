import { NextResponse } from 'next/server';
import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const outgoingApplicationSid = process.env.TWILIO_TWIML_APP_SID;

    if (!accountSid || !apiKey || !apiSecret || !outgoingApplicationSid) {
      return NextResponse.json(
        { error: 'Missing required Twilio configuration' },
        { status: 500 }
      );
    }

    // Create an access token
    const accessToken = new AccessToken(
      accountSid,
      apiKey,
      apiSecret,
      { identity: 'user_' + Date.now() } // Replace with actual user identity
    );

    // Create a Voice grant and add to token
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: outgoingApplicationSid,
      incomingAllow: true,
    });
    accessToken.addGrant(voiceGrant);

    return NextResponse.json({
      accessToken: accessToken.toJwt(),
      identity: 'user_' + Date.now()
    });
  } catch (error) {
    console.error('Error generating access token:', error);
    return NextResponse.json(
      { error: 'Failed to generate access token' },
      { status: 500 }
    );
  }
}