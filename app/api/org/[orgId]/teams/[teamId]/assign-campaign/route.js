import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/services/prisma";
import {
  validateOrgAccess,
  validateTeamOrgAccess,
} from "@/lib/services/db/validations";

export async function PATCH(req, { params }) {
  const { teamId, orgId } = await params;
  const { campaignId } = await req.json();
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Invalid User" }, { status: 401 });
  }

  try {
    // Validate user belongs to org
    await validateOrgAccess(clerkId, orgId);

    // Validate user is member of the team in the org
    await validateTeamOrgAccess(clerkId, teamId, orgId);

    const exsitingCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        name: true,
        type: true,
        teamId: true,
        _count: {
          select: {
            leads: true,
          },
        },
      },
    });
    if (!exsitingCampaign) {
      return NextResponse.json(
        { message: "Campaign does not exist" },
        { status: 404 }
      );
    }

    // Now update team campaigns safely
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        campaigns: {
          connect: { id: exsitingCampaign.id },
        },
      },
    });

    return NextResponse.json(
      {
        message: `Campaign assigned successfully to ${updatedTeam.name}`,
        team: updatedTeam,
        campaign: exsitingCampaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 403 });
  }
}
