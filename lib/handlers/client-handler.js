// /lib/handlers/client-handler.js
import { NextResponse } from "next/server";

export function handleClientCall(twiml, webhookData, callFlowConfig, orgId) {
  const { from, to, customFromNumber } = webhookData;
  const targetNumber = to;

  if (!targetNumber) {
    twiml.say("Please provide a valid number to call");
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }

  console.log(
    `Client ${from} calling ${targetNumber} - recording: ${callFlowConfig.recordingEnabled}`
  );

  console.log("🟡 ADDING STREAM TO TWIML");

  // Start the media stream for transcription
  const start = twiml.start();
  start.stream({ 
    url: `wss://raccoon-credible-elephant.ngrok-free.app`,
    track: 'both_tracks', // Capture both caller and callee audio
  });

  // Set up the dial with proper configuration
  const dial = twiml.dial({
    callerId: customFromNumber || process.env.TWILIO_PHONE_NUMBER,
    timeout: 30,
    record:
      callFlowConfig.recordingEnabled && callFlowConfig.recordOutboundCalls
        ? "record-from-answer-dual-channel"
        : undefined,
    recordingStatusCallback:
      callFlowConfig.recordingEnabled && callFlowConfig.recordOutboundCalls
        ? `/api/org/${orgId}/twiml`
        : undefined,
  });

  dial.number(targetNumber);

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}

// // Alternative version if you want to add transcription greeting
// export function handleClientCallWithGreeting(twiml, webhookData, callFlowConfig, orgId) {
//   const { from, to, customFromNumber } = webhookData;
//   const targetNumber = to;

//   if (!targetNumber) {
//     twiml.say("Please provide a valid number to call");
//     return new NextResponse(twiml.toString(), {
//       status: 200,
//       headers: { "Content-Type": "application/xml" },
//     });
//   }

//   console.log(
//     `Client ${from} calling ${targetNumber} - recording: ${callFlowConfig.recordingEnabled}`
//   );

//   // Optional: Add a brief message about transcription
//   twiml.say({
//     voice: 'Polly.Salli'
//   }, "Connecting your call. This conversation will be transcribed.");

//   console.log("🟡 ADDING STREAM TO TWIML");

//   // Start the media stream for transcription
//   const start = twiml.start();
//   start.stream({ 
//     url: `wss://raccoon-credible-elephant.ngrok-free.app`,
//     track: 'both_tracks', // Capture both sides of conversation
//   });

//   // Set up the dial
//   const dial = twiml.dial({
//     callerId: customFromNumber || process.env.TWILIO_PHONE_NUMBER,
//     timeout: 30,
//     record:
//       callFlowConfig.recordingEnabled && callFlowConfig.recordOutboundCalls
//         ? "record-from-answer-dual-channel"
//         : undefined,
//     recordingStatusCallback:
//       callFlowConfig.recordingEnabled && callFlowConfig.recordOutboundCalls
//         ? `/api/org/${orgId}/twiml`
//         : undefined,
//   });

//   dial.number(targetNumber);

//   return new NextResponse(twiml.toString(), {
//     status: 200,
//     headers: { "Content-Type": "application/xml" },
//   });
// }