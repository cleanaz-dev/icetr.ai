import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { validateOrgAccess } from "@/lib/db/validations";

export async function POST(req, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }

  const { orgId, leadId } = await params;
  if (!orgId || !leadId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);

    const body = await req.json();

    // check if lead research exists
    const researchExists = await prisma.research.findFirst({
      where: {
        leadId: leadId,
      },
    });
    if (researchExists) {
      await prisma.research.update({
        where: { id: researchExists.id },
        data: { research: body },
      });
      return NextResponse.json(researchExists, { status: 200 });
    }

    const research = await prisma.research.create({
      data: {
        lead: { connect: { id: leadId } },
        research: body,
      },
    });
    return NextResponse.json(research, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update lead status" },
      { status: 500 }
    );
  }
}
