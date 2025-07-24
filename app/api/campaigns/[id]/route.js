import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/service/prisma";
import { PrismaClientRustPanicError } from "@/lib/generated/prisma/runtime/edge";

export async function PATCH(req, { params }) {
  const { id: campaignId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }
  try {
    const { name, type } = await req.json();
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { name, assignmentStrategy: type },
    });
    return NextResponse.json({ message: "Updated Campaign" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

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
    return NextResponse.json({ data: campaignDocuments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id: campaignId } = await params;
  const { userId: clerkId } = await auth();

  // Authentication check
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Input validation
  if (!campaignId) {
    return NextResponse.json({ message: "Campaign ID is required" }, { status: 400 });
  }

  try {
    // Check if campaign exists and user has permission (via org)
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organization: {
          users: {
            some: {
              clerkId: clerkId
            }
          }
        }
      },
      include: {
        leads: {
          select: { id: true }
        }
      }
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { message: "Campaign not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Use transaction to safely delete campaign and related data
    const result = await prisma.$transaction(async (prisma) => {
      // Delete related records first
      await prisma.leadActivity.deleteMany({
        where: {
          lead: {
            campaignId: campaignId
          }
        }
      });

      await prisma.followUp.deleteMany({
        where: {
          lead: {
            campaignId: campaignId
          }
        }
      });

      await prisma.call.deleteMany({
        where: {
          lead: {
            campaignId: campaignId
          }
        }
      });

      // Delete leads
      await prisma.lead.deleteMany({
        where: { campaignId: campaignId }
      });

      // Delete campaign documents
      await prisma.campaignDocument.deleteMany({
        where: { campaignId: campaignId }
      });

      // Delete call sessions
      await prisma.callSession.deleteMany({
        where: { campaignId: campaignId }
      });

      // Finally delete the campaign
      const deletedCampaign = await prisma.campaign.delete({
        where: { id: campaignId }
      });

      return deletedCampaign;
    });

    return NextResponse.json(
      { 
        message: `${result.name} and all related data have been deleted successfully`,
        deletedCampaign: {
          id: result.id,
          name: result.name,
          leadsDeleted: existingCampaign.leads.length
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete campaign error:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { message: "Cannot delete campaign due to related records" },
        { status: 409 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { message: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}