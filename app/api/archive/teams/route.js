import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/services/prisma";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("data:", data);
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ message: "Invalid User" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
      select: {
        role: true,
        orgId: true,
        id: true,
      },
    });

    if (user.role.toLocaleLowerCase() === "agent") {
      return NextResponse.json(
        { message: "Unauthorized User" },
        { status: 404 }
      );
    }

    // Use transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name: data.name,
          organization: { connect: { id: user.orgId } },
          manager: { connect: { id: user.id } },
        },
      });

      await tx.teamMember.create({
        data: {
          userId: user.id,
          teamId: team.id,
        },
      });

      return team;
    });

    return NextResponse.json({
      message: `Team ${result.name} created successfully`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
