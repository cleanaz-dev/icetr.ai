import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import twilio from "twilio";
import prisma from "@/lib/service/prisma";
import { decryptIntegrationData } from "@/lib/encryption";

// GET /api/org/[orgId]/integrations/twilio/available-numbers
export async function GET(request, { params }) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;
    const { searchParams } = new URL(request.url);

    // 2. Extract query parameters
    const countryCode = searchParams.get("countryCode") || "US";
    const areaCode = searchParams.get("areaCode");
    const contains = searchParams.get("contains");
    const limit = parseInt(searchParams.get("limit")) || 20;

    // 3. Validate user has access to this org
    // Replace with your actual org access check
    const userHasOrgAccess = await checkUserOrgAccess(userId, orgId);
    if (!userHasOrgAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Get org's Twilio integration
    const twilioIntegration = await getTwilioIntegration(orgId);
    if (!twilioIntegration || !twilioIntegration.enabled) {
      return NextResponse.json(
        { error: "Twilio integration not found or disabled" },
        { status: 400 }
      );
    }
    console.log("twilio integration", twilioIntegration);

    // 5. Decrypt the auth token
    let decryptedAuthToken;
    try {
      decryptedAuthToken = decryptIntegrationData(
        twilioIntegration.authToken,
        orgId
      );
    } catch (decryptError) {
      console.error("Failed to decrypt Twilio auth token:", decryptError);
      return NextResponse.json(
        { error: "Invalid Twilio credentials" },
        { status: 400 }
      );
    }
    console.log("decryptedAuth", decryptedAuthToken)
    // 6. Initialize Twilio client
    // const twilioClient = twilio(
    //   twilioIntegration.accountSid, // Plain text
    //   decryptedAuthToken.authToken // Decrypted
    // );
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    // 6. Build search parameters
    const searchOptions = {
      areaCode: 438, // optional: Toronto area
      // contains: "", // optional: pattern match
      limit: 1, // how many numbers to return
    };

    // if (areaCode) {
    //   searchOptions.areaCode = areaCode;
    // }

    // if (contains) {
    //   searchOptions.contains = contains;
    // }

    // 7. Search for available numbers
    try {
      const availableNumbers = await twilioClient
        .availablePhoneNumbers("CA").national
        .list(searchOptions);
      return availableNumbers;
    } catch (error) {
      console.error("Twilio number search error:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        status: error.status,
        more: error,
      });
      throw new Error("Failed to search available phone numbers.");
    }

    // 8. Format response
    const formattedNumbers = availableNumbers.map((number) => ({
      phoneNumber: number.phoneNumber,
      friendlyName: number.friendlyName,
      locality: number.locality,
      region: number.region,
      country: number.isoCountry,
      capabilities: {
        voice: number.capabilities.voice,
        sms: number.capabilities.sms,
        mms: number.capabilities.mms,
      },
    }));

    return NextResponse.json({
      success: true,
      numbers: formattedNumbers,
      searchCriteria: {
        countryCode,
        areaCode,
        contains,
        limit,
      },
    });
  } catch (error) {
    console.error("Available numbers API error:", error);

    // Handle Twilio-specific errors
    if (error.code === 20404) {
      return NextResponse.json(
        { error: "Invalid country code or no numbers available" },
        { status: 400 }
      );
    }

    if (error.code === 20003) {
      return NextResponse.json(
        { error: "Invalid Twilio credentials" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to search available numbers" },
      { status: 500 }
    );
  }
}

// Helper functions (implement based on your database setup)
async function checkUserOrgAccess(userId, orgId) {
  const orgAdmin = await prisma.user.findFirst({
    where: {
      clerkId: userId,
      orgId: orgId,
    },
    select: { role: true },
  });

  if (!orgAdmin || orgAdmin.role !== "Admin") {
    return false;
  }

  return orgAdmin;
}

async function getTwilioIntegration(orgId) {
  const integration = await prisma.orgIntegration.findFirst({
    where: { organizationId: orgId },
    select: { twilio: true },
  });

  return integration?.twilio ?? null;
}
