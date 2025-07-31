import { NextResponse } from "next/server";
import twilio from "twilio";
import prisma from "@/lib/services/prisma";
import { safeDecryptField } from "@/lib/encryption";
import { getTwillioIntegrationData } from "@/lib/services/db/integrations";

export async function GET(req, { params }) {
  const { orgId } = await params;
  console.log("orgId", orgId)

  try {
    const { accountSid, apiKey, apiSecret, appSid } =
      await getTwillioIntegrationData(orgId);

    // 5. Decrypt the auth token
    const decryptedApiKey = safeDecryptField(apiKey, orgId, "apiKey");
    const decryptedSecret = safeDecryptField(apiSecret, orgId, "apiSecret");



    if (!decryptedApiKey ||  !decryptedSecret) {
      return NextResponse.json(
        { error: "Invalid or corrupted API key" },
        { status: 400 }
      );
    }

    // return NextResponse.json({ message: "Workning on it!" }, { status: 200 });

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;
    const accessToken = new AccessToken(accountSid, decryptedApiKey, decryptedSecret, {
      identity: "user",
    });

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: true,
    });

    accessToken.addGrant(voiceGrant);
    const token = accessToken.toJwt();

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
