import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/services/prisma";

export async function PATCH(req, { params }) {
  const { id: campaignId } = await params;
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }
  try {
    const { status } = await req.json();
    console.log("status:", status);

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status,
      },
    });
    return NextResponse.json(
      { message: `Campaign status is now ${status}` },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
