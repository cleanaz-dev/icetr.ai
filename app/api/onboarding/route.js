import { createClerkClient } from "@clerk/backend";
import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req) {
  try {
    const data = await req.json();

    const {
      firstname,
      lastname,
      email,
      organizationName,
      country,
      invites = [],
    } = data;

    const response = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (response.data.length === 0) {
      return NextResponse.json(
        { error: "No matching user found in Clerk" },
        { status: 404 }
      );
    }

    const clerkUser = response.data[0];

    // 🔁 Wrap everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          country,
          createdBy: clerkUser.id,
        },
      });

      // 2. Create user
      const user = await tx.user.create({
        data: {
          firstname,
          lastname,
          email,
          imageUrl: clerkUser.imageUrl,
          clerkId: clerkUser.id,
          orgId: organization.id,
        },
      });

      // 3. Create user settings
      await tx.userSettings.create({
        data: {
          user: { connect: { id: user.id } },
        },
      });

      return { user, organization };
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (error) {
    console.error("Onboarding error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
