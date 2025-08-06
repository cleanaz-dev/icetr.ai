import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { validateOrgAccess } from "@/lib/db/validations";

export async function GET(req, { params }) {
  const { orgId, campaignId } = await params;
  if (!orgId || !campaignId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }
  try {
    await validateOrgAccess(clerkId, orgId);
    const campaignDocuments = await prisma.campaignDocument.findMany({
      where: {
        campaignId,
      },
    });

    return NextResponse.json(campaignDocuments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
