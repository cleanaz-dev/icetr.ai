// app/api/org/[orgId]/phone-configuration/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { auth } from "@clerk/nextjs/server";
import { validateHasPermission } from "@/lib/services/db/validations";

// GET - Fetch phone configuration
export async function GET(request, { params }) {
  try {
    const { orgId } = await params;
    if (!org) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ message: "Invalid User" }, { status: 401 });
    }

    validateHasPermission(clerkId,['integration.public'])

    // Get or create phone configuration
    let phoneConfig = await prisma.phoneConfiguration.findUnique({
      where: { orgId },
    });

    if (!phoneConfig) {
      // Create default configuration
      phoneConfig = await prisma.phoneConfiguration.create({
        data: {
          orgId,
          // Defaults will be applied from schema
        },
      });
    }

    return NextResponse.json(phoneConfig);
  } catch (error) {
    console.error("Error fetching phone configuration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Update phone configuration
export async function POST(request, { params }) {
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "" }, { status: 401 });
  }
  try {
    await validateHasPermission(clerkId, ["integration.create"]);

    const body = await request.json();
    console.log("body:", body);
    console.log("orgId", orgId);
    // Validate the configuration data
    const validatedConfig = {
      recordingEnabled: Boolean(body.recordingEnabled),
      minOutboundDuration: parseInt(body.minOutboundDuration) || 120,
      recordInboundCalls: Boolean(body.recordInboundCalls),
      recordOutboundCalls: Boolean(body.recordOutboundCalls),
      transcriptionProvider: body.transcriptionProvider || "assemblyai",
      transcribeInbound: Boolean(body.transcribeInbound),
      transcribeOutbound: Boolean(body.transcribeOutbound),
      inboundFlow: body.inboundFlow || "voicemail",
      voicemailMessage: body.voicemailMessage || null,
      forwardToNumber: body.forwardToNumber || null,
      autoCreateLeads: Boolean(body.autoCreateLeads),
      autoCreateFollowUps: Boolean(body.autoCreateFollowUps),
    };

    // Upsert the configuration
    const phoneConfig = await prisma.phoneConfiguration.upsert({
      where: {
        orgId: orgId,
      },
      update: validatedConfig,
      create: {
        organization: {
          connect: {
            id: orgId,
          },
        },
        ...validatedConfig,
      },
    });

    return NextResponse.json(
      { message: "Settings Saved Successfully!", phoneConfig: phoneConfig },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating phone configuration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function you can use in your Twilio webhook
export async function getPhoneConfigForOrg(orgId) {
  try {
    const phoneConfig = await prisma.phoneConfiguration.findUnique({
      where: { orgId },
    });

    // Return defaults if no config exists
    if (!phoneConfig) {
      return {
        recordingEnabled: true,
        minOutboundDuration: 120,
        recordInboundCalls: true,
        recordOutboundCalls: true,
        transcriptionProvider: "assemblyai",
        transcribeInbound: true,
        transcribeOutbound: true,
        inboundFlow: "voicemail",
        autoCreateLeads: true,
        autoCreateFollowUps: true,
      };
    }

    return phoneConfig;
  } catch (error) {
    console.error("Error fetching phone config:", error);
    // Return safe defaults on error
    return {
      recordingEnabled: true,
      minOutboundDuration: 120,
      recordInboundCalls: true,
      recordOutboundCalls: true,
      transcriptionProvider: "assemblyai",
      transcribeInbound: true,
      transcribeOutbound: true,
      inboundFlow: "voicemail",
      autoCreateLeads: true,
      autoCreateFollowUps: true,
    };
  }
}
