// app/api/outbound/[orgId]/route.js
import { NextResponse } from "next/server";
import { getAiAgentConfig } from "@/lib/db/integrations";
import {

  setAiAgentConfigCache,
} from "@/lib/services/integrations/redis";
import { createLeadCall } from "@/lib/handlers/outbound-ai-handler";
import { getAvailability } from "@/lib/services/integrations/hapio";


export async function POST(request, { params }) {
  const { orgId } = await params;
  if (!orgId)
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });

  try {
    // Get hapio config with caching
    let aiAgentConfig = await getAiAgentConfig(orgId);
    if (!aiAgentConfig) {
      aiAgentConfig = await getAiAgentConfig(orgId);
      await setAiAgentConfigCache(orgId, aiAgentConfig);
    }

    const hapioIds = {
      resourceId: aiAgentConfig.resource?.id,
      serviceId: aiAgentConfig.service?.id,
      locationId: aiAgentConfig.location?.id,
      recurringScheduleId: aiAgentConfig.recurringSchedule?.id,
    };

    const aiAgentConfiguration = {
      prompt: aiAgentConfig.prompt,
      webhookUrl: aiAgentConfig.webhookUrl,
    }
    

    // console.log("aiAgentConfig:", hapioIds);
    const {all_slots: allSlots, first_six_slots: firstSixSlots} = await getAvailability(hapioIds,orgId);

    const { leadId, leadData } = await request.json();
 

    // Create and dispatch the call
    const result = await createLeadCall(leadId, leadData, hapioIds, allSlots, firstSixSlots, orgId, aiAgentConfiguration);
    // console.log("result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to create LiveKit lead call:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create call",
      },
      { status: 500 }
    );
  }
}
