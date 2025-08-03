import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { validateOrgAccess } from "@/lib/db/validations";

export async function GET(request, { params }) {
  const { orgId } = await params;
  const { userId: clerkId } = await auth();

  try {
    await validateOrgAccess(clerkId, orgId);
    const campaigns = await prisma.campaign.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
