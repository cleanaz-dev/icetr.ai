import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { auth } from "@clerk/nextjs/server"

export async function POST(request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'User not authorized'}, {  status: 401 })
  }
  const body = await request.json();
  const { toNumber } = body;

  if (!toNumber) {
    return NextResponse.json({ error: 'To number is required' }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json({ error: 'Twilio credentials are missing' }, { status: 500 });
  }

  const client = twilio(accountSid, authToken);

  

  try {
    const call = await client.calls.create({
      to: toNumber,
      from: fromNumber,
      url: 'http://demo.twilio.com/docs/voice.xml', // Replace with your TwiML URL
    });

    return NextResponse.json({ sid: call.sid }, { status: 200 });
  } catch (error) {
    console.error('Twilio Call Error:', error);
    return NextResponse.json({ error: 'Failed to initiate call' }, { status: 500 });
  }
}
