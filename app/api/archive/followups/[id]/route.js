import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unvalid User" }, { status: 401 });
  }
  try {
    const { id } = await params;
    // console.log("id", id);
    const { outcome, notes } = await req.json();
    // console.log("data:", outcome, notes);

    const followUp = await prisma.followUp.update({
      where: { id: id },
      data: {
        completed: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    await prisma.leadActivity.create({
      data: {
        lead: { connect: { id: followUp.leadId } },
        createdUser: { connect: { id: user.id } },
        type: "FOLLOW_UP",
        content: outcome,
      },
    });
    console.log("followUp", followUp);
    return NextResponse.json({ message: "Updated Follow" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
