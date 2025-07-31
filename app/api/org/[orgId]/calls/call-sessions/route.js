import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/services/prisma";
import { validateOrgAccess } from "@/lib/services/db/validations";

export async function POST(request, { params }) {
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized user" }, { status: 401 });
  }

  try {
    const { campaignId } = await request.json();
    console.log("campId", campaignId);

    await validateOrgAccess(clerkId, orgId);

    const today = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());

    // Check if user has an active session today
    let session = await prisma.callSession.findFirst({
      where: {
        user: {
          clerkId: clerkId,
        },
        createdAt: {
          gte: today,
          lte: endOfToday,
        },
      },
    });

    // If no active session today, create new one
    if (!session) {
      session = await prisma.callSession.create({
        data: {
          user: {
            connect: {
              clerkId: clerkId,
            },
          },
          campaign: { connect: { id: campaignId } },
          totalCalls: 0,
          successfulCalls: 0,
          totalDuration: 0,
        },
      });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
