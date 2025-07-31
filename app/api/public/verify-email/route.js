import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs";
import { emailVerificationSchema } from "@/lib/schema/onboarding";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, code } = emailVerificationSchema.parse(body);
    
    // Here you would verify the OTP with Clerk
    // This is a simplified example - you'll need to implement based on your Clerk setup
    
    try {
      // Verify email with Clerk
      // const verification = await clerkClient.emailAddresses.verifyEmailAddress({
      //   emailAddressId: "email_address_id",
      //   code: code
      // });
      
      // For demo purposes, we'll simulate success
      if (code === "123456") {
        return NextResponse.json({ 
          success: true, 
          message: "Email verified successfully" 
        });
      } else {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 400 }
        );
      }
    } catch (clerkError) {
      return NextResponse.json(
        { error: "Failed to verify email" },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error("Email verification error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}