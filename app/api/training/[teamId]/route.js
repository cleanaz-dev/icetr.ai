// app/api/training/[teamId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req, { params }) {
  const { teamId } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Optional: verify caller belongs to the team
  const caller = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId: caller.id },
  });
  if (!member) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const trainings = await prisma.training.findMany({
      where: {
        user: {
          teamMemberships: { some: { teamId } },
        },
      },
      include: {
        user: { 
            select: { 
                id: true, 
                firstname: true, 
                lastname: true,
                imageUrl: true
            } },
      },
    });

    return NextResponse.json({ trainings }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
