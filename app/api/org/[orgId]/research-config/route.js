import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { validateOrgAccess } from "@/lib/db/validations";

export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);
    const { services, techStackFocus, isPremium, socials, campaignId } =
      await req.json();
    console.log("tech stack focus:", techStackFocus);
    console.log("services:", services);

    // Upsert a ResearchConfig for each campaign
    const config = await prisma.researchConfig.upsert({
      where: { orgId, campaignId },
      update: { services, techStackFocus, isPremium, socials },
      create: {
        organization: { connect: { id: orgId } },
        campaign: { connect: { id: campaignId } },
        services,
        techStackFocus,
        isPremium,
        socials,
      },
    });
    return NextResponse.json(
      config,
      { message: "Data received successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  const { userId: clerkId } = await auth();
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized user" }, { status: 401 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);
    const researchData = await prisma.researchConfig.findMany({
      where: {
        orgId: orgId,
      },
    });
    return NextResponse.json(researchData, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
