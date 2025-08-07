//api/org/[orgId]/twilio/call-config/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
export async function GET(request, { params }) {
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
  }
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }
  try {
    const config = await getCallFlowConfiguration(orgId);
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { orgId } = await params;
  const configData = await request.json();
  
  try {
    const config = await prisma.callFlowConfiguration.upsert({
      where: { orgId },
      create: {
        orgId,
        ...configData
      },
      update: configData
    });
    
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
