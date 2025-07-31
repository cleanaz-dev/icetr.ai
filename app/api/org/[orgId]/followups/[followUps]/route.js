import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { auth } from "@clerk/nextjs/server";
import { validateOrgAccess } from "@/lib/services/db/validations";

export async function PATCH(req, { params }) {
  const { orgId, followUpId } = await params;
  if (!orgId && !followUpId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  const { userId:clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unvalid User" }, { status: 401 });
  }
  try {
    
    validateOrgAccess(clerkId,orgId)
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
