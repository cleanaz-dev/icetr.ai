import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";

export async function GET(request, { params }) {
  const { orgId } = await params;

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}