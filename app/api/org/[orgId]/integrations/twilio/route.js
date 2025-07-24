// app/api/org/[orgid]/integrations/twilio/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/service/prisma";
import {
  encryptIntegrationData,
  decryptIntegrationData,
} from "@/lib/encryption";
import {
  twilioIntegrationSchema,
  formatZodError,
} from "@/lib/validations/integrations"; // adjust path

/* ------------------------------------------------------------------ */
/* POST – create / update Twilio integration                          */
/* ------------------------------------------------------------------ */
export async function POST(req, { params }) {
  try {
    /* ------------ 1. Auth & Org checks ------------ */
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId } = await params;
    if (!orgId)
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        orgId: true,
        role: true,
      },
    });
    if (!user || user.orgId !== orgId || user.role !== "Admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    /* ------------ 2. Validate body with Zod ------------ */
    const body = await req.json();
    // console.log("body", body);
    const parsed = twilioIntegrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    // console.log("parsed data:", parsed);
    const { enabled, accountSid, authToken, phoneNumbers, ...rest } =
      parsed.data;

    /* ------------ 3. Upsert TwilioIntegration ------------ */
    const parent = await prisma.orgIntegration.upsert({
      where: { organizationId: orgId },
      update: {}, // nothing to change on parent row
      create: { organizationId: orgId },
    });

    const result = await prisma.twilioIntegration.upsert({
      where: { orgIntegrationId: parent.id },
      update: {
        enabled,
        accountSid: enabled ? accountSid : null,
        authToken: enabled
          ? encryptIntegrationData({ authToken }, orgId)
          : null,
        phoneNumbers: enabled ? phoneNumbers : [],
        voiceUrl: rest.voiceUrl ?? null,
        smsUrl: rest.smsUrl ?? null,
        apiKey: rest.apiKey ?? null,
        apiSecret: rest.apiSecret
          ? encryptIntegrationData({ apiSecret: rest.apiSecret }, orgId)
          : null,
        appSid: rest.appSid ?? null,
      },
      create: {
        orgIntegration: { connect: { organizationId: orgId } },
        enabled,
        accountSid: enabled ? accountSid : null,
        authToken: enabled
          ? encryptIntegrationData({ authToken }, orgId)
          : null,
        phoneNumbers: enabled ? phoneNumbers : [],
        voiceUrl: rest.voiceUrl ?? null,
        smsUrl: rest.smsUrl ?? null,
        apiKey: rest.apiKey ?? null,
        apiSecret: rest.apiSecret
          ? encryptIntegrationData({ apiSecret: rest.apiSecret }, orgId)
          : null,
        appSid: rest.appSid ?? null,
      },
    });

    /* ------------ 4. Return safe, decrypted subset ------------ */
    const decrypted = decryptIntegrationData(result.authToken, orgId);
    return NextResponse.json({
      success: true,
      data: {
        enabled: result.enabled,
        accountSid: result.accountSid,
        phoneNumbers: result.phoneNumbers,
        voiceUrl: result.voiceUrl,
        smsUrl: result.smsUrl,
        appSid: result.appSid,
        apiKey: result.apiKey,
        apiSecret: result.apiSecret
          ? decryptIntegrationData(result.apiSecret, orgId)
          : null,
        // NEVER send the raw authToken back
      },
    });
  } catch (err) {
    console.error("Twilio integration POST error:", err);
    return NextResponse.json(
      { error: "Unable to save Twilio integration", details: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId } = await params;
    if (!orgId)
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        orgId: true,
        role: true,
      },
    });
    if (!user || user.orgId !== orgId || user.role !== "Admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { enabled } = await req.json();

    await prisma.organization.update({
      where: { id: orgId },
      data: {
        orgIntegrations: {
          update: { twilio: { update: { enabled: enabled } } },
        },
      },
    });

    return NextResponse.json(
      { message: "Disabled Twilio Integration Successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error.message);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
