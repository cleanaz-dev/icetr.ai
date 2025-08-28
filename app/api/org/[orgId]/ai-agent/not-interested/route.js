import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  const { orgId } = await params;
  if (!orgId)
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });

  const data = await request.json();
  const { lead_id } = data;

  if (!lead_id)
    return NextResponse.json({ error: "Invalid lead_id" }, { status: 400 });

  const lead = await prisma.lead.update({
    where: { id: lead_id },
    data: {
      status: "Lost",
    },
  });

  return NextResponse.json({ message: "Request received" }, { status: 200 });
}
