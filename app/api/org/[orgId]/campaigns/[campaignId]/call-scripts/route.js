import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { validateHasPermission, validateOrgAccess } from "@/lib/db/validations";

export async function POST(req, { params }) {
  const { orgId, campaignId } = await params;
  if (!orgId || !campaignId) {
    return NextResponse.json(
      { message: "Missing required parameters" },
      { status: 400 }
    );
  }
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);
    const data = await req.json();
    console.log("scripts:", data);

    const campaignToUpdate = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        scripts: data.script

      },
    })
    return NextResponse.json(
      { 
        message: "Scripts added successfully!", 
        campaign: campaignToUpdate,},
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to create call:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
