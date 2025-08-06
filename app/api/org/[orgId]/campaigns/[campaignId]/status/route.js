import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { validateHasPermission, validateOrgAccess } from "@/lib/db/validations";

export async function PATCH(req, { params }) {
  const { campaignId, orgId } = await params;

  if (!campaignId || !orgId) {
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
    await validateHasPermission(clerkId, ["campaign.update"]);
    const { status } = await req.json();

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status,
      },
      include: {
        team: {
          select: {
            members: true,
          },
        },
      },
    });
    return NextResponse.json(updatedCampaign, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
