import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import twilio from "twilio";
import { validateOrgAccess } from "@/lib/db/validations";
// import { decryptIntegrationData } from "@/lib/encryption";

export async function POST(req, { params }) {
  // Get user authentication - replace with your auth method
  const { userId: clerkId } = await auth();

  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  console.log("orgId:", orgId);
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { phoneNumber, countryCode } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

     await validateOrgAccess(clerkId, orgId);


    // Placeholder credentials - replace with actual credential retrieval
    const accountSid = process.env.TWILIO_ACCOUNT_SID || "your-account-sid";
    const authToken = process.env.TWILIO_AUTH_TOKEN || "your-auth-token";

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: "Twilio credentials not configured" },
        { status: 500 }
      );
    }

    // Initialize Twilio client
    const twilio = require("twilio")(accountSid, authToken);

    // Purchase the phone number from Twilio
    const purchasedNumber = await twilio.incomingPhoneNumbers.create({
      phoneNumber: phoneNumber,

      voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/${orgId}/twilio/twmil/`,
      smsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/${orgId}/twilio/twmil/`,
      voiceMethod: "POST",
      smsMethod: "POST",
      // Optional: Set a friendly name
      friendlyName: `Number for Org ${orgId}`,
    });

    // TODO: Save the purchased number to your database
    const savedNumber = await prisma.phoneNumber.create({
      data: {
        phoneNumber: purchasedNumber.phoneNumber,
        countryCode: countryCode,
        clerk: { connect: { id: clerkId } },
        organization: { connect: { id: orgId } },
      }
    });

    // Return success response with purchased number details
    return NextResponse.json(
      { message: "Phone number purchased successfully", purchasedNumber },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error purchasing phone number:", error);

    // Handle specific Twilio API errors
    if (error.code === 21452) {
      return NextResponse.json(
        { error: "Phone number is no longer available for purchase" },
        { status: 400 }
      );
    }

    if (error.code === 21451) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    if (error.code === 20003) {
      return NextResponse.json(
        { error: "Authentication failed - check Twilio credentials" },
        { status: 401 }
      );
    }

    if (error.code === 21457) {
      return NextResponse.json(
        { error: "Phone number not available in your region" },
        { status: 400 }
      );
    }

    if (error.code === 20429) {
      return NextResponse.json(
        { error: "Too many requests - rate limit exceeded" },
        { status: 429 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Failed to purchase phone number",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper function placeholders - implement based on your architecture

// async function checkUserOrgAccess(userId, orgId) {
//   // Check if user has permission to purchase numbers for this organization
//   // Return boolean
// }

// async function getTwilioCredentials(orgId) {
//   // Retrieve Twilio credentials for the organization
//   // Could be from database, vault, environment variables, etc.
//   // Return { accountSid, authToken }
// }
