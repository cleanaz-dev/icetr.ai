import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { validateHasPermission, validateOrgAccess } from "@/lib/db/validations";

export async function POST(request, { params }) {
  try {
    const { orgId } = await params;
    const { userId: clerkId } = await auth();
    if (!orgId) {
      return NextResponse.json({ message: "Invalid User" }, { status: 400 });
    }
    if (!clerkId) {
      return NextResponse.json({ message: "Invalid User" }, { status: 401 });
    }
    await validateHasPermission(clerkId, ["campaign.create"]);
    await validateOrgAccess(clerkId, orgId);

    const {
      name,
      campaignType: type,
      assignmentStrategy,
      selectedTeamId,
    } = await request.json();

    console.log("object:", { name, type, assignmentStrategy, selectedTeamId });

    if (!name || !type || !selectedTeamId) {
      return NextResponse.json({ message: "Invalid Data" }, { status: 403 });
    }

    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        type,
        assignmentStrategy,
        organization: { connect: { id: orgId } },
        team: { connect: { id: selectedTeamId } },
      },
      include: {
        team: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error("Campaign creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
