import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/service/prisma";

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

    const team = await prisma.team.create({
      data: {
        name: data.name,
        organization: { connect: { id: user.orgId } },
        manager: { connect: { id: user.id } },
        members: { connect: { id: user.id } },
      },
    });
    return NextResponse.json({
      message: `Team ${team.name} created successfully`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
