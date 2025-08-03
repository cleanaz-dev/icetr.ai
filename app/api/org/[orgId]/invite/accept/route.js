import prisma from "@/lib/prisma";
import redis from "@/lib/services/integrations/redis";
import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";
import { getFullName } from "@/lib/db/helpers";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const baseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BASE_URL
    : "http://localhost:3000";

export async function POST(request, { params }) {
  const { orgId: organizationId } = await params;
  if (!organizationId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 401 });
  }
  try {
    const {
      firstname,
      lastname,
      email,
      orgId,
      id: tempUUID,
      userRole,
      teamId,
      teamRole,
    } = await request.json();

    // Alternative: Log as a grouped object
    console.log("User Data:", {
      firstname,
      lastname,
      email,
      orgId,
      tempUUID,
      userRole,
      teamId,
    });
    if (orgId !== organizationId) {
      return NextResponse.json(
        { message: "Invalid Organization ID" },
        { status: 401 }
      );
    }
    // return NextResponse.json({ message: "Error, please try again or contact system admin." }, { status: 500 });

    // Optional: Check if user exists in your DB first
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const existingClerkUsers = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (existingClerkUsers.length > 0) {
      return NextResponse.json(
        { message: "User exists in database" },
        { status: 400 }
      );
    }

    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      firstName: firstname,
      lastName: lastname,
      publicMetadata: {
        role: userRole,
      },
    });

    const fullname = getFullName(firstname,lastname)

    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        fullname,
        email,
        clerkId: clerkUser.id,
        imageUrl: clerkUser.imageUrl,
        organization: { connect: { id: orgId } },
        teamMemberships: {
          create: {
            teamId: teamId,
            teamRole: teamRole
          },
        },
        role: userRole,
      },
    });

    await prisma.userSettings.create({
      data: {
        user: { connect: { id: user.id } },
      },
    });

    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: clerkUser.id,
      expiresInSeconds: 300, // 5 minutes
    });
    // console.log("Sign-in token created:", signInToken);
    await redis.json.set(`invitee:${orgId}:${tempUUID}`, ".status", "complete");

    await prisma.notification.create({
      data: {
        user: { connect: { id: user.id } },
        type: "Training",
        message: "Please complete 5-10 Training Calls",
      },
    });

    return NextResponse.json({
      success: true,
      signInToken: signInToken.token,
    });
  } catch (error) {
    console.error("Invite Accept Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to accept invite" },
      { status: 500 }
    );
  }
}
