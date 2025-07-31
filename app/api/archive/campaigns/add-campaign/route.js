import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/services/prisma";

export async function POST(request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ message: "Invalid User" }, { status: 401 });
    }

    const {
      name,
      campaignType: type,
      assignmentStrategy,
    } = await request.json();

    if (!name || !type) {
      return NextResponse.json({ message: "Invalid Data" }, { status: 403 });
    }

    // Get the user's organization
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { organization: true },
    });

    if (!user || !user.organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    await prisma.campaign.create({
      data: {
        name,
        type,
        assignmentStrategy,
        orgId: user.orgId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Campaign creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
