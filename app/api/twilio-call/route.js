import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    const { toNumber, fromNumber } = await request.json();

    const call = await client.calls.create({
      url: "http://demo.twilio.com/docs/voice.xml",
      to: toNumber,
      from: fromNumber,
    });

    return NextResponse.json({ sid: call.sid }, { status: 200 });
  } catch (error) {
    console.error('Twilio error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to make call' },
      { status: 500 }
    );
  }
}