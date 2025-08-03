import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { validateHasPermission } from "@/lib/db/validations";

export async function GET(req, { params }) {
  const { orgId } = await params;
  if (!orgId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  const { userId: clerkId } = await auth();

  await validateHasPermission(clerkId, ["lead.read"]);
  const leads = await prisma.lead.findMany({
    where: {
      orgId: orgId,
    },
  });

  return NextResponse.json(leads);
}
