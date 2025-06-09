// api/twiml/route.js

import { NextResponse } from 'next/server';
import twilio from 'twilio';
import prisma from '@/lib/service/prisma';

async function saveCallData(callSid, from, to, direction, callStatus) {
  try {
    const callRecord = await prisma.voicemail.create({
      data: {
        callSid,
        from,
        to,
        direction,
        callStatus,
        createdAt: new Date(),
      }
    });
    console.log('Call data saved:', callRecord);
    return callRecord;
  } catch (error) {
    console.error('Error saving call data:', error);
    throw error;
  }
}

// Function to update call with recording data
async function updateCallWithRecording(callSid, recordingUrl, transcriptionText = null, recordingDuration = null) {
  try {
    const updatedRecord = await prisma.voicemail.update({
      where: { callSid },
      data: {
        recordingUrl,
        transcriptionText,
        recordingDuration,
        updatedAt: new Date(),
      }
    });
    console.log('Recording data updated:', updatedRecord);
    return updatedRecord;
  } catch (error) {
    console.error('Error updating recording data:', error);
    throw error;
  }
}

// Function to check if phone number is a known lead
async function checkIfLead(phoneNumber) {
  try {
    const lead = await prisma.lead.findFirst({
      where: { phone: phoneNumber }
    });
    return lead;
  } catch (error) {
    console.error('Error checking lead:', error);
    return null;
  }
}

// Function to create follow-up task for lead
async function createFollowUpTask(leadId, callSid, message) {
  try {
    const task = await prisma.task.create({
      data: {
        leadId,
        callSid,
        type: 'CALLBACK',
        message,
        priority: 'HIGH',
        status: 'PENDING',
        createdAt: new Date(),
      }
    });
    console.log('Follow-up task created:', task);
    return task;
  } catch (error) {
    console.error('Error creating follow-up task:', error);
    throw error;
  }
}

// Main TwiML generation function
function generateTwiML(formData) {
  const twiml = new twilio.twiml.VoiceResponse();
  
  const from = formData.get('From');
  const to = formData.get('To');
  const direction = formData.get('Direction');
  const customFromNumber = formData.get('fromNumber');

  // Check if this is a client-initiated call (outbound through client)
  if (from && from.startsWith('client:')) {
    // This is a client calling out through your app
    const targetNumber = formData.get('To');
    
    if (targetNumber) {
      console.log(`Client ${from} calling ${targetNumber}`);
      
      const dial = twiml.dial({ 
        callerId: customFromNumber || process.env.TWILIO_PHONE_NUMBER,
        timeout: 30
      });
      
      dial.number(targetNumber);
    } else {
      twiml.say('Please provide a valid number to call');
    }
    
  } else if (direction === 'inbound' && from && from.startsWith('+')) {
    // This is a real inbound call from a phone number - go straight to voicemail
    console.log(`Real inbound call from ${from} - sending to voicemail`);
    
    twiml.say({
      voice: 'Polly.Amy-Neural',
      language: 'en-US'
    }, 'Hello! We are currently unavailable. Please leave a detailed message after the beep and we will get back to you soon.');
    
    twiml.record({
      timeout: 30,
      maxLength: 120,
      transcribe: true,
      transcribeCallback: '/api/transcribe',
      recordingStatusCallback: '/api/recording-status'
    });
    
  } else if (direction === 'outbound-api' || formData.get('targetNumber')) {
    // Handle outbound calls initiated by your application
    const targetNumber = formData.get('targetNumber');
    
    if (targetNumber) {
      const dial = twiml.dial({ 
        callerId: customFromNumber || process.env.TWILIO_PHONE_NUMBER,
        timeout: 30
      });

      if (targetNumber.startsWith('client:')) {
        dial.client(targetNumber.replace('client:', ''));
      } else {
        dial.number(targetNumber);
      }
    } else {
      twiml.say('Please provide a valid number to call');
    }
  } else {
    // Fallback for any other scenarios
    console.log(`Unexpected call scenario - Direction: ${direction}, From: ${from}`);
    
    twiml.say('Thank you for calling. How can we help you today?');
    
    const gather = twiml.gather({
      numDigits: 1,
      action: '/api/handle-menu',
      timeout: 10
    });
    gather.say('Press 1 for sales, Press 2 for support, or stay on the line to speak with someone.');
    
    twiml.redirect('/api/twiml');
  }

  return twiml;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    console.log("formData", formData);
    
    const from = formData.get('From');
    const to = formData.get('To');
    const callSid = formData.get('CallSid');
    const callStatus = formData.get('CallStatus');
    const direction = formData.get('Direction');
    const recordingUrl = formData.get('RecordingUrl');
    const transcriptionText = formData.get('TranscriptionText');
    const recordingDuration = formData.get('RecordingDuration');

    console.log(`Processing: CallSid: ${callSid}, From: ${from}, Direction: ${direction}`);

    // Check if this is a recording callback (has RecordingUrl)
    if (recordingUrl && callSid) {
      console.log('Recording callback received');
      
      // Update the existing call record with recording data
      await updateCallWithRecording(callSid, recordingUrl, transcriptionText, recordingDuration);
      
      // Check if this is from a known lead
      if (from && from.startsWith('+')) {
        const lead = await checkIfLead(from);
        
        if (lead) {
          // Create follow-up task for the lead
          const message = `Lead ${lead.name} left a voicemail. Transcription: ${transcriptionText || 'Transcription pending'}`;
          await createFollowUpTask(lead.id, callSid, message);
          console.log(`Follow-up task created for lead: ${lead.name}`);
        } else {
          console.log(`Voicemail from unknown number ${from} - added to general pool`);
        }
      }
      
      // Return success response for recording callback
      return new NextResponse('OK', { status: 200 });
    }

    // If not a client call, save the initial call data
    if (from && !from.startsWith('client:') && callSid) {
      await saveCallData(callSid, from, to, direction, callStatus);
    }

    // Generate and return TwiML response
    const twiml = generateTwiML(formData);
    
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('An error occurred while processing the call. Please try again later.');
    
    return new NextResponse(twiml.toString(), {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

export async function GET(request) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('This is a test TwiML response.');
  
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}