import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/services/prisma";
import {
  encryptIntegrationData,
  isEncrypted,
  safeDecryptField,
} from "@/lib/encryption";
import {
  twilioIntegrationSchema,
  formatZodError,
} from "@/lib/validations/integrations";
import twilio from "twilio";

export async function POST(req, { params }) {
  try {
    // 1. Auth & org checks
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
      select: { orgId: true, role: true },
    });
    if (!user || user.orgId !== orgId || user.role.type !== "SuperAdmin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 2. Validate body (expect appSid, voiceUrl, smsUrl, etc.)
    const body = await req.json();
    const parsed = twilioIntegrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const {
      enabled,
      accountSid,
      authToken,
      appSid, // TwiML App SID to update
      voiceUrl,
      smsUrl,
      ...rest
    } = parsed.data;

    console.log("Twilio config:", {
      enabled,
      accountSid,
      authToken,
      appSid,
      voiceUrl,
      smsUrl,
      ...rest,
    });
  
    // 3. Upsert integration in DB (store the new values)
    const parent = await prisma.orgIntegration.upsert({
      where: { orgId },
      update: {},
      create: { orgId },
    });

    const result = await prisma.twilioIntegration.upsert({
      where: { orgIntegrationId: parent.id },
      update: {
        enabled,
        accountSid: enabled ? accountSid : null,
        authToken: enabled
          ? isEncrypted(authToken)
            ? authToken
            : encryptIntegrationData({ authToken }, orgId)
          : null,
        voiceUrl: voiceUrl ?? null,
        smsUrl: smsUrl ?? null,
        appSid: appSid ?? null,
        // Keep other fields unchanged or add as needed
      },
      create: {
        orgIntegration: { connect: { orgId } },
        enabled,
        accountSid: enabled ? accountSid : null,
        authToken: enabled
          ? encryptIntegrationData({ authToken }, orgId)
          : null,
        voiceUrl: voiceUrl ?? null,
        smsUrl: smsUrl ?? null,
        appSid: appSid ?? null,
      },
    });

    // 4. If enabled & have credentials & appSid, update TwiML App webhooks
    if (enabled && accountSid && authToken && appSid && (voiceUrl || smsUrl)) {
      const decryptedAuthToken = safeDecryptField(
        authToken,
        orgId,
        "authToken"
      );

      if (!decryptedAuthToken) {
        console.warn(
          "Auth token decryption failed; skipping TwiML App update."
        );
      } else {
        const client = twilio(accountSid, decryptedAuthToken);

        try {
          await client.applications(appSid).update({
            voiceUrl,
            voiceMethod: "POST",
            smsUrl,
            smsMethod: "POST",
          });
        } catch (e) {
          console.error(`Failed to update TwiML App ${appSid}:`, e.message);
          return NextResponse.json(
            { error: "Failed to update TwiML App", details: e.message },
            { status: 500 }
          );
        }
      }
    }

    // 5. Return safe response (decrypt fields as needed)
    return NextResponse.json({
      success: true,
      data: {
        enabled: result.enabled,
        accountSid: result.accountSid,
        voiceUrl: result.voiceUrl,
        smsUrl: result.smsUrl,
        appSid: result.appSid,
        apiKey: safeDecryptField(result.apiKey, orgId, "apiKey"),
        apiSecret: safeDecryptField(result.apiSecret, orgId, "apiSecret"),
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
    if (!user || user.orgId !== orgId || user.role.type !== "SuperAdmin") {
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
