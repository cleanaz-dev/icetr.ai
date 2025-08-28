import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { validateOrgAccess } from "@/lib/db/validations";

export async function GET(req, { params }) {
  const { orgId, userId } = await params;
  if (!orgId || !userId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized user" }, { status: 401 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);
    const leads = await prisma.lead.findMany({
      where: {
        assignedUser: { clerkId: clerkId },
      },
      include: {
        research: true,
      }
    });

    return NextResponse.json(leads || []);
  } catch (error) {
    console.error("Error fetching user leads", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
