import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unvalid User" }, { status: 401 });
  }
  try {
    const { id } = await params;
    console.log("id", id);

    const followUp = await prisma.followUp.update({
      where: { id: id },
      data: {
        completed: true,
      },
    });

    const leadActivity = await prisma.leadActivity.create({
      data: {
        lead: { connect: { id: followUp.leadId } },
        type: "FOLLOW_UP",
      },
    });
    console.log("followUp", followUp);
    return NextResponse.json({ message: "Updated Follow" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
