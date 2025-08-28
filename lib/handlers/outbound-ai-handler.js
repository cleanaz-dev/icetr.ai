// lib/services/outbound-handler.js

import {
  createUserToken,
  dispatchAgent,
  dispatchAgentHttp,
} from "../services/integrations/livekit";

export async function createLeadCall(
  leadId,
  leadData,
  hapioConfig,
  allSlots,
  firstSixSlots,
  orgId
) {
  const roomName = `lead-call-${leadId}-${Date.now()}`;

    // Extract talking points
  const talkingPoints = leadData.research?.research?.talkingPoints || [];
  console.log("Talking points:", JSON.stringify(talkingPoints, null, 2));

  // Create user token
  const token = createUserToken(`user-${leadId}`, roomName, "Lead Caller");

  // Prepare metadata for agent
  const metadata = {
    lead_id: leadId,
    org_id: orgId,
    phone_number: leadData.phoneNumber,
    transfer_to: "+14373884985" || null,
    hapio_config: hapioConfig,
    first_six_slots: firstSixSlots,
    talking_points: talkingPoints,
    all_slots: allSlots,
    ...leadData,
  };

  console.log("metadata:", JSON.stringify(metadata, null, 2));
  
  try {
  
    await dispatchAgentHttp("outbound-caller", roomName, metadata);
  } catch (error) {
    console.log("Trying HTTP fallback...");
    throw new Error("Failed to dispatch agent", error.message);
  }

  return {
    roomName,
    token: await token.toJwt(),
    success: true,
  };
}
