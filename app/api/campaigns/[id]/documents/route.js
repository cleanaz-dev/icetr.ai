import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/service/prisma";

export async function GET(req, { params }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }
  try {
    const campaignDocuments = await prisma.campaignDocument.findMany({
      where: {
        campaignId: id,
      },
    });
  
    return NextResponse.json(campaignDocuments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
