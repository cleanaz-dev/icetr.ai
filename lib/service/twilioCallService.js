import prisma from "./prisma";

export async function isTrainingCall(from, callSid) {
  try {
    // Check if the call is from Bland AI's phone number
    if (from === process.env.BLAND_AI_PHONE_NUMBER) {
      return true;
    }

    // You can also check for specific patterns in the from number that Bland AI uses
    // Bland AI might call from different numbers, so you might need to adjust this logic
    if ((from && from.includes("bland")) || (from && from.includes("ai"))) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking if training call:", error);
    return false;
  }
}

export async function checkIfLead(phoneNumber) {
  try {
    const lead = await prisma.lead.findFirst({
      where: { phoneNumber: phoneNumber },
      include: {
        assignedUser: true,
      },
    });
    return lead;
  } catch (error) {
    console.error("Error checking lead:", error);
    return null;
  }
}

export async function createOrUpdateCall(
  callSid,
  leadId,
  callSessionId,
  fromNumber,
  to,
  direction = null,
  callStatus = null,
  userId,
  updates = {}
) {
  try {
    // Check if call already exists
    const existingCall = await prisma.call.findUnique({
      where: { callSid },
    });

    if (existingCall) {
      // Update existing call
      const updatedCall = await prisma.call.update({
        where: { callSid },
        data: {
          status: callStatus || existingCall.status,
          ...updates,
          updatedAt: new Date(),
        },
      });
      console.log("Call updated:", updatedCall);
      return updatedCall;
    } else {
      // Create new call - only when we have leadId and callSessionId
      if (!leadId || !callSessionId) {
        console.log(
          `Missing required data for call creation: leadId=${leadId}, callSessionId=${callSessionId}`
        );
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      const newCall = await prisma.call.create({
        data: {
          callSid,
          lead: { connect: { id: leadId } },
          callSession: { connect: { id: callSessionId } },
          direction: direction || "outbound",
          from: fromNumber,
          to,
          status: callStatus || "initiated",
          startTime: new Date(),
          createdUser: { connect: { id: user.id } },
          ...updates,
        },
      });

      console.log("New call created:", newCall);
      return newCall;
    }
  } catch (error) {
    console.error("Error creating/updating call:", error);
    throw error;
  }
}

export async function updateCallWithRecording(
  callSid,
  recordingUrl,
  transcription = null,
  duration = null
) {
  try {
    const updatedCall = await prisma.call.update({
      where: { callSid },
      data: {
        recordingUrl,
        transcription,
        duration,
        status: "completed",
        endTime: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log("Call updated with recording and transcription:", updatedCall);
    return updatedCall;
  } catch (error) {
    console.error("Error updating call with recording:", error);
    throw error;
  }
}

export async function createFollowUp(
  leadId,
  callSid,
  from,
  to,
  reason = "voicemail"
) {
  try {
    const followUp = await prisma.followUp.create({
      data: {
        leadId,
        callSid,
        from,
        to,
        type: "call",
        reason,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        completed: false,
      },
    });

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { 
        assignedUserId: true,
        company: true 
      },
    });

    await prisma.notification.create({
      data: {
        user: { connect: { id: lead.assignedUserId } },
        type: "Missed Call",
        message: `${lead.company} called from ${from}`,
        followUpId: followUp.id || null
      },
    });
    console.log("Follow-up created:", followUp);
    return followUp;
  } catch (error) {
    console.error("Error creating follow-up:", error);
    throw error;
  }
}

export async function updateFollowUpWithRecording(
  callSid,
  recordingUrl,
  transcription = null
) {
  try {
    const updatedFollowUp = await prisma.followUp.update({
      where: { callSid },
      data: {
        recordingUrl,
        transcription: transcription,
      },
    });
    console.log("Follow-up updated with recording:", updatedFollowUp);
    return updatedFollowUp;
  } catch (error) {
    console.error("Error updating follow-up with recording:", error);
    throw error;
  }
}

export async function createProspect(
  phoneNumber,
  callSid,
  source = "inbound_call"
) {
  try {
    const prospect = await prisma.prospect.create({
      data: {
        phoneNumber,
        callSid,
        source,
        status: "New",
        notes: `Inbound call received - CallSid: ${callSid}`,
      },
    });
    console.log("Prospect created:", prospect);
    return prospect;
  } catch (error) {
    console.error("Error creating prospect:", error);
    throw error;
  }
}

export async function updateProspectWithRecording(
  callSid,
  recordingUrl,
  transcription = null
) {
  try {
    const updatedProspect = await prisma.prospect.update({
      where: { callSid },
      data: {
        recordingUrl,
        transcription,
        notes: transcription
          ? `Voicemail left: ${transcription}`
          : "Voicemail recording available",
      },
    });
    console.log("Prospect updated with recording:", updatedProspect);
    return updatedProspect;
  } catch (error) {
    console.error("Error updating prospect with recording:", error);
    throw error;
  }
}
