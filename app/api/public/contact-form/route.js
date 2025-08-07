import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "argon2";
import { assignNextInLine } from "@/lib/db/helpers";

export async function POST(req) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ message: "Missing API Key" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Received contact form data:", body);

    if (
      !body.name ||
      !body.email ||
      !body.company ||
      !body.interest ||
      !body.phone ||
      !body.campaignId
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find campaign with assignment details
    const campaign = await prisma.campaign.findUnique({
      where: { id: body.campaignId },
      select: {
        id:true,
        assignmentStrategy: true,
        teamId: true,
        orgId: true,
        apiKeys: {
          select: {
            key: true,
          }
        }// fetch all keys for verification
      },
    });

    console.log("campaign", campaign)

    if (!campaign || !campaign.apiKeys.length) {
      return NextResponse.json(
        { message: "Invalid campaign ID or no keys found" },
        { status: 400 }
      );
    }

    // Verify API key against all keys for this campaign
    const isValid = await Promise.any(
      campaign.apiKeys.map(({ key }) => verify(key, apiKey))
    ).catch(() => false);

    console.log("isValid:",isValid)

    if (!isValid) {
      return NextResponse.json({ message: "Invalid API Key" }, { status: 401 });
    }
    const newLead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email,
        company: body.company,
        phoneNumber: body.phone,
        campaign: { connect: { id: campaign.id } },
        organization: { connect: {id: campaign.orgId }},
        source: "API",
      }
    })

    // Assign lead using the campaign’s team & strategy
    const { assignedUser } = await assignNextInLine({
      campaignId: campaign.id,
      teamId: campaign.teamId,
      orgId: campaign.orgId,
      leadId: newLead.id,
    });

    // Continue processing form, e.g., save lead with assignedUser info, etc.

    console.log("assigned User:", assignedUser);

    return NextResponse.json(
      { message: "Contact form submitted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
