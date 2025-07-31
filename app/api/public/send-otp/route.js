// app/api/send-otp/route.ts
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists with this email
    const users = await clerkClient.users.getUserList({ emailAddress: [email] });
    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 404 }
      );
    }

    // Create email verification token
    const { token } = await clerkClient.users.createEmailVerification({
      userId: user.id,
      strategy: 'email_code', // This will trigger an OTP email
    });

    // In a real implementation, you might want to:
    // 1. Store the token in your database
    // 2. Set an expiration time
    // 3. Track verification attempts

    return NextResponse.json(
      { 
        success: true,
        message: 'Verification code sent to your email',
        // Don't send the actual token to the client in production!
        // This is just for demonstration
        token: process.env.NODE_ENV === 'development' ? token : undefined
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}