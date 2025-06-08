//api/twiml/route.js

import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request) {
  const twiml = new twilio.twiml.VoiceResponse();

  try {
    // Parse form-encoded data
    const formData = await request.formData();
    console.log("formData", formData)
    const fromNumber = formData.get('fromNumber')
    const To = formData.get('To');

    if (To) {
      const dial = twiml.dial({ callerId: fromNumber || process.env.TWILIO_PHONE_NUMBER });

      if (To.startsWith('client:')) {
        dial.client(To.replace('client:', ''));
      } else {
        dial.number(To);
      }
    } else {
      twiml.say('Please provide a valid number to call');
    }

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Error generating TwiML:', error);
    twiml.say('An error occurred while processing the call');
    return new NextResponse(twiml.toString(), {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
