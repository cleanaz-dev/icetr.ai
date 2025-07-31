import { NextResponse } from "next/server";
import prisma from "@/lib/services/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Invalid User" }, { status: 401 });
    }

    const leads = await prisma.lead.findMany();
    return NextResponse.json(leads);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
