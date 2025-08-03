import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { orgId } = await req.json();
    console.log("ord id:", orgId);
   

    const exisitingOrg = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
      },
    });

    const updatedLeads = await prisma.lead.updateMany({
        data: {
            orgId: exisitingOrg.id
        }
    })
     return NextResponse.json({ message: "Org ID recieved, leads updated" }, { status: 200 });
  } catch (error) {
    console.error(error.message);
    return NextResponse.json(
      { message: "Error adding Org ID to leads" },
      { status: 500 }
    );
  }
}
