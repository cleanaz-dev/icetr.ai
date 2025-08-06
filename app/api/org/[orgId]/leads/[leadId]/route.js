import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { validateHasPermission, validateOrgAccess } from "@/lib/db/validations";

export async function DELETE(request, { params }) {
  const { orgId, leadId } = await params;

  if (!orgId || !leadId) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }

  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await validateOrgAccess(clerkId, orgId);
    await validateHasPermission(clerkId, ["lead.delete"]);

    // Check if lead exists and belongs to the org
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        orgId: orgId,
      },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Delete the lead
    await prisma.lead.delete({
      where: {
        id: leadId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  const { orgId, leadId } = await params;
  if (!orgId || !leadId) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse({ message: "Invalid User" }, { status: 401 });
  }

  try {

    const data = await req.json();
    
    await validateOrgAccess(clerkId, orgId);
    const updatedLead = await prisma.lead.update({
      where: {
        id: leadId,
      },
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("Delete lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
