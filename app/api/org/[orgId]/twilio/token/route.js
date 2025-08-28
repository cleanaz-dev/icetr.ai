import { NextResponse } from "next/server";
import twilio from "twilio";
import prisma from "@/lib/prisma";
import { safeDecryptField } from "@/lib/encryption";
import { getTwillioIntegrationData } from "@/lib/db/integrations";

export async function GET(req, { params }) {
  const { orgId } = await params;
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  console.log("token for userId:", userId);
  
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const { accountSid, apiKey, apiSecret, appSid } = await getTwillioIntegrationData(orgId);
    const decryptedApiKey = safeDecryptField(apiKey, orgId, "apiKey");
    const decryptedSecret = safeDecryptField(apiSecret, orgId, "apiSecret");
    
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;
    
    const accessToken = new AccessToken(accountSid, decryptedApiKey, decryptedSecret, {
      identity: userId, // Use the user's actual ID
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
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
