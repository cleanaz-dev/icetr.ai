// api/twiml/route.js

import { NextResponse } from 'next/server';
import twilio from 'twilio';
import prisma from '@/lib/service/prisma';

// Database functions
async function checkIfLead(phoneNumber) {
  try {
    const lead = await prisma.lead.findFirst({
      where: { phoneNumber: phoneNumber },
      include: {
        assignedUser: true
      }
    });
    return lead;
  } catch (error) {
    console.error('Error checking lead:', error);
    return null;
  }
}

async function saveCallData(callSid, from, to, direction = null, callStatus = null) {
  try {
    // First check if this is from a known lead
    const lead = await checkIfLead(from);
    
    if (!lead) {
      console.log(`Call from unknown number ${from} - not saving to FollowUp (requires lead connection)`);
      return null;
    }

    const callRecord = await prisma.followUp.create({
      data: {
        callSid,
        from,
        to,
        lead: { connect: { id: lead.id } }, // Required connection to Lead
        dueDate: new Date(), // Set to current time, can be updated later if needed
        type: direction === 'inbound' ? 'call' : 'call',
        reason: direction === 'inbound' ? 'inbound_call' : 'outbound_call',
        completed: false,
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

async function updateCallWithRecording(callSid, recordingUrl, transcriptionText = null) {
  try {
    const updatedRecord = await prisma.followUp.update({
      where: { callSid },
      data: {
        recordingUrl,
        transcriptionText,
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

async function createLeadActivity(leadId, message, userId) {
  try {
    if (!userId) {
      console.log('No user ID provided for lead activity');
      return null;
    }
    
    const task = await prisma.leadActivity.create({
      data: {
        lead: { connect: { id: leadId } },
        createdUser: { connect: { id: userId } },
        content: message,
        type: 'MISSED_CALL'
      }
    });
    console.log('Lead activity created:', task);
    return task;
  } catch (error) {
    console.error('Error creating lead activity:', error);
    throw error;
  }
}

export async function POST(request) {
  const twiml = new twilio.twiml.VoiceResponse();

  try {
    // Parse form-encoded data
    const formData = await request.formData();
    console.log("formData", formData);
    
    // Get standard Twilio webhook parameters
    const from = formData.get('From');
    const to = formData.get('To');
    const callSid = formData.get('CallSid');
    const callStatus = formData.get('CallStatus');
    const direction = formData.get('Direction');
    
    // Recording callback parameters
    const recordingUrl = formData.get('RecordingUrl');
    const transcriptionText = formData.get('TranscriptionText');
    const recordingDuration = formData.get('RecordingDuration');
    
    // Custom parameters (for outbound calls initiated by your app)
    const customFromNumber = formData.get('fromNumber');
    const customTo = formData.get('To');
    
    console.log(`Processing: CallSid: ${callSid}, From: ${from}, Direction: ${direction}`);

    // Handle recording callback - this happens after a voicemail is left
    if (recordingUrl && callSid) {
      console.log('Recording callback received');
      
      try {
        // Update the existing call record with recording data
        await updateCallWithRecording(callSid, recordingUrl, transcriptionText);
        
        // Check if this is from a known lead
        if (from && from.startsWith('+')) {
          const lead = await checkIfLead(from);
          
          if (lead) {
            // Get the assigned user ID
            const userId = lead.assignedUser?.id || lead.assignedUserId;
            
            if (userId) {
              // Create lead activity for the voicemail
              const message = `Lead ${lead.name || 'Unknown'} left a voicemail.`;
              await createLeadActivity(lead.id, message, userId);
              console.log(`Lead activity created for lead: ${lead.name || lead.id}`);
            } else {
              console.log(`No assigned user found for lead ${lead.id} - skipping activity creation`);
            }
          } else {
            console.log(`Voicemail from unknown number ${from} - stored in general pool`);
          }
        }
      } catch (error) {
        console.error('Error processing recording callback:', error);
      }
      
      // For recording callbacks, return success response (not TwiML)
      return new NextResponse('OK', { status: 200 });
    }

    // Save initial call data (but not for client calls)
    if (from && !from.startsWith('client:') && callSid) {
      try {
        const savedCall = await saveCallData(callSid, from, to, direction, callStatus);
        if (savedCall) {
          console.log(`Call data saved for lead: ${savedCall.leadId}`);
        }
      } catch (error) {
        console.error('Error saving call data:', error);
        // Continue processing even if save fails
      }
    }

    console.log(`Incoming call from ${from} to ${to}, Direction: ${direction}`);

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
        recordingStatusCallback: '/api/twiml' // This will call back to this same endpoint with recording data
      });
      
    } else if (direction === 'outbound-api' || customTo) {
      // Handle outbound calls initiated by your application
      const targetNumber = customTo || formData.get('targetNumber');
      
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

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
    
  } catch (error) {
    console.error('Error generating TwiML:', error);
    twiml.say('An error occurred while processing the call. Please try again later.');
    return new NextResponse(twiml.toString(), {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

// Optional: Handle GET requests for testing
export async function GET(request) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('This is a test TwiML response.');
  
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}