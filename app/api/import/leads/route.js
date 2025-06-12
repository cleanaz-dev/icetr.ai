//api/import/leads

import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";
import csv from "csv-parser";
import { Readable } from "stream";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const campaignId = formData.get("campaignId");
    const source = formData.get("source")
    const industry = formData.get("industry")
    const region = formData.get("region")
    const country = formData.get("country")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);
    const results = [];

    return new Promise((resolve) => {
      stream
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          try {
            const leads = [];

            for (const row of results) {
              if (!row.phoneNumber) {
                continue; // Skip rows without phone number
              }

              const leadData = {
                campaignId,
                phoneNumber: row.phoneNumber.trim(),
                company: row.company?.trim() || null,
                website: row.website?.trim() || null,
                industry: industry || null,
                source: source || null,
                status: "New",
                country: country || null,
                region: region || null
              };

              // Parse metadata if provided
              if (row.metadata) {
                try {
                  leadData.metadata = JSON.parse(row.metadata);
                } catch (e) {
                  // If metadata parsing fails, store as string
                  leadData.metadata = { raw: row.metadata };
                }
              }

              leads.push(leadData);
            }

            // Bulk create leads
            const createdLeads = await prisma.lead.createMany({
              data: leads,
            });

            resolve(
              NextResponse.json({
                success: true,
                count: createdLeads.count,
                message: `Successfully imported ${createdLeads.count} leads`,
              })
            );
          } catch (error) {
            console.error("Database error:", error);
            resolve(
              NextResponse.json(
                {
                  error: "Failed to save leads to database",
                },
                { status: 500 }
              )
            );
          }
        })
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          resolve(
            NextResponse.json(
              {
                error: "Failed to parse CSV file",
              },
              { status: 400 }
            )
          );
        });
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
