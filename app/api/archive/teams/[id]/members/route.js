import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { users, teamId } = await req.json();
    if (!Array.isArray(users) || !teamId) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    // Just create the team members - simple as that
    for (const user of users) {
      await prisma.teamMember.create({
        data: {
          userId: user.id,
          teamId: teamId
        }
      });
    }

    return NextResponse.json({
      message: `${users.length} member(s) added successfully`
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to add members" },
      { status: 500 }
    );
  }
}