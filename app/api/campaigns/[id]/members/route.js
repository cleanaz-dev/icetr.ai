import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }

  try {
    const { id: campaignId } = await params;
    const { users } = await request.json();
    console.log("users", users)

    // Validate input
    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { message: "users array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Create campaign memberships for all users
    const campaignMemberships = users.map(user => ({
      campaignId: campaignId,
      userId: user.id,
      role: user.role
    }));

    const createdMemberships = await prisma.campaignUser.createMany({
      data: campaignMemberships
    });

    return NextResponse.json({
      success: true,
      count: createdMemberships.count
    });

  } catch (error) {
    console.error('Error adding campaign members:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}